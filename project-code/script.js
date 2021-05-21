/*** HTML ELEMENTS ***/
const prevButton = document.getElementById("arrow-left");
const nextButton = document.getElementById("arrow-right");
const introButton = document.getElementById("introduction");
const beccsButton = document.getElementById("beccs");
const emissionsButton = document.getElementById("emissions");
const landButton = document.getElementById("land-use");
const otherButton = document.getElementById("other");
const conclusionButton = document.getElementById("conclusion");
const diagramElement = document.getElementById("diagram");
const landElement = document.getElementById('land-visual');
const squareElement = document.getElementById('square');
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');

let counter = 0;

/** SET UP SVG **/
let intViewportWidth = window.innerWidth;
let intViewportHeight = window.innerHeight;
let squareDimension = Math.sqrt(intViewportWidth * intViewportHeight * .16);
console.log(squareDimension);
// console.log(intViewportWidth)
//global variables
let svgWidth = .6 * intViewportWidth
let svgHeight = .4 * intViewportWidth

let margin = {
  left: 50,
  right: 20,
  top: 20,
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
var beccs;
var beccs_static;
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
  beccs = data.documentElement
});

d3.xml("./svg/missing.svg").then(data => {
  missing = data.documentElement
});

d3.xml("./svg/beccs-static.svg").then(data => {
  beccs_static = data.documentElement
});


d3.xml("./svg/carbon.svg").then(data => {
  carbon = data.documentElement
});

d3.xml("./svg/land-visual-1.svg").then(data => {
  land_visual_1 = data.documentElement
});

d3.xml("./svg/land-visual-2.svg").then(data => {
  land_visual_2 = data.documentElement
});


