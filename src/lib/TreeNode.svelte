<script lang="ts">
  import _ from "lodash";
  import TreeNode from "./TreeNode.svelte";
  import "iconify-icon";
  import { collapsePath, editModelPath, expandedModelPaths, expandPath } from "./stores";

  export let key: string;
  export let value: any;
  export let modelPath: Array<string>;

  let isExpanded = false;

  $: valueDisplayText = `= ${valueToString()}`;

  function getObjectEntries(val): Array<[string, any]> {
    if (_.isObject(val)) {
      return Object.entries(val);
    }
    return [];
  }

  function expand(event: PointerEvent) {
    event.stopPropagation();
    expandPath(modelPath);
  }

  function collapse(event: PointerEvent) {
    event.stopPropagation();
    collapsePath(modelPath);
  }

  function handleThisNodeClick() {
    editModelPath.update(() => modelPath);
  }

  function valueToString(): string {
    if (_.isEqual(value, {})) {
      return "{}";
    } else if (_.isEqual(value, [])) {
      return "[]";
    }
    return _.toString(value);
  }

  expandedModelPaths.subscribe((value) => {
    isExpanded = false;

    for (const path of value) {
      if (_.isEqual(path, modelPath)) {
        isExpanded = true;
      }
    }
  });
</script>

<div>
  <div class="tree-node" on:click={handleThisNodeClick}>
    <iconify-icon
      icon="bx:chevron-down"
      width="22"
      height="22"
      on:click={collapse}
      class:display-none={!isExpanded || _.isEmpty(getObjectEntries(value))}
    />
    <iconify-icon
      icon="bx:chevron-right"
      width="22"
      height="22"
      on:click={expand}
      class:display-none={isExpanded || _.isEmpty(getObjectEntries(value))}
    />
    <span
      class:tree-node-text-padded={_.isEmpty(getObjectEntries(value))}
      class="tree-node-key-text">{key}</span
    >
    {#if _.isEmpty(getObjectEntries(value))}
      <span class="tree-node-value-text">{valueDisplayText}</span>
    {/if}
  </div>
  <div class="tree-node-children" class:display-none={!isExpanded}>
    {#each getObjectEntries(value) as [childKey, childValue]}
      <TreeNode
        key={childKey}
        value={childValue}
        modelPath={[...modelPath, childKey]}
      />
    {/each}
  </div>
</div>

<style>
  .tree-node {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    line-height: 16px;
    font-size: 14px;
  }

  .tree-node:hover {
    background-color: #00000008;
  }

  .tree-node-key-text {
    overflow: visible;
    font-weight: 500;
  }

  .tree-node-value-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-left: 0.5ch;
    opacity: 0.7;
  }

  .tree-node-text-padded {
    padding-left: 22px;
  }

  .tree-node-children {
    margin-left: 10px;
    border-left: 1px solid #ccc;
  }
</style>
