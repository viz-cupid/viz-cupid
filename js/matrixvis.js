// https://github.com/d3/d3-interpolate

// matrix color box sizes
const box_offset = 60;
const box_size = 60;
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

  vis.box_size = 60;

  vis.margin = { top: 50, right: 0, bottom: 260, left: 300 };

  (vis.width =
    $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right),
    (vis.height = 700 - vis.margin.top - vis.margin.bottom);

  // SVG drawing area
  vis.svg = d3
    .select("#" + vis.parentElement)
    .append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .append("g")
    .attr(
      "transform",
      `translate(${vis.margin.left}, ${vis.margin.top})
      scale(1.5 1.5)`
    );

  // matrix color box sizes
  const box_offset = 60;
  const box_size = 60;

  // make sure that the vis updates when selection changes
  d3.select("#matrix-ranking-type").on("change", () => {
    vis.updateVis();
  });

  var rating_type = d3.select("#matrix-ranking-type").property("value");

  // Setup the tool tip. This tooltip code is taken from previous homework.
  vis.tool_tip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(d => {
      var rating_type = d3.select("#matrix-ranking-type").property("value");
      const count = d.num_respondents;
      const ratio = d3.format(".2%")(d.ratio);
      const ratio_string = makeRatioString(rating_type)(ratio);
      return `${count} respondents<br>${ratio_string}`;
    });
  vis.svg.call(vis.tool_tip);

  vis.freq_domain = [
    "Once a month or less",
    "2 to 3 times a month",
    "Once or twice a week",
    "3 to 6 times a week",
    "Once a day or more"
  ];
  vis.quality_domain = ["very poor", "poor", "fair", "good", "excellent"];

  var legend = vis.svg
    .append("g")
    .attr("class", "matrix-legend")
    .selectAll("rect")
    .data([0]);

  legend
    .enter()
    .append("rect")
    .attr("x", 380)
    .attr("y", 0)
    .attr("width", 50)
    .attr("height", box_size * 5 - 1)
    .attr("fill", "darkgray");

  var legendScale = legendLabelInterpolator(rating_type);

  vis.legend_steps = legend
    .data([1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0])
    .enter();
  vis.legend_rects = vis.legend_steps
    .append("rect")
    .attr("x", 380)
    .attr("y", (d, i) => (i * 300) / 11)
    .attr("width", 50)
    .attr("height", 300 / 11 - 1)
    .attr("fill", d => {
      const scale = scaleByRatingType(rating_type);
      return d3.interpolateHcl("#ffffff", "#980043")(legendScale(scale(d)));
    });
  vis.legend_labels = vis.legend_steps
    .append("text")
    .attr("x", 370)
    .attr("y", (d, i) => (i * 300) / 11 + 18)
    .attr("class", "matrix-text")
    .style("text-anchor", "end")
    .text(d => d3.format(".0%")(legendLabelInterpolator(rating_type)(d)));

  vis.legend_description = vis.svg
    .append("text")
    .attr("x", 400)
    .attr("y", -10)
    .attr("class", "matrix-text")
    .style("text-anchor", "middle")
    .text(makeRatioString(rating_type)("Percent").replace("this", "a"));

  var y_axis_label = vis.svg.append("g").attr("class", "matrix-y-axis-label");
  y_axis_label
    .append("g")
    .attr("transform", `translate(-185, 150)`)
    .append("text")
    .attr("class", "matrix-text")
    .text("Sex Frequency")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle");

  var x_axis_label = vis.svg.append("g").attr("class", "matrix-x-axis-label");
  x_axis_label
    .append("g")
    .attr("transform", `translate(150, 400)`)
    .append("text")
    .text("Relationship Quality")
    .attr("class", "matrix-text")
    .style("text-anchor", "middle");

  // select all the columns
  var rootSelection = vis.svg
    .selectAll(".matrix-column")
    .data(vis.data, d => d.frequency);

  // make group for columns
  var columns = rootSelection
    .enter()
    .append("g")
    .attr("class", "matrix-column")
    .attr(
      "transform",
      (d, i) => `translate(${box_offset * i + 16}, ${vis.box_size * 5.6})`
    );

  // label columns
  columns
    .append("text")
    .attr("class", "matrix-text")
    .attr("y", 0)
    .attr("x", vis.box_size / 2 + 2)
    .style("text-anchor", "end")
    .attr("transform", `rotate(${270 + 45})`)
    .text((d, i) => vis.quality_domain[i]);

  // rows group
  var rows = rootSelection
    .enter()
    .append("g")
    .attr("class", "matrix-row")
    .attr("transform", (d, i) => `translate(0, ${box_offset * (4 - i)})`);

  // label the rows tbh
  rows
    .append("text")
    .attr("class", "matrix-text")
    .attr("y", vis.box_size / 2 + 2)
    .attr("x", -10)
    .style("text-anchor", "end")
    .text((d, i) => vis.freq_domain[i]);

  rootSelection
    .transition()
    .duration(200)
    .attr("transform", (d, i) => `translate(${box_offset * i}, 0)`);

  var squares = rows
    .selectAll(".matrix-square")
    .data(d => d.ratios_per_quality[rating_type]);
  squares
    .enter()
    .append("rect")
    .on("mouseover", vis.tool_tip.show)
    .on("mouseout", vis.tool_tip.hide)
    .attr("x", (d, i) => i * box_offset)
    .attr("y", 0)
    .attr("height", vis.box_size)
    .attr("width", vis.box_size)
    .attr("class", "matrix-square")
    .attr("fill", d => {
      const scale = scaleByRatingType(rating_type);
      return d3.interpolateHcl("#ffffff", "#980043")(scale(d.ratio));
    });

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

