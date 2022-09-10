import { writable, type Writable } from "svelte/store";
import _ from "lodash";
import { pathArrayToString, stringify } from "./util";
import { ROOT_NODE_KEY, SAMPLE_JSON } from "./constants";

export const model: Writable<any> = writable(SAMPLE_JSON);

export const activeModelPath: Writable<Array<string>> = writable([]);

export const expandedModelPaths: Writable<Map<string, boolean>> = writable(
  new Map<string, boolean>()
);

export const inputJson: Writable<string> = writable(stringify(SAMPLE_JSON));

export const isTreeLoading: Writable<boolean> = writable(false);

export function expandPath(
  path: Array<string>,
  expandParents: boolean = true
): void {
  if (expandParents) {
    const pathsToAdd: Array<string> = [ROOT_NODE_KEY];
    for (let i = 0; i < path.length; i++) {
      pathsToAdd.push(pathArrayToString(path.slice(0, i + 1)));
    }
    expandedModelPaths.update((existingPaths) => {
      const newPaths = new Map(existingPaths);
      for (const newPath of pathsToAdd) {
        newPaths.set(newPath, true);
      }
      return newPaths;
    });
  } else {
    expandedModelPaths.update((existingPaths) => {
      const newPaths = new Map(existingPaths);
      newPaths.set(pathArrayToString(path), true);
      return newPaths;
    });
  }
}

export function expandAllPaths(allPaths: Array<Array<string>>) {
  isTreeLoading.update(() => true);
  // Timeout to let spinner in tree show first
  setTimeout(() => {
    expandedModelPaths.update((existingPaths) => {
      const newPaths = new Map(existingPaths);
      for (const path of allPaths) {
        newPaths.set(pathArrayToString(path), true);
      }
      return newPaths;
    });
  });
  // Will run once expansion is finished
  setTimeout(() => isTreeLoading.update(() => false));
}

export function collapsePath(path: Array<string>): void {
  if (path.length === 0) {
    expandedModelPaths.update(() => new Map());
  } else {
    expandedModelPaths.update((existingPaths) => {
      const pathString = pathArrayToString(path);
      const newPaths = new Map(existingPaths);
      newPaths.forEach((_value, key) => {
        if (key.startsWith(pathString)) {
          newPaths.set(key, false);
        }
      });
      return newPaths;
    });
  }
}
