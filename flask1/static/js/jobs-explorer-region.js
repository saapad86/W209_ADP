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
            name: 'Northeast',
            data: jobs_northeast
        },
        {
            name: 'West',
            data: jobs_west
        },
        {
            name: 'South',
            data: jobs_south
        },
        {
            name: 'Midwest',
            data: jobs_midwest
        }]
    });
});