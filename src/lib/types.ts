import type monaco from "monaco-editor";

export type MonacoEditor = monaco.editor.IStandaloneCodeEditor;

/** A model path and its value */
export interface PathValuePair {
  path: Array<string>;
  value: any;
}