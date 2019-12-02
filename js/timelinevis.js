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
        );

    // SVG clipping path
    vis.svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width + 4)
        .attr("height", vis.height + 4);

    vis.x = d3.scaleTime()
        .domain([d3.min(vis.data, d => d.dates[0].date), d3.max(vis.data, d => d.dates[d.dates.length-1].date)])
        .range([5, vis.width-5]);
    vis.y = d3.scaleLinear()
        .domain([0, vis.data.length-1])
        .range([5, vis.height-5]);

    vis.color = d3.scaleOrdinal()
        .domain(["marry", "movein", "dating", "met"])
        .range(['#980043', '#dd1c77', '#df65b0', '#c994c7', '#d4b9da', '#f1eef6']);

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};


/*
 * Data wrangling
 */

TimelineVis.prototype.wrangleData = function() {
    var vis = this;
    vis.data = vis.data.sort((a, b) => relationshipLength(b) - relationshipLength(a));
    vis.data = vis.data.filter((_, i) => i < 100);
    console.log(vis.data);
    // (Update visualization)
    vis.updateVis();
};

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

TimelineVis.prototype.updateVis = function() {
    var vis = this;
    vis.y.domain([0, vis.data.length-1]);
    console.log(vis.y.range());
    vis.x.domain([d3.min(vis.data, d => d.dates[0].date), d3.max(vis.data, d => d.dates[d.dates.length-1].date)]);

    vis.xAxis = d3.axisBottom()
        .ticks(5)
        .scale(vis.x);

    vis.svg.append("g")
        .attr("class", "axis x-axis")
        .transition()
        .attr("transform", "translate(0," + (vis.height) + ")")
        .call(vis.xAxis);

    var timeline = vis.svg.append("g")
        .attr("clip-path", "url(#clip")
        .selectAll(".timeline")
        .data(vis.data);


    var timelineGroup = timeline.enter().append("g")
        .attr("class", "timeline");
    timelineGroup
      .merge(timeline)
      .transition()
      .attr("transform", (d, i) => `translate(0, ${vis.y(i)})`);



    timelineGroup.append("path")
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 1)
        .merge(timeline)
        .attr("d", d => `M${vis.x(d.dates[0].date)} 0 L${vis.x(d.dates[d.dates.length-1].date)} 0 Z`);


    var date = timelineGroup.merge(timeline).selectAll(".date")
        .data(d => d.dates);

    date.enter().append("circle")
        .attr("class", "date")
        .attr("r", 4)
        .style("opacity", 0.7)
        .attr("stroke", "black")
        .merge(date)
        .raise()
        .transition()
        .attr("fill", d => vis.color(d.milestone))
        .attr("cx", d => vis.x(d.date));
    date.exit().remove();

};


function relationshipLength(d) {
    return (d.dates[d.dates.length-1].date - d.dates[0].date) / d.age;
}

