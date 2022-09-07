<script lang="ts">
  import _, { size } from "lodash";
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

  let isSearchExact = false;

  $: isSearchExact, executeSearch();

  model.subscribe((value) => {
    modelValue = value;
    pathValues = getAllPathValues(modelValue);
    executeSearch();
  });

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
      executeSearch();
    });

    return () => {
      editor.dispose();
    };
  });

  function executeSearch() {
    const editorValue = editor?.getModel()?.getValue();

    if (_.isNil(editorValue)) return;

    const query: any = parseJsonString(editorValue);

    if (query === undefined) return;

    if (isSearchExact) {
      searchResults = pathValues.filter((pv) => _.isEqual(pv.value, query));
    } else {
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
  }

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
</script>

<div bind:this={containerEl} class="container">
  <div class="monaco-editor-container">
    <div bind:this={editorEl} class="monaco-editor" />
    <div class="search-controls">
      <span style:font-weight={isSearchExact ? "600" : "400"}>Exact</span>
      <input type="checkbox" bind:checked={isSearchExact} />
    </div>
  </div>
  <div class="splitter" on:mousedown={handleSplitterMouseDown} />
  <div bind:this={resultsEl} class="results">
    {#if _.size(searchResults) === 0}
      <div class="search-help">
        <div>
          <span>
            Enter a search query in the form of a partial description of the
            value to find.
          </span>
          <br />
          <code>{"{"} "id": 4 {"}"}</code> will match
          <code>{"{"} "id": 4, "name": "John" {"}"}</code>
          <br />
          <code>[10]</code> will match <code>[10, 20, 30]</code>
          <br />
          <code>"Hello world"</code> will match <code>"Hello world</code>
          <br />
          <span>
            Checking <i>Exact</i> will make the search only match values that are
            exactly equal to the query.
          </span>
        </div>
      </div>
    {/if}
    {#if _.size(searchResults) > 0}
      {#each searchResults as res}
        <SearchResult modelPath={res.path} />
      {/each}
    {/if}
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
    height: calc(100% - 24px);
  }

  .search-controls {
    width: 100%;
    height: 24px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    background-color: #f8f8f8;
    border-top: 1px solid #ccc;
    font-size: 15px;
  }

  .search-controls > input {
    margin: 0 6px;
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
    overflow: auto;
  }

  .search-help {
    width: 100%;
    height: 100%;
    padding: 10px;
    line-height: 32px;
  }

  code {
    background-color: #e5e5e5;
    padding: 2.5px;
    border-radius: 3px;
    margin: 0 2px;
  }
</style>
