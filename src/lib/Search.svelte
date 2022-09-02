<script lang="ts">
  import _ from "lodash";
  import type monaco from "monaco-editor";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import { onMount } from "svelte";
  import { getObjectEntries, parseJsonString } from "./util";

  interface PathValuePair {
    path: Array<string>;
    value: any;
  }

  export let model: any;

  let editorEl: HTMLDivElement = null;
  let editor: monaco.editor.IStandaloneCodeEditor;
  let Monaco: any;

  let pathValues: Array<PathValuePair> = [];
  let searchResults: Array<PathValuePair> = [];

  let containerEl: HTMLDivElement = null;
  let splitterEl: HTMLDivElement = null;
  let resultsEl: HTMLDivElement = null;

  let isSplitterMouseDown = false;

  $: model, (pathValues = getAllPathValues());

  function handleSplitterMouseDown() {
    isSplitterMouseDown = true;
  }

  function handleSplitterMouseMove(event: MouseEvent) {
    if (isSplitterMouseDown) {
      const containerWidth = containerEl.clientWidth;
      const mouseX = event.clientX - containerEl.clientLeft;
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
    });

    editor.onDidChangeModelContent(() => {
      const query: any = parseJsonString(editor.getModel().getValue());
      if (query !== undefined) {
        const allMatches = pathValues.filter((pv) => {
          return _.isMatch(pv.value, query);
        });
        const leafMatches = allMatches.filter((pv) => {
          return !allMatches.some(
            (pv2) =>
              pv2.path.length > pv.path.length &&
              pv.path.every((pathSegment, i) => pv2.path[i] === pathSegment)
          );
        });
        searchResults = leafMatches;
      }
    });

    return () => {
      editor.dispose();
    };
  });

  function getAllPathValues(): Array<PathValuePair> {
    const pvs: Array<PathValuePair> = [];
    const stack: Array<Array<string>> = [[]];

    while (stack.length > 0) {
      const path = stack.pop();
      const value = _.isEmpty(path) ? model : _.get(model, path);
      pvs.push({ path, value });

      for (const entry of getObjectEntries(value)) {
        stack.push([...path, entry[0]]);
      }
    }
    return pvs;
  }
</script>

<div bind:this={containerEl} class="search-container">
  <div class="search-monaco-editor-container">
    <div bind:this={editorEl} class="search-monaco-editor" />
  </div>
  <div
      bind:this={splitterEl}
      class="search-splitter"
      on:mousedown={handleSplitterMouseDown}
    />
  <div bind:this={resultsEl} class="search-results" />
</div>

<style>
  .search-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-size: 0;
  }

  .search-container > div {
    display: inline-block;
  }

  .search-monaco-editor-container {
    width: calc(50% - 8px);
    height: 100%;
  }

  .search-monaco-editor {
    width: 100%;
    height: 100%;
  }

  .search-splitter {
    width: 16px;
    height: 100%;
    border-left: 1px solid #b0b0b0;
    border-right: 1px solid #b0b0b0;
    user-select: none;
  }

  .search-results {
    width: calc(50% - 8px);
    height: 100%;
    background: yellowgreen;
  }
</style>
