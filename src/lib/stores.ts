import { writable, type Writable } from "svelte/store";
import _ from "lodash";
import { pathArrayToString, stringify } from "./util";
import { ROOT_NODE_KEY, SAMPLE_JSON } from "./constants";

/**
 * The modified input JSON as edited by the user.
 * Changes to the model do not affect the input JSON.
 */
export const model: Writable<any> = writable(SAMPLE_JSON);

/**
 * The path within the model currently being edited by the user
 * in the explore step. For example, `["foo", "0", "bar"]`
 * represents `model.foo[0].bar`.
 */
export const activeModelPath: Writable<Array<string>> = writable([]);

/**
 * A map of stringified model paths to whether their respective tree
 * nodes have been expanded (to show children) by the user. For example.
 * `{ "foo.0.bar": true }` means that `model.foo[0].bar` has been expanded.
 */
export const expandedModelPaths: Writable<Map<string, boolean>> = writable(
  new Map<string, boolean>()
);

/**
 * The input JSON entered by the user. Edits to the model do not affect this.
 */
export const inputJson: Writable<string> = writable(stringify(SAMPLE_JSON));

/** Whether the tree in the explore step is loading changes. */
export const isTreeLoading: Writable<boolean> = writable(false);

/**
 * Expands the tree node (to show children) for the given model path.
 * @param path Model path to the node being expanded
 * @param expandParents If true, all parent nodes will be expanded too
 */
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

/**
 * Expands the tree nodes (to show children) for all given model paths.
 * @param allPaths Model paths to expand
 */
export function expandManyPaths(allPaths: Array<Array<string>>) {
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

/**
 * Collapses the tree node (to hide children) for the given model path.
 * Collapsing a node collapses all of its children.
 * @param path Model path to collapse
 */
export function collapsePath(path: Array<string>): void {
  if (path.length === 0) {
    // Collapse all paths, because the root node was collapse
    expandedModelPaths.update(() => new Map());
  } else {
    expandedModelPaths.update((existingPaths) => {
      const pathString = pathArrayToString(path);
      const newPaths = new Map(existingPaths);

      // Collapse all children too
      newPaths.forEach((_value, key) => {
        if (key.startsWith(pathString)) {
          newPaths.set(key, false);
        }
      });
      return newPaths;
    });
  }
}
