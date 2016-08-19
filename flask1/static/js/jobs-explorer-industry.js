$(function() {
    window.chart = new Highcharts.StockChart({
        chart: {
            renderTo: 'container'
        },
        rangeSelector: {
            inputDateFormat: '%Y-%m-%d',
            buttons: [{
                type: 'month',
                count: 6,
                text: '6m'
            }, {
                type: 'year',
                count: 1,
                text: '1y'
            }, {
                type: 'year',
                count: 5,
                text: '5y'
            }, {
                type: 'ytd',
                text: 'YTD'
            }, {
                type: 'all',
                text: 'All'

            }],
            selected: 2    // refers to the index of button array that is pre-selected, see details here: http://api.highcharts.com/highstock#rangeSelector.buttons
        },
        
        legend: {
          enabled: true,
          title: {
            text: 'Legend<br/><span style="font-size: 9px; color: #666; font-weight: normal">(Click to hide)</span>',
          },
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'middle',
        },

        xAxis: {
            dateTimeLabelFormats: {
                millisecond:"%A, %b %e, %H:%M:%S.%L",
                second:"%A, %b %e, %H:%M:%S",
                minute:"%A, %b %e, %H:%M",
                hour:"%A, %b %e, %H:%M",
                day:"%A, %b %e, %Y",
                week:"Week from %A, %b %e, %Y",
                month:"%b %Y",
                year:"%Y"
            },
        },
        
        yAxis: {
            labels: {
                align: 'left',
                formatter: function () {
                    return (this.value > 0 ? ' + ' : '') + this.value + 'K';
                }
            },
        },
        
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}K</b> <br/>',
            valueDecimals:0,
            dateTimeLabelFormats: {
                millisecond:"%A, %b %e, %H:%M:%S.%L",
                second:"%A, %b %e, %H:%M:%S",
                minute:"%A, %b %e, %H:%M",
                hour:"%A, %b %e, %H:%M",
                day:"%A, %b %e, %Y",
                week:"Week from %A, %b %e, %Y",
                month:"%B %Y",
                year:"%Y"
            },
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Natural Resource',
            data: jobs_resource
        },
        {
            name: 'Trade',
            data: jobs_trade
        },
        {
            name: 'Professional',
            data: jobs_professional
        },
        {
            name: 'Manufacturing',
            data: jobs_manufacturing
        },
        {
            name: 'Financial/Other',
            data: jobs_other
        }]
    });
});