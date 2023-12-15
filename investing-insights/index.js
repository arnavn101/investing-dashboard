import "dotenv/config";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import apiRouter from "./routes/api.js";
import logger from "./modules/logger.js";
import errorMiddleWare from "./modules/error-mw.js";
import cors from "cors";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));
app.use(express.json());

// Routes
app.use("/api", apiRouter);
app.use(errorMiddleWare);

app.listen(port, () => {
    logger.info(`Stock Insights Server is running on port ${port}`);
});
