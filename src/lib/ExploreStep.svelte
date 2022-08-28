<script lang="ts">
  import _ from "lodash";
  import type monaco from "monaco-editor";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import TreeNode from "./TreeNode.svelte";
  import { editModelPath } from "./stores";

  const dispatch = createEventDispatcher();

  export let inputJson: string;
  export let model: any;

  let editorEl: HTMLDivElement = null;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let Monaco: any;

  let editModelPathValue: Array<string> = [];

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

  function parseJsonString(str): string | undefined {
    try {
      return JSON.parse(str);
    } catch (e) {
      return undefined;
    }
  }

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
    });

    editor.onDidChangeModelContent(() => {
      const newVal = parseJsonString(editor.getModel().getValue());

      if (newVal === undefined) return;

      if (_.isEmpty(editModelPathValue)) {
        dispatch("setModel", { model: newVal });
      } else {
        _.set(model, editModelPathValue, newVal);
      }
    });

    return () => {
      editor.dispose();
    };
  });
</script>

<div class="explore-container">
  <div class="explore-tree">
    <TreeNode key="Root" value={model} modelPath={[]} />
  </div>
  <div bind:this={editorEl} class="explore-monaco-editor" />
</div>

<style>
  .explore-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: stretch;
    justify-content: stretch;
  }

  .explore-tree {
    width: 100%;
    height: 100%;
  }

  .explore-monaco-editor {
    width: 100%;
    height: 100%;
  }
</style>
