//global variables
let svgWidth = 850
let svgHeight = svgWidth * 0.65

let margin = {
    left:30,
    right:50,
    top:0,
    bottom:50
}

//inner width & height 
let height = svgHeight - margin.top - margin.bottom
let width = svgWidth - margin.left - margin.right

// setup svg & add group
let svg = d3.select('.graph-center')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//global variables
var parseDate = d3.timeParse("%Y");
var response;
var text_data;
var diagram;
var counter = document.getElementById("counter").value;
//set initial text box
if(counter == 0) {
    d3.select('.text')
        .html('Climate scientists agree: the earth is warming largely due to greenhouse gas emissions. Logically, the most important step is reducing emissions.  But one concern is dealing with historic emissions trapped in the atmosphere.')
}

//load data
d3.json("https://raw.githubusercontent.com/ripleycleghorn/thesis/main/project-code/text.json").then(data => {
    text_data = data;
});

d3.csv("https://raw.githubusercontent.com/ripleycleghorn/thesis/main/project-code/all_emissions.csv").then(data => {
    response = data;
    response.forEach(d => {
        //this converts emissions to numerical
        d.emissions = +d.emissions;
        //this renames my year variable to be lower case
        d.numericYear = +d.Year;
        d.year = parseDate(d.Year);
    })
})
d3.xml("https://raw.githubusercontent.com/ripleycleghorn/thesis/main/project-code/svg/diagram.svg").then(data => {
    diagram = data.documentElement
});

setTimeout(function () {
    console.log()
}, 1000);

//page counter
function buttonIncrease() {
    document.getElementById("counter").value++;
    counter = document.getElementById("counter").value
    pageCheck(counter)
}

function buttonDecrease() {
    document.getElementById("counter").value -= 1;
    counter = document.getElementById("counter").value
    pageCheck(counter)
}

function pageCheck(counter) {
    console.log(counter)
    //intro pages
    if(counter < 3) {
        d3.select('.text')
            .style('opacity', '1')
            .html(text_data['text-' + counter])
    } else if(counter == 3) {
        //hide previous text
        d3.select('.text')
            .style('opacity', '0')
        d3.select(".diagram")
            .node()
            .append(diagram);       
    } else if(counter > 3 && counter < 6) {
        d3.select('.diagram')
            .attr('display', 'none')
        d3.select('.text')
            .style('opacity', '1')
            .html(text_data['text-' + counter])
    }
    //historical emissions charts
    else if(counter < 10 && counter > 5) {
        var historicArray = response.filter(d => d.Entity == 'historic')
        var startDate = new Date(1860, 0, 1);

        if (counter == 6) {
            var filteredArray = response.filter(d => d.numericYear < 1885)
        }
        else if (counter == 7) {
            var filteredArray = response.filter(d => d.numericYear < 1970)
        }
        else if (counter == 8) {
            var filteredArray = response.filter(d => d.numericYear > 1970)
            startDate = new Date(1970, 0, 1);
        }
        else if (counter == 9) {
            var filteredArray = response.filter(d => d.numericYear < 2020)
        }

        var emissions = d3.extent(historicArray, d => d.emissions)
        var dates = d3.extent(historicArray, d => d.year)
        var dataNest = Array.from(
            d3.group(filteredArray, d => d.Entity), ([key, value]) => ({key, value})
        );
        drawGraph(startDate, dates[1], emissions[0], emissions[1], dataNest)
    //future emissions charts
    } else if(counter == 10) {
        var filteredArray = response.filter(d => d.numericYear > 2010)
        var dataNest = Array.from(
            d3.group(filteredArray, d => d.Entity), ([key, value]) => ({key, value})
        );
        var dates = d3.extent(filteredArray, d => d.year)
        var emissions = d3.extent(filteredArray, d => d.emissions)
        drawGraph(dates[0], dates[1], emissions[0], emissions[1] + 4, dataNest)
    }
}

function drawGraph (xScalestart, xScaleend, yScalesart, yScaleend, graphData) {
    let path_number = document.getElementById("counter").value;
    let previous_path = path_number - 1;

    //hide previous line
    d3.select('.chart' + previous_path)
        .attr('opacity', '0')
    // Set the ranges
    var xScale = d3.scaleTime()
        .domain([xScalestart, xScaleend])
        .range([0, width]);
    var yScale = d3.scaleLinear()
        .domain([yScalesart, yScaleend])
        .range([height, 0]);

    // Define the line
    var valueLine = d3.line()    
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.emissions); })
        .curve(d3.curveBasis);

    // Loop through each symbol / key
  
    graphData.forEach(function(d,i) { 
        svg.append("path")
            .attr("class", "chart" + path_number + " path" + i)
            .attr("d", valueLine(d.value))
            .attr('fill', 'none')
            // .attr('stroke', '#070C0D')
            .attr('stroke-width', 1)
            .attr('stroke', function(d) {
                if (path_number == 7 && i == 1) {return '#93A603'}
                else if (path_number == 7 && i == 2) {return '#049DBF'}
                else if (path_number == 7 && i == 3) {return '#F2B705'}
                else if (path_number == 7 && i == 4) {return '#0468BF'}
                else {return '#070C0D'}
            ;});
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

    //append axis
    d3.select('#x-axis')
        .transition()
        .call(xAxis)

    d3.select('#y-axis')
        .transition()
        .call(yAxis)
}

