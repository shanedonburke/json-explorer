<script lang="ts">
  import _ from "lodash";
  import InputStep from "./components/steps/input/InputStep.svelte";
  import ExploreStep from "./components/steps/explore/ExploreStep.svelte";
  import { inputJson, model } from "./lib/stores";
  import ExportStep from "./components/steps/export/ExportStep.svelte";
  import { parseJsonString } from "./lib/util";

  function setCurrStep(clickedStep: number): void {
    currStep = clickedStep;
  }

  inputJson.subscribe((value) => {
    const newModel = parseJsonString(value);
    if (newModel !== undefined && !_.isEqual(model, newModel)) {
      model.update(() => newModel);
    }
  });

  /**
   * Index of current step (0 for input, 1 for explore, 2 for export).
   */
  let currStep = 0;
</script>

<main>
  <div class="container">
    <div class="navbar">
      <button class:selected={currStep === 0} on:click={() => setCurrStep(0)}>
        <span><b>Step 1: </b>Input</span>
      </button>
      <div class="navbar-btn-divider" />
      <button class:selected={currStep === 1} on:click={() => setCurrStep(1)}>
        <span><b>Step 2: </b>Explore / Edit</span>
      </button>
      <div class="navbar-btn-divider" />
      <button class:selected={currStep === 2} on:click={() => setCurrStep(2)}>
        <span><b>Step 3: </b>Export</span>
      </button>
    </div>
    <div style="width: 100%; height: 100%; overflow-x: hidden">
      <div
        style="width: 100%; height: 100%"
        class:display-none={currStep !== 0}
      >
        <InputStep on:nextStep={() => setCurrStep(1)} />
      </div>
      <div
        style="width: 100%; height: 100%"
        class:display-none={currStep !== 1}
      >
        <ExploreStep />
      </div>
      <div
        style="width: 100%; height: 100%"
        class:display-none={currStep !== 2}
      >
        <ExportStep />
      </div>
    </div>
  </div>
</main>

<style>
  main {
    width: 100%;
    height: 100%;
  }

  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .navbar {
    width: 100%;
    min-height: 40px;
    display: flex;
    justify-content: space-evenly;
    border-bottom: 1px solid #d0d0d0;
  }

  .navbar > button {
    width: 100%;
    height: 100%;
    background-color: #f8f8f8;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .navbar > button:hover {
    background-color: #eaeaea;
  }

  .navbar > button.selected {
    background-color: #e5e5e5;
  }

  .navbar-btn-divider {
    min-width: 1px;
    height: 100%;
    background-color: #d5d5d5;
  }
</style>
