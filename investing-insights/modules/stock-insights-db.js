import { DataTypes } from "sequelize";
import {
    initiateConnection,
    sequelize,
    cleanDB,
    getAllTables,
} from "./db-config.js";
import logger from "./logger.js";

await initiateConnection();
await cleanDB();

const tableSchema = {
    timestamp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    signal: {
        type: DataTypes.STRING,
        allowNull: false,
    },
};

const tableOptions = {
    freezeTableName: true,
};

export async function initStockTable(stockName, syncTable) {
    const model = sequelize.define(stockName, tableSchema, tableOptions);

    if (syncTable) {
        await model.sync({ force: true }).catch((error) => {
            logger.error("Faced error while syncing models:", error);
        });
    }

    return model;
}

export async function dropStockTable(stockName) {
    const model = await initStockTable(stockName);
    await model.drop();
}

export async function getStockInsightsData(stockName) {
    const listStockNames =
        stockName !== undefined ? [stockName] : await getAllTables();
    const listData = {};

    for (const ticker of listStockNames) {
        const stockInsightsTable = await initStockTable(ticker);
        const listCurData = (await stockInsightsTable.findAll()).map(
            (dbEntry) => dbEntry.dataValues
        );

        if (listCurData.length > 0) {
            const mapCurData = {};
            for (const dataObj of listCurData) {
                mapCurData[dataObj.timestamp] = dataObj.signal;
            }
            listData[ticker] = mapCurData;
        }
    }

    return stockName !== undefined ? listData[stockName] : listData;
}
