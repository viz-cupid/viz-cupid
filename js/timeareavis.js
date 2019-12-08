/*
 * TimeAreaVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- the actual data
 */

TimeAreaVis = function(_parentElement, _data, _eventHandler) {
    this.parentElement = _parentElement;
    this.data = _data
        .filter(function(d) {
            return d.time >= 0;
        })
        .sort(function(a,b) {
            return a.met - b.met;
        });
    this.eventHandler = _eventHandler;

    this.initVis();
};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

TimeAreaVis.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 30, right: 0, bottom: 120, left: 200 };

    (vis.width =
        $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right),
        (vis.height = 500 - vis.margin.top - vis.margin.bottom);

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

    /* START CODE MODIFIED FROM LAB 9*/
    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .ticks(6);


    // Set domains
    var minMaxY= [0, d3.max(vis.data.map(function(d){ return d.time; }))];
    vis.y.domain(minMaxY);

    var minMaxX = d3.extent(vis.data.map(function(d){ return d.met; }));
    vis.x.domain(minMaxX);
    console.log(vis.x.domain());

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Axis title
    vis.svg.append("text")
        .attr("x", -50)
        .attr("y", -8)
        .text("Years Before Marriage");


    // Append a path for the area function, so that it is later behind the brush overlay
    vis.timePath = vis.svg.append("path")
        .attr("class", "area area-time");

    // Define the D3 path generator
    vis.area = d3.area()
        .x(function(d) {
            return vis.x(d.met);
        })
        .y0(vis.height)
        .y1(function(d) { return vis.y(d.time); });
    vis.area.curve(d3.curveStep);
    console.log(vis.data.map(d => vis.y(d.time)));


    // Initialize brushing component
    vis.currentBrushRegion = null;
    vis.brush = d3.brushX()
        .extent([[0,0],[vis.width, vis.height]])
        .on("brush", () => {
            vis.currentBrushRegion = d3.event.selection.map(vis.x.invert);


            $(vis.eventHandler).trigger("selectionChanged", vis.currentBrushRegion)
        });

    // Append brush component here

    vis.brushGroup = vis.svg.append("g")
        .attr("class", "brush");
    /* END CODE MODIFIED FROM LAB 9*/

    // (Filter, aggregate, modify data)
    vis.wrangleData();
};


/*
 * Data wrangling
 */

TimeAreaVis.prototype.wrangleData = function() {
    var vis = this;

    vis.updateVis();
};

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

TimeAreaVis.prototype.updateVis = function() {
  var vis = this;

    /* BEGIN CODE MODIFIED FROM LAB 9 */
    // Call brush component here
    vis.brushGroup.call(vis.brush);


    // Call the area function and update the path
    // D3 uses each data point and passes it to the area function.
    // The area function translates the data into positions on the path in the SVG.
    vis.timePath
        .datum(vis.data)
        .attr("d", vis.area);


    // Call axis functions with the new domain
    vis.svg.selectAll(".x-axis").call(vis.xAxis);
    vis.svg.selectAll(".y-axis").call(vis.yAxis);
    /* END CODE MODIFIED FROM LAB 9 */
};