function handleData(data) {
  //see how many pages we have
  const numPages = Object.keys(data).length;

  pageCheck();

  //decide which content to show
  function pageCheck() {
    //get the data from the current page
    const pageData = data["page-" + counter]

    //title
    //text shadow css
    if (pageData.title) {
      d3.select('.title')
        .html(pageData.title)
        .attr('class', 'title active')
    } else {
      d3.select('.title')
        .attr('class', 'title hidden')
    }
    //text data
    if (pageData.text || pageData.summary) {
      d3.select('.summary')
        .attr('class', 'summary active')
        .attr('id', 'text' + counter)
        .html(pageData.summary)
        .append('div')
        .attr('class', 'text')
        .html(pageData.text)
      if (counter == 27) {
        //loop through references
        d3.select('.summary')
          .attr('class', 'summary active')
          .attr('id', 'text' + counter)
          .html(pageData.summary)
        pageData.text.forEach((item) => {
          d3.select('.summary')
            .append('div')
            .attr('class', 'text')
            .html(item)
        })
      }
    } else {
      d3.select('.summary')
        .attr('class', 'summary hidden')
    }
    //image data
    if (pageData.image) {
      d3.select('.image')
        .attr('class', 'image active')
        .attr('id', 'image' + counter)
      d3.select('img')
        .attr('src', pageData.image)
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
    //button data
    if (pageData.button) {
      if (pageData.leftButtontext) {
        d3.select('#left-button')
          .html(pageData.leftButtontext)
          .attr('class', 'button active')
      }
      if (pageData.rightButtontext) {
        d3.select('#right-button')
          .html(pageData.rightButtontext)
          .attr('class', 'button active')
      }
    } else {
      d3.select('#left-button')
        .attr('class', 'button hidden')
      d3.select('#right-button')
        .attr('class', 'button hidden')
    }
    //beccs diagrams
    if (pageData.diagramVisible) {
      if (diagramElement.hasChildNodes()) {
        diagramElement.removeChild(diagramElement.childNodes[0])
      }
      if (pageData.diagramVisible == 1) {
        d3.select('.diagram')
          .attr('class', 'diagram active')
          .node()
          .append(beccs)
      } else if (pageData.diagramVisible == 2) {
        d3.select('.diagram')
          .attr('class', 'diagram active')
          .node()
          .append(beccs_static);
      } else if (pageData.diagramVisible == 3) {
        d3.select('.diagram')
          .attr('class', 'diagram active')
          .node()
          .append(carbon);
      } else if (pageData.diagramVisible == 4) {
        d3.select('.diagram')
          .attr('class', 'diagram active')
          .node()
          .append(missing);
      }
    } else {
      if (diagramElement.hasChildNodes()) {
        diagramElement.removeChild(diagramElement.childNodes[0])
      }
      d3.select('.diagram')
        .attr('class', 'diagram hidden')
    }
    //SQUARE
    if (pageData.square) {
      if (squareElement.hasChildNodes()) {
        squareElement.removeChild(squareElement.childNodes[0])
      }

      d3.select('.square-container')
        .attr('class', 'square-container active')
        .append('svg')
        .attr('class', 'square-canvas active')
        .append('rect')
        .attr('fill', '#F2F2F2')
        .attr('width', squareDimension)
        .attr('height', squareDimension)

      d3.select('.square-canvas')
        .append('text')
        .attr('class', 'square-text')
        .text('16%')
        .attr('fill', 'black')
        .attr('font-size', '30px')
        .attr('y', 40)
        .attr('x', 20)

    } else {
      d3.select('.square-container')
        .attr('class', 'square-container hidden')
    }
    //land visual
    if (pageData.landVisible) {
      if (pageData.landVisible == 1) {
        //delete previous land visual
        if (landElement.hasChildNodes()) {
          landElement.removeChild(landElement.childNodes[0])
        }
        d3.select('.land-visual')
          .attr('class', 'land-visual active')
          .node()
          .append(land_visual_1);
      } else if (pageData.landVisible == 2) {
        //delete previous land visual
        if (landElement.hasChildNodes()) {
          landElement.removeChild(landElement.childNodes[0])
        }
        d3.select('.land-visual')
          .attr('class', 'land-visual active')
          .node()
          .append(land_visual_2);
      }
    }
    else {
      //remove this svg when on other pages so that when I return to that svg it renders correctly
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
          .attr("id", "hoverText-" + counter)
          .style("opacity", 0);

      // setup svg & add group
      let hover = d3.select('.tooltip')
        .on("mouseover", function (event) {
          div.transition()
            .duration(200)
            .style("opacity", 1);
          div.html(pageData.hoverText)
            .style("right", function (d) {
              if (counter == 8) { return (width) + "px" } 
              else { return (width * 1.2) + "px" }
            })
            .style("bottom", (height / 1.2) + "px")
            .style("position", "absolute")
            .style("padding", "10px");
        })
        .on("mouseout", function (d) {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
    } else {
      svg.selectAll('.hoverText').remove();
    }
    if (pageData['percent-1']) {
      var percent_counter = 0
      while (percent_counter < 10) {
        d3.select('#container')
          .append('div')
          .attr('class', 'human active')
          .attr('id', 'human-percent-' + percent_counter)
        percent_counter++
      }
      d3.select('.human-text')
        .attr('class', 'human-text active')
    } else {
      d3.selectAll('.human')
        .attr('class', 'human hidden')
      d3.select('.human-text')
        .attr('class', 'human-text hidden')
    }
    if (pageData['percent-2']) {
      var percent_counter = 0
      while (percent_counter < 10) {
        d3.select('#container')
          .append('div')
          .attr('class', 'land active')
          .attr('id', 'land-percent-' + percent_counter)
        percent_counter++
      }
      d3.select('.land-text')
        .attr('class', 'land-text active')
    } else {
      d3.selectAll('.land')
        .attr('class', 'land hidden')
      d3.select('.land-text')
        .attr('class', 'land-text hidden')
    }
  }

  function drawGraph(x, y, graphData) {
    const pageData = data["page-" + counter]
    //give a page class to each graph
    svg.attr('class', 'graph-center page' + counter);
    //remove previous paths before drawing new ones
    svg.selectAll('path').remove();
    svg.selectAll('.data-label').remove();

    // Set the ranges
    var xScale = d3.scaleTime()
      .domain(x)
      .range([0, width]);
    var yScale = d3.scaleLinear()
      .domain([d3.min(y, d => d.emissions), (d3.max(y, d => d.emissions) + 2)])
      .range([height, 0]);

    //define the line
    var valueLine = d3.line()
      .x(function (d) { return xScale(d.year); })
      .y(function (d) { return yScale(d.emissions); })
      .curve(d3.curveBasis);

    //loop through each entity
    graphData.forEach(function (d, i) {
      var path = svg.append("path")
        .attr("class", "chart" + counter + " path" + i)
        .attr("d", valueLine(d.value))
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', '#070C0D')

      const length = path.node().getTotalLength();
      var pathNum = counter + '-' + i;
      var staticPatharray = ['11-0', '13-0', '13-4', '14-0', '14-4', '14-3', '15-0', '15-1', '15-2', '15-3', '15-4']
      var staticDatalabelarray = ['11-0', '12-0', '13-0', '13-4', '14-0', '14-4', '14-3', '15-0', '15-1', '15-2', '15-3', '15-4']

      function animate() {
        // Animate the path by setting the initial offset and dasharray and then transition the offset to 0
        path.attr("stroke-dasharray", length + " " + length)
          .attr("stroke-dashoffset", length)
          .transition()
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0)
          .duration(1000)
      };

      function dataLabel() {
        svg.append("text")
          .datum(graphData[i].value[graphData[i].value.length - 1])
          .attr('class', 'data-label')
          .attr('id', 'page' + counter + '-label' + i)
          .attr('x', -10)
          .attr("transform", function (d) { return "translate(" + xScale(d.year) + "," + (yScale(d.emissions) - 15) + ")"; })
          .attr("text-anchor", "middle")
          .text(graphData[i].value[graphData[i].value.length - 1].Entity);
      }
      //only animate new lines
      if (!staticPatharray.includes(pathNum)) {
        animate();
      }
      //only show data labels for future scenarios, add delay the first time the label is shown
      if (pageData.graphVisible && counter > 10) {
        if (!staticDatalabelarray.includes(pathNum)) {
          setTimeout(() => { dataLabel() }, 1500);
        } else {
          dataLabel();
        };
      } else {
        d3.select('.data-label')
          .attr('class', 'data-label hidden')
      }
    });

    // axis
    let xAxis = d3.axisBottom(xScale)
    // .ticks(10)

    let yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.format("d"))

    //add svg group to append axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .attr("id", "x-axis")

    svg.append("g")
      .attr("id", "y-axis")

    // text label for the y axis
    if (document.getElementById("label") == null) {
      svg.append("text")
        .attr('id', 'label')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Gigatons of CO2");
    }

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
      d3.select('.land-use').classed('highlight', false)
      d3.select('.other').classed('highlight', false)
    }
    else if (pageData.pageHeader == "Beccs") {
      d3.select('.beccs')
        .attr('class', 'nav beccs highlight')
      //remove other headers
      d3.select('.introduction').classed('highlight', false)
      d3.select('.emissions').classed('highlight', false)
      d3.select('.land-use').classed('highlight', false)
      d3.select('.other').classed('highlight', false)
    }
    else if (pageData.pageHeader == "Emissions") {
      d3.select('.emissions')
        .attr('class', 'nav emissions highlight')
      //remove other headers
      d3.select('.introduction').classed('highlight', false)
      d3.select('.beccs').classed('highlight', false)
      d3.select('.land-use').classed('highlight', false)
      d3.select('.other').classed('highlight', false)
      d3.select('.conclusion').classed('highlight', false)
    }
    else if (pageData.pageHeader == "Land") {
      d3.select('.land-use')
        .attr('class', 'nav land-use highlight')
      //remove other headers
      d3.select('.introduction').classed('highlight', false)
      d3.select('.beccs').classed('highlight', false)
      d3.select('.emissions').classed('highlight', false)
      d3.select('.other').classed('highlight', false)
      d3.select('.conclusion').classed('highlight', false)
    }
    else if (pageData.pageHeader == "Other") {
      d3.select('.other')
        .attr('class', 'nav other highlight')
      //remove other headers
      d3.select('.introduction').classed('highlight', false)
      d3.select('.beccs').classed('highlight', false)
      d3.select('.emissions').classed('highlight', false)
      d3.select('.land-use').classed('highlight', false)
      d3.select('.conclusion').classed('highlight', false)
    }
    else if (pageData.pageHeader == "Conclusion") {
      d3.select('.conclusion')
        .attr('class', 'nav conclusion highlight')
      //remove other headers
      d3.select('.introduction').classed('highlight', false)
      d3.select('.beccs').classed('highlight', false)
      d3.select('.emissions').classed('highlight', false)
      d3.select('.land-use').classed('highlight', false)
      d3.select('.other').classed('highlight', false)
    }
  }

  prevButton.onclick = function () {
    if (counter <= 0) return;
    counter -= 1;
    console.log('current', counter)
    //will be replaced with:
    pageCheck();
    highlight();
  }

  nextButton.onclick = function () {
    if (counter >= numPages - 1) return;
    counter += 1;
    console.log('current', counter)
    //will be replaced with:
    pageCheck();
    highlight();
  }

  introButton.onclick = function () {
    counter = 0;
    pageCheck();
    highlight();
  }
  beccsButton.onclick = function () {
    counter = 4;
    pageCheck();
    highlight();
  }
  emissionsButton.onclick = function () {
    counter = 7;
    pageCheck();
    highlight();
  }
  landButton.onclick = function () {
    counter = 16;
    pageCheck();
    highlight();
  }
  otherButton.onclick = function () {
    counter = 19;
    pageCheck();
    highlight();
  }
  conclusionButton.onclick = function () {
    counter = 23;
    pageCheck();
    highlight();
  }
  leftButton.onclick = function () {
    counter = 20;
    pageCheck();
    highlight();
  }
  rightButton.onclick = function () {
    counter = 23;
    pageCheck();
    highlight();
  }
}