<script lang="ts">
  /** Toast text */
  export let text: string;

  /** Background color for the toast */
  export let backgroundColor: string;

  /**
   * Whether the toast should be shown.
   * The exit animation starts when this is set to `false`.
   */
  export let shouldShow = false;

  /** Whether the toast is actually visible */
  let isVisible = false;

  $: {
    if (shouldShow) {
      isVisible = true;
    } else {
      // Hide after 500s exit animation
      setTimeout(() => isVisible = false, 500);
    }
  }
</script>

<div class="container" class:toast-enter={isVisible} class:toast-exit={!shouldShow && isVisible}>
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
    pointer-events: none;
  }

  .toast {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    padding: 0 15px;
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
