<script lang="ts">
  import _ from "lodash";
  import type monaco from "monaco-editor";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import TreeNode from "./TreeNode.svelte";

  const dispatch = createEventDispatcher();

  export let inputJson: string;
  export let model: any;

  let editorEl: HTMLDivElement = null;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let Monaco: any;

  let editPath = "";

  function parseJsonString(str): string | undefined {
    try {
      return JSON.parse(str);
    } catch (e) {
      return undefined;
    }
  }

  function getObjectEntries(val): Array<[string, any]> {
    if (typeof val === "object") {
      return Object.entries(val);
    }
    return [];
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
      value:
        editPath === ""
          ? JSON.stringify(model, null, "\t")
          : JSON.stringify(_.get(model, editPath), null, "\t"),
      language: "json",
      automaticLayout: true,
    });

    editor.onDidChangeModelContent(() => {
      const newVal = parseJsonString(editor.getModel().getValue());

      if (newVal === undefined) return;

      if (editPath === "") {
        dispatch("setModel", { model: newVal });
      } else {
        _.set(model, editPath, newVal);
        console.log(model);
      }
    });

    return () => {
      editor.dispose();
    };
  });
</script>

<div class="explore-container">
  <div class="explore-tree">
    {#each getObjectEntries(model) as [key, value]}
      <TreeNode {key} {value} />
    {/each}
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
    padding-left: 5px;
  }

  .explore-monaco-editor {
    width: 100%;
    height: 100%;
  }
</style>
