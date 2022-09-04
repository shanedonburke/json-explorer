<script lang="ts">
  import _ from "lodash";
  import type monaco from "monaco-editor";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import { onMount } from "svelte";
  import TreeNode from "./TreeNode.svelte";
  import Search from "./Search.svelte";
  import { activeModelPath, expandPath, model } from "./stores";
  import { getValueInModelByPath, parseJsonString, pathArrayToString, revealTreeNode } from "./util";

  let modelValue: any;

  let editorEl: HTMLDivElement = null;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let Monaco: any;

  let activeModelPathValue: Array<string> = [];

  let containerEl: HTMLDivElement = null;
  let editContainerEl: HTMLDivElement = null;
  let treeEl: HTMLDivElement = null;
  let searchEl: HTMLDivElement = null;

  let isHSplitterMouseDown = false;
  let isVSplitterMouseDown = false;

  model.subscribe((value) => {
    modelValue = value;

    const editorValue = parseJsonString(editor?.getModel()?.getValue());
    const activeModelValue = getActiveModelValue();

    // Don't update editor if the new model value and the editor value are semantically equal
    if (!_.isEqual(editorValue, activeModelValue)) {
      if (activeModelValue !== undefined) {
        editor?.getModel()?.setValue(JSON.stringify(activeModelValue, null, "\t"));
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

  activeModelPath.subscribe((value) => {
    activeModelPathValue = value;
    if (!_.isNil(editor?.getModel())) {
      if (_.isEmpty(value)) {
        editor.getModel().setValue(JSON.stringify(modelValue, null, "\t"));
      } else {
        editor
          .getModel()
          .setValue(JSON.stringify(_.get(modelValue, value), null, "\t"));
      }
    }
  });

  function getActiveModelValue(): any {
    return getValueInModelByPath(modelValue, activeModelPathValue);
  }

  function handleRevealButtonClick() {
    revealTreeNode(activeModelPathValue);
  }

  function handleHSplitterMouseDown() {
    isHSplitterMouseDown = true;
  }

  function handleVSplitterMouseDown() {
    isVSplitterMouseDown = true;
  }

  function handleSplitterMouseUp() {
    isHSplitterMouseDown = false;
    isVSplitterMouseDown = false;
  }

  function handleSplitterMouseMove(event: MouseEvent) {
    if (isHSplitterMouseDown) {
      const containerWidth = containerEl.clientWidth;
      const mouseX = event.clientX - containerEl.offsetLeft;
      treeEl.style.width = `${mouseX - 8}px`;
      editorEl.parentElement.style.width = `${containerWidth - mouseX - 8}px`;
    } else if (isVSplitterMouseDown) {
      const containerHeight = containerEl.clientHeight;
      const mouseY = event.clientY - containerEl.offsetTop;
      editContainerEl.style.height = `${mouseY - 8}px`;
      searchEl.style.height = `${containerHeight - mouseY - 8}px`;
    }
  }

  document.addEventListener("mouseup", handleSplitterMouseUp);
  document.addEventListener("mousemove", handleSplitterMouseMove);

  onMount(async () => {
    // @ts-ignore
    self.MonacoEnvironment = {
      getWorker: function (_moduleId: any) {
        return new jsonWorker();
      },
    };

    Monaco = await import("monaco-editor");
    editor = Monaco.editor.create(editorEl, {
      value: JSON.stringify(getActiveModelValue(), null, "\t"),
      language: "json",
      automaticLayout: true,
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      overviewRulerLanes: 0,
    });

    editor.onDidChangeModelContent(() => {
      const newValue = parseJsonString(editor.getModel().getValue());

      if (newValue === undefined) return;
      if (_.isEqual(getActiveModelValue(), newValue)) return;

      if (_.isEmpty(activeModelPathValue)) {
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
</script>

<div bind:this={containerEl} class="container">
  <div bind:this={editContainerEl} class="edit-container">
    <div bind:this={treeEl} class="tree">
      <TreeNode key="Root" value={modelValue} modelPath={[]} />
    </div>
    <div class="splitter h-splitter" on:mousedown={handleHSplitterMouseDown} />
    <div class="monaco-editor-container">
      <div class="edit-path">
        <button
          class="reveal-button"
          on:click={handleRevealButtonClick}
          title="Reveal in tree"
        >
          <iconify-icon icon="fe:target" width="20" height="20" />
        </button>
        <span class="edit-path-text"
          >{pathArrayToString(activeModelPathValue)}</span
        >
      </div>
      <div bind:this={editorEl} class="monaco-editor" />
    </div>
  </div>
  <div class="splitter v-splitter" on:mousedown={handleVSplitterMouseDown} />
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

  .tree {
    width: calc(50% - 8px);
    height: 100%;
    overflow: auto;
    user-select: none;
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
  }

  .v-splitter {
    width: 100%;
    height: 16px;
    border-top: 1px solid #b0b0b0;
    border-bottom: 1px solid #b0b0b0;
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

  .edit-path {
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
    padding: 0 8px;
  }

  .reveal-button {
    width: 24px;
    height: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: none;
    background-color: transparent;
    border-right: 1px solid #bbb;
  }

  .reveal-button:hover {
    background-color: #00000010;
  }

  .search-container {
    width: 100%;
    height: 25%;
  }
</style>
