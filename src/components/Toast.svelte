<script lang="ts">
  export let text: string;
  export let backgroundColor: string;
  export let shouldShow = false;

  $: hasBeenShown = shouldShow ? true : hasBeenShown;
</script>

<div class="container" class:toast-enter={shouldShow} class:toast-exit={!shouldShow && hasBeenShown}>
  <div class="toast" style:background={backgroundColor}>
    <span>{text}</span>
  </div>
</div>

<style>

  .container {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: stretch;
    width: 100%;
    height: 32px;
    z-index: 10;
    top: -32px;
  }

  .toast {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 200px;
    height: 100%;
    color: white;
    font-size: 15px;
    line-height: 15px;
    border-radius: 5px;
  }

  .toast-enter {
    animation-name: enter;
    animation-duration: 0.5s;
    animation-timing-function: ease-in-out;
    animation-fill-mode: forwards;
  }

  .toast-exit {
    animation-name: exit;
    animation-duration: 0.5s;
    animation-timing-function: ease-in-out;
    animation-fill-mode: forwards;
  }

  @keyframes enter {
    from {
      top: -32px;
    }
    to {
      top: 10px;
    }
  }

  @keyframes exit {
    from {
      top: 10px;
    }
    to {
      top: -32px;
    }
  }
</style>
