<script lang="ts">
  import _ from 'lodash';
  import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
  import { onMount } from 'svelte';
  import TreeNode from './TreeNode.svelte';
  import Search from './search/Search.svelte';
  import {
    activeModelPath,
    collapsePath,
    expandManyPaths,
    inputJson,
    isTreeLoading,
    model,
  } from '../../../lib/stores';
  import {
    getAllPathValues,
    getValueInModelByPath,
    parseJsonString,
    pathArrayToString,
    revealTreeNode,
    setEditorValue,
    stringify,
    pathStringToArray,
  } from '../../../lib/util';
  import type { MonacoEditor } from '../../../lib/types';
  import Toast from '../../Toast.svelte';
  import { ROOT_NODE_KEY } from '../../../lib/constants';

  let editorEl: HTMLDivElement = null;
  let editor: MonacoEditor;
  let Monaco: any;

  let containerEl: HTMLDivElement = null;
  let editContainerEl: HTMLDivElement = null;
  let treeEl: HTMLDivElement = null;
  let searchEl: HTMLDivElement = null;

  /** Splitter between tree/edit */
  let hSplitterEl: HTMLDivElement = null;

  /** Splitter between explore/search */
  let vSplitterEl: HTMLDivElement = null;

  /** Value of the `model` store */
  let modelValue: any;

  /** Path currently being edited */
  let activeModelPathValue: Array<string> = [];

  /** Value of the inputJson store */
  let inputJsonValue = '';

  /** Whether the splitter between tree/edit is being dragged */
  let isHSplitterMouseDown = false;

  /** Whether the splitter between explore/search is being dragged */
  let isVSplitterMouseDown = false;

  /** Whether the toast notification for resetting a value should be shown */
  let shouldShowResetToast = false;

  /** Timeout for hiding the reset toast */
  let resetToastTimeout: any;

  /** Whether the loading spinner should be shown for the tree */
  let isTreeLoadingValue = false;

  /** Whether the user is manually editing the path string */
  let isEditingPath = false;

  /** Whether the path string the user has entered is valid */
  let isEditedPathValid = true;

  /** Input for manual path editing */
  let pathInputEl: HTMLInputElement = null;

  document.addEventListener('mouseup', handleSplitterMouseUp);
  document.addEventListener('mousemove', handleSplitterMouseMove);

  inputJson.subscribe((value) => (inputJsonValue = value));

  // Update editor value when the user changes the input JSON
  model.subscribe((value) => {
    modelValue = value;

    const editorValue = parseJsonString(editor?.getModel()?.getValue());
    const activeModelValue = getActiveModelValue();

    // Don't update editor if the new model value and the editor value are semantically equal
    if (!_.isEqual(editorValue, activeModelValue)) {
      if (activeModelValue !== undefined) {
        setEditorValue(editor, activeModelValue);
      } else {
        // The current model path no longer exists due to model or input JSON changes
        if (!_.isEmpty(activeModelPathValue)) {
          // Change current model path to the closest parent that still exists
          let pathToCheck = _.cloneDeep(activeModelPathValue);

          while (!_.isEmpty(pathToCheck)) {
            pathToCheck = pathToCheck.slice(0, pathToCheck.length - 1);
            if (getValueInModelByPath(modelValue, pathToCheck) !== undefined) {
              activeModelPath.update(() => pathToCheck);
              break;
            }
          }
        }
      }
    }
  });

  // Update editor value when user navigates to a new path
  activeModelPath.subscribe((value) => {
    activeModelPathValue = value;
    if (!_.isNil(editor?.getModel())) {
      if (_.isEmpty(value)) {
        // Navigated to root node
        setEditorValue(editor, modelValue);
      } else {
        setEditorValue(editor, _.get(modelValue, value));
      }
    }
  });

  isTreeLoading.subscribe((value) => (isTreeLoadingValue = value));

  onMount(async () => {
    // @ts-ignore
    self.MonacoEnvironment = {
      getWorker: function (_moduleId: any) {
        return new jsonWorker();
      },
    };

    Monaco = await import('monaco-editor');
    editor = Monaco.editor.create(editorEl, {
      value: stringify(getActiveModelValue()),
      language: 'json',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      overviewRulerLanes: 0,
      // Folding is a big performance hit on large text
      folding: false,
    });

    editor.onDidChangeModelContent(() => {
      const newValue = parseJsonString(editor.getModel().getValue());

      if (newValue === undefined) return;

      // Don't update if editor value is semantically equal to model
      if (_.isEqual(getActiveModelValue(), newValue)) return;

      if (_.isEmpty(activeModelPathValue)) {
        // _.isEqual sometimes doesn't return true for {} and []
        model.update(() => newValue);
      } else {
        const newModel = _.cloneDeep(modelValue);
        _.set(newModel, activeModelPathValue, newValue);
        model.update(() => newModel);
      }
    });

    return () => {
      editor.dispose();
    };
  });

  /** Get the model value for the path being edited */
  function getActiveModelValue(): any {
    return getValueInModelByPath(modelValue, activeModelPathValue);
  }

  /** Reveal the tree node being edited */
  function handleRevealButtonClick() {
    revealTreeNode(activeModelPathValue);
  }

  /** Handle mouse down on splitter between tree/edit */
  function handleHSplitterMouseDown() {
    isHSplitterMouseDown = true;
  }

  /** Handle mouse down on splitter between explore/search */
  function handleVSplitterMouseDown() {
    isVSplitterMouseDown = true;
  }

  /** Handle mouse up on both splitters */
  function handleSplitterMouseUp() {
    isHSplitterMouseDown = false;
    isVSplitterMouseDown = false;
  }

  /** Handle mouse move on either splitter */
  function handleSplitterMouseMove(event: MouseEvent) {
    if (isHSplitterMouseDown) {
      const splitterWidth = hSplitterEl.offsetWidth;
      const containerWidth = containerEl.clientWidth;
      const mouseX = event.clientX - containerEl.offsetLeft;
      treeEl.style.width = `${mouseX - splitterWidth / 2}px`;
      editorEl.parentElement.style.width = `${
        containerWidth - mouseX - splitterWidth / 2
      }px`;
    } else if (isVSplitterMouseDown) {
      const splitterHeight = vSplitterEl.offsetHeight;
      const containerHeight = containerEl.clientHeight;
      const mouseY = event.clientY - containerEl.offsetTop;
      editContainerEl.style.height = `${mouseY - splitterHeight / 2}px`;
      searchEl.style.height = `${
        containerHeight - mouseY - splitterHeight / 2
      }px`;
    }
  }

  /** Expand every tree node, including nested ones */
  function expandAllTreeNodes() {
    expandManyPaths(getAllPathValues(modelValue).map((pv) => pv.path));
  }

  /** Collapse every tree node, including nested ones */
  function collapseAllTreeNodes() {
    collapsePath([]);
  }

  /** Edit parent of current node and reveal in tree */
  function goToParent() {
    if (activeModelPathValue.length > 0) {
      const newPath = _.cloneDeep(activeModelPathValue);
      newPath.pop();
      activeModelPath.set(newPath);
      revealTreeNode(newPath);
    }
  }

  /** Beautify current editor code */
  function beautify() {
    editor.trigger('beautify', 'editor.action.formatDocument', null);
  }

  /** Show input element for path string */
  function editPath() {
    isEditedPathValid = true;
    isEditingPath = true;
    setTimeout(() => {
      let inputVal = pathArrayToString(activeModelPathValue);
      if (inputVal === 'Root') {
        inputVal = '';
      }
      pathInputEl.value = inputVal;
      pathInputEl.focus();
    });
  }

  /** Finalize or cancel path editing if Enter/Esc was pressed */
  function onPathInputKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      finalizePathEdit();
    } else if (e.key === 'Escape') {
      isEditingPath = false;
    }
  }

  /** Determine whether user-entered path is a valid model path */
  function onPathInputInput() {
    const pathArr = pathStringToArray(pathInputEl.value);
    isEditedPathValid =
      pathArr.length > 0 ? _.get(modelValue, pathArr) !== undefined : true;
  }

  /** Navigate to the model path entered by the user */
  function finalizePathEdit() {
    if (!isEditingPath) {
      isEditingPath = false;
      return;
    }

    const newPath = pathStringToArray(pathInputEl.value);
    const val = newPath.length > 0 ? _.get(modelValue, newPath) : modelValue;
    if (val !== undefined) {
      activeModelPath.set(newPath);
      revealTreeNode(newPath);
    }
    isEditingPath = false;
  }

  /**
   * Reset the value in the editor to the original value (from the input JSON).
   * Only the path being edited is affected. If the current path doesn't exist
   * in the input JSON, a toast notification is shown, and nothing happens.
   */
  function resetActiveModel() {
    const newModel = _.cloneDeep(modelValue);
    const activeInputJson = _.get(
      parseJsonString(inputJsonValue),
      activeModelPathValue
    );

    if (activeInputJson !== undefined) {
      _.set(newModel, activeModelPathValue, activeInputJson);
      model.update(() => newModel);
    } else {
      // Show toast
      shouldShowResetToast = true;
      clearTimeout(resetToastTimeout);
      resetToastTimeout = setTimeout(
        () => (shouldShowResetToast = false),
        3000
      );
    }
  }
