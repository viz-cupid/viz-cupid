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
    (vis.height = 600 - vis.margin.top - vis.margin.bottom);

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

  const box_offset = 60;
  const box_size = 60;

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

  vis.freq_domain = [
    "Once a month or less",
    "2 to 3 times a month",
    "Once or twice a week",
    "3 to 6 times a week",
    "Once a day or more"
  ];
  vis.quality_domain = ["very poor", "poor", "fair", "good", "excellent"];

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

  var y = (d, i) => i * box_offset + 15;

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
  //   .text((d, i) => vis.quality_domain[i]);
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
    // .data(vis.data, (d, i) => vis.freq_domain[i]);
    .data(vis.data, d => d.frequency);

  // make column labels (rotation makes this difficult)
  // rootSelection
  //   .enter()
  //   .append("text")
  //   .attr("x", (d, i) => -105 + 23 * i)
  //   .attr("y", (d, i) => i * 23 + 132)
  //   .text((d, i) => vis.quality_domain[i])
  //   // .text((d, i) => d.frequency)
  //   .attr("class", "matrix-x-axis-label")
  //   .attr("transform", `rotate(${270 + 45})`);

  // make group for columns
  var columns = rootSelection
    .enter()
    .append("g")
    .attr("class", "matrix-column")
    .attr(
      "transform",
      (d, i) => `translate(${box_offset * i + 16}, ${box_size * 5.6})`
    );
  // .attr("transform", (d, i) => `translate(0, ${box_offset * i})`);

  // label columns
  columns
    .append("text")
    .attr("y", 0)
    .attr("x", box_size / 2 + 2)
    .style("text-anchor", "end")
    .attr("transform", `rotate(${270 + 45})`)
    .text((d, i) => vis.quality_domain[i]);

  // rows group
  var rows = rootSelection
    .enter()
    .append("g")
    .attr("class", "matrix-column")
    .attr("transform", (d, i) => `translate(0, ${box_offset * (4 - i)})`);

  // label the rows tbh
  rows
    .append("text")
    .attr("y", box_size / 2 + 2)
    .attr("x", -10)
    .style("text-anchor", "end")
    .text((d, i) => vis.freq_domain[i]);

  rootSelection
    .transition()
    .duration(200)
    // .attr("transform", (d, i) => `translate(0, ${box_offset * i})`);
    // .attr("transform", (d, i) => `translate(0, ${box_offset * 5 - box_offset * i})`);
    .attr("transform", (d, i) => `translate(${box_offset * i}, 0)`);

  var squares = rows.selectAll(".matrix-square").data(d => d.ratings);
  squares
    .enter()
    // .append("text")
    .append("rect")
    .on("mouseover", tool_tip.show)
    .on("mouseout", tool_tip.hide)
    // .attr("y", (d, i) => (4 - i) * box_offset)
    .attr("x", (d, i) => i * box_offset)
    .attr("y", 0)
    // .attr("x", 0)
    // .text((d, i) => d);
    .attr("height", box_size)
    .attr("width", box_size)
    .attr("class", "matrix-square")
    .attr("fill", d => d3.interpolateHcl("#ffffff", "#980043")(d / 330));
  // .attr("fill", d => d3.interpolateReds(d / 300));

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
