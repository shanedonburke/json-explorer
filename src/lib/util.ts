import _ from "lodash";
import type { MonacoEditor } from "./types";

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
  // let path = "";

  // for (const segment of pathArr) {
  //   const asNum = Number(segment);
  //   if (!_.isNaN(asNum)) {
  //     if (path.length > 0 && path[path.length - 1] === ".") {
  //       path = path.substring(0, path.length - 1);
  //     }
  //     path += `[${asNum}]`;
  //   } else {
  //     path += `${segment}.`
  //   }
  // }
  // if (path[path.length - 1] === ".") {
  //   path = path.substring(0, path.length - 1);
  // }
  // return path;
  return pathArr.join(".");
}

export function setEditorValue(editor: MonacoEditor, value: any) {
  if (value !== undefined) {
    const newValue = _.isString(value) ? value : JSON.stringify(value, null, "\t");
    editor?.getModel()?.setValue(newValue);
  }
}

export function getValueInModelByPath(modelValue: any, path: Array<string>): any {
  return _.isEmpty(path)
    ? modelValue
    : _.get(modelValue, path);
}