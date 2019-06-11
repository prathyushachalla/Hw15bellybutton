function dropDown() {
    let $select = Plotly.d3.select('#selDataset');

    let namesUrl = '/names';

    Plotly.d3.json(namesUrl, (error, nameList) => {
        if (error) return console.warn(error);

        // console.log(nameList);

        $select.selectAll('option')
            .data(nameList)
            .enter()
            .append('option')
            .attr('value', data => data)
            .text(data => data);
    });
}


function sampleTable(sample_id) {
    let metaUrl = `/metadata/${sample_id}`;

    let $tbody = Plotly.d3.select('table#data-table tbody');

    Plotly.d3.json(metaUrl, (error, metaData) => {
        if (error) return console.warn(error);

        // console.log(metaData);
        // console.log(Object.keys(metaData));

        $tbody.selectAll('tr').remove();

        for (let key in metaData) {
            $tbody.append('tr')
                .html(`<td>${key}</td><td>${metaData[key]}</td>`);
        }
    });
}


function getClassification(otuIds) {
    let otuUrl = '/otu';

    let otuList = [];

    Plotly.d3.json(otuUrl, (error, otuData) => {
        if (error) return console.warn(error);

        // console.log(otuData);

        for (let i = 0, ii = otuData.length; i < ii; i++) {
            for (let j = 0, jj = otuIds.length; j < jj; j++) {
                if (i === +otuIds[j]) {
                    otuList.push(otuData[i]);
                }
            }
        }
    });

    return otuList;
}


function pieChart(sample_id) {
    let samplesUrl = `/samples/${sample_id}`;

    Plotly.d3.json(samplesUrl, (error, samplesData) => {
        if (error) return console.warn(error);

        // console.log(samplesData);

        let otuIds = samplesData[0].otu_ids.slice(0, 10);
        let sampleValues = samplesData[1].sample_values.slice(0, 10);

        let otuList = getClassification(otuIds);

        let pieTrace = {
            labels: otuIds,
            values: sampleValues,
            type: 'pie',
            text: otuList,
            textinfo: 'percent',
            textposition: 'inside'
            // hoverinfo: `label+percent+value+${otuList}`
        };

        let pieData = [pieTrace];

        let pieLayout = {
            // height: 300,
            // width: 500,
            margin: {
                l: 30,
                r: 30,
                b: 30,
                t: 30,
            }
        };

        Plotly.react('pie', pieData, pieLayout);

        // let hasChart = Plotly.d3.select('#pie').classed('js-plotly-plot');

        // if (hasChart === true) {
        //     Plotly.restyle('pie', pieTrace);
        // }
        // else {
        //     Plotly.newPlot('pie', pieData, pieLayout);
        // }
    });
}


function gaugeChart(sample_id) {
    let wfreqUrl = `/wfreq/${sample_id}`;

    Plotly.d3.json(wfreqUrl, (error, wfreqData) => {
        if (error) return console.warn(error);

        // console.log(wfreqData);

        let wfreq = wfreqData.WFREQ;

        // Enter a washing freq between 0 and 180
        const coefficient = 180 / 9;
        let level = coefficient * wfreq;

        // Trig to calc meter point
        let degrees = 180 - level,
            radius = .5;
        let radians = degrees * Math.PI / 180;
        let x = radius * Math.cos(radians);
        let y = radius * Math.sin(radians);

        // Path: may have to change to create a better triangle
        let mainPath = 'M -.0 -0.025 L .0 0.025 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';

        let path = mainPath.concat(pathX, space, pathY, pathEnd);

        let gaugeData = [{
            type: 'scatter',
            x: [0], y: [0],
            marker: { size: 28, color: '850000' },
            showlegend: false,
            name: 'Washing Frequency',
            text: wfreq,
            hoverinfo: 'text+name'
        },
        {
            values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
            rotation: 90,
            text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
            textinfo: 'text',
            textposition: 'inside',
            marker: {
                colors: ['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                    'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                    'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                    'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)']
            },
            labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
            hoverinfo: 'label',
            hole: .5,
            type: 'pie',
            showlegend: false
        }];

        let gaugeLayout = {
            shapes: [{
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: {
                    color: '850000'
                }
            }],
            // height: 400,
            // width: 400,
            margin: {
                l: 30,
                r: 30,
                b: 30,
                t: 80,
            },
            xaxis: {
                zeroline: false, showticklabels: false,
                showgrid: false, range: [-1, 1]
            },
            yaxis: {
                zeroline: false, showticklabels: false,
                showgrid: false, range: [-1, 1]
            }
        };

        Plotly.react('gauge', gaugeData, gaugeLayout);
    });
}


function bubbleChart(sample_id) {
    let samplesUrl = `/samples/${sample_id}`;

    Plotly.d3.json(samplesUrl, (error, samplesData) => {
        if (error) return console.warn(error);

        // console.log(samplesData);

        let sampleValues = samplesData[1].sample_values.filter(num => { return num !== 0; });
        let otuIds = samplesData[0].otu_ids.slice(0, sampleValues.length);

        // console.log(sampleValues);
        // console.log(otuIds);

        let otuList = getClassification(otuIds);

        let bubbleTrace = {
            x: otuIds,
            y: sampleValues,
            text: otuList,
            mode: 'markers',
            marker: {
                size: sampleValues,
                colorscale: 'Portland',
                color: otuIds
            }
        };

        let bubbleData = [bubbleTrace];

        let bubbleLayout = {
            hovermode: 'closest',
            xaxis: {
                title: 'Operational Taxonomic Unit (OTU) ID'
            },
            yaxis: {
                title: 'Sample Values'
            },
            height: 600,
            width: 1200,
            margin: {
                l: 80,
                r: 100,
                b: 100,
                t: 30,
            }
        };

        Plotly.react('bubble', bubbleData, bubbleLayout);

        // let hasChart = Plotly.d3.select('#bubble').classed('js-plotly-plot');

        // if (hasChart === true) {
        //     Plotly.restyle('bubble', bubbleTrace);
        // }
        // else {
        //     Plotly.newPlot('bubble', bubbleData, bubbleLayout);
        // }
    });
}


function optionChanged(sample_id) {
    // console.log(sample_id);

    sampleTable(sample_id);
    pieChart(sample_id);
    gaugeChart(sample_id);
    bubbleChart(sample_id);
}


function init() {
    dropDown();

    let defaultSample = 'BB_940';

    sampleTable(defaultSample);
    pieChart(defaultSample);
    gaugeChart(defaultSample);
    bubbleChart(defaultSample);
}


init();