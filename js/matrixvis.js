/*
 * MatrixVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

MatrixVis = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;

  this.initVis();
};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

MatrixVis.prototype.initVis = function() {
  var vis = this;

  vis.margin = { top: 200, right: 0, bottom: 60, left: 200 };

  (vis.width =
    $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right),
    (vis.height = 400 - vis.margin.top - vis.margin.bottom);

  // SVG drawing area
  vis.svg = d3
    .select("#" + vis.parentElement)
    .append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr(
      "transform",
      "translate(" + vis.margin.left + "," + vis.margin.top + ")"
    );

  vis.scale = d3.scaleSequential(d3.interpolateGreys);

  vis.x_domain = [
    "Once a month or less",
    "2 to 3 times a month",
    "Once or twice a week",
    "3 to 6 times a week",
    "Once a day or more"
  ];
  vis.y_domain = ["very poor", "poor", "fair", "good", "excellent"];

  var y = (d, i) => i * 32 + 15;

  // select all the rows
  var rootSelection = vis.svg
    .selectAll(".row")
    .data(vis.data, d => d.frequency);

  // make column labels
  rootSelection
    .enter()
    .append("text")
    .attr("x", 10)
    .attr("y", y)
    .text(d => d.frequency)
    .attr("transform", "rotate(270)");

  var rows = rootSelection
    .enter()
    .append("g")
    .attr("class", "row")
    .attr("transform", (d, i) => `translate(0, ${32 * i})`);
  rows
    .append("text")
    .attr("y", 15)
    .attr("x", -10)
    .style("text-anchor", "end")
    .text((d, i) => vis.y_domain[i]);

  rootSelection
    .transition()
    .duration(200)
    .attr("transform", (d, i) => `translate(0, ${32 * i})`);

  var squares = rows.selectAll(".matrix-square").data(d => d.ratings);
  squares
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 32)
    .attr("y", 0)
    .attr("height", 10)
    .attr("width", 10)
    .attr("class", "matrix-square")
    .attr("fill", d => d3.interpolateBlues(d / 600));

  // (Filter, aggregate, modify data)
  // vis.wrangleData();
};

/*
 * Data wrangling
 */

// MatrixVis.prototype.wrangleData = function() {
//   var vis = this;
//
//   this.displayData = this.data;
//
//   Update the visualization
//   vis.updateVis();
// };

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

// MatrixVis.prototype.updateVis = function() {
//   var vis = this;
//   placeholder
// };
