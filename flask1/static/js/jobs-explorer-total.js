$(function() {
    window.chart = new Highcharts.StockChart({
        chart: {
            renderTo: 'container'
        },
        title: {
            text: 'Jobs Data'
        },
        rangeSelector: {
            selected: 5    // refers to the index of button array that is pre-selected, see details here: http://api.highcharts.com/highstock#rangeSelector.buttons
        },
        yAxis: {
            labels: {
                formatter: function () {
                    return (this.value > 0 ? ' + ' : '') + this.value;
                }
            },
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> <br/>',
            valueDecimals:0
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Total Jobs',
            data: jobs_us
        }]
    });
});