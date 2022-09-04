<script lang="ts">
  import _ from "lodash";
  import TreeNode from "./TreeNode.svelte";
  import "iconify-icon";
  import {
    collapsePath,
    activeModelPath,
    expandedModelPaths,
    expandPath,
  } from "../../../lib/stores";
  import { getObjectEntries, pathArrayToString, valueToString } from "../../../lib/util";

  export let key: string;
  export let value: any;
  export let modelPath: Array<string>;

  let isExpanded = false;
  let isEditing = false;

  $: valueDisplayText = `= ${valueToString(value)}`;

  activeModelPath.subscribe((value) => {
    isEditing = _.isEqual(modelPath, value);
  });

  function expand(event: PointerEvent) {
    event.stopPropagation();
    expandPath(modelPath);
  }

  function collapse(event: PointerEvent) {
    event.stopPropagation();
    collapsePath(modelPath);
  }

  function handleThisNodeClick() {
    activeModelPath.update(() => modelPath);
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
  <div
    class="tree-node"
    id={pathArrayToString(modelPath)}
    on:click={handleThisNodeClick}
    class:selected={isEditing}
  >
    <iconify-icon
      icon="bx:chevron-down"
      width="18"
      height="18"
      on:click={collapse}
      class:display-none={!isExpanded || _.isEmpty(getObjectEntries(value))}
    />
    <iconify-icon
      icon="bx:chevron-right"
      width="18"
      height="18"
      on:click={expand}
      class:display-none={isExpanded || _.isEmpty(getObjectEntries(value))}
    />
    <span
      class:text-padded={_.isEmpty(getObjectEntries(value))}
      class="key-text">{key}</span
    >
    {#if _.isEmpty(getObjectEntries(value))}
      <span class="value-text">{valueDisplayText}</span>
    {/if}
  </div>
  <div class="children" class:display-none={!isExpanded}>
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
    height: 18px;
    line-height: 18px;
    font-size: 14px;
    border-left: 4px solid transparent;
  }

  .tree-node:hover {
    background-color: #0000000f;
  }

  .selected {
    border-left: 4px solid #3d4;
    background-color: #e5ffe5;
  }

  .key-text {
    overflow: visible;
    font-weight: 500;
  }

  .value-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-left: 0.5ch;
    opacity: 0.7;
  }

  .text-padded {
    padding-left: 18px;
  }

  .children {
    margin-left: 10px;
    border-left: 1px solid #ccc;
  }
</style>
