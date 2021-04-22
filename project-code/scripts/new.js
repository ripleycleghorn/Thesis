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
    var data_post_2000 = data.filter(d => d.year > 2000)
    // console.log(data_post_2000)
    // Group the entries by symbol
    var dataNest = Array.from(
	    d3.group(data, d => d.Entity), ([key, value]) => ({key, value})
	  );
    var dataNest_post_2000 = Array.from(
	    d3.group(data_post_2000, d => d.Entity), ([key, value]) => ({key, value})
	  );
    
    var historic_data = dataNest[0].value
    // var axis_data;
    var filteredData;

    var path = window.location.pathname;

    if(path == '/page4.html' || path == '/page7.html' || path == '/page8.html' || path == '/page9.html'){
        var axis_data = historic_data
        filteredData = historic_data
    }
    else if(path == '/page5.html') {
        var axis_data = historic_data
        filteredData = historic_data.filter(d => d.emissions < 2)
    }
    else if(path == '/page6.html') {
        var axis_data = historic_data
        filteredData = historic_data.filter(d => d.year < 1970)
    }
    else if(path == '/page10.html'){
        var axis_data = data.filter(d => d.year > 2000)
        filteredData = dataNest_post_2000.filter(item => (item.key == 'historic' || item.key == 'baseline low'))
        
    }
    else if(path == '/page11.html'){
        var axis_data = data
        filteredData = dataNest_post_2000.filter(entity => entity.key !== '1.5 degrees' && entity.key !== '2 degrees')
    }
    else if(path == '/page12.html'){
        var axis_data = data
        filteredData = dataNest_post_2000
        console.log(filteredData);
    }
    
    // set the colour scale
    // var color = d3.scaleOrdinal(d3.schemeCategory10);
    var color;

    // Set the ranges
    var xScale = d3.scaleTime()
        .domain(d3.extent(axis_data, d => d.year))
        .range([0, width]);
    var yScale = d3.scaleLinear()
        .domain(d3.extent(axis_data, d => d.emissions))
        .range([height, 0]);

    // Define the line
    var valueLine = d3.line()    
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.emissions); })
        .curve(d3.curveBasis);

    // Loop through each symbol / key

    
    if (path == '/page10.html' || path == '/page11.html' || path == '/page12.html') {
        filteredData.forEach(function(d,i) { 
            if(d.key == "historic"){
                color = '#070C0D';
                
            }
            else if(d.key == "baseline low"){
                color = '#0468BF'; 
                
            }
            else if(d.key == "current policies low"){
                color = '#F2B705'; 
                
            }
            else if(d.key == "2 degrees"){
                color = '#049DBF'; 
                
            }
            else if(d.key == "1.5 degrees"){
                color = '#93A603'; 
                
            }

            svg.append("path")
                .attr("class", "line")
                .style("stroke", color)
                .attr("d", valueLine(d.value))
                .attr('fill', 'none')
                .attr('stroke-width', 1);
    
        });
    }
    else if(path !== '/page4.html'){
        svg.selectAll('path')
            .data(filteredData)
            .join('path')
            .attr("d", valueLine(filteredData))
            .attr('fill', 'none')
            .attr('stroke-width', 1)
            .attr('stroke', '#070C0D')
    }

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



