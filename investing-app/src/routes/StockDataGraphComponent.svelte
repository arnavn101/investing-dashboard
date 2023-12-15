<script>
    import FusionCharts from "fusioncharts";
    import Timeseries from "fusioncharts/fusioncharts.timeseries";
    import SvelteFC, { fcRoot } from "svelte-fusioncharts";

    export let initialData;

    fcRoot(FusionCharts, Timeseries);

    const schema = [
        {
            name: "Time",
            type: "date",
            format: "%Y-%-m-%-dT%-H:%-M:%-S%Z",
        },
        {
            name: "Signal",
            type: "number",
        },
    ];

    const strToInt = { SELL: -1, BUY: 1 };
    const data = initialData.map((d) => [
        d.getTimestamp(),
        strToInt[d.getSignal()],
    ]);

    const getChartConfig = ([data, schema]) => {
        const fusionDataStore = new FusionCharts.DataStore(),
            fusionTable = fusionDataStore.createDataTable(data, schema);

        return {
            type: "timeseries",
            width: "100%",
            height: 450,
            renderAt: "chart-container",
            dataSource: {
                data: fusionTable,
                caption: { text: "Trading Signals" },
                yAxis: [
                    {
                        title: "Signal",
                        plot: {
                            value: "Signal",
                            type: "smooth-line",
                        },
                    },
                ],
                navigator: {
                    enabled: 0,
                },
            },
        };
    };
</script>

<SvelteFC {...getChartConfig([data, schema])} />
