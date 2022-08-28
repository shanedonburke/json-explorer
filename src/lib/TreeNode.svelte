<script lang="ts">
  import TreeNode from "./TreeNode.svelte";

  export let key: string;
  export let value: any;
</script>

<div>
  <div class="tree-node">
    {key}
  </div>
  <div class="tree-node-children">
    {#each Object.entries(value) as [childKey, childValue]}
      <TreeNode key={childKey} value={childValue} />
    {/each}
  </div>
</div>

<style>
  .tree-node {
    padding: 0 10px;
  }

  .tree-node:hover {
    background-color: #00000008;
  }

  .tree-node-children {
    margin-left: 6px;
    border-left: 1px solid #ccc;
  }
</style>
