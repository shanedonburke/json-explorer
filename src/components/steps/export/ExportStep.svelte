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

  /** Value of the `model` store */
  let modelValue: any;

  model.subscribe((value) => {
    modelValue = value;
    editor?.getModel()?.setValue(stringify(value));
  });

  onMount(async () => {
    // @ts-ignore
    self.MonacoEnvironment = {
      getWorker: function (_moduleId: any) {
        return new jsonWorker();
      },
    };

    Monaco = await import("monaco-editor");
    editor = Monaco.editor.create(editorEl, {
      value: stringify(modelValue) ?? stringify(SAMPLE_JSON),
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

  /** Copy the output JSON to the clipboard */
  function copyToClipboard() {
    const editorValue = editor?.getModel()?.getValue();
    if (editorValue) {
      navigator.clipboard.writeText(editorValue);
    }
  }

  /** Open a dialog to save the output JSON to a file */
  function saveFile() {
    const text = stringify(modelValue);

    if (text === undefined) return;

    const blob = new Blob([text], { type: "application/json" });
    saveAs(blob, "output.json");
  }
</script>

<div class="container">
  <div class="monaco-editor-container">
    <div bind:this={editorEl} class="monaco-editor" />
  </div>
  <div class="controls">
    <button class="export-step-btn text-btn primary-btn" on:click={copyToClipboard}>Copy to clipboard</button>
    <button class="export-step-btn text-btn primary-btn" on:click={saveFile}>Save file</button>
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

  .export-step-btn {
    margin: 20px 20px 0 20px;
  }
</style>
