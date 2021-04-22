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

var parseDate = d3.timeParse("%Y");

// load in data
d3.csv("https://raw.githubusercontent.com/ripleycleghorn/thesis/main/project-code/all_emissions.csv").then(data =>{

    // parse (Strings to Numbers if needed)
    data.forEach(d => {
        //this converts emissions to numerical
        d.emissions = +d.emissions;
        //this renames my year variable to be lower case
        d.year = parseDate(d.Year);
      })

    var dataNest = Array.from(
	    d3.group(data, d => d.Entity), ([key, value]) => ({key, value})
	  );
    console.log(dataNest)
    
    var combinedData = dataNest[0].value.concat(dataNest[1].value, dataNest[2].value, dataNest[3].value, dataNest[4].value)
    

    // Set the ranges
    var xScale = d3.scaleTime()
        .domain(d3.extent(combinedData, d => d.year))
        .range([0, width]);
    var yScale = d3.scaleLinear()
        .domain(d3.extent(combinedData, d => d.emissions))
        .range([height, 0]);

    // Define the line
    var valueLine = d3.line()    
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.emissions); })
        .curve(d3.curveBasis);

    // Loop through each symbol / key

    
    dataNest.forEach(function(d,i) { 
        svg.append("path")
            .attr("class", "line" + i)
            .attr("d", valueLine(d.value))
            .attr('fill', 'none')
            .attr('stroke-width', 1);

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
        .call(yAxis)



})



