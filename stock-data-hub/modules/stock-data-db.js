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
    ClosePrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    HighPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    LowPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    TradeCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    OpenPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    Timestamp: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Volume: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    VWAP: {
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

export async function getStockData(stockName) {
    const listStockNames =
        stockName !== undefined ? [stockName] : await getAllTables();
    const listData = {};

    for (const ticker of listStockNames) {
        const stockTable = await initStockTable(ticker);
        listData[ticker] = (await stockTable.findAll()).map(
            (dbEntry) => dbEntry.dataValues
        );
    }

    return stockName !== undefined ? listData[stockName] : listData;
}
