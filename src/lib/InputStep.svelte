<script lang="ts">
  import _ from "lodash";

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
      scrollBeyondLastLine: false,
    });

    editor.getModel().onDidChangeContent(() => {
      dispatch("inputChange", {
        value: editor.getModel().getValue(),
      });
    });

    return () => {
      editor.dispose();
    };
  });

  function parseJsonString(str): string | undefined {
    try {
      return JSON.parse(str);
    } catch (e) {
      return undefined;
    }
  }

  function beautify() {
    editor.trigger("beautify", 'editor.action.formatDocument', null);
  }

  function goToNextStep() {
    dispatch("nextStep");
  }
</script>

<div class="input-container">
  <div style="width: 100%; height: 100%">
    <div bind:this={editorEl} class="input-monaco-editor" />
  </div>
  <div class="input-control-bar">
    <button class="input-beautify-button" on:click={beautify}>
      <span>Beautify</span>
    </button>
    <button class="input-next-button" on:click={goToNextStep}>
      <span>Next</span>
    </button>
  </div>
</div>

<style>
  .input-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    box-sizing: border-box;
  }

  .input-monaco-editor {
    width: 100%;
    height: calc(100% - 100px);
  }

  .input-control-bar {
    width: 100%;
    height: 50px;
    padding: 7.5px;
    border-top: 1px solid #d0d0d0;
    display: flex;
    justify-content: flex-end;
    gap: 15px;
  }

  .input-control-bar > button {
    height: 100%;
    width: 100px;
    border-radius: 3px;
    border: none;
    box-shadow: 1px 1px 3px #5a5a5a;
  }

  .input-beautify-button {
    background-color: #d5d5d5;
  }

  .input-beautify-button:hover {
    background-color: #c5c5c5;
  }

  .input-beautify-button:active {
    background-color: #b5b5b5;
  }

  .input-next-button {
    background-color: #2a60eb;
    color: white;
  }

  .input-next-button:hover {
    background-color: #254fb9;
  }

  .input-next-button:active {
    background-color: #0f3fb8;
  }
</style>
