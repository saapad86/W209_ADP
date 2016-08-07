
/*
The purpose of this demo is to demonstrate how multiple charts on the same page can be linked
through DOM and Highcharts events and API methods. It takes a standard Highcharts config with a
small variation for each data set, and a mouse/touch event handler to bind the charts together.
*/

$(function () {

  $("#btnGet").on('click', function(evt) {
      $("#container").empty();
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


    $('#container').bind('mousemove touchmove touchstart', function (e) {
        var chart,
            point,
            points,
            i,
            secSeriesIndex = 1;
            event;

        for (i = 0; i < Highcharts.charts.length; i++) {
            chart = Highcharts.charts[i];
            e = chart.pointer.normalize(e); // Find coordinates within the chart
            points = [chart.series[0].searchPoint(e, true), // Get the hovered point

            chart.series[1].searchPoint(e, true)]; // Get the hovered point
            console.log(points)


            if (points[0] && points[1]) {
                if (!points[0].series.visible) {
                    points.shift();
                    secSeriesIndex = 0;
                }
                if (!points[secSeriesIndex].series.visible) {
                    points.splice(secSeriesIndex,1);
                }
                if (points.length) {
                    chart.tooltip.refresh(points); // Show the tooltip
                    chart.xAxis[0].drawCrosshair(e, points[0]); // Show the crosshair
                }
            }
        }
    });
    /**
     * Override the reset function, we don't need to hide the tooltips and crosshairs.
     */
    Highcharts.Pointer.prototype.reset = function () {};

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

    var lastChart;
    var lastChart1;

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

    $.getJSON('../static/data/ADPBLSNew.json', function (activity) {
        $.each(activity.datasets, function (i, dataset) {

             // Add X values
             dataset.ADP = Highcharts.map(activity.datasets[0].data, function (val, j) {

                return [((parseInt(activity.xData[j]))- 25569)*86400*1000, val];
              }
            );
            dataset.BLS = Highcharts.map(activity.datasets[1].data, function (val, j) {

                return [((parseInt(activity.xData[j]))- 25569)*86400*1000, val];
              }
            );
            dataset.Diff = Highcharts.map(activity.datasets[2].data, function (val, j) {

                return [((parseInt(activity.xData[j]))- 25569)*86400*1000, val];
              }
            );
            dataset.AbsDiff = Highcharts.map(activity.datasets[3].data, function (val, j) {

                return [((parseInt(activity.xData[j]))- 25569)*86400*1000, val];
              }
            );

            dataset.data = Highcharts.map(dataset.data, function (val, i) {

                return [((parseInt(activity.xData[i]))- 25569)*86400*1000, val];
              }
            );

          //  console.log(maj_avg(dataset.Diff))
            console.log(new Date(start_date).getUTCMonth());
            console.log(activity.datasets[1].data)

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

            if (i == 0) {

            $('<div class="chart">')
                .appendTo('#container')
                .highcharts({
                    chart: {
                        marginLeft: 150, // Keep all charts left aligned
                        height: 350,
                        spacingBottom: 20,
                        spacingRight: 300
                    },
                    title: {
                        text: 'ADP vs BLS',
                        align: 'center',
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
                            text: "Thous."
                        }
                    },
                    tooltip: {
                            shared: true,
                            pointFormat: '{series.name}: {point.y}<br>',
                            valueDecimals: dataset.valueDecimals
                                },
                    legend: {
                      title: {
                        text: 'Series<br/><span style="font-size: 9px; color: #666; font-weight: normal">(Click to hide)</span>',
                        style: {
                          fontStyle: 'italic'
                        }
                      },
                      layout: 'vertical',
                      align: 'top',
                      verticalAlign: 'middle',
                      borderWidth: 0
                    },
                    series: [{
                        data: dataset.data,
                        name: dataset.name,
                        type: 'line',
                        color: '#FF7F50',
                        fillOpacity: 0.3,
                        tooltip: {
                            valueSuffix: ' '+'k'
                        }
                    }]}
                    ,
                    function (chart) {

                                        var point = chart.series[0].data[index_corr(dataset.ADP)],
                                            text = chart.renderer.text(
                                                "Correlation over <br> time displayed: " + pearsonCorrelation(cor_ADP,cor_BLS).toFixed(3),
                                                point.plotX + chart.plotLeft + 10,
                                                point.plotY + chart.plotTop - 40
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
                  } else if(i == 1) {
                  lastChart = Highcharts.charts[Highcharts.charts.length - 1];
                              lastChart.addSeries({
                              data: dataset.data,
                              name: dataset.name,
                              type: 'line',
                              color: '#6495ED',
                              fillOpacity: 0.3,
                              tooltip: {
                                        valueSuffix: ' '+'k'
                                      },
                              plotOptions: {
                                        series: {
                                        events: {
                                        legendItemClick: function (event) {
                                        this.hide()
                                        }
                                        }
                                        }
                                        }
                              });
                        } else if(i == 3) {
                        lastChart = Highcharts.charts[Highcharts.charts.length - 1];
                                    lastChart.addSeries({
                                    data: dataset.data,
                                    name: dataset.name,
                                    type: 'line',
                                    color: '#DB7093',
                                    fillOpacity: 0.3,
                                    tooltip: {
                                              valueSuffix: ' '+'k'
                                            }
                                    });
                         }  else {
                          $('<div class="chart">')
                              .appendTo('#container')
                              .highcharts({
                                  chart: {
                                      marginLeft: 150, // Keep all charts left aligned
                                      height: 350,
                                      spacingBottom: 20,
                                      spacingRight: 300
                                  },
                                  title: {
                                      text: 'Difference Between ADP and BLS',
                                      align: 'center',
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
                                          text: "Thous."
                                      }
                                  },
                                  tooltip: {
                                          shared: true,
                                          pointFormat: '{series.name}: {point.y}<br>',
                                          valueDecimals: dataset.valueDecimals
                                              },
                                  legend: {
                                    title: {
                                      text: 'Series<br/><span style="font-size: 9px; color: #666; font-weight: normal">(Click to hide)</span>',
                                      style: {
                                        fontStyle: 'italic'
                                      }
                                    },
                                    layout: 'vertical',
                                    align: 'top',
                                    verticalAlign: 'middle',
                                    borderWidth: 0
                                  },
                                  series: [{
                                      data: dataset.data,
                                      name: dataset.name,
                                      type: 'line',
                                      color: '#C0C0C0',
                                      fillOpacity: 0.3,
                                      tooltip: {
                                          valueSuffix: ' '+'k'
                                      }
                                  }]}
                                  ,
                                  function (chart) {

                                      var point = chart.series[0].data[index_start(dataset.Diff)],
                                          text = chart.renderer.text(
                                              "Mean abs error <br> over time displayed: " + maj_avg(dataset.Diff).toFixed(1) + "k",
                                              point.plotX + chart.plotLeft + 10,
                                              point.plotY + chart.plotTop - 50
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
                                  }
                                );

                              }

              });
            });
  };
  });
