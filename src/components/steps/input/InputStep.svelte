<script lang="ts">
  import _ from "lodash";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import { createEventDispatcher, onMount } from "svelte";
  import { INPUT_JSON_STORAGE_KEY, SAMPLE_JSON } from "../../../lib/constants";
  import { inputJson, model } from "../../../lib/stores";
  import type { MonacoEditor } from "../../../lib/types";
  import { parseJsonString, stringify } from "../../../lib/util";
  import Toast from "../../Toast.svelte";

  const dispatch = createEventDispatcher();

  let editorEl: HTMLDivElement;
  let editor: MonacoEditor;
  let Monaco: any;

  /** Value of the `model` store */
  let modelValue: any;

  /** Whether the "Input loaded from last session" toast should be displayed */
  let shouldShowLoadedToast = false;

  let isEditorLoading = true;

  model.subscribe((value) => (modelValue = value));

  onMount(async () => {
    // @ts-ignore
    self.MonacoEnvironment = {
      getWorker: function (_moduleId: any) {
        return new jsonWorker();
      },
    };

    // Input JSON is stored in local storage
    const localStorageValue = localStorage.getItem(INPUT_JSON_STORAGE_KEY);
    if (localStorageValue !== null) {
      inputJson.update(() => localStorageValue);

      // Shopw toast for 3 seconds, after 1 second
      setTimeout(() => {
        shouldShowLoadedToast = true;
        setTimeout(() => {
          shouldShowLoadedToast = false;
        }, 3000);
      }, 1000);
    }

    Monaco = await import("monaco-editor");
    editor = Monaco.editor.create(editorEl, {
      value: localStorageValue ?? stringify(SAMPLE_JSON),
      language: "json",
      automaticLayout: true,
      scrollBeyondLastLine: false,
      minimap: { enabled: false },
      overviewRulerLanes: 0,
    });

    editor.getModel().onDidChangeContent(() => {
      // Update store and local storage if the new value represents
      // a different model
      const editorValue = editor.getModel().getValue();
      const parsedEditorValue = parseJsonString(editorValue);
      if (
        parsedEditorValue !== undefined &&
        !_.isEqual(parsedEditorValue, modelValue)
      ) {
        inputJson.update(() => editorValue);
        localStorage.setItem(INPUT_JSON_STORAGE_KEY, editorValue);
      }
    });

    isEditorLoading = false;

    return () => {
      editor.dispose();
    };
  });

  /** Beautify the current editor text */
  function beautify() {
    editor.trigger("beautify", "editor.action.formatDocument", null);
  }

  /** Proceed to the "Explore/Edit" step */
  function goToNextStep() {
    dispatch("nextStep");
  }
</script>

<div class="container">
  <Toast
    text="Input loaded from last session"
    backgroundColor="#24bf58"
    shouldShow={shouldShowLoadedToast}
  />
  <div style="width: 100%; height: 100%" class:display-none={isEditorLoading}>
    <div bind:this={editorEl} class="monaco-editor" />
  </div>
  <div class="editor-spinner" class:display-none={!isEditorLoading}>
    <iconify-icon
      class="spinner-icon"
      icon="fluent:spinner-ios-20-filled"
      width="72"
      height="72"
    />
  </div>
  <div class="control-bar">
    <button class="text-btn secondary-btn" on:click={beautify}>
      <span>Beautify</span>
    </button>
    <button class="text-btn primary-btn" on:click={goToNextStep}>
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
    height: 100%;
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

  .editor-spinner {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    user-select: none;
    background-color: #f8f8f8;
  }
</style>
