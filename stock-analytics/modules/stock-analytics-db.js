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
    MACD: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    BB: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    RSI: {
        type: DataTypes.FLOAT,
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

export async function getStockAnalyticsData(stockName) {
    const listStockNames =
        stockName !== undefined ? [stockName] : await getAllTables();
    const listData = {};

    for (const ticker of listStockNames) {
        const stockAnalyticsTable = await initStockTable(ticker);
        const listCurData = (await stockAnalyticsTable.findAll()).map(
            (dbEntry) => dbEntry.dataValues
        );

        const mapCurData = {};
        for (const dataObj of listCurData) {
            mapCurData[dataObj.timestamp] = dataObj;
        }
        listData[ticker] = mapCurData;
    }

    return stockName !== undefined ? listData[stockName] : listData;
}
