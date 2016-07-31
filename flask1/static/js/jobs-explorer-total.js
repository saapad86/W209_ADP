$(function() {
    $('#container').highcharts({
        chart: {
            type: 'area',
            zoomType: 'x'
        },
        title: {
            text: 'Monthly Change in Employment'
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
            name: 'Total Jobs',
            data: jobs_us
        }]
    });
});