import Alpaca from "@alpacahq/alpaca-trade-api";
import logger from "./logger.js";
import { initStockTable } from "./stock-data-db.js";
import { getAllTables } from "./db-config.js";

export const LIST_SYMBOL_ATTRS = ["symbol"];

const alpaca = new Alpaca({
    keyId: process.env.ALPACA_KEY,
    secretKey: process.env.ALPACA_SECRET,
    paper: true,
});

// Setup DB
await extractAssetSymbols(process.env.LIMIT);
await extractLatestAssetData(process.env.INTERVAL);

async function extractAssetSymbols(limit) {
    const allSymbols = await alpaca
        .getAssets({
            status: "active",
            exchange: "NYSE",
        })
        .then((assets) => assets.map((asset) => asset.symbol))
        .then((symbols) => symbols.filter((s) => !s.includes(".")));
    const shuffled = allSymbols.sort(function () {
        return 0.5 - Math.random();
    });
    const truncSymbols = shuffled.slice(0, limit);
    logger.info(`Extracted ${truncSymbols.length} asset symbols`);

    for (const symbol of truncSymbols) {
        await initStockTable(symbol, !(await getAllTables()).includes(symbol));
    }
}

export async function extractAssetData(symbol) {
    let resp = alpaca.getBarsV2(symbol, {
        limit: process.env.INTERVAL,
        timeframe: "1Min",
    });

    const stockTable = await initStockTable(
        symbol,
        !(await getAllTables()).includes(symbol)
    );

    for await (let b of resp) {
        await stockTable.create(b);
    }
}

async function extractLatestAssetData() {
    for (const symbol of await getAllTables()) {
        await extractAssetData(symbol);
    }
}

export async function updateDataEvent() {
    await extractLatestAssetData();
    logger.info("Pulled new data from Alpaca API");
}