MatrixVis.prototype.updateVis = function() {
  var vis = this;

  var rating_type = d3.select("#matrix-ranking-type").property("value");
  var legendScale = legendLabelInterpolator(rating_type);
  console.log("selected", rating_type);

  console.log(vis);

  var rows = vis.svg.selectAll(".matrix-row").data(vis.data, d => d.frequency);
  rows
    .selectAll("rect")
    .data(d => d.ratios_per_quality[rating_type])
    .transition()
    .attr("height", vis.box_size * 0.85)
    .attr("width", vis.box_size * 0.85)
    .transition()
    .duration(800)
    .attr("fill", d => {
      const scale = scaleByRatingType(rating_type);
      return d3.interpolateHcl("#ffffff", "#980043")(scale(d.ratio));
    })
    .transition()
    .attr("height", boxHeightBySelection(rating_type))
    .attr("width", boxWidthBySelection(rating_type));

  vis.legend_rects
    .transition()
    .transition()
    .duration(800)
    .attr("fill", d => {
      const scale = scaleByRatingType(rating_type);
      return d3.interpolateHcl("#ffffff", "#980043")(legendScale(scale(d)));
    });

  vis.legend_labels
    .transition()
    .transition()
    .duration(800)
    .text(d => d3.format(".0%")(legendLabelInterpolator(rating_type)(d)));

  vis.legend_description.text(
    makeRatioString(rating_type)("Percent").replace("in this ", "within ")
  );
};

// returns a scaling function
function scaleByRatingType(type) {
  if (type === "across_all_freqs") {
    return ratio => ratio * 5;
  } else if (type === "across_this_freq") {
    return ratio => ratio * 2;
  } else if (type === "across_qualities") {
    return ratio => ratio * 5;
  }
}

// returns a function making a ratio string
function makeRatioString(type) {
  if (type === "across_all_freqs") {
    return ratio => `${ratio} of responses overall`;
  } else if (type === "across_this_freq") {
    return ratio => `${ratio} of responses in this row`;
  } else if (type === "across_qualities") {
    return ratio => `${ratio} of responses in this column`;
  }
}

function boxHeightBySelection(type) {
  if (type === "across_all_freqs") {
    return box_size;
  } else if (type === "across_this_freq") {
    return box_size * 0.85;
  } else if (type === "across_qualities") {
    return box_size;
  }
}

function boxWidthBySelection(type) {
  if (type === "across_all_freqs") {
    return box_size;
  } else if (type === "across_this_freq") {
    return box_size;
  } else if (type === "across_qualities") {
    return box_size * 0.85;
  }
}

function legendLabelInterpolator(type) {
  if (type === "across_all_freqs") {
    return d3.interpolateNumber(0, 0.2);
  } else if (type === "across_this_freq") {
    return d3.interpolateNumber(0, 0.7);
  } else if (type === "across_qualities") {
    return d3.interpolateNumber(0, 0.3);
  }
}
