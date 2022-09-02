<script lang="ts">
  import _ from "lodash";
  import type monaco from "monaco-editor";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import TreeNode from "./TreeNode.svelte";
  import Search from "./Search.svelte";
  import { editModelPath } from "./stores";
  import { parseJsonString } from "./util";

  const dispatch = createEventDispatcher();

  export let inputJson: string;
  export let model: any;

  $: model, editor?.getModel()?.setValue(JSON.stringify(model, null, "\t"));

  let editorEl: HTMLDivElement = null;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let Monaco: any;

  let editModelPathValue: Array<string> = [];

  let containerEl: HTMLDivElement = null;
  let editContainerEl: HTMLDivElement = null;
  let treeEl: HTMLDivElement = null;
  let hSplitterEl: HTMLDivElement = null;
  let vSplitterEl: HTMLDivElement = null;
  let searchEl: HTMLDivElement = null;

  editModelPath.subscribe((value) => {
    editModelPathValue = value;
    if (!_.isNil(editor?.getModel())) {
      if (_.isEmpty(value)) {
        editor.getModel().setValue(JSON.stringify(model, null, "\t"));
      } else {
        editor
          .getModel()
          .setValue(JSON.stringify(_.get(model, value), null, "\t"));
      }
    }
  });

  let isHSplitterMouseDown = false;
  let isVSplitterMouseDown = false;

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
      const splitterWidth = hSplitterEl.offsetWidth;
      const containerCenter =
        editContainerEl.clientWidth / 2 + editContainerEl.clientLeft;
      const treeOffset =
        event.clientX - containerCenter - event.offsetX / 2 - splitterWidth / 4;
      const editorOffset =
        event.clientX - containerCenter - event.offsetX / 2 + splitterWidth;
      treeEl.style.width = `calc(50% + ${treeOffset}px)`;
      editorEl.parentElement.style.width = `calc(50% - 1px - ${editorOffset}px)`;
    } else if (isVSplitterMouseDown) {
      const splitterHeight = vSplitterEl.offsetHeight;
      const containerCenter =
        containerEl.clientHeight / 2 + containerEl.offsetTop;
      const editOffset = event.clientY - containerCenter - splitterHeight / 2;
      const searchOffset = event.clientY - containerCenter + splitterHeight / 2;
      editContainerEl.style.height = `calc(50% + ${editOffset}px)`;
      searchEl.style.height = `calc(50% - ${searchOffset}px)`;
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
      value: _.isEmpty(editModelPathValue)
        ? JSON.stringify(model, null, "\t")
        : JSON.stringify(_.get(model, editModelPathValue), null, "\t"),
      language: "json",
      automaticLayout: true,
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
    });

    editor.onDidChangeModelContent(() => {
      const newModel = parseJsonString(editor.getModel().getValue());

      if (newModel === undefined) return;
      if (_.isEqual(model, newModel)) return;

      if (_.isEmpty(editModelPathValue)) {
        dispatch("setModel", { model: newModel });
      } else {
        _.set(model, editModelPathValue, newModel);
      }
    });

    return () => {
      editor.dispose();
    };
  });
</script>

<div bind:this={containerEl} class="explore-container">
  <div bind:this={editContainerEl} class="explore-edit-container">
    <div bind:this={treeEl} class="explore-tree">
      <TreeNode key="Root" value={model} modelPath={[]} />
    </div>
    <div
      bind:this={hSplitterEl}
      class="explore-h-splitter"
      on:mousedown={handleHSplitterMouseDown}
    />
    <div class="explore-monaco-editor-container">
      <div bind:this={editorEl} class="explore-monaco-editor" />
    </div>
  </div>
  <div
    bind:this={vSplitterEl}
    class="explore-v-splitter"
    on:mousedown={handleVSplitterMouseDown}
  />
  <div bind:this={searchEl} class="explore-search-container">
    <Search model={model} />
  </div>
</div>

<style>
  .explore-container {
    width: 100%;
    height: 100%;
  }

  .explore-edit-container {
    width: 100%;
    height: calc(75% - 16px);
    display: block;
    overflow: hidden;
    border-bottom: 1px solid #d0d0d0;
    font-size: 0;
  }

  .explore-edit-container > div {
    display: inline-block;
  }

  .explore-tree {
    width: calc(50% - 8px);
    height: 100%;
    overflow: auto;
    grid-column: 1;
    user-select: none;
  }

  .explore-h-splitter {
    width: 16px;
    height: 100%;
    border-left: 1px solid #b0b0b0;
    border-right: 1px solid #b0b0b0;
    grid-column: 2;
    user-select: none;
  }

  .explore-v-splitter {
    width: 100%;
    height: 16px;
    border-top: 1px solid #b0b0b0;
    border-bottom: 1px solid #b0b0b0;
    user-select: none;
  }

  .explore-monaco-editor-container {
    width: calc(50% - 8px);
    height: 100%;
    user-select: none;
  }

  .explore-monaco-editor {
    height: 100%;
    width: 100%;
  }

  .explore-search-container {
    width: 100%;
    height: 25%;
  }
</style>
