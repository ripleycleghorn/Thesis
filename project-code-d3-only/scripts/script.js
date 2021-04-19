//global variables
let svgWidth = 800
let svgHeight = svgWidth * 0.75

let margin = {
    left:70,
    right:50,
    top:50,
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



// load in data
d3.csv("https://raw.githubusercontent.com/ripleycleghorn/thesis/main/project-code/all_emissions.csv").then(data =>{

    // parse (Strings to Numbers if needed)
    data.forEach(d => {
        d.emissions = +d.emissions;
        d.year = +d.Year;
      })
    //   console.log(data);
    // var emissionsData = data;


    // filter
    var filteredData = data.filter(d => d.Entity === 'historic')
    // filteredData = d3.group(data, d => d.Entity);

    // scales
    let xScale = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => d.year))
        .range([0, width])
    let yScale = d3.scaleLinear()
        .domain(d3.extent(filteredData, d => d.emissions))
        .range([height, 0])
    
    // define the line
    function valueLine(data) {
      const lineGenerator = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.emissions))
            // .curve(d3.curveMonotoneX)
            // console.log(this.casesData)
          return lineGenerator(data)
    }
    // Add the valueline path.
    svg.selectAll('path')
      .data(filteredData)
      .join('path')
      .attr("d", valueLine(filteredData))
      .attr('fill', 'none')
      .attr('stroke-width', 1)
      .attr('stroke', 'steelblue')
    
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



