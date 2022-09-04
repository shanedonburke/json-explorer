<script lang="ts">
  import _ from "lodash";

  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import { createEventDispatcher, onMount } from "svelte";
  import { inputJson, model } from "../../../lib/stores";
  import type { MonacoEditor } from "../../../lib/types";
  import { parseJsonString } from "../../../lib/util";

  let editorEl: HTMLDivElement = null;
  let editor: MonacoEditor;
  let Monaco: any;

  let modelValue: any = undefined;

  model.subscribe((value) => (modelValue = value));

  const dispatch = createEventDispatcher();

  onMount(async () => {
    // @ts-ignore
    self.MonacoEnvironment = {
      getWorker: function (_moduleId: any) {
        return new jsonWorker();
      },
    };

    Monaco = await import("monaco-editor");
    editor = Monaco.editor.create(editorEl, {
      value: JSON.stringify(
        {
          a: {
            b: 1,
            c: [0, { d: 2 }],
          },
        },
        null,
        "\t"
      ),
      language: "json",
      automaticLayout: true,
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      overviewRulerLanes: 0,
    });

    editor.getModel().onDidChangeContent(() => {
      const editorValue = editor.getModel().getValue();
      const parsedEditorValue = parseJsonString(editorValue);
      if (
        parsedEditorValue !== undefined &&
        !_.isEqual(parsedEditorValue, modelValue)
      ) {
        inputJson.update(() => editorValue);
      }
    });

    return () => {
      editor.dispose();
    };
  });

  function beautify() {
    editor.trigger("beautify", "editor.action.formatDocument", null);
  }

  function goToNextStep() {
    dispatch("nextStep");
  }
</script>

<div class="container">
  <div style="width: 100%; height: 100%">
    <div bind:this={editorEl} class="monaco-editor" />
  </div>
  <div class="control-bar">
    <button class="beautify-button" on:click={beautify}>
      <span>Beautify</span>
    </button>
    <button class="next-button" on:click={goToNextStep}>
      <span>Next</span>
    </button>
  </div>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    box-sizing: border-box;
  }

  .monaco-editor {
    width: 100%;
    height: calc(100% - 100px);
  }

  .control-bar {
    width: 100%;
    height: 50px;
    padding: 7.5px;
    border-top: 1px solid #d0d0d0;
    display: flex;
    justify-content: flex-end;
    gap: 15px;
  }

  .control-bar > button {
    height: 100%;
    width: 100px;
    border-radius: 3px;
  }

  .beautify-button {
    background-color: #f0f0f0;
    border: 1px solid #aaa;
  }

  .beautify-button:hover {
    background-color: #e5e5e5;
  }

  .beautify-button:active {
    background-color: #dadada;
  }

  .next-button {
    background-color: #2a60eb;
    color: white;
    border: none;
  }

  .next-button:hover {
    background-color: #254fb9;
  }

  .next-button:active {
    background-color: #0f3fb8;
  }
</style>
