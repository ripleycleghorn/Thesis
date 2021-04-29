/*** HTML ELEMENTS ***/
const prevButton = document.getElementById("arrow-left");
const nextButton = document.getElementById("arrow-right");
const introButton = document.getElementById("introduction");
const beccsButton = document.getElementById("beccs");
const emissionsButton = document.getElementById("emissions");
const landButton = document.getElementById("land");
const otherButton = document.getElementById("other");
const conclusionButton = document.getElementById("conclusion");
const diagramElement = document.getElementById("diagram");
const landElement = document.getElementById('land-visual');

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
fetch("./data/data.json")
  .then(pageData => pageData.json())
  .then(json => {
    handleData(json)
  })

d3.csv("./data/all_emissions.csv").then(data => {
  response = data;
  response.forEach(d => {
    //this converts emissions to numerical
    d.emissions = +d.emissions;
    //this renames my year variable to be lower case
    d.numericYear = +d.Year;
    d.year = parseDate(d.Year);
  })
})

d3.xml("./svg/diagram.svg").then(data => {
    diagram = data.documentElement
});

d3.xml("./svg/land-visual-1.svg").then(data => {
    land_visual = data.documentElement
});


function handleData(data) {
  //see how many pages we have
  const numPages = Object.keys(data).length;

  pageCheck();

  //decide which content to show
  function pageCheck() {
    //get the data from the current page
    const pageData = data["page-" + counter]
    //text data
    if (pageData.title) {
      d3.select('.title')
        .html(pageData.title)
        .attr('class', 'title active')

    } else {
      d3.select('.title')
        .attr('class', 'title hidden')
    }
    if (pageData.text) {
      d3.select('.text')
        .html(pageData.text)
        .attr('id', 'text' + counter)
        .attr('class', 'text active')

    } else {
      d3.select('.text')
        .attr('class', 'text hidden')
    }
    //image data
    if (pageData.image) {
      d3.select('.image')
        .attr('class', 'image active')
        .append("image")
        .attr("xlink:href", pageData.image)
        .style("width", "50px")
        .style("height", "auto")

    } else {
      d3.select('.image')
        .attr('class', 'image hidden')
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
      if (diagramElement.hasChildNodes()) {
        diagramElement.removeChild(diagramElement.childNodes[0])
      }
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
      //remove this svg when on other pages so that when I return to that svg it doesn't get rendered incorrectly
      if (landElement.hasChildNodes()) {
        landElement.removeChild(landElement.childNodes[0])
      }
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
      var div = 
      d3.select(".tooltip")
        .append("div")
        .attr("class", "hoverText")
        .style("opacity", 0);

        // setup svg & add group
        let hover = d3.select('.tooltip')
            .on("mouseover", function(event) {
                div.transition()
                  .duration(200)
                  .style("opacity", 1);
                div.html(pageData.hoverText)
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
    
    //give a page class to each graph
    svg.attr('class', 'graph-center page' + counter);
    //remove previous paths before drawing new ones
    svg.selectAll('path').remove();
    
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
        .attr('stroke-width', 2)
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
    console.log('current',counter)
    //will be replaced with:
    pageCheck();
    highlight();
  }

  nextButton.onclick = function () {
    if (counter >= numPages - 1) return;
    counter += 1;
    console.log('current',counter)
    //will be replaced with:
    pageCheck();
    highlight();
  }

  introButton.onclick = function() {
    counter = 0;
    pageCheck();
    highlight();
  }
  beccsButton.onclick = function() {
    counter = 4;
    pageCheck();
    highlight();
  }
  emissionsButton.onclick = function() {
    counter = 8;
    pageCheck();
    highlight();
  }
  landButton.onclick = function() {
    counter = 18;
    pageCheck();
    highlight();
  }
  otherButton.onclick = function() {
    counter = 0;
    pageCheck();
    highlight();
  }
  conclusionButton.onclick = function() {
    counter = 0;
    pageCheck();
    highlight();
  }
}