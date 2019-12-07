var allData = [];

// Variable for the visualization instance
var matrixVis;

// File paths
var matrixDataPath = "data/matrix-data.json";
var ageVisDataPath = "data/age-diff-data.json";
var timeVisDataPath = "data/time-data.csv";

// Function to convert date objects to strings or reverse
var dateFormatter = d3.timeFormat("%Y-%m-%d");
var dateParser = d3.timeParse("%Y-%m-%d");

// (1) Load data asynchronously
queue()
  .defer(d3.json, matrixDataPath)
  .defer(d3.json, ageVisDataPath)
  .defer(d3.csv, timeVisDataPath)
  .await(createVis);

function createVis(error, matrixData, ageData, timeData) {
  if (error) {
    console.log(error);
  }

  console.log(matrixData);
  console.log(ageData);

  // clean up time data
  timeData.forEach(d => {
    d.same_sex = +d.same_sex === -1 ? null : +d.same_sex === 1;
    d.age = +d.age;
    var milestones = ["met", "dating", "movein", "marry"];
    d.dates = milestones
      .map(ms => {
        d[ms] = d[ms] === "null" ? null : new Date(d[ms]);
        return { milestone: ms, date: d[ms], same_sex: d.same_sex };
      })
      .filter(dt => dt.date !== null);
  });
  var newTimeData = timeData.filter(d => d.dates.length > 0);
  console.log(newTimeData);

  // (4) Create visualization instances
  var matrixVis = new MatrixVis("matrix-vis", matrixData);

  var ageVis = new AgeVis("age-vis", ageData);

  var timelineVis = new TimelineVis("timeline-vis", newTimeData);
  // var timeAreaVis = new TimeAreaVis("time-area-vis", ...)
}
