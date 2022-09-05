import _ from "lodash";
import { expandPath } from "./stores";
import type { MonacoEditor, PathValuePair } from "./types";

export function parseJsonString(str: string): string | undefined {
  try {
    return JSON.parse(str);
  } catch (e) {
    return undefined;
  }
}

export function valueToString(value: any): string {
  if (_.isEqual(value, {})) {
    return "{ }";
  } else if (_.isEqual(value, [])) {
    return "[ ]";
  } else if (value === null) {
    return "null";
  }
  return _.toString(value);
}

export function getObjectEntries(val: any): Array<[string, any]> {
  if (_.isPlainObject(val) || _.isArray(val)) {
    return Object.entries(val);
  }
  return [];
}

export function pathArrayToString(pathArr: Array<string>): string {
  return pathArr.length > 0 ? pathArr.join(".") : "Root";
}

export function setEditorValue(editor: MonacoEditor, value: any) {
  if (value !== undefined) {
    editor?.getModel()?.setValue(stringify(value));
  }
}

export function getValueInModelByPath(modelValue: any, path: Array<string>): any {
  return _.isEmpty(path)
    ? modelValue
    : _.get(modelValue, path);
}

export function getAllPathValues(modelValue: any): Array<PathValuePair> {
  const pvs: Array<PathValuePair> = [];
  const stack: Array<Array<string>> = [[]];

  while (stack.length > 0) {
    const path = stack.pop();
    const value = _.isEmpty(path) ? modelValue : _.get(modelValue, path);
    pvs.push({ path, value });

    for (const entry of getObjectEntries(value)) {
      stack.push([...path, entry[0]]);
    }
  }
  return pvs;
}

export function revealTreeNode(modelPath: Array<string>) {
  if (modelPath.length > 0) {
    // Expand all paths but the one being revealed
    expandPath(modelPath.slice(0, modelPath.length - 1));
  }
  document.getElementById(pathArrayToString(modelPath)).scrollIntoView();
}

export function stringify(val: any) {
  return _.isString(val) ? val : JSON.stringify(val, null, "\t");
}