</script>

<div bind:this={containerEl} class="container">
  <Toast
    text="Property doesn't exist in the input JSON"
    backgroundColor="#d12424"
    shouldShow={shouldShowResetToast}
  />
  <div bind:this={editContainerEl} class="edit-container">
    <div bind:this={treeEl} class="tree-container">
      <div class="tree" class:display-none={isTreeLoadingValue}>
        <div class="tree-controls">
          <button
            class="icon-btn icon-btn-left"
            on:click={expandAllTreeNodes}
            title="Expand all"
          >
            <iconify-icon icon="bx:expand-vertical" width="20" height="20" />
          </button>
          <button
            class="icon-btn icon-btn-left"
            on:click={collapseAllTreeNodes}
            title="Collapse all"
          >
            <iconify-icon icon="bx:collapse-vertical" width="20" height="20" />
          </button>
          <button
            class="icon-btn icon-btn-left"
            on:click={goToParent}
            title="Go to parent"
          >
            <iconify-icon icon="mdi:arrow-up" width="20" height="20" />
          </button>
          <div
            style="display: flex; justify-content: flex-start; align-items: center; width: 100%; overflow: hidden"
          >
            {#if !isEditingPath}
              <span class="edit-path-text"
                >{pathArrayToString(activeModelPathValue)}</span
              >
              <iconify-icon
                icon="material-symbols:edit"
                width="18"
                height="18"
                on:click={editPath}
              />
            {:else}
              <input
                type="text"
                class="path-input"
                style="border: {isEditedPathValid
                  ? '2px solid #555'
                  : '2px solid red'}"
                bind:this={pathInputEl}
                on:blur={finalizePathEdit}
                on:keydown={onPathInputKeyDown}
                on:input={onPathInputInput}
              />
            {/if}
          </div>
        </div>
        <div class="tree-nodes">
          <TreeNode key={ROOT_NODE_KEY} value={modelValue} modelPath={[]} />
        </div>
      </div>
      <div class="tree-spinner" class:display-none={!isTreeLoadingValue}>
        <iconify-icon
          class="spinner-icon"
          icon="fluent:spinner-ios-20-filled"
          width="72"
          height="72"
        />
      </div>
    </div>
    <div
      bind:this={hSplitterEl}
      class="splitter h-splitter"
      on:mousedown={handleHSplitterMouseDown}
    >
      <iconify-icon
        icon="charm:grab-vertical"
        width="14"
        height="14"
        class="grab-vertical"
      />
    </div>
    <div class="monaco-editor-container">
      <div class="editor-controls">
        <button
          class="icon-btn icon-btn-left"
          on:click={handleRevealButtonClick}
          title="Reveal in tree"
        >
          <iconify-icon icon="fe:target" width="20" height="20" />
        </button>
        <button
          class="icon-btn icon-btn-left"
          on:click={beautify}
          title="Beautify"
        >
          <iconify-icon icon="gg:format-left" width="20" height="20" />
        </button>
        <div class="spacer" />
        <button
          class="icon-btn icon-btn-right"
          on:click={resetActiveModel}
          title="Reset"
        >
          <iconify-icon
            icon="ic:outline-clear"
            style="color: red"
            width="20"
            height="20"
          />
        </button>
      </div>
      <div bind:this={editorEl} class="monaco-editor" />
    </div>
  </div>
  <div
    bind:this={vSplitterEl}
    class="splitter v-splitter"
    on:mousedown={handleVSplitterMouseDown}
  >
    <iconify-icon
      icon="charm:grab-horizontal"
      width="14"
      height="14"
      class="grab-horizontal"
    />
  </div>
  <div bind:this={searchEl} class="search-container">
    <Search />
  </div>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
  }

  .edit-container {
    width: 100%;
    height: calc(75% - 16px);
    display: block;
    overflow: hidden;
    border-bottom: 1px solid #d0d0d0;
    font-size: 0;
  }

  .edit-container > div {
    display: inline-block;
  }

  .tree-container {
    width: calc(50% - 8px);
    height: 100%;
    overflow: hidden;
    user-select: none;
  }

  .tree {
    width: 100%;
    height: 100%;
    overflow: hidden;
    user-select: none;
  }

  .tree-controls {
    height: 24px;
    display: flex;
    background-color: #f8f8f8;
    border-bottom: 1px solid #ccc;
  }

  .tree-nodes {
    height: calc(100% - 24px);
    overflow: auto;
  }

  .tree-spinner {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    user-select: none;
    background-color: #f8f8f8;
  }

  .splitter {
    user-select: none;
    background-color: #f9f9f9;
  }

  .h-splitter {
    width: 16px;
    height: 100%;
    border-left: 1px solid #b0b0b0;
    border-right: 1px solid #b0b0b0;
    cursor: col-resize;
  }

  .v-splitter {
    width: 100%;
    height: 16px;
    border-top: 1px solid #b0b0b0;
    border-bottom: 1px solid #b0b0b0;
    cursor: row-resize;
  }

  .grab-vertical {
    display: block;
    position: relative;
    top: calc(50% - 7px);
  }

  .grab-horizontal {
    display: block;
    position: relative;
    left: calc(50% - 7px);
  }

  .monaco-editor-container {
    width: calc(50% - 8px);
    height: 100%;
    user-select: none;
  }

  .monaco-editor {
    height: calc(100% - 24px);
    width: 100%;
  }

  .editor-controls {
    width: 100%;
    height: 24px;
    font-size: 14px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ccc;
    background-color: #f8f8f8;
    justify-content: flex-start;
  }

  .edit-path-text {
    padding: 0 4px 0 8px;
    font-weight: 500;
    color: black;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .path-input {
    border-radius: 2.5px;
    margin: 0 4px;
    width: 90%;
  }

  .path-input:focus {
    outline: none;
  }

  .icon-btn {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    background-color: transparent;
  }

  .icon-btn:hover {
    background-color: #00000010;
  }

  .icon-btn-left {
    border-right: 1px solid #bbb;
  }

  .icon-btn-right {
    border-left: 1px solid #bbb;
  }

  .spacer {
    width: auto;
    height: 100%;
    flex-grow: 1;
  }

  .search-container {
    width: 100%;
    height: 25%;
  }
</style>
