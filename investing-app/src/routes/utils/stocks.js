export class Stocks {
    constructor(listStocks) {
        this.listStocks = listStocks;
    }

    addStock(stock) {
        if (this.listStocks.every((curStock) => curStock.name !== stock.name)) {
            this.listStocks.push(stock);
        }
    }

    removeStock(stock) {
        this.listStocks = this.listStocks.filter(
            (curStock) => curStock.name !== stock.name
        );
    }

    getStock(stockName) {
        return this.listStocks.find((stock) => stock.name === stockName);
    }

    getStocks() {
        return this.listStocks;
    }

    static create() {
        return new Stocks([]);
    }

    static fromJson(allStocksData) {
        return new Stocks(
            Object.entries(allStocksData).map((stockData) =>
                Stock.fromJson(stockData)
            )
        );
    }
}

export class Stock {
    constructor(name) {
        this.name = name;
        this.listData = [];
    }

    addData(stockData) {
        if (
            this.listData.every(
                (curData) => curData.timestamp !== stockData.timestamp
            )
        ) {
            this.listData.push(stockData);
        }
    }

    getSpecificData(timestamp) {
        return this.listStocks.find(
            (stockData) => stockData.timestamp === timestamp
        );
    }

    getData() {
        return this.listData;
    }

    getName() {
        return this.name;
    }

    static create() {
        return new Stock("Loading...");
    }

    static fromJson(stockData) {
        const stock = new Stock(stockData[0]);
        Object.entries(stockData[1]).forEach((data) =>
            stock.addData(StockData.fromJson(data))
        );
        return stock;
    }
}

export class StockData {
    constructor(timestamp, signal) {
        this.timestamp = timestamp;
        this.signal = signal;
    }

    getTimestamp() {
        return this.timestamp;
    }

    getSignal() {
        return this.signal;
    }

    static fromJson(data) {
        return new StockData(data[0], data[1]);
    }
}
