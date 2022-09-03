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

<div bind:this={containerEl} class="container">
  <div bind:this={editContainerEl} class="edit-container">
    <div bind:this={treeEl} class="tree">
      <TreeNode key="Root" value={model} modelPath={[]} />
    </div>
    <div
      bind:this={hSplitterEl}
      class="h-splitter"
      on:mousedown={handleHSplitterMouseDown}
    />
    <div class="monaco-editor-container">
      <div bind:this={editorEl} class="monaco-editor" />
    </div>
  </div>
  <div
    bind:this={vSplitterEl}
    class="v-splitter"
    on:mousedown={handleVSplitterMouseDown}
  />
  <div bind:this={searchEl} class="search-container">
    <Search model={model} />
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

  .h-splitter {
    width: 16px;
    height: 100%;
    border-left: 1px solid #b0b0b0;
    border-right: 1px solid #b0b0b0;
    user-select: none;
  }

  .v-splitter {
    width: 100%;
    height: 16px;
    border-top: 1px solid #b0b0b0;
    border-bottom: 1px solid #b0b0b0;
    user-select: none;
  }

  .monaco-editor-container {
    width: calc(50% - 8px);
    height: 100%;
    user-select: none;
  }

  .monaco-editor {
    height: 100%;
    width: 100%;
  }

  .search-container {
    width: 100%;
    height: 25%;
  }
</style>
