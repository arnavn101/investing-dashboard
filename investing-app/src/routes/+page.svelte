<script>
    import StockListComponent from "./StockListComponent.svelte";
    import { Stocks } from "./utils/stocks.js";
    import { Store } from "./utils/store.js";
    import { retrieveStockInsights } from "./utils/fetch-data.js";

    const setInitialStockData = async () => {
        const data = await retrieveStockInsights();
        Store.set(Stocks.fromJson(data));
    };
</script>

{#await setInitialStockData()}
    Loading stock data...
{:then}
    <StockListComponent />
{:catch error}
    Internal server error: {error.message}.
{/await}
