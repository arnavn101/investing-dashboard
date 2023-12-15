import express from "express";
import {
    LIST_SYMBOL_ATTRS,
    updateDataEvent,
    extractAssetData,
} from "../modules/parse-stock-data.js";
import { getStockData, dropStockTable } from "../modules/stock-data-db.js";
import { getAllTables } from "../modules/db-config.js";
import "express-async-errors";
import cors from "cors";

const apiRouter = express.Router();
apiRouter.use(cors());

setInterval(
    async () => await updateDataEvent(),
    60000 * (process.env.INTERVAL + 1)
);

const returnMessage = (status, reason) => ({
    success: status,
    reason: reason || "N/A",
});

apiRouter.get("/", (_, res) => {
    res.send("Welcome to Stock Data Hub API!");
});

apiRouter.get("/data", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const querySymbol = req.query.symbol;

    if (querySymbol === undefined) {
        res.send(await getStockData());
    } else if (!(await getAllTables()).includes(symbol)) {
        res.status(404).send(
            returnMessage(
                false,
                "The requested stock symbol was not found in the database."
            )
        );
    } else {
        res.send(await getStockData(querySymbol));
    }
});

apiRouter.get("/symbols", async (_, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(await getAllTables());
});

apiRouter.post("/events", async (req, res) => {
    const { type, data } = req.body;

    if (type === "AddStockData") {
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
                    "The symbol already exists in the database"
                )
            );
        } else {
            await extractAssetData(data.symbol);
            res.status(200).send(returnMessage(true));
        }
    } else {
        res.status(404).send("Event cannot be handled");
    }
});

apiRouter.delete("/symbols", async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const querySymbol = req.query.symbol;

    if (!(await getAllTables()).includes(symbol)) {
        res.status(404).send(
            returnMessage(false, "The symbol does on exist in the database")
        );
    } else {
        await dropStockTable(querySymbol);
        res.status(200).send(returnMessage(true));
    }
});

export default apiRouter;
