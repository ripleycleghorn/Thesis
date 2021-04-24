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
var counter;

//load data
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

// setTimeout(function () {
//     console.log(response);
// }, 200);


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
        if(counter > 2 && counter < 7) {
            var historicArray = response.filter(d => d.Entity == 'historic')
            if (counter == 3) {
                var filteredArray = response.filter(d => d.numericYear < 1885)
                var startDate = new Date(1860, 0, 1);
            }
            else if (counter == 4) {
                var filteredArray = response.filter(d => d.numericYear < 1970)
                var startDate = new Date(1860, 0, 1);
            }
            else if (counter == 5) {
                var filteredArray = response.filter(d => d.numericYear > 1970)
                var startDate = new Date(1971, 0, 1);
            }
            else if (counter == 6) {
                var filteredArray = response.filter(d => d.numericYear < 2020)
                var startDate = new Date(1860, 0, 1);
            }
            console.log(counter)
            var emissions = d3.extent(historicArray, d => d.emissions)
            var dates = d3.extent(historicArray, d => d.year)
            var dataNest = Array.from(
                d3.group(filteredArray, d => d.Entity), ([key, value]) => ({key, value})
            );
            drawGraph(startDate, dates[1], emissions[0], emissions[1], dataNest)
        }
        if(counter > 6 && counter < 10) {
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
    var path_number = document.getElementById("counter").value;
    console.log(path_number)
    var previous_path = path_number - 1;

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