<script lang="ts">
  import type monaco from "monaco-editor";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";

  const dispatch = createEventDispatcher();

  export let inputJson: string;

  let editorEl: HTMLDivElement = null;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let Monaco: any;

  onMount(async () => {
    // @ts-ignore
    self.MonacoEnvironment = {
      getWorker: function (_moduleId: any) {
        return new jsonWorker();
      },
    };

    Monaco = await import("monaco-editor");
    editor = Monaco.editor.create(editorEl, {
      value: inputJson,
      language: "json",
      automaticLayout: true,
    });

    editor.getModel().onDidChangeContent(() => {
      dispatch("inputChange", {
        value: editor.getModel().getValue()
      });
    });

    return () => {
      editor.dispose();
    };
  });
</script>

<div bind:this={editorEl} class="input-monaco-editor" />

<style>
  .input-monaco-editor {
    width: 100%;
    height: 100%;
  }
</style>
