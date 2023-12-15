import logger from "./logger.js";

const errorMiddleWare = (err, req, res, next) => {
    if (req.headerSent) {
        next(err);
    }

    logger.debug(`Encountered error with message "${err.message}"`);
    res.status(500).send({
        error:
            err.message !== undefined
                ? err.message
                : "Internal Stock Data Hub Server Error",
    });
};

export default errorMiddleWare;
