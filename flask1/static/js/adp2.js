$(function() {
    $('#container').highcharts({
        chart: {
            type: 'area',
            zoomType: 'x'
        },
        title: {
            text: 'Jobs Data'
        },
        subtitle: {
            text: 'Source: ADP Survey'
        },
        xAxis: {
        	categories: months
            // type: 'datetime'
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