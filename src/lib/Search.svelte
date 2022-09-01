<script lang="ts">
  import type monaco from "monaco-editor";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import { onMount } from "svelte";
  import { parseJsonString } from "./util";

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
      value: "",
      language: "json",
      automaticLayout: true,
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
    });

    editor.onDidChangeModelContent(() => {
      const query = parseJsonString(editor.getModel().getValue());
    });

    return () => {
      editor.dispose();
    };
  });
</script>

<div class="search-monaco-editor-container">
  <div bind:this={editorEl} class="search-monaco-editor" />
</div>

<style>
  .search-monaco-editor-container {
    width: 100%;
    height: 100%;
  }

  .search-monaco-editor {
    width: 100%;
    height: 100%;
  }
</style>
