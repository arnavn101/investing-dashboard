import express from "express";
import {
    LIST_SYMBOL_ATTRS,
    updateAnalyticsEvent,
    addAssetData,
} from "../modules/parse-stock-analytics.js";
import { getStockAnalyticsData } from "../modules/stock-analytics-db.js";
import { getAllTables } from "../modules/db-config.js";
import "express-async-errors";
import cors from "cors";

const apiRouter = express.Router();
apiRouter.use(cors());

setInterval(
    async () => await updateAnalyticsEvent(),
    60000 * (process.env.INTERVAL + 1)
);

const returnMessage = (status, reason) => ({
    success: status,
    reason: reason || "N/A",
});

apiRouter.get("/", (_, res) => {
    res.send("Welcome to Stock Analytics API!");
});

apiRouter.get("/analysis", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const querySymbol = req.query.symbol;

    if (querySymbol === undefined) {
        res.send(await getStockAnalyticsData());
    } else if (!(await getAllTables()).includes(querySymbol)) {
        res.status(404).send(
            returnMessage(
                false,
                "The requested stock does not have analyses in the database."
            )
        );
    } else {
        res.send(await getStockAnalyticsData(querySymbol));
    }
});

apiRouter.post("/events", async (req, res) => {
    const { type, data } = req.body;

    if (type === "AddStockAnalytics") {
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
                    "The symbol analysis already exists in the database"
                )
            );
        } else {
            await addAssetData(data.symbol);
            await updateAnalyticsEvent();
            res.status(200).send(returnMessage(true));
        }
    } else {
        res.status(404).send("Event cannot be handled");
    }
});

export default apiRouter;
