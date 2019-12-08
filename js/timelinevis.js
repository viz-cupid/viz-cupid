/*
 * TimelineVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- the actual data
 */

TimelineVis = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.oData = _data
    .map(d => d)
    .sort((a, b) => a.dates[0].date - b.dates[0].date);

  this.milestoneMap = {
    marry: "Married",
    movein: "Moved In",
    dating: "Started Dating",
    met: "Met"
  };

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
  vis.svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", vis.width)
    .attr("height", vis.height);

  vis.x = d3
    .scaleTime()
    .domain([
      d3.min(vis.data, d => d.dates[0].date),
      d3.max(vis.data, d => d.dates[d.dates.length - 1].date)
    ])
    .range([5, vis.width - 5]);
  vis.y = d3
    .scaleLinear()
    .domain([0, 79])
    .range([5, vis.height - 5]);

  vis.color = d3
    .scaleOrdinal()
    .domain(Object.keys(vis.milestoneMap))
    .range(["#980043", "#dd1c77", "#df65b0", "#c994c7", "#d4b9da", "#f1eef6"]);

  // tool tip
  vis.tool_tip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(dates, selected = "") {
      var html = "";
      dates.forEach((d, i) => {
        html += selected === d.milestone ? "<b>" : "";
        html += vis.milestoneMap[d.milestone] + ": ";
        html += dateFormat(d.date, "mmmm yyyy");
        html += selected === d.milestone ? "</b>" : "";
        html += i < dates.length - 1 ? "<br/>" : "";
      });
      return html;
    });
  vis.svg.call(vis.tool_tip);

  // zoom
  vis.yOrig = vis.y.copy();
  vis.xOrig = vis.x.copy();
  vis.zoomFunction = function() {
    vis.y = d3.event.transform.rescaleY(vis.yOrig);
    vis.x = d3.event.transform.rescaleX(vis.xOrig);
    // console.log(vis.data.length);
    // console.log(vis.y.range());
    // console.log(vis.y.domain());
    vis.updateVis();
  };
  vis.zoom = d3.zoom().on("zoom", vis.zoomFunction);
  vis.zoomGroup = vis.svg
    .call(vis.zoom)
    .append("rect")
    .attr("width", vis.width)
    .attr("height", vis.height)
    .attr("fill", "none")
    .attr("pointer-events", "all");

  vis.xAxis = d3
    .axisBottom()
    .ticks(8)
    .scale(vis.x);
  vis.svg
    .append("g")
    .attr("class", "axis x-axis")
    .transition()
    .attr("transform", "translate(0," + vis.height + ")");
  vis.clipGroup = vis.svg.append("g");

  // (Filter, aggregate, modify data)
  vis.wrangleData();
};

/*
 * Data wrangling
 */

TimelineVis.prototype.wrangleData = function() {
  var vis = this;
  vis.data = vis.data.sort((a, b) => a.dates[0].date - b.dates[0].date);

  // Until zoom/scroll implemented, only take the first 80 to avoid clutter
  vis.data = vis.data.filter((_, i) => i < 80);

  // (Update visualization)
  vis.updateVis();
};

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

TimelineVis.prototype.updateVis = function() {
  var vis = this;
  vis.r =
    (vis.y.range()[1] - vis.y.range()[0]) /
      (vis.y.domain()[1] - vis.y.domain()[0]) /
      2 -
    0.5;
  // console.log(vis.r);

  // clip chart area

  vis.xAxis.scale(vis.x);
  vis.svg.selectAll(".x-axis").call(vis.xAxis);

  var timeline = vis.clipGroup.selectAll(".timeline").data(vis.data);

  vis.clipGroup.attr("clip-path", "url(#clip)");

  var timelineGroup = timeline
    .enter()
    .append("g")
    .attr("class", "timeline");

  vis.svg
    .selectAll(".timeline")
    // .transition()
    .attr("transform", (d, i) => `translate(0, ${vis.y(i)})`);

  timelineGroup
    .append("path")
    .attr("class", "timeline-path")
    .attr("stroke", "black")
    .attr("stroke-width", 1);

  timelineGroup
    .merge(timeline)
    .select(".timeline-path")
    .attr(
      "d",
      d =>
        `M${vis.x(d.dates[0].date) - vis.r} 0 L${vis.x(
          d.dates[d.dates.length - 1].date
        ) + vis.r} 0 Z`
    );
  vis.svg
    .selectAll("timeline-path")
    .attr(
      "d",
      d =>
        `M${vis.x(d.dates[0].date) - vis.r} 0 L${vis.x(
          d.dates[d.dates.length - 1].date
        ) + vis.r} 0 Z`
    );

  // invisible path for hover
  timelineGroup
    .append("path")
    .attr("class", "black")
    .attr("stroke-width", vis.r * 3)
    .attr("class", "timeline-hover-path")
    .style("pointer-events", "all");

  vis.svg
    .selectAll(".timeline-hover-path")
    .attr("stroke-width", vis.r * 3)
    .on("mouseover", function() {
      vis.highlightTimeline(this);

      // show tool tip
      var groupDates = d3.select(this.parentNode).datum().dates;
      vis.tool_tip.show(groupDates);
    })
    .on("mouseout", function() {
      vis.unHighlightTimeline(this);
    });

  var date = vis.svg
    .selectAll(".timeline")
    .selectAll(".date")
    .data(d => d.dates);

  date
    .enter()
    .append("circle")
    .attr("class", "date")
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
    .on("mouseover", function(d) {
      vis.highlightTimeline(this);

      // make this circle slightly bigger
      d3.select(this)
        .raise()
        .attr("opacity", 0.7)
        .attr("r", vis.r * 3);

      // show tool tip
      var groupDates = d3.select(this.parentNode).datum().dates;
      vis.tool_tip.show(groupDates, d.milestone);
    })
    .on("click", function() {
      d3.select(this).lower();
      d3.select(this.parentNode)
        .selectAll("path")
        .lower();
    })
    .on("mouseout", function() {
      vis.unHighlightTimeline(this);
    })
    .attr("r", vis.r)
    .attr("fill", d => vis.color(d.milestone))
    .attr("cx", d => vis.x(d.date));
  date.exit().remove();
};

TimelineVis.prototype.highlightTimeline = function(node) {
  var vis = this;

  // gray out background
  d3.selectAll("path").attr("opacity", 0.1);
  d3.selectAll(".date").attr("opacity", 0.3);

  // highlight this timeline
  d3.select(node.parentNode)
    .raise()
    .selectAll("path")
    .attr("opacity", 1);
  d3.select(node.parentNode)
    .selectAll(".date")
    .attr("opacity", 1)
    .attr("r", vis.r * 1.9);
};

TimelineVis.prototype.unHighlightTimeline = function(node) {
  var vis = this;

  d3.selectAll("path").attr("opacity", 1);
  d3.selectAll(".date").attr("opacity", 1);
  d3.select(node.parentNode)
    .selectAll(".date")
    .attr("r", vis.r);
  vis.tool_tip.hide();
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
