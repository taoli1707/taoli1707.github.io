document.addEventListener("DOMContentLoaded", function(event) {
    Highcharts.chart('container', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'Daily electricity usage.'
        },
        xAxis: {
            categories: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
                         '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'
            ]
        },
        yAxis: {
            title: {
                text: 'Daily usage'
            },
            plotBands: [{
                from: 10,
                to: 13,
                color: 'rgba(68, 170, 213, 0.2)',
                label: {
                    text: 'Target peak region'
                }
            }]
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: false
            }
        },
        series: [ {
            name: 'Your home',
            data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8,
                3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
        }]
    });

});