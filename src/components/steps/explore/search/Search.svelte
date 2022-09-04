<script lang="ts">
  import _ from "lodash";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import { onMount } from "svelte";
  import { getAllPathValues, parseJsonString } from "../../../../lib/util";
  import SearchResult from "./SearchResult.svelte";
  import { model } from "../../../../lib/stores";
  import type { MonacoEditor, PathValuePair } from "../../../../lib/types";

  let modelValue: any;

  let editorEl: HTMLDivElement = null;
  let editor: MonacoEditor;
  let Monaco: any;

  let pathValues: Array<PathValuePair> = [];
  let searchResults: Array<PathValuePair> = [];

  let containerEl: HTMLDivElement = null;
  let resultsEl: HTMLDivElement = null;

  let isSplitterMouseDown = false;

  $: modelValue, (pathValues = getAllPathValues(modelValue));

  model.subscribe((value) => (modelValue = value));

  function handleSplitterMouseDown() {
    isSplitterMouseDown = true;
  }

  function handleSplitterMouseMove(event: MouseEvent) {
    if (isSplitterMouseDown) {
      const containerWidth = containerEl.clientWidth;
      const mouseX = event.clientX - containerEl.offsetLeft;
      editorEl.parentElement.style.width = `${mouseX - 8}px`;
      resultsEl.style.width = `${containerWidth - mouseX - 8}px`;
    }
  }

  function handleSplitterMouseUp() {
    isSplitterMouseDown = false;
  }

  document.addEventListener("mousemove", handleSplitterMouseMove);
  document.addEventListener("mouseup", handleSplitterMouseUp);

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
      overviewRulerLanes: 0,
    });

    editor.onDidChangeModelContent(() => {
      const query: any = parseJsonString(editor.getModel().getValue());
      if (query !== undefined) {
        const allMatches = pathValues.filter((pv) => {
          if (_.isNumber(query) || query === null) {
            return pv.value === query;
          } else {
            return _.isMatch(pv.value, query);
          }
        });
        const leafMatches = allMatches.filter((pv) => {
          return !allMatches.some(
            (pv2) =>
              pv2.path.length > pv.path.length &&
              pv.path.every((pathSegment, i) => pv2.path[i] === pathSegment)
          );
        });
        leafMatches.sort((a, b) => a.path.length - b.path.length);
        searchResults = leafMatches;
      }
    });

    return () => {
      editor.dispose();
    };
  });
</script>

<div bind:this={containerEl} class="container">
  <div class="monaco-editor-container">
    <div bind:this={editorEl} class="monaco-editor" />
  </div>
  <div class="splitter" on:mousedown={handleSplitterMouseDown} />
  <div bind:this={resultsEl} class="results">
    {#each searchResults as res}
      <SearchResult modelPath={res.path} />
    {/each}
  </div>
</div>

<style>
  .container {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-size: 0;
  }

  .container > div {
    display: inline-block;
  }

  .monaco-editor-container {
    width: calc(50% - 8px);
    height: 100%;
  }

  .monaco-editor {
    width: 100%;
    height: 100%;
  }

  .splitter {
    width: 16px;
    height: 100%;
    border-left: 1px solid #b0b0b0;
    border-right: 1px solid #b0b0b0;
    user-select: none;
    background-color: #f9f9f9;
  }

  .results {
    width: calc(50% - 8px);
    height: 100%;
    font-size: 14px;
  }
</style>
