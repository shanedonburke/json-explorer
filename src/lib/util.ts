import _ from 'lodash';
import { ROOT_NODE_KEY } from './constants';
import { expandPath } from './stores';
import type { MonacoEditor, PathValuePair } from './types';

/**
 * Parses a JSON string.
 * @param str JSON to parse
 * @returns The parsed value, or `undefined` if it wasn't valid JSON
 */
export function parseJsonString(str: string): any | undefined {
  try {
    return JSON.parse(str);
  } catch (e) {
    return undefined;
  }
}

/**
 * Stringifies a value to be suitable for display.
 * @param value Value to stringify
 * @returns The stringified value
 */
export function valueToString(value: any): string {
  if (_.isEqual(value, {})) {
    return '{ }';
  } else if (_.isEqual(value, [])) {
    return '[ ]';
  } else if (value === null) {
    return 'null';
  }
  return _.toString(value);
}

/**
 * Gets the entries for the given value. Note that
 * only plain objects and arrays have entries.
 * @param val Object to get entries for
 * @returns Object entries, or an empty array
 */
export function getObjectEntries(val: any): Array<[string, any]> {
  if (_.isPlainObject(val) || _.isArray(val)) {
    return Object.entries(val);
  }
  return [];
}

/**
 * Converts a model path array to a key that's
 * suitable for use with lodash.
 * @param pathArr Model path array
 * @returns String key representing path
 */
export function pathArrayToString(pathArr: Array<string>): string {
  return pathArr.length > 0 ? pathArr.join('.') : ROOT_NODE_KEY;
}

export function pathStringToArray(pathStr: string): Array<string> {
  const str = pathStr.trim();
  if (str === 'Root' || str === '') {
    return [];
  }
  return pathStr.split('.');
}

/**
 * Sets the text value of the given Monaco editor.
 * @param editor Monaco editor
 * @param value Value to set in editor
 */
export function setEditorValue(editor: MonacoEditor, value: any) {
  if (value !== undefined) {
    editor?.getModel()?.setValue(stringify(value));
  }
}

/**
 * Gets a value in the model at the given path.
 * For example, `getValueInModelByPath({ num: 4 }, ["num"])` returns `4`.
 * @param modelValue Value of the full model, i.e. the root value
 * @param path Model path
 * @returns A value from the model
 */
export function getValueInModelByPath(
  modelValue: any,
  path: Array<string>
): any {
  return _.isEmpty(path) ? modelValue : _.get(modelValue, path);
}

/**
 * Gets an array of all paths (incl. nested) in the model paired with their respective values.
 * @param modelValue Value of the full model, i.e. the root value
 * @returns All path-value pairs
 */
export function getAllPathValues(modelValue: any): Array<PathValuePair> {
  const pvs: Array<PathValuePair> = [];
  const stack: Array<Array<string>> = [[]];

  while (stack.length > 0) {
    const path = stack.pop();
    const value = _.isEmpty(path) ? modelValue : _.get(modelValue, path);
    pvs.push({ path, value });

    for (const entry of getObjectEntries(value)) {
      // entry[0] is the entry key
      stack.push([...path, entry[0]]);
    }
  }
  return pvs;
}

/**
 * Expands the tree node at the given model path, and
 * scrolls to make sure it's visible.
 * @param modelPath Model path of node to reveal
 */
export function revealTreeNode(modelPath: Array<string>) {
  if (modelPath.length > 0) {
    // Expand all paths but the one being revealed
    expandPath(modelPath.slice(0, modelPath.length - 1));
  }
  setTimeout(() =>
    document.getElementById(pathArrayToString(modelPath)).scrollIntoView()
  );
}

/**
 * Stringifies a value into beautified (i.e. formatted) JSON.
 * @param val Value to stringify
 * @returns Beautified JSON
 */
export function stringify(val: any) {
  return JSON.stringify(val, null, '\t');
}
