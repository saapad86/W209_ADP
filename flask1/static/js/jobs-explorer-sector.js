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
        legend: {
        enabled: true,
        maxHeight: 100               
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
            valueDecimals:0,
            dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%b %Y',
                week: '%e. %b',
                month: '%b \'%y',
                year: '%Y'
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Goods-producing',
            data: jobs_goods
        },
        {
            name: 'Services',
            data: jobs_service
        }]
    });
});