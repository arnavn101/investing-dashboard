import express from "express";
import {
    LIST_SYMBOL_ATTRS,
    updateInsightsEvent,
    addAnalyticsData,
} from "../modules/parse-inv-insights.js";
import { getStockInsightsData } from "../modules/stock-insights-db.js";
import { getAllTables } from "../modules/db-config.js";
import "express-async-errors";
import cors from "cors";

const apiRouter = express.Router();
apiRouter.use(cors());

setInterval(
    async () => await updateInsightsEvent(),
    60000 * (process.env.INTERVAL + 1)
);

const returnMessage = (status, reason) => ({
    success: status,
    reason: reason || "N/A",
});

apiRouter.get("/", (_, res) => {
    res.send("Welcome to Investing Insights API!");
});

apiRouter.get("/insights", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const querySymbol = req.query.symbol;

    if (querySymbol === undefined) {
        res.send(await getStockInsightsData());
    } else if (!(await getAllTables()).includes(querySymbol)) {
        res.status(404).send(
            returnMessage(
                false,
                "The requested stock does not have insights in the database."
            )
        );
    } else {
        res.send(await getStockInsightsData(querySymbol));
    }
});

apiRouter.post("/events", async (req, res) => {
    const { type, data } = req.body;

    if (type === "AddStockInsights") {
        res.setHeader("Content-Type", "application/json");

        if (LIST_SYMBOL_ATTRS.some((attr) => !(attr in data))) {
            res.status(400).send(
                returnMessage(
                    false,
                    `The request body did not contain the attributes ${LIST_SYMBOL_ATTRS.join(
                        ", "
                    )}`
                )
            );
        } else if ((await getAllTables()).includes(data.symbol)) {
            res.status(409).send(
                returnMessage(
                    false,
                    "The symbol insights already exists in the database"
                )
            );
        } else {
            await addAnalyticsData(data.symbol);
            await updateInsightsEvent();
            res.status(200).send(returnMessage(true));
        }
    } else {
        res.status(404).send("Event cannot be handled");
    }
});

export default apiRouter;
