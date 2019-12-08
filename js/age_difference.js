/*
 * AgeVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

AgeVis = function(_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;

  this.initVis();
};

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

AgeVis.prototype.initVis = function() {
  var vis = this;

  // Margin object with properties for the four directions
  var margin = { top: 20, right: 30, bottom: 50, left: 50 };

  // Width and height as the inner dimensions of the chart area
  (vis.width = 800 - margin.left - margin.right),
    (vis.height = 650 - margin.top - margin.bottom);

  // Define 'svg' as a child-element (g) from the drawing area and include spaces
  vis.svg = d3
    .select("#" + vis.parentElement)
    .append("svg")
    .attr("width", vis.width + margin.left + margin.right)
    .attr("height", vis.height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Setup the tool tip. This tooltip code is taken from previous homework.
  var tool_tip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([-8, 0])
    .html(function(d) {
      return (
        "Respondent's age: " +
        d.participant_age +
        "<br>" +
        "Partner's age: " +
        d.partner_age +
        "<br>" +
        d.marital_status
      );
    });
  vis.svg.call(tool_tip);

  vis.x = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(vis.data, function(d) {
        return d.participant_age;
      })
    ])
    .range([0, vis.width]);

  vis.y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(vis.data, function(d) {
        return d.partner_age;
      })
    ])
    .range([vis.height, 0]);

  console.log(vis.x(34));
  console.log(vis.y(38));

  // For fill color of circles
  vis.marital_status = [
    "Married",
    "Living with partner",
    "Never married",
    "Separated",
    "Widowed",
    "Divorced"
  ];

  //colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"];
  var colors = [
    "#980043",
    "#dd1c77",
    "#df65b0",
    "#c994c7",
    "#d4b9da",
    "#f1eef6"
  ];

  var legendkey = [];
  for (var i = 0; i < colors.length; i++) {
    var object = {};
    object[vis.marital_status[i]] = colors[i];
    legendkey.push(object);
  }

  var colorPalette = d3
    .scaleOrdinal()
    .domain(vis.marital_status)
    .range(colors);

  //var colorPalette = d3.scaleOrdinal(d3.schemeCategory10);

  //colorPalette.domain(['Living with partner', 'Married', 'Never married', "Separated", "Widowed", "Divorced"]);

  // create an array of objects with key = marital status, value = color
  var legendkey = [];
  vis.marital_status.forEach(function(d) {
    var object = {};
    object[d] = colorPalette(d);
    legendkey.push(object);
  });

  vis.xAxis = d3.axisBottom().scale(vis.x);

  vis.yAxis = d3.axisLeft().scale(vis.y);

  vis.svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", "translate(0," + vis.height + ")")
    .call(vis.xAxis);

  vis.svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", "translate(0, 0)")
    .call(vis.yAxis);

  // Enter and Update (set the dynamic properties of the elements)
  var circle = vis.svg.selectAll("circle").data(vis.data);

  circle
    .enter()
    .append("circle")
    .on("mouseover", tool_tip.show)
    .on("mouseout", tool_tip.hide)

    .merge(circle)
    .transition()
    .duration(1000)
    .attr("cx", function(d) {
      if (d.participant_age < 15) {
        console.log(d.participant_age);
        console.log(d.partner_age);
      }
      return vis.x(d.participant_age);
    })
    .attr("cy", function(d) {
      if (d.partner_age < 15) {
        console.log(d.partner_age);
        console.log(d.participant_age);
      }
      return vis.y(d.partner_age);
    })
    .attr("r", 5)
    .attr("fill", function(d) {
      return colorPalette(d.marital_status);
    })
    .style("opacity", 0.7)
    .attr("stroke", "black");

  // Exit
  //circle.exit().remove();

  d3.select("#ranking-type").on("change", function() {
    var selected = d3.select("#ranking-type").property("value");
    vis.selected = selected;
    console.log(vis.selected);

    vis.displayData = vis.data.filter(function(d) {
      return d.marital_status === selected;
    });

    if (selected == "all_attributes") {
      vis.displayData = vis.data;
    }

    // Enter and Update (set the dynamic properties of the elements)
    var circle = vis.svg.selectAll("circle").data(vis.displayData);

    circle
      .enter()
      .append("circle")
      .on("mouseover", tool_tip.show)
      .on("mouseout", tool_tip.hide)
      .merge(circle)
      .transition()
      .duration(1000)
      .attr("cx", function(d) {
        return vis.x(d.participant_age);
      })
      .attr("cy", function(d) {
        return vis.y(d.partner_age);
      })
      .attr("r", 5)
      .attr("fill", function(d) {
        if (selected == "all_attributes") {
          return colorPalette(d.marital_status);
        } else {
          return colorPalette(selected);
        }
      })
      .style("opacity", 0.7)
      .attr("stroke", "black");

    // Exit
    circle.exit().remove();
  });

  // axes labels
  vis.svg
    .append("text")
    .text("Respondent's Age")
    .attr("class", "axisTitle")
    .attr("x", vis.width / 2 - 40)
    .attr("y", vis.height + 40);

  vis.svg
    .append("text")
    .text("Partner's Age")
    .attr("class", "axisTitle")
    .attr("x", -60)
    .attr("y", vis.height / 2 - 15)
    .attr("transform", "rotate(-90, -20, " + vis.height / 2 + ")");

  // Data-join (rect now contains the update selection)
  var rect = vis.svg.selectAll("rect").data(colors);

  //console.log(colorSet);

  // Enter (initialize the newly added elements)
  rect
    .enter()
    .append("rect")
    .attr("class", "bar")

    // Enter and Update (set the dynamic properties of the elements)
    .merge(rect)
    .transition()
    .duration(1000)
    .attr("x", 15)
    .attr("y", function(d, i) {
      return i * 23;
    })
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", function(d) {
      console.log(d);
      return d;
    });

  // Exit
  rect.exit().remove();

  var legendText = vis.svg
    .selectAll(".legendText")
    .data(legendkey)
    .enter()
    .append("text")
    .attr("class", "legendText")
    .attr("x", 45)
    .attr("y", function(d, i) {
      return 15 + i * 23;
    })
    .text(function(d) {
      for (var key in d) {
        console.log(key);
        return key;
      }
    });
};
