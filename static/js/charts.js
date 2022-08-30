function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");
  
    // Use the list of sample names to populate the select options
    d3.json("samples.json").then((data) => {
      var sampleNames = data.names;
  
      sampleNames.forEach((sample) => {
        selector
          .append("option")
          .text(sample)
          .property("value", sample);
      });
  
      // Use the first sample from the list to build the initial plots
      var firstSample = sampleNames[0];
      buildCharts(firstSample);
      buildMetadata(firstSample);
    });
  }
  
  // Initialize the dashboard
  init();
  
  function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildMetadata(newSample);
    buildCharts(newSample);
    
  }
  
  // Demographics Panel 
  function buildMetadata(sample) {
    d3.json("samples.json").then((data) => {
      var metadata = data.metadata;
      // Filter the data for the object with the desired sample number
      var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
      var result = resultArray[0];
      // Use d3 to select the panel with id of `#sample-metadata`
      var PANEL = d3.select("#sample-metadata");
  
      // Use `.html("") to clear any existing metadata
      PANEL.html("");
  
      // Use `Object.entries` to add each key and value pair to the panel
      // Hint: Inside the loop, you will need to use d3 to append new
      // tags for each key-value in the metadata.
      Object.entries(result).forEach(([key, value]) => {
        PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
      });
  
    });
  }
  
// Create the buildChart function.
function buildCharts(sample) {
  // Use d3.json to load the samples.json file 
  d3.json("samples.json").then((data) => {
    // console.log(data);

    // Create a variable that holds the samples array.
    let samplesArray = data.samples; 

    // Create a variable that filters the samples for the object with the desired sample number.
    let filteredSamplesArray = samplesArray.filter(sampleObj => sampleObj.id == sample);

    // 1. Create a variable that filters the metadata array for the object with the desired sample number.
    var metadata = data.metadata
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);

    // Create a variable that holds the first sample in the array.
    var sampleResult = filteredSamplesArray[0];

    // 2. Create a variable that holds the first sample in the metadata array.
    var metadataResult = resultArray[0];

    // Create variables that hold the otu_ids, otu_labels, and sample_values.
    var sampleOtuIds = sampleResult.otu_ids;
    var sampleOtuLabels = sampleResult.otu_labels;
    var sampleValues = sampleResult.sample_values;

    // 3. Create a variable that holds the washing frequency.
    var wFreqResult = parseFloat(metadataResult.wfreq);
   
    // Create the yticks for the bar chart.
    var yticks = sampleOtuIds.map(item => ("OTU " + item)).sort((a, b) => parseInt(a) - parseInt(b)).slice(0, 10);

    // Use Plotly to plot the bar data and layout.
    barTrace = {
        x: sampleValues.slice(0, 10).reverse(),
        y: yticks.reverse(),
        text: yticks,
        type: "bar",
        orientation: "h",
        // https://community.plotly.com/t/customizing-individual-bar-colors/6137
        marker: {
          color: "lightsalmon",
        },
    };

    barData = [
        barTrace
    ];
    
    barLayout = {
        title: "Top 10 Bacteria Cultures Found",
        width: 450,
        height: 400,
        // https://stackoverflow.com/questions/29968152/setting-background-color-to-transparent-in-plotly-plots
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)"
    };

    Plotly.newPlot("bar", barData, barLayout);
    
    // Use Plotly to plot the bubble data and layout.
    bubbleTrace = {
        x: sampleResult.otu_ids,
        y: sampleResult.sample_values,
        text: sampleResult.otu_labels,
        mode: "markers",
        marker: {
          color: sampleResult.otu_ids,
          size: sampleResult.sample_values,
          symbol: "circle",
          type: "scatter"
        },
    };
    
    bubbleData = [
        bubbleTrace,
    ];
    
    var bubbleLayout = {
        title: "Bacteria Cultures Per Sample",
        showlegend: false,
        height: 550,
        width: 1140,
        opacity: 1,
        margin: {
            l: 75,
            r: 75,
            t: 75,
            b: 75
        },
        xaxis: {title: "OTU ID"},
        // https://stackoverflow.com/questions/29968152/setting-background-color-to-transparent-in-plotly-plots
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)"
    };

    Plotly.newPlot("bubble", bubbleData, bubbleLayout);
    
    // 4. Create the trace for the gauge chart.

    // layout tips from: https://plotly.com/javascript/gauge-charts/
    // trace formatting tips from: https://plotly.com/javascript/indicator/
    var gaugeTrace = {
        domain: { x: [ null, 1 ], y: [0, 10] },
        value: wFreqResult,
        title: {
            text: "Belly Button Washing Frequency<br><span Style='font-size:0.8em;color:gray'>"+
                  "Scrubs per Week</span>",            
            font: { weight: "bold" }
        
        },
        y: {
            text: "Scrubs per Week"
        },
        type: "indicator",
        mode: "gauge+number",
        gauge: { 
            axis: { range: [null, 10] },
            steps: [
                { range: [ 0, 2 ], color: "red" },
                { range: [ 2, 4 ], color: "pink" },
                { range: [ 4, 6 ], color: "lightgoldenrodyellow" },
                { range: [ 6, 8 ], color: "yellowgreen" },
                { range: [ 8, 10 ], color: "green" },
            ],
            bar: { color: "skyblue" }
        }
    };

    var gaugeData = [
        gaugeTrace     
    ];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
        width: 450,
        height: 400,
        margin: {
            t: 1,
            b: 0
        },
        // https://stackoverflow.com/questions/29968152/setting-background-color-to-transparent-in-plotly-plots
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)"
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
  });
}
