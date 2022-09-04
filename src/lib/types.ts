import type monaco from "monaco-editor";

export type MonacoEditor = monaco.editor.IStandaloneCodeEditor;

export interface PathValuePair {
  path: Array<string>;
  value: any;
}