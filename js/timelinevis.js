/*
 * TimelineVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- the actual data
 */

TimelineVis = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.oData = _data.map(d => d);

  this.initVis();
};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

TimelineVis.prototype.initVis = function() {
  var vis = this;
  vis.r = 4;

  vis.margin = { top: 30, right: 40, bottom: 120, left: 40 };

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
      "translate(" + vis.margin.left + "," + vis.margin.top + ")"
    )
    .attr("overflow", "auto");

  // SVG clipping path
  // vis.svg.append("defs")
  //     .append("clipPath")
  //     .attr("id", "clip")
  //     .append("rect")
  //     .attr("width", vis.width + 4)
  //     .attr("height", vis.height + 4);

  vis.x = d3
    .scaleTime()
    .domain([
      d3.min(vis.data, d => d.dates[0].date),
      d3.max(vis.data, d => d.dates[d.dates.length - 1].date)
    ])
    .range([5, vis.width - 5]);
  vis.y = d3
    .scaleLinear()
    .domain([0, vis.data.length - 1])
    .range([5, vis.height - 5]);

  vis.color = d3
    .scaleOrdinal()
    .domain(["marry", "movein", "dating", "met"])
    .range(["#980043", "#dd1c77", "#df65b0", "#c994c7", "#d4b9da", "#f1eef6"]);

  // (Filter, aggregate, modify data)
  vis.wrangleData();
};

/*
 * Data wrangling
 */

TimelineVis.prototype.wrangleData = function() {
  var vis = this;

  vis.data = vis.data.sort((a, b) => a.dates[0].date - b.dates[0].date);
  // Until zoom/scroll implemented, only take the first 100 to avoid clutter
  vis.data = vis.data.filter((_, i) => i < 100);
  // (Update visualization)
  vis.updateVis();
};

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

TimelineVis.prototype.updateVis = function() {
  var vis = this;
  vis.y.domain([0, vis.data.length - 1]);
  vis.x.domain([minDate(vis.data), maxDate(vis.data)]);

  vis.xAxis = d3
    .axisBottom()
    .ticks(5)
    .scale(vis.x);

  vis.svg
    .append("g")
    .attr("class", "axis x-axis")
    .transition()
    .attr("transform", "translate(0," + vis.height + ")")
    .call(vis.xAxis);

  var timeline = vis.svg
    .append("g")
    // .attr("clip-path", "url(#clip)")
    .selectAll(".timeline")
    .data(vis.data);

  var timelineGroup = timeline
    .enter()
    .append("g")
    .attr("class", "timeline");
  timelineGroup
    .merge(timeline)
    .transition()
    .attr("transform", (d, i) => `translate(0, ${vis.y(i)})`);

  timelineGroup
    .append("path")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .merge(timeline)
    .attr(
      "d",
      d =>
        `M${vis.x(d.dates[0].date) + 4} 0 L${vis.x(
          d.dates[d.dates.length - 1].date
        ) - 4} 0 Z`
    );

  var date = timelineGroup
    .merge(timeline)
    .selectAll(".date")
    .data(d => d.dates);

  date
    .enter()
    .append("circle")
    .attr("class", "date")
    .attr("r", vis.r)
    .attr("stroke", "black")
    .on("mouseover", function() {
      d3.selectAll("path").attr("opacity", 0.1);
      d3.selectAll(".date").attr("opacity", 0.3);
      d3.select(this).raise();
      d3.select(this.parentNode)
        .raise()
        .selectAll("path")
        .attr("opacity", 1);
      d3.select(this.parentNode)
        .selectAll(".date")
        .attr("opacity", 1)
        // .transition()
        // .duration(750)
        .attr("r", vis.r * 1.5);
    })
    .on("mouseout", function() {
      d3.selectAll("path")
        // .transition()
        .attr("opacity", 1);
      d3.selectAll(".date")
        // .transition()
        .attr("opacity", 1);
      d3.select(this.parentNode)
        .selectAll(".date")
        // .transition()
        .attr("r", vis.r);
    })
    .merge(date)
    .transition()
    .attr("fill", d => vis.color(d.milestone))
    .attr("cx", d => vis.x(d.date));
  date.exit().remove();
};

function relationshipLength(d) {
  return d.dates[d.dates.length - 1].date - d.dates[0].date;
}

function minDate(data) {
  return d3.min(data, d => d.dates[0].date);
}

function maxDate(data) {
  return d3.max(data, d => d.dates[d.dates.length - 1].date);
}
