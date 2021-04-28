/*** HTML ELEMENTS ***/
const prevButton = document.getElementById("arrow-left");
const nextButton = document.getElementById("arrow-right");
const introButton = document.getElementById("introduction");
const beccsButton = document.getElementById("beccs");
const emissionsButton = document.getElementById("emissions");
const landButton = document.getElementById("land");
const otherButton = document.getElementById("other");
const conclusionButton = document.getElementById("conclusion");

// const jumpPageButton = document.getElementById("jump-page-button");
let counter = 0;

/** SET UP SVG **/
//global variables
let svgWidth = 850
let svgHeight = svgWidth * 0.65

let margin = {
  left: 50,
  right: 50,
  top: 0,
  bottom: 50
}

let height = svgHeight - margin.top - margin.bottom
let width = svgWidth - margin.left - margin.right

let svg = d3.select('.graph-center')
  .append('svg')
  .attr('height', svgHeight)
  .attr('width', svgWidth)
  .append('g')
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseDate = d3.timeParse("%Y");
var response;
var diagram;
var land_visual;

/** LOAD DATA **/
fetch("https://raw.githubusercontent.com/ripleycleghorn/thesis/main/project-code/data/data.json")
  .then(pageData => pageData.json())
  .then(json => {
    handleData(json)
  })

d3.csv("https://gitcdn.link/repo/ripleycleghorn/thesis/main/project-code/data/all_emissions.csv").then(data => {
  response = data;
  response.forEach(d => {
    //this converts emissions to numerical
    d.emissions = +d.emissions;
    //this renames my year variable to be lower case
    d.numericYear = +d.Year;
    d.year = parseDate(d.Year);
  })
})
d3.xml("https://gitcdn.link/repo/ripleycleghorn/thesis/main/project-code/svg/diagram.svg").then(data => {
    diagram = data.documentElement
});
d3.xml("https://gitcdn.link/repo/ripleycleghorn/thesis/main/project-code/svg/land-visual-1.svg").then(data => {
    land_visual = data.documentElement
});


