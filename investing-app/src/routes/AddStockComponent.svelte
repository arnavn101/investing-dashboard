<script>
    import { Stock } from "./utils/stocks.js";
    import { SelectedStock, Store } from "./utils/store.js";
    import { retrieveStockInsights, addNewStock } from "./utils/fetch-data.js";

    export let show = false;
    let stockName;

    function close() {
        show = false;
    }

    async function handleSubmit() {
        show = false;
        const curStockName = stockName;
        stockName = ""; // Clear input

        const successAddedStock = await addNewStock(curStockName);

        if (!successAddedStock) {
            console.log("Failed to add stock");
            return;
        }

        const newStockData = await retrieveStockInsights(curStockName);
        Store.update((stocks) => {
            const newStock = Stock.fromJson([curStockName, newStockData]);
            stocks.addStock(newStock);
            return stocks;
        });
    }
</script>

{#if show}
    <div class="modal">
        <div class="modal-content">
            <h1 id="title">Add Stock</h1>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span class="close" on:click={close}>✕</span>
            <form on:submit|preventDefault={handleSubmit} id="form">
                <input
                    type="text"
                    id="name"
                    bind:value={stockName}
                    placeholder="Stock Ticker"
                    class="form-item"
                    required
                />
                <button type="submit" id="submit-btn">Submit</button>
            </form>
        </div>
    </div>
{/if}

<style>
    .modal {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
        z-index: 1;
    }

    .modal-content {
        top: 10%;
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        position: relative;
        max-width: 500px;
        margin: 0 auto;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .close {
        position: absolute;
        top: 3px;
        right: 10px;
        font-size: 20px;
        cursor: pointer;
        color: #555;
    }

    #form {
        display: flex;
        flex-direction: column;
        margin-top: 30px;
    }

    .form-item {
        margin-bottom: 15px;
        padding: 10px;
        resize: none;
        border: 1px solid #ddd;
        border-radius: 5px;
    }

    #submit-btn {
        background-color: #2980b9;
        color: #fff;
        padding: 12px;
        cursor: pointer;
        border: none;
        border-radius: 5px;
        font-size: 16px;
        transition: background-color 0.3s ease;
    }

    #submit-btn:hover {
        background-color: #175e8d;
    }

    #title {
        font-size: x-large;
        text-align: center;
        color: #333;
    }
</style>
