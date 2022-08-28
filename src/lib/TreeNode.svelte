<script lang="ts">
  import _ from "lodash";
  import TreeNode from "./TreeNode.svelte";
  import "iconify-icon";
  import { editModelPath } from './stores';

  export let key: string;
  export let value: any;
  export let modelPath: Array<string>;

  let isExpanded = false;

  function getObjectEntries(val): Array<[string, any]> {
    if (typeof val === "object") {
      return Object.entries(val);
    }
    return [];
  }

  function expand(event: PointerEvent) {
    event.stopPropagation();
    isExpanded = true;
  }

  function collapse(event: PointerEvent) {
    event.stopPropagation();
    isExpanded = false;
  }

  function handleThisNodeClick() {
    editModelPath.update(() => modelPath);
  }
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
    <span class:tree-node-text-padded={_.isEmpty(getObjectEntries(value))}>{key}</span>
  </div>
  <div class="tree-node-children" class:display-none={!isExpanded}>
    {#each getObjectEntries(value) as [childKey, childValue]}
      <TreeNode key={childKey} value={childValue} modelPath={[...modelPath, childKey]} />
    {/each}
  </div>
</div>

<style>
  .tree-node {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    line-height: 22px;
    font-size: 14px;
  }

  .tree-node:hover {
    background-color: #00000008;
  }

  .tree-node-text-padded {
    padding-left: 22px;
  }

  .tree-node-children {
    margin-left: 10px;
    border-left: 1px solid #ccc;
  }
</style>
