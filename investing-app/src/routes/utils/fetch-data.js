import { EVENT_BUS_URL, INVESTING_INSIGHTS_URL } from "./constants.js";

export async function retrieveStockInsights(stockName) {
    let reqURL = `${INVESTING_INSIGHTS_URL}/insights`;
    if (stockName != undefined) {
        reqURL += `?symbol=${stockName}`;
    }
    return fetch(reqURL).then((resp) => resp.json());
}

export async function addNewStock(stockName) {
    return fetch(EVENT_BUS_URL, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            type: "AddStockInsights",
            data: {
                symbol: stockName,
            },
        }),
    }).then((resp) => resp.ok);
}
