<script lang="ts">
  import { pathArrayToString } from "./util";

  export let path: Array<string>;
</script>

<div class="container">{pathArrayToString(path)}</div>

<style>
  .container {
    width: 100%;
    padding: 2px 10px;
  }
</style>