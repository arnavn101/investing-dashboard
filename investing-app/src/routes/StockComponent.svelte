<script>
    import { onMount } from "svelte";
    import { Stock } from "./utils/stocks";

    export let stock = Stock.create();

    let StockDataSignalGraphComponent;

    onMount(async () => {
        const module = await import("./StockDataGraphComponent.svelte");
        StockDataSignalGraphComponent = module.default;
    });
</script>

<div class="stock-container">
    {#key stock.getData()}
        <svelte:component
            this={StockDataSignalGraphComponent}
            {...{ initialData: stock.getData() }}
        />
    {/key}
</div>

<style>
    .stock-container {
        margin: 20px;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
</style>
