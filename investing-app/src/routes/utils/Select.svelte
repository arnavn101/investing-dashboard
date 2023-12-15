<script>
    import { SelectedStock } from "./store";

    export let options = [];
    export let display_func = (a) => a;
    export let index = 0;

    $: {
        SelectedStock.set(options[index]);
    }
</script>

<div class="select-container">
    <select class="custom-select" bind:value={index}>
        {#each options as option, i}
            <option value={i}>{display_func(option)}</option>
        {/each}
    </select>
    <div class="arrow" />
</div>

<style>
    .select-container {
        position: relative;
        display: inline-block;
        width: 60%;
    }

    .custom-select {
        width: 100%;
        padding: 10px;
        font-size: 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        appearance: none;
        background-color: #fff;
        cursor: pointer;
    }

    .custom-select:hover {
        border-color: #aaa;
    }

    .custom-select:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
    }

    .custom-select option {
        padding: 10px;
    }

    .arrow {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 5px 5px 0 5px;
        border-color: #555 transparent transparent transparent;
    }
</style>
