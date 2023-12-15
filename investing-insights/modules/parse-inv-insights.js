import fetch from "node-fetch";
import logger from "./logger.js";
import { initStockTable } from "./stock-insights-db.js";
import { getAllTables } from "./db-config.js";

export const LIST_SYMBOL_ATTRS = ["symbol"];
const STOCK_ANALYTICS_URL = "http://stock-analytics:4000/api";
const EVENT_BUS_URL = "http://event-bus:5005/events";

// Setup DB
await updateInsightsEvent();

function notContainKeys(obj, keys) {
    return keys.every((key) => key in obj);
}

export async function addAnalyticsData(stockSymbol) {
    const response = await fetch(EVENT_BUS_URL, {
        method: "POST",
        body: JSON.stringify({
            type: "AddStockAnalytics",
            data: {
                symbol: stockSymbol,
            },
        }),
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(
            `Got error from Stock Analytics API: ${response.status}`
        );
    }
}

async function getAnalyticsData(stockSymbol) {
    const url = `${STOCK_ANALYTICS_URL}/analysis`;

    if (stockSymbol !== undefined) {
        url += `?symbol=${stockSymbol}`;
    }
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Got error from Stock Analytics API: ${response.status}`
        );
    }

    const respJson = await response.json();
    return respJson;
}

function provideInsights(analysis) {
    // Simple Strat
    // Buy if Average RSI < 50, MACD increasing, Average Upper - Lower BB < 1
    // Sell if Average RSI >= 50, MACD decreasing, Average Upper - Lower BB >= 1

    const signals = [];
    let sumRSI = 0;
    let sumBBDiff = 0;

    const attrExists = (obj) => notContainKeys(obj, ["MACD", "BB", "RSI"]);

    const listTs = Object.keys(analysis);
    listTs.sort();

    for (let i = 0; i < listTs.length; ++i) {
        const indicatorData = analysis[listTs[i]];

        const curSignal = { timestamp: listTs[i] };
        let doesInsightExist = false;

        if (attrExists(indicatorData)) {
            sumRSI += indicatorData["RSI"];
            sumBBDiff +=
                indicatorData["BB"]["upper"] - indicatorData["BB"]["lower"];

            // Need at least 1 past datapoint with all entries
            let prevIndicatorData = {};
            if (
                i > 0 &&
                attrExists((prevIndicatorData = analysis[listTs[i - 1]]))
            ) {
                // TODO - check that all attrs exist
                const isMACDInc =
                    indicatorData["MACD"] > prevIndicatorData["MACD"];

                const n = i + 1;
                const doBuy = sumRSI / n < 50 && sumBBDiff / n < 1 && isMACDInc;
                curSignal.signal = doBuy ? "BUY" : "SELL";
                doesInsightExist = true;
            }

            if (doesInsightExist) {
                signals.push(curSignal);
            }
        }
    }

    return signals;
}

export async function updateInsightsEvent() {
    const analyticsData = await getAnalyticsData();

    for (const [symbol, analysis] of Object.entries(analyticsData)) {
        const stockInsightsTable = await initStockTable(
            symbol,
            !(await getAllTables()).includes(symbol)
        );

        for (const insights of provideInsights(analysis)) {
            stockInsightsTable.create(insights);
        }
    }

    logger.debug("Got insights with new data from Stock Analytics API");
}

export default LIST_SYMBOL_ATTRS;
