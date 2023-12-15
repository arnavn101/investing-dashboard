import { Sequelize } from "sequelize";
import logger from "./logger.js";

const DB_NAME = process.env.DB_NAME || "final_proj";

await createDatabase(DB_NAME);
export const sequelize = new Sequelize(
    `postgres://postgres:mypass@stock-db:5432/${DB_NAME}`,
    { logging: false }
);

export async function initiateConnection() {
    try {
        await sequelize.authenticate();
        logger.info("Connection to DB has been established successfully.");
    } catch (error) {
        logger.error("Unable to connect to the database:", error);
    }
}

export async function terminateConnection() {
    sequelize.close();
    logger.info("Connection to DB has been terminated successfully.");
}

export async function syncTables(force) {
    await sequelize.sync({ force: force });
    const created = force === true ? "recreated" : "created";
    logger.debug(`All models in DB were ${created} successfully.`);
}

export async function cleanDB() {
    await sequelize.getQueryInterface().dropAllTables();
}

export async function checkIfTableExists(tableName) {
    return await sequelize.getQueryInterface().tableExists(tableName);
}

export async function getAllTables() {
    return sequelize.getQueryInterface().showAllTables();
}

export async function createDatabase(dbName) {
    const s = new Sequelize(
        `postgres://postgres:mypass@stock-db:5432/postgres`,
        { logging: false }
    );
    await s.authenticate();

    try {
        await s.getQueryInterface().createDatabase(dbName);
        logger.info("Successfully created DB.");
    } catch (error) {
        logger.warn("DB already exists.");
    }
    await s.close();
}

export async function getAllTableRows(tableName) {
    return (await sequelize.query(`SELECT * from "${tableName}";`))[0];
}
