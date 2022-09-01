import { writable, type Writable } from "svelte/store";
import _ from "lodash";

export const editModelPath: Writable<Array<string>> = writable([]);

export const expandedModelPaths: Writable<Array<Array<string>>> = writable([]);

export function expandPath(path: Array<string>): void {
  const pathsToAdd: Array<Array<string>> = [[]];
  for (let i = 0; i < path.length; i++) {
    pathsToAdd.push(path.slice(0, i + 1));
  }
  expandedModelPaths.update((existingPaths) => {
    return _.uniq([...existingPaths, ...pathsToAdd]);
  });
}

export function collapsePath(path: Array<string>): void {
  expandedModelPaths.update((existingPaths) => {
    const newPaths = _.filter(existingPaths, (existingPath) => {
      if (existingPath.length < path.length) {
        return true;
      }
      for (let i = 0; i < path.length; i++) {
        if (existingPath[i] !== path[i]) {
          return true;
        }
      }
      return false;
    });
    return newPaths;
  });
}
