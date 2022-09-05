<script lang="ts">
  import type { MonacoEditor } from "src/lib/types";
  import { saveAs } from "file-saver";
  import { onMount } from "svelte";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import { model } from "../../../lib/stores";
  import { stringify } from "../../../lib/util";
  import { SAMPLE_JSON } from "../../../lib/constants";

  let editorEl: HTMLDivElement = null;
  let editor: MonacoEditor;
  let Monaco: any;

  let modelValue: any;

  model.subscribe((value) => {
    modelValue = value;
    editor?.getModel()?.setValue(stringify(value));
  });

  function copyToClipboard() {
    const editorValue = stringify(editor?.getModel()?.getValue());
    if (editorValue !== undefined) {
      navigator.clipboard.writeText(editorValue);
    }
  }

  function saveFile() {
    const text = stringify(modelValue);

    if (text === undefined) return;

    const blob = new Blob([text], { type: "application/json" });
    saveAs(blob, "output.json");
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
      value: stringify(SAMPLE_JSON),
      language: "json",
      automaticLayout: true,
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      overviewRulerLanes: 0,
      readOnly: true,
    });

    return () => {
      editor.dispose();
    };
  });
</script>

<div class="container">
  <div class="monaco-editor-container">
    <div bind:this={editorEl} class="monaco-editor" />
  </div>
  <div class="controls">
    <button class="button primary-button" on:click={copyToClipboard}>Copy to clipboard</button>
    <button class="button primary-button" on:click={saveFile}>Save file</button>
  </div>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: stretch;
  }

  .monaco-editor-container {
    height: 100%;
    width: 100%;
  }

  .monaco-editor {
    height: 100%;
    width: 100%;
  }

  .controls {
    height: 100%;
    width: min-content;
    border-left: 1px solid #ccc;
    background-color: #f8f8f8;
  }

  .button {
    height: 30px;
    width: 150px;
    margin: 20px 20px 0 20px;
    border-radius: 3px;
    white-space: nowrap;
  }

  .primary-button {
    background-color: #2a60eb;
    color: white;
    border: none;
  }

  .primary-button:hover {
    background-color: #254fb9;
  }

  .primary-button:active {
    background-color: #0f3fb8;
  }
</style>
