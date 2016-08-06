/*
The purpose of this demo is to demonstrate how multiple charts on the same page can be linked
through DOM and Highcharts events and API methods. It takes a standard Highcharts config with a
small variation for each data set, and a mouse/touch event handler to bind the charts together.
*/

$(function () {

  $("#btnGet").on('click', function(evt) {
      evt.preventDefault();
      var date1 = $("#date1").val();
      var date2 = $("#date2").val();
      var dataString = {
          date1: date1,
          date2: date2
      };
      requestData(dataString);
  });
    /**
     * In order to synchronize tooltips and crosshairs, override the
     * built-in events with handlers defined on the parent element.
     */

 function requestData(dataString) {

   var start_date = dataString.date1
   var end_date = dataString.date2


    $('#chart2').bind('mousemove touchmove touchstart', function (e) {
        var chart,
            point,
            i,
            event;

        for (i = 0; i < Highcharts.charts.length; i = i + 1) {
            chart = Highcharts.charts[i];
            event = chart.pointer.normalize(e.originalEvent); // Find coordinates within the chart
            point = chart.series[0].searchPoint(event, true); // Get the hovered point

            if (point) {
                point.highlight(e);
            }
        }
    });
    /**
     * Override the reset function, we don't need to hide the tooltips and crosshairs.
     */
    Highcharts.Pointer.prototype.reset = function () {
        return undefined;
    };

    /**
     * Highlight a point by showing tooltip, setting hover state and draw crosshair
     */
    Highcharts.Point.prototype.highlight = function (event) {
        this.onMouseOver(); // Show the hover marker
        this.series.chart.tooltip.refresh(this); // Show the tooltip
        this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    };

    /**
     * Synchronize zooming through the setExtremes event handler.
     */
    function syncExtremes(e) {
        var thisChart = this.chart;

        if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
            Highcharts.each(Highcharts.charts, function (chart) {
                if (chart !== thisChart) {
                    if (chart.xAxis[0].setExtremes) { // It is null while updating
                        chart.xAxis[0].setExtremes(e.min, e.max, undefined, false, { trigger: 'syncExtremes' });
                    }
                }
            });
        }
    }


    function pearsonCorrelation(p1, p2) {
      var si = [];

      for (var key in p1) {
        if (p2[key]) si.push(key);
      }

      var n = si.length;

      if (n == 0) return 0;

      var sum1 = 0;
      for (var i = 0; i < si.length; i++) sum1 += p1[si[i]];

      var sum2 = 0;
      for (var i = 0; i < si.length; i++) sum2 += p2[si[i]];

      var sum1Sq = 0;
      for (var i = 0; i < si.length; i++) {
        sum1Sq += Math.pow(p1[si[i]], 2);
      }

      var sum2Sq = 0;
      for (var i = 0; i < si.length; i++) {
        sum2Sq += Math.pow(p2[si[i]], 2);
      }

      var pSum = 0;
      for (var i = 0; i < si.length; i++) {
        pSum += p1[si[i]] * p2[si[i]];
      }

      var num = pSum - (sum1 * sum2 / n);
      var den = Math.sqrt((sum1Sq - Math.pow(sum1, 2) / n) *
          (sum2Sq - Math.pow(sum2, 2) / n));

      if (den == 0) return 0;

      return num / den;
    }

    $.getJSON('../static/data/ADPBLSsep.json', function (activity) {
        $.each(activity.datasets, function (i, dataset) {

            // Add X values
            dataset.ADP = Highcharts.map(dataset.ADP, function (val, j) {

                return [((parseInt(activity.xData[j]))- 25569)*86400*1000, val];
              }
            );

            dataset.BLS = Highcharts.map(dataset.BLS, function (val, j) {

                return [((parseInt(activity.xData[j]))- 25569)*86400*1000, val];
              }
            );

            function data_cor1(values) {
              var cor_arr1 = [];
              for(var i = 0; i < values.length; i++) {
                if (values[i][0] >= new Date(start_date).getTime() & values[i][0] <= new Date(end_date).getTime()) {
                  cor_arr1.push(values[i][1])
                }
              }
              return cor_arr1

            }

            var cor_ADP = data_cor1(dataset.ADP);
            var cor_BLS = data_cor1(dataset.BLS);
            console.log(pearsonCorrelation(cor_ADP, cor_BLS));

            function index_corr(values) {
              var index_st = 0;
              for(var i = 0; i < values.length; i++) {
                if (0 <= (new Date(start_date).getTime() - values[i][0]) &
                (new Date(start_date).getTime() - values[i][0]) <= 2628000000) {
                  index_st = i;
                }
              }
              return index_st
            }

            console.log(index_corr(cor_ADP));

            $('<div class="chart">')
                .appendTo('#chart2')
                .highcharts({
                    chart: {
                        marginLeft: 40, // Keep all charts left aligned
                        spacingTop: 20,
                        spacingBottom: 20
                    },
                    title: {
                        text: 'ADP vs BLS',
                        align: 'left',
                        margin: 0,
                        x: 30
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: false
                    },
                    xAxis: {
                        crosshair: true,
                        events: {
                            setExtremes: syncExtremes,
                        },
                        type: "datetime",
                        min: new Date(start_date).getTime(),
                        max: new Date(end_date).getTime(),
                        labels: {
                            format: '{value:%b-%Y}'
                        }
                    },
                    yAxis: {
                        title: {
                            text: null
                        }
                    },
                    tooltip: {
                        positioner: function () {
                            return {
                                x: this.chart.chartWidth - this.label.width, // right aligned
                                y: -1 // align to title
                            };
                        },
                        borderWidth: 0,
                        backgroundColor: 'none',
                        pointFormat: 'ADP: {point.x:%b-%Y}' + ', {point.y}',
                        headerFormat: '',
                        shadow: false,
                        style: {
                            fontSize: '18px'
                        },
                        valueDecimals: dataset.valueDecimals
                    },
                    legend: {
                      layout: 'vertical',
                      align: 'top',
                      verticalAlign: 'middle',
                      borderWidth: 0
                    },
                    series: [{
                        data: dataset.ADP,
                        name: 'ADP',
                        type: 'line',
                        color: '#C47451',
                        fillOpacity: 0.3,
                        tooltip: {
                            valueSuffix: ' '+'k'
                        }
                    },
                    {
                        data: dataset.BLS,
                        name: 'BLS',
                        type: 'line',
                        color: '#3BB9FF',
                        fillOpacity: 0.3,
                        tooltip: {
                            valueSuffix: ' '+'k'
                        }
                    }
                  ]
                },
                function (chart) {

                    var point = chart.series[0].data[index_corr(dataset.ADP)],
                        text = chart.renderer.text(
                            "Correlation: " + pearsonCorrelation(cor_ADP,cor_BLS).toFixed(3),
                            point.plotX + chart.plotLeft + 10,
                            point.plotY + chart.plotTop - 10
                        ).attr({
                            zIndex: 5
                        }).add(),
                        box = text.getBBox();
                        console.log(index_corr(dataset.ADP));
                    chart.renderer.rect(box.x - 5, box.y - 5, box.width + 10, box.height + 10, 5)
                        .attr({
                            fill: '#FFFFEF',
                            stroke: 'gray',
                            'stroke-width': 1,
                            zIndex: 4
                        })
                        .add();
                }
              );
        });
    });


    function avg(values) {
      var total = 0;
      for(var i = 0; i < values.length; i++) {
          total += values[i];
      }
      return total / values.length

    }

    function maj_avg(values) {
      var total = 0;
      var count = 0;
      for(var i = 0; i < values.length; i++) {
        if (values[i][0] >= new Date(start_date).getTime() & values[i][0] <= new Date(end_date).getTime()) {
          total += Math.abs(values[i][1]);
          count += 1
        }
      }
      return total / count
    }

    function index_start(values) {
      var index_st = 0;
      for(var i = 0; i < values.length; i++) {
        if (0 <= (new Date(start_date).getTime() - values[i][0]) &
        (new Date(start_date).getTime() - values[i][0]) <= 2628000000) {
          index_st = i;
        }
      }
      return index_st
    }

    // Get the data. The contents of the data file can be viewed at
    // https://github.com/highcharts/highcharts/blob/master/samples/data/activity.json
    $.getJSON('../static/data/ADPBLSDiff.json', function (activity) {
        $.each(activity.datasets, function (i, dataset) {

            // Add X values
            dataset.Diff = Highcharts.map(dataset.Diff, function (val, j) {

                return [((parseInt(activity.Date[j]))- 25569)*86400*1000, val];
              }
            );

            console.log(maj_avg(dataset.Diff))
            console.log(new Date(start_date).getUTCMonth());


            $('<div class="chart">')
                .appendTo('#chart2')
                .highcharts({
                    chart: {
                        marginLeft: 40, // Keep all charts left aligned
                        spacingTop: 20,
                        spacingBottom: 20
                    },
                    title: {
                        text: 'Difference',
                        align: 'left',
                        margin: 0,
                        x: 30
                    },
                    credits: {
                        enabled: false
                    },
                    legend: {
                        enabled: false
                    },
                    xAxis: {
                        crosshair: true,
                        events: {
                            setExtremes: syncExtremes
                        },
                        type: "datetime",
                        min: new Date(start_date).getTime(),
                        max: new Date(end_date).getTime(),
                        labels: {
                            format: '{value:%b-%Y}'
                        }
                    },
                    yAxis: {
                        title: {
                            text: null
                        }
                    },
                    tooltip: {
                        positioner: function () {
                            return {
                                x: this.chart.chartWidth - this.label.width, // right aligned
                                y: -1 // align to title
                            };
                        },
                        borderWidth: 0,
                        backgroundColor: 'none',
                        pointFormat: '{point.x:%b-%Y}'+', '+'{point.y}',
                        headerFormat: '',
                        shadow: false,
                        style: {
                            fontSize: '18px'
                        },
                        valueDecimals: dataset.valueDecimals
                    },
                    series: [{
                        data: dataset.Diff,
                        name: 'Difference',
                        type: 'line',
                        color: '#9DC209',
                        fillOpacity: 0.2,
                        tooltip: {
                            valueSuffix: ''+'k'
                        }
                    }]
                },
                function (chart) {

                    var point = chart.series[0].data[index_start(dataset.Diff)],
                        text = chart.renderer.text(
                            "Mean abs error: " + maj_avg(dataset.Diff).toFixed(1) + "k",
                            point.plotX + chart.plotLeft + 10,
                            point.plotY + chart.plotTop - 10
                        ).attr({
                            zIndex: 5
                        }).add(),
                        box = text.getBBox();
                        console.log(index_start(dataset.Diff));
                    chart.renderer.rect(box.x - 5, box.y - 5, box.width + 10, box.height + 10, 5)
                        .attr({
                            fill: '#FFFFEF',
                            stroke: 'gray',
                            'stroke-width': 1,
                            zIndex: 4
                        })
                        .add();
                });
        });
    });
  };
  });


