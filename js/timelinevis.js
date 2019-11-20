/*
 * TimelineVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data				-- the actual data
 */

TimelineVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

TimelineVis.prototype.initVis = function() {
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

    // (Filter, aggregate, modify data)
    // vis.wrangleData();
};


/*
 * Data wrangling
 */

// TODO: implement wrangleData
// TimelineVis.prototype.wrangleData = function() {
//     var vis = this;
// };

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

// TODO: implement updateVis
// TimelineVis.prototype.updateVis = function() {
//   var vis = this;
//   placeholder
// };
