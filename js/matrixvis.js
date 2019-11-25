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

  vis.margin = { top: 100, right: 0, bottom: 260, left: 200 };

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

  // Setup the tool tip. This tooltip code is taken from previous homework.
  var tool_tip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(d => {
      return `${d} respondents`;
    });
  vis.svg.call(tool_tip);

  vis.scale = d3.scaleSequential(d3.interpolateGreys);

  vis.x_domain = [
    "Once a month or less",
    "2 to 3 times a month",
    "Once or twice a week",
    "3 to 6 times a week",
    "Once a day or more"
  ];
  vis.y_domain = ["very poor", "poor", "fair", "good", "excellent"];

  // var legend = vis.svg.append("g").data([0, 50, 100, 200, 300, 400]);
  // legend
  //   .selectAll("rect")
  //   .enter()
  //   .append("rect")
  //   .attr("x", 0)
  //   .attr("y", 0)
  //   .attr("width", 50)
  //   .attr("height", 20)
  //   .attr("fill", "green");

  var y = (d, i) => i * 32 + 15;

  // // select all the rows
  // var rootSelection = vis.svg
  //   .selectAll(".row")
  //   .data(vis.data, d => d.frequency);
  //
  // // make column labels
  // rootSelection
  //   .enter()
  //   .append("text")
  //   .attr("x", (d, i) => -105 + 23 * i)
  //   .attr("y", (d, i) => i * 23 + 115)
  //   .text(d => d.frequency)
  //   .attr("class", "matrix-x-axis-label")
  //   .attr("transform", `rotate(${270 + 45})`);
  //
  // var rows = rootSelection
  //   .enter()
  //   .append("g")
  //   .attr("class", "row")
  //   .attr("transform", (d, i) => `translate(0, ${32 * i})`);
  // rows
  //   .append("text")
  //   .attr("y", 10)
  //   .attr("x", -10)
  //   .style("text-anchor", "end")
  //   .text((d, i) => vis.y_domain[i]);
  //
  // rootSelection
  //   .transition()
  //   .duration(200)
  //   .attr("transform", (d, i) => `translate(0, ${32 * i})`);
  //
  // var squares = rows.selectAll(".matrix-square").data(d => d.ratings);
  // squares
  //   .enter()
  //   .append("rect")
  //   .attr("x", (d, i) => i * 32)
  //   .attr("y", 0)
  //   .attr("height", 10)
  //   .attr("width", 10)
  //   .attr("class", "matrix-square")
  //   .attr("fill", d => d3.interpolateBlues(d / 600));

  // select all the columns
  var rootSelection = vis.svg
    .selectAll(".matrix-column")
    .data(vis.data, d => d.frequency);

  // make column labels
  rootSelection
    .enter()
    .append("text")
    .attr("x", (d, i) => -105 + 23 * i)
    .attr("y", (d, i) => i * 23 + 115)
    .text(d => d.frequency)
    .attr("class", "matrix-x-axis-label")
    .attr("transform", `rotate(${270 + 45})`);

  // make group for columns
  var columns = rootSelection
    .enter()
    .append("g")
    .attr("class", "matrix-column")
    .attr("transform", (d, i) => `translate(${32 * i}, 0)`);
  // .attr("transform", (d, i) => `translate(0, ${32 * i})`);

  // rows group
  var rows = rootSelection
    .enter()
    .append("g")
    .attr("class", "matrix-column")
    .attr("transform", (d, i) => `translate(0, ${32 * i})`);

  // label the rows tbh
  rows
    .append("text")
    .attr("y", 10)
    .attr("x", -10)
    .style("text-anchor", "end")
    .text((d, i) => vis.y_domain[4 - i]);

  rootSelection
    .transition()
    .duration(200)
    // .attr("transform", (d, i) => `translate(0, ${32 * i})`);
    // .attr("transform", (d, i) => `translate(0, ${32 * 5 - 32 * i})`);
    .attr("transform", (d, i) => `translate(${32 * i}, 0)`);

  var squares = columns.selectAll(".matrix-square").data(d => d.ratings);
  squares
    .enter()
    // .append("text")
    .append("rect")
    .on("mouseover", tool_tip.show)
    .on("mouseout", tool_tip.hide)
    .attr("y", (d, i) => (4 - i) * 32)
    // .attr("x", (d, i) => i * 32)
    .attr("x", 0)
    // .text((d, i) => d);
    .attr("height", 10)
    .attr("width", 10)
    .attr("class", "matrix-square")
    .attr("fill", d => d3.interpolateBlues(d / 300));

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
