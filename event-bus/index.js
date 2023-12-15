import express from "express";
import logger from "morgan";
import cors from "cors";

const app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());

const serviceURLs = [
    "stock-data-hub:3000",
    "stock-analytics:4000",
    "investing-insights:5000",
];

app.get("/", (_, res) => {
    res.send("Welcome to Event Bus!");
});

app.post("/events", async (req, res) => {
    const event = req.body;
    console.log(`(${process.pid}) Event Bus (Received Event) ${event.type}`);
    for (const URL of serviceURLs) {
        try {
            console.log(
                `(${process.pid}) Event Bus (Sending Event to ${URL}) ${event.type}`
            );
            await fetch(`http://${URL}/api/events`, {
                method: "POST",
                body: JSON.stringify(event),
                headers: { "Content-Type": "application/json" },
            });
        } catch (err) {
            console.log(err);
        }
    }
    res.send({ status: "OK" });
});

app.listen(5005, () => {
    console.log(`(${process.pid}) Event Bus Listening on 5005`);
});
