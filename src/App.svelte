<script lang="ts">
  import _ from 'lodash';
  import InputStep from "./lib/InputStep.svelte";
  import ExploreStep from "./lib/ExploreStep.svelte";

  function parseJsonString(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return undefined;
    }
  }

  function setCurrStep(clickedStep: number): void {
    currStep = clickedStep;
  }

  function handleInputChange(event) {
    inputJson = event.detail.value;

    const newModel = parseJsonString(inputJson);
    if (newModel !== undefined && !_.isEqual(model, newModel)) {
      model = newModel;
    }
  }

  function handleSetModel(event) {
    model = event.detail.model;
  }

  let currStep = 0;
  let inputJson = JSON.stringify({
    a: {
      b: 1,
      c: [0, { d: 2 }]
    }
  }, null, "\t");
  let model = parseJsonString(inputJson);
</script>

<main>
  <div class="container">
    <div class="navbar">
      <button class:selected={currStep === 0} on:click={() => setCurrStep(0)}>
        <span><b>Step 1: </b>Input</span>
      </button>
      <div class="navbar-btn-divider" />
      <button class:selected={currStep === 1} on:click={() => setCurrStep(1)}>
        <span><b>Step 2: </b>Explore/Edit</span>
      </button>
      <div class="navbar-btn-divider" />
      <button class:selected={currStep === 2} on:click={() => setCurrStep(2)}>
        <span><b>Step 3: </b>Export</span>
      </button>
    </div>
    <div style="width: 100%; height: 100%; overflow-x: hidden">
      <div style="width: 100%; height: 100%" class:display-none={currStep !== 0}>
        <InputStep {inputJson} on:inputChange={handleInputChange} on:nextStep={() => setCurrStep(1)} />
      </div>
      <div style="width: 100%; height: 100%" class:display-none={currStep !== 1}>
        <ExploreStep {inputJson} {model} on:setModel={handleSetModel} />
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

  .navbar > button.selected {
    background-color: #e5e5e5;
  }

  .navbar-btn-divider {
    width: 1px;
    height: 100%;
    background-color: #dfdfdf;
  }
</style>