$(function () {

  $("#btnGet2").on('click', function(evt) {
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


function bar_avgerror(values, start, end) {
  var total = 0;
  var count = 0;
  for(var i = 0; i < values.length; i++) {
    if (new Date(values[i][0]).getTime() >= new Date(start).getTime() && new Date(values[i][0]).getTime()
    <= new Date(end+1).getTime()) {
      total += Math.abs(values[i][1]);
      count += 1
    }
  }
    return total/count
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

        // var Jan = [Math.abs(dataset.Diff[9][1]), Math.abs(dataset.Diff[21][1]),Math.abs(dataset.Diff[33][1]), Math.abs(dataset.Diff[45][1]),
        //   Math.abs(dataset.Diff[57][1]), Math.abs(dataset.Diff[69][1]),Math.abs(dataset.Diff[81][1]), Math.abs(dataset.Diff[93][1]),
        //   Math.abs(dataset.Diff[105][1]), Math.abs(dataset.Diff[117][1]),Math.abs(dataset.Diff[129][1]), Math.abs(dataset.Diff[141][1]),
        //   Math.abs(dataset.Diff[153][1]), Math.abs(dataset.Diff[165][1]),Math.abs(dataset.Diff[177][1])];
        //
        // var Feb = [Math.abs(dataset.Diff[10][1]), Math.abs(dataset.Diff[22][1]),Math.abs(dataset.Diff[34][1]), Math.abs(dataset.Diff[46][1]),
        //   Math.abs(dataset.Diff[58][1]), Math.abs(dataset.Diff[70][1]),Math.abs(dataset.Diff[82][1]), Math.abs(dataset.Diff[94][1]),
        //   Math.abs(dataset.Diff[106][1]), Math.abs(dataset.Diff[118][1]),Math.abs(dataset.Diff[130][1]), Math.abs(dataset.Diff[142][1]),
        //   Math.abs(dataset.Diff[154][1]), Math.abs(dataset.Diff[166][1]),Math.abs(dataset.Diff[178][1])];
        //
        // var Mar = [Math.abs(dataset.Diff[11][1]), Math.abs(dataset.Diff[23][1]),Math.abs(dataset.Diff[35][1]), Math.abs(dataset.Diff[47][1]),
        //   Math.abs(dataset.Diff[59][1]), Math.abs(dataset.Diff[71][1]),Math.abs(dataset.Diff[83][1]), Math.abs(dataset.Diff[95][1]),
        //   Math.abs(dataset.Diff[107][1]), Math.abs(dataset.Diff[119][1]),Math.abs(dataset.Diff[131][1]), Math.abs(dataset.Diff[143][1]),
        //   Math.abs(dataset.Diff[155][1]), Math.abs(dataset.Diff[167][1]),Math.abs(dataset.Diff[179][1])];
        //
        // var Apr = [Math.abs(dataset.Diff[0][1]),Math.abs(dataset.Diff[12][1]), Math.abs(dataset.Diff[24][1]),Math.abs(dataset.Diff[36][1]), Math.abs(dataset.Diff[48][1]),
        //   Math.abs(dataset.Diff[60][1]), Math.abs(dataset.Diff[72][1]),Math.abs(dataset.Diff[84][1]), Math.abs(dataset.Diff[96][1]),
        //   Math.abs(dataset.Diff[108][1]), Math.abs(dataset.Diff[120][1]),Math.abs(dataset.Diff[132][1]), Math.abs(dataset.Diff[144][1]),
        //   Math.abs(dataset.Diff[156][1]), Math.abs(dataset.Diff[168][1]),Math.abs(dataset.Diff[180][1])];
        //
        // var May = [Math.abs(dataset.Diff[1][1]),Math.abs(dataset.Diff[13][1]), Math.abs(dataset.Diff[25][1]),Math.abs(dataset.Diff[37][1]), Math.abs(dataset.Diff[49][1]),
        //   Math.abs(dataset.Diff[61][1]), Math.abs(dataset.Diff[73][1]),Math.abs(dataset.Diff[85][1]), Math.abs(dataset.Diff[97][1]),
        //   Math.abs(dataset.Diff[109][1]), Math.abs(dataset.Diff[121][1]),Math.abs(dataset.Diff[133][1]), Math.abs(dataset.Diff[145][1]),
        //   Math.abs(dataset.Diff[157][1]), Math.abs(dataset.Diff[169][1]),Math.abs(dataset.Diff[181][1])];
        //
        // var Jun = [Math.abs(dataset.Diff[2][1]),Math.abs(dataset.Diff[14][1]), Math.abs(dataset.Diff[26][1]),Math.abs(dataset.Diff[38][1]), Math.abs(dataset.Diff[50][1]),
        //   Math.abs(dataset.Diff[62][1]), Math.abs(dataset.Diff[74][1]),Math.abs(dataset.Diff[86][1]), Math.abs(dataset.Diff[98][1]),
        //   Math.abs(dataset.Diff[110][1]), Math.abs(dataset.Diff[122][1]),Math.abs(dataset.Diff[134][1]), Math.abs(dataset.Diff[146][1]),
        //   Math.abs(dataset.Diff[158][1]), Math.abs(dataset.Diff[170][1]),Math.abs(dataset.Diff[182][1])];
        //
        // var Jul = [Math.abs(dataset.Diff[3][1]),Math.abs(dataset.Diff[15][1]), Math.abs(dataset.Diff[27][1]),Math.abs(dataset.Diff[39][1]), Math.abs(dataset.Diff[51][1]),
        //   Math.abs(dataset.Diff[63][1]), Math.abs(dataset.Diff[75][1]),Math.abs(dataset.Diff[87][1]), Math.abs(dataset.Diff[99][1]),
        //   Math.abs(dataset.Diff[111][1]), Math.abs(dataset.Diff[123][1]),Math.abs(dataset.Diff[135][1]), Math.abs(dataset.Diff[147][1]),
        //   Math.abs(dataset.Diff[159][1]), Math.abs(dataset.Diff[171][1])];
        //
        // var Aug = [Math.abs(dataset.Diff[4][1]),Math.abs(dataset.Diff[16][1]), Math.abs(dataset.Diff[28][1]),Math.abs(dataset.Diff[40][1]), Math.abs(dataset.Diff[52][1]),
        //   Math.abs(dataset.Diff[64][1]), Math.abs(dataset.Diff[76][1]),Math.abs(dataset.Diff[88][1]), Math.abs(dataset.Diff[100][1]),
        //   Math.abs(dataset.Diff[112][1]), Math.abs(dataset.Diff[124][1]),Math.abs(dataset.Diff[136][1]), Math.abs(dataset.Diff[148][1]),
        //   Math.abs(dataset.Diff[160][1]), Math.abs(dataset.Diff[172][1])];
        //
        // var Sep = [Math.abs(dataset.Diff[5][1]),Math.abs(dataset.Diff[17][1]), Math.abs(dataset.Diff[29][1]),Math.abs(dataset.Diff[41][1]), Math.abs(dataset.Diff[53][1]),
        //   Math.abs(dataset.Diff[65][1]), Math.abs(dataset.Diff[77][1]),Math.abs(dataset.Diff[89][1]), Math.abs(dataset.Diff[101][1]),
        //   Math.abs(dataset.Diff[113][1]), Math.abs(dataset.Diff[125][1]),Math.abs(dataset.Diff[137][1]), Math.abs(dataset.Diff[149][1]),
        //   Math.abs(dataset.Diff[161][1]), Math.abs(dataset.Diff[173][1])];
        //
        // var Oct = [Math.abs(dataset.Diff[6][1]),Math.abs(dataset.Diff[18][1]), Math.abs(dataset.Diff[30][1]),Math.abs(dataset.Diff[42][1]), Math.abs(dataset.Diff[54][1]),
        //   Math.abs(dataset.Diff[66][1]), Math.abs(dataset.Diff[78][1]),Math.abs(dataset.Diff[90][1]), Math.abs(dataset.Diff[102][1]),
        //   Math.abs(dataset.Diff[114][1]), Math.abs(dataset.Diff[126][1]),Math.abs(dataset.Diff[138][1]), Math.abs(dataset.Diff[150][1]),
        //   Math.abs(dataset.Diff[162][1]), Math.abs(dataset.Diff[174][1])];
        //
        // var Nov = [Math.abs(dataset.Diff[7][1]),Math.abs(dataset.Diff[19][1]), Math.abs(dataset.Diff[31][1]),Math.abs(dataset.Diff[43][1]), Math.abs(dataset.Diff[55][1]),
        //   Math.abs(dataset.Diff[67][1]), Math.abs(dataset.Diff[79][1]),Math.abs(dataset.Diff[91][1]), Math.abs(dataset.Diff[103][1]),
        //   Math.abs(dataset.Diff[115][1]), Math.abs(dataset.Diff[127][1]),Math.abs(dataset.Diff[139][1]), Math.abs(dataset.Diff[151][1]),
        //   Math.abs(dataset.Diff[163][1]), Math.abs(dataset.Diff[175][1])];
        //
        // var Dec = [Math.abs(dataset.Diff[8][1]),Math.abs(dataset.Diff[20][1]), Math.abs(dataset.Diff[32][1]),Math.abs(dataset.Diff[44][1]), Math.abs(dataset.Diff[56][1]),
        //   Math.abs(dataset.Diff[68][1]), Math.abs(dataset.Diff[80][1]),Math.abs(dataset.Diff[92][1]), Math.abs(dataset.Diff[104][1]),
        //   Math.abs(dataset.Diff[116][1]), Math.abs(dataset.Diff[128][1]),Math.abs(dataset.Diff[140][1]), Math.abs(dataset.Diff[152][1]),
        //   Math.abs(dataset.Diff[164][1]), Math.abs(dataset.Diff[176][1])];

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



    $('#chart2').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Difference Between ADP and BLS'
        },
        xAxis: {
            categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ],
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Error (Thousands)'
            }
        },
        tooltip: {
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
                borderWidth: 0
            }
        },
        series: [{
            name: 'Monthly Mean Absolute Error',
            data: [Jan_avg, Feb_avg, Mar_avg, Apr_avg, May_avg, Jun_avg, Jul_avg, Aug_avg, Sep_avg, Oct_avg, Nov_avg, Dec_avg],
            color: 'blue'
        }]
    },
    function (chart) {

        var point = chart.series[0].data[5],
            text = chart.renderer.text(
                "Mean abs error: " + bar_avgerror(dataset.Diff, start_bar, end_bar).toFixed(1) + "k",
                point.plotX + chart.plotLeft + 10,
                point.plotY + chart.plotTop - 10
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
    });
  });
  });
};
})