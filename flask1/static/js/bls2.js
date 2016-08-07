
$(function () {

  $("#btnGet2").on('click', function(evt) {
    $("#container").empty();
      evt.preventDefault();
      var date3 = $("#date3").val();
      var date4 = $("#date4").val();
      var dataString2 = {
          date3: date3,
          date4: date4
      };
      requestData(dataString2);
  });

    /**
     * In order to synchronize tooltips and crosshairs, override the
     * built-in events with handlers defined on the parent element.
     */

 function requestData(dataString2) {


  var start_bar = dataString2.date3;
  var end_bar = dataString2.date4;

  function median(values) {

      values.sort( function(a,b) {return a - b;} );

      var half = Math.floor(values.length/2);

      if(values.length % 2)
          return values[half];
      else
          return (values[half-1] + values[half]) / 2.0;
  }

function avg(values) {
  var total = 0;
  for(var i = 0; i < values.length; i++) {
      total += values[i];
  }
  return total / values.length

}

function mth(values, ind, start, end) {
  var mth_arr = [];
  for(var i = 0; i < values.length; i++) {
    if (new Date(values[i][0]).getUTCMonth() == ind && new Date(values[i][0]).getTime()
    >= new Date(start).getTime() && new Date(values[i][0]).getTime()
    <= new Date(end).getTime()) {
      mth_arr.push(Math.abs(values[i][1]));
    }
  }
    return mth_arr
}

function mth_raw(values, ind, start, end) {
  var mth_arr_raw = [];
  for(var i = 0; i < values.length; i++) {
    if (new Date(values[i][0]).getUTCMonth() == ind && new Date(values[i][0]).getTime()
    >= new Date(start).getTime() && new Date(values[i][0]).getTime()
    <= new Date(end).getTime()) {
      mth_arr_raw.push(values[i][1]);
    }
  }
    return mth_arr_raw
}

function bar_avgerror(values, start, end) {
  var total = 0;
  var count = 0;
  console.log(new Date(end).getTime() + 10)
  for(var i = 0; i < values.length; i++) {
    if (new Date(values[i][0]).getTime() >= new Date(start).getTime() && new Date(values[i][0]).getTime()
    <= new Date(end).getTime()+86400000) {
      total += Math.abs(values[i][1]);
      count += 1
    }
  }
    return total/count
}


// function ct_poserror(values, start, end) {
//   var count = 0;
//   for(var i = 0; i < values.length; i++) {
//     if (new Date(values[i][0]).getTime() >= new Date(start).getTime() && new Date(values[i][0]).getTime()
//     <= new Date(end).getTime()+86400000 && values[i][1] > 0) {
//       count += 1
//     }
//   }
//     return count
// }

function pos_ct(values) {
  var count = 0;
  for(var i = 0; i < values.length; i++) {
    if (values[i] > 0)
      count += 1;
  }
  return count

}

function neg_ct(values) {
  var count = 0;
  for(var i = 0; i < values.length; i++) {
    if (values[i] < 0)
      count += 1;
  }
  return count

}

  $.getJSON('../static/data/ADPBLSDiffM.json', function (activity) {
    $.each(activity.datasets, function (i, dataset) {


        // Add X values
        dataset.Diff = Highcharts.map(dataset.Diff, function (val, j) {

            return [activity.Date[j], val];
          });


    console.log(bar_avgerror(dataset.Diff, start_bar, end_bar));

        var Jan = mth(dataset.Diff,0, start_bar, end_bar)
        var Feb = mth(dataset.Diff,1, start_bar, end_bar)
        var Mar = mth(dataset.Diff,2, start_bar, end_bar)
        var Apr = mth(dataset.Diff,3, start_bar, end_bar)
        var May = mth(dataset.Diff,4, start_bar, end_bar)
        var Jun = mth(dataset.Diff,5, start_bar, end_bar)
        var Jul = mth(dataset.Diff,6, start_bar, end_bar)
        var Aug = mth(dataset.Diff,7, start_bar, end_bar)
        var Sep = mth(dataset.Diff,8, start_bar, end_bar)
        var Oct = mth(dataset.Diff,9, start_bar, end_bar)
        var Nov = mth(dataset.Diff,10, start_bar, end_bar)
        var Dec = mth(dataset.Diff,11, start_bar, end_bar)

        var Jan_raw = mth_raw(dataset.Diff,0, start_bar, end_bar)
        var Feb_raw = mth_raw(dataset.Diff,1, start_bar, end_bar)
        var Mar_raw = mth_raw(dataset.Diff,2, start_bar, end_bar)
        var Apr_raw = mth_raw(dataset.Diff,3, start_bar, end_bar)
        var May_raw = mth_raw(dataset.Diff,4, start_bar, end_bar)
        var Jun_raw = mth_raw(dataset.Diff,5, start_bar, end_bar)
        var Jul_raw = mth_raw(dataset.Diff,6, start_bar, end_bar)
        var Aug_raw = mth_raw(dataset.Diff,7, start_bar, end_bar)
        var Sep_raw = mth_raw(dataset.Diff,8, start_bar, end_bar)
        var Oct_raw = mth_raw(dataset.Diff,9, start_bar, end_bar)
        var Nov_raw = mth_raw(dataset.Diff,10, start_bar, end_bar)
        var Dec_raw = mth_raw(dataset.Diff,11, start_bar, end_bar)

        Jan_median = median(Jan);
        Feb_median = median(Feb);
        Mar_median = median(Mar);
        Apr_median = median(Apr);
        May_median = median(May);
        Jun_median = median(Jun);
        Jul_median = median(Jul);
        Aug_median = median(Aug);
        Sep_median = median(Sep);
        Oct_median = median(Oct);
        Nov_median = median(Nov);
        Dec_median = median(Dec);

        Jan_avg = avg(Jan);
        Feb_avg = avg(Feb);
        Mar_avg = avg(Mar);
        Apr_avg = avg(Apr);
        May_avg = avg(May);
        Jun_avg = avg(Jun);
        Jul_avg = avg(Jul);
        Aug_avg = avg(Aug);
        Sep_avg = avg(Sep);
        Oct_avg = avg(Oct);
        Nov_avg = avg(Nov);
        Dec_avg = avg(Dec);

        Jan_pos = pos_ct(Jan_raw);
        Feb_pos = pos_ct(Feb_raw);
        Mar_pos = pos_ct(Mar_raw);
        Apr_pos = pos_ct(Apr_raw);
        May_pos = pos_ct(May_raw);
        Jun_pos = pos_ct(Jun_raw);
        Jul_pos = pos_ct(Jul_raw);
        Aug_pos = pos_ct(Aug_raw);
        Sep_pos = pos_ct(Sep_raw);
        Oct_pos = pos_ct(Oct_raw);
        Nov_pos = pos_ct(Nov_raw);
        Dec_pos = pos_ct(Dec_raw);

        Jan_neg = neg_ct(Jan_raw);
        Feb_neg = neg_ct(Feb_raw);
        Mar_neg = neg_ct(Mar_raw);
        Apr_neg = neg_ct(Apr_raw);
        May_neg = neg_ct(May_raw);
        Jun_neg = neg_ct(Jun_raw);
        Jul_neg = neg_ct(Jul_raw);
        Aug_neg = neg_ct(Aug_raw);
        Sep_neg = neg_ct(Sep_raw);
        Oct_neg = neg_ct(Oct_raw);
        Nov_neg = neg_ct(Nov_raw);
        Dec_neg = neg_ct(Dec_raw);

        console.log(pos_ct(May_raw))
        console.log(neg_ct(May_raw))

        var data1 = [Jan_avg, Feb_avg, Mar_avg, Apr_avg, May_avg, Jun_avg,
          Jul_avg, Aug_avg, Sep_avg, Oct_avg, Nov_avg, Dec_avg];
        var data2 = [Jan_pos, Feb_pos, Mar_pos, Apr_pos, May_pos, Jun_pos,
          Jul_pos, Aug_pos, Sep_pos, Oct_pos, Nov_pos, Dec_pos];
        var data3 = [Jan_neg, Feb_neg, Mar_neg, Apr_neg, May_neg, Jun_neg,
          Jul_neg, Aug_neg, Sep_neg, Oct_neg, Nov_neg, Dec_neg];


        var categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
                                           'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        $('<div class="chart">')
            .appendTo('#container').highcharts({
        chart: {
            type: 'column',
            height: 500,
            marginLeft: 150, // Keep all charts left aligned
            spacingRight: 300
        },
        title: {
            text: 'Absolute Difference Between ADP and BLS',
            align: 'center',
        },
        xAxis: {
            categories: categories,
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Error (Thousands)'
            }
        },
        tooltip: {
          formatter: function() {
              var index = $.inArray(this.x, categories);
              var s = '<b>'+ this.x +'</b>';

              s += '<br/>Mean absolute error: ' + data1[index].toFixed(1) + "k";
              s += '<br/># of times ADP higher: ' + data2[index];
              s += '<br/># of times ADP lower: ' + data3[index];
              return s;
          },
            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} k</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0,
                color: '#FA8072'
            }
        },
        series: [{data: data1, showInLegend: false, pointWidth: 40, color: '#FA8072'},
                 {data: data2, visible: false, showInLegend: false },
                 {data: data3, visible: false, showInLegend: false }]
    }
    ,
    function (chart) {

        var point = chart.series[0].data[5],
            text = chart.renderer.text(
                "Mean abs error for time < /b>period selected: " + bar_avgerror(dataset.Diff, start_bar, end_bar).toFixed(1) + "k",
                point.plotX + chart.plotLeft + 10,
                point.plotY + chart.plotTop - 50
            ).attr({
                zIndex: 5
            }).add(),
            box = text.getBBox();

        chart.renderer.rect(box.x - 5, box.y - 5, box.width + 10, box.height + 10, 5)
            .attr({
                fill: '#FFFFEF',
                stroke: 'gray',
                'stroke-width': 1,
                zIndex: 4
            })
            .add();
    }
  )
  });
  });
};
}
);