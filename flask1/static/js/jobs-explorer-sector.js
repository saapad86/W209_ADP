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
            text: 'Monthly Change in Employment'
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
            name: 'Goods-producing',
            data: jobs_goods
        },
        {
            name: 'Services',
            data: jobs_service
        }]
    });
});