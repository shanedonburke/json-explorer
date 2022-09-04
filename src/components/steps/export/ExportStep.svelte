<script lang="ts">
  import type { MonacoEditor } from "src/lib/types";
  import { onMount } from "svelte";
  import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
  import { model } from "src/lib/stores";
  import { stringify } from "src/lib/util";

  let editorEl: HTMLDivElement = null;
  let editor: MonacoEditor;
  let Monaco: any;

  model.subscribe((value) => editor?.getModel()?.setValue(stringify(value)));

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
      readOnly: true,
    });

    return () => {
      editor.dispose();
    };
  });
</script>
