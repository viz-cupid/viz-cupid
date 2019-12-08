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

  var mSecondsInAYear = 31536000000;
  var areaData = newTimeData.map(function(d) {
    return {
      "met": d.dates[0].date,
      "time": relationshipLength(d) / mSecondsInAYear
    }
  });

  // (4) Create visualization instances
  var matrixVis = new MatrixVis("matrix-vis", matrixData);

  var ageVis = new AgeVis("age-vis", ageData);

  var timelineVis = new TimelineVis("timeline-vis", newTimeData);

  var MyEventHandler = {};
  var areaVis = new TimeAreaVis("time-area-vis", areaData, MyEventHandler);

  // (5) Bind event handler
  $(MyEventHandler).bind("selectionChanged", function(event, rangeStart, rangeEnd){
    timelineVis.onSelectionChange(rangeStart, rangeEnd);
  });
}
