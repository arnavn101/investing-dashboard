<script>
    import StockComponent from "./StockComponent.svelte";
    import AddStockComponent from "./AddStockComponent.svelte";
    import Select from "./utils/Select.svelte";
    import { Stocks } from "./utils/stocks.js";
    import { SelectedStock, Store } from "./utils/store.js";

    let listStocks = Stocks.create();
    let index = 0;

    Store.subscribe((_listStocks) => {
        listStocks = _listStocks;
        index = listStocks.getStocks().length - 1;
    });

    let showAddStock = false;
    function handleAddStockClick() {
        showAddStock = true;
    }
</script>

<main>
    <div class="container">
        <h1>Investing Insights</h1>
        <div class="header">
            <Select
                options={listStocks.getStocks()}
                display_func={(stock) => stock.getName()}
                bind:index
            />
            <button on:click={handleAddStockClick} class="add-button">+</button>
        </div>
        <StockComponent stock={$SelectedStock} />
    </div>
    <AddStockComponent bind:show={showAddStock} />
</main>

<style>
    main {
        text-align: center;
        margin: 20px;
    }

    .container {
        width: 60%;
        margin: 0 auto;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        background-color: #fff;
    }

    h1 {
        font-size: 24px;
        color: #333;
        margin-bottom: 20px;
    }

    .header {
        display: center;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
    }

    .add-button {
        font-size: 20px;
        padding: 8.5px 15px;
        background-color: #2980b9;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        margin-left: 10px;
    }

    .add-button:hover {
        background-color: #175e8d;
    }

    .add-button:hover {
        background-color: #267bbd;
    }
</style>
