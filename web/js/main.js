var allData = [];

// Variable for the visualization instance
var matrixVis;

// File paths
var matrixDataPath = "data/matrix-data.json";

// Function to convert date objects to strings or reverse
var dateFormatter = d3.timeFormat("%Y-%m-%d");
var dateParser = d3.timeParse("%Y-%m-%d");

// (1) Load data asynchronously
queue()
  .defer(d3.json, matrixDataPath)
  .await(createVis);

function createVis(error, matrixData) {
  if (error) {
    console.log(error);
  }

  console.log(matrixData);

  // (4) Create visualization instances
  var matrixVis = new MatrixVis("matrix-vis", matrixData);
}