function handleData(data) {
  //see how many pages we have
  const numPages = Object.keys(data).length;

  pageCheck(counter);

  //decide which content to show
  function pageCheck(counter) {
    //get the data from the current page
    const pageData = data["page-" + counter]
    //text data
    if (pageData.text) {
      d3.select('.text')
        .html(pageData.text)
        .attr('id', 'text' + counter)
        .attr('class', 'text active')

    } else {
      d3.select('.text')
        .attr('class', 'text hidden')
    }
    //annotation data
    if (pageData.annotation) {
      d3.select('.annotation')
        .html(pageData.annotation)
        .attr('id', 'annotation' + counter)
        .attr('class', 'annotation active')
    } else {
      d3.select('.annotation')
        .attr('class', 'annotation hidden')
    }
    //diagram
    if (pageData.diagramVisible) {
      d3.select('.diagram')
        .attr('class', 'diagram active')
        .node()
        .append(diagram); 
    } else {
      d3.select('.diagram')
        .attr('class', 'diagram hidden')
    }
    //land visual
    if (pageData.landVisible) {
      d3.select('.land-visual')
        .attr('class', 'land-visual active')
        .node()
        .append(land_visual); 
    } else {
      d3.select('.land-visual')
        .attr('class', 'land-visual hidden')
    }
    //chart data
    if (pageData.graphVisible) {
      d3.select('.graph-center')
        .attr('class', 'graph-center active')
      //first, filter data by historic if necessary and set up variables for graph
      var yScaledata = (pageData.historicOnly) ? (response.filter(d => d.Entity == 'historic')) : response;
      var xScaledata = [new Date(pageData.filterAxisstart, 0, 1), new Date(pageData.filterAxisend, 0, 1)]
      var lineData = response.filter(d => d.numericYear < parseInt(pageData.filterLineend) && d.numericYear > parseInt(pageData.filterLinestart));
      var dataNest = Array.from(
        d3.group(lineData, d => d.Entity), ([key, value]) => ({ key, value })
      );
      drawGraph(xScaledata, yScaledata, dataNest)
    } else {
      d3.select('.graph-center')
        .attr('class', 'graph-center hidden')
    }
    if (pageData.hover) {
      var div = d3.select("#geoengineering")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        // setup svg & add group
        let hover = d3.select('#geoengineering')
            .on("mouseover", function(event) {
                div.transition()
                  .duration(200)
                  .style("opacity", .9);
                div.html("Geoengineering: To make a large-scale effort to modify the earth or its environment, especially to counteract global warming")
                  .style("left", (900) + "px")
                  .style("top", (150) + "px")
                  .style("position", "absolute");
                })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
                });
    }
  }

  function drawGraph(x, y, graphData) {
    const pageData = data["page-" + counter]
    let previous_counter = counter - 1;
    
    svg.attr('class', 'graph-center page' + counter);

    //hide previous line
    d3.select('.chart' + previous_counter)
        .attr('opacity', '0')

    // Set the ranges
    var xScale = d3.scaleTime()
      .domain(x)
      .range([0, width]);
    var yScale = d3.scaleLinear()
      .domain(d3.extent(y, d => d.emissions))
      .range([height, 0]);

    //define the line
    var valueLine = d3.line()
      .x(function (d) { return xScale(d.year); })
      .y(function (d) { return yScale(d.emissions); })
      .curve(d3.curveBasis);

    //loop through each entity
    graphData.forEach(function (d, i) {
      svg.append("path")
        .attr("class", "chart" + counter + " path" + i)
        .attr("d", valueLine(d.value))
        .attr('fill', 'none')
        .attr('stroke-width', 1)
        .attr('stroke', '#070C0D')
    });

    // axis
    let xAxis = d3.axisBottom(xScale)
      .ticks(10)

    let yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.format("d"))

    //add svg group to append axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .attr("id", "x-axis")

    svg.append("g")
      .attr("id", "y-axis")

    // text label for the y axis
    svg.append("text")
      .attr('class', 'label')
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Gigatons");

    //append axis
    d3.select('#x-axis')
      .transition()
      .call(xAxis)

    d3.select('#y-axis')
      .transition()
      .call(yAxis)
  }

  //show tooltip
  function tooltip() {
    
  }

  //underline current section header
  function highlight() {
    const pageData = data["page-" + counter]
    if (pageData.pageHeader == "Intro") {
      d3.select('.introduction')
        .attr('class', 'nav introduction highlight')
      //remove other headers
      d3.select('.beccs').classed('highlight', false)
      d3.select('.emissions').classed('highlight', false)
      d3.select('.land').classed('highlight', false)
    } 
    else if (pageData.pageHeader == "Beccs") {
      d3.select('.beccs')
        .attr('class', 'nav beccs highlight')
      //remove other headers
      d3.select('.introduction').classed('highlight', false)
      d3.select('.emissions').classed('highlight', false)
      d3.select('.land').classed('highlight', false)
    }
    else if (pageData.pageHeader == "Emissions") {
      d3.select('.emissions')
        .attr('class', 'nav emissions highlight')
      //remove other headers
      d3.select('.introduction').classed('highlight', false)
      d3.select('.beccs').classed('highlight', false)
      d3.select('.land').classed('highlight', false)
    }
    else if (pageData.pageHeader == "Land") {
      console.log('land!')
      d3.select('.land')
        .attr('class', 'nav land highlight')
      //remove other headers
      d3.select('.introduction').classed('highlight', false)
      d3.select('.beccs').classed('highlight', false)
      d3.select('.emissions').classed('highlight', false)
    }
  }

  prevButton.onclick = function () {
    if (counter <= 0) return;
    counter -= 1;
    console.log(counter)
    //will be replaced with:
    pageCheck(counter);
    highlight();
  }

  nextButton.onclick = function () {
    if (counter >= numPages - 1) return;
    counter += 1;
    console.log(counter)
    //will be replaced with:
    pageCheck(counter);
    highlight();
  }

  introButton.onclick = function() {
    counter = 0;
    pageCheck(counter)
  }
  beccsButton.onclick = function() {
    counter = 3;
    pageCheck(counter)
  }
  emissionsButton.onclick = function() {
    counter = 7;
    pageCheck(counter)
  }
  landButton.onclick = function() {
    counter = 17;
    pageCheck(counter)
  }
  otherButton.onclick = function() {
    counter = 0;
    pageCheck(counter)
  }
  conclusionButton.onclick = function() {
    counter = 0;
    pageCheck(counter)
  }
}