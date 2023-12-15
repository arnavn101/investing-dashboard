import fetch from "node-fetch";
import logger from "../modules/logger.js";
import { BollingerBands, SMA, RSI } from "@debut/indicators";
import { initStockTable } from "./stock-analytics-db.js";
import { getAllTables } from "./db-config.js";

export const LIST_SYMBOL_ATTRS = ["symbol"];
const STOCK_HUB_URL = "http://stock-data-hub:3000/api";
const EVENT_BUS_URL = "http://event-bus:5005/events";

// Setup DB
await updateAnalyticsEvent();

export async function addAssetData(stockSymbol) {
    const response = await fetch(EVENT_BUS_URL, {
        method: "POST",
        body: JSON.stringify({
            type: "AddStockData",
            data: {
                symbol: stockSymbol,
            },
        }),
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Got error from Stock Hub API: ${response.status}`);
    }
}

async function getAssetData(stockSymbol) {
    const url = `${STOCK_HUB_URL}/data`;

    if (stockSymbol !== undefined) {
        url += `?symbol=${stockSymbol}`;
    }
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Got error from Stock Hub API: ${response.status}`);
    }

    const respJson = await response.json();
    return respJson;
}

function provideAnalytics(bars) {
    const listIndicators = {
        MACD: new SMA(4),
        BB: new BollingerBands(4, 3),
        RSI: new RSI(4),
    };
    const barsAnalysis = [];

    bars.forEach(
        ({
            ClosePrice,
            HighPrice,
            LowPrice,
            TradeCount,
            OpenPrice,
            Timestamp,
            Volume,
            VWAP,
        }) => {
            const curAnalysis = { timestamp: Timestamp };
            let doesAnalysisExist = true;
            for (const [indicatorName, indicator] of Object.entries(
                listIndicators
            )) {
                const val = indicator.nextValue(ClosePrice);
                if (val !== undefined) {
                    curAnalysis[indicatorName] = val;
                } else {
                    doesAnalysisExist = false;
                }
            }
            if (doesAnalysisExist) {
                barsAnalysis.push(curAnalysis);
            }
        }
    );

    return barsAnalysis;
}

export async function updateAnalyticsEvent() {
    const assetData = await getAssetData();

    for (const [symbol, bars] of Object.entries(assetData)) {
        const stockAnalyticsTable = await initStockTable(
            symbol,
            !(await getAllTables()).includes(symbol)
        );

        for (const analytics of provideAnalytics(bars)) {
            stockAnalyticsTable.create(analytics);
        }
    }

    logger.debug("Analyzed new data from Stock Hub API");
}

export default LIST_SYMBOL_ATTRS;
