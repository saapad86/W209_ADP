$(function() {
    $('#container').highcharts({
        chart: {
            type: 'line',
            zoomType: 'x'
        },
        title: {
            text: 'Jobs Data'
        },
        subtitle: {
            text: 'Source: ADP Survey'
        },
        xAxis: {
        	categories: months,
            type: 'datetime',
            labels: {
                formatter: function() {
                    return Highcharts.dateFormat('%b %Y', this.value);
                }
            }
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
        }]
    });
});