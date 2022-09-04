<script lang="ts">
  import _ from "lodash";
  import { activeModelPath, expandPath } from "./stores";

  import { pathArrayToString } from "./util";

  export let modelPath: Array<string>;

  let isEditing = false;

  function handleClick() {
    expandPath(modelPath);
    activeModelPath.update(() => modelPath);
  }

  activeModelPath.subscribe((value) => {
    isEditing = _.isEqual(modelPath, value);
  });
</script>

<div class="result" on:click={handleClick} class:selected={isEditing}>
  {pathArrayToString(modelPath)}
</div>

<style>
  .result {
    width: 100%;
    padding: 2px 6px;
    border-bottom: 1px solid #aaa;
    border-left: 4px solid transparent;
  }

  .selected {
    border-left: 4px solid #3d4;
    background-color: #e5ffe5;
  }

  .result:hover {
    background-color: #0000000f;
  }
</style>
