//global variables
let svgWidth = 850
let svgHeight = svgWidth * 0.65

let margin = {
    left:50,
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
var land_visual;
var counter = document.getElementById("counter").value;
//set initial text box
if(counter == 0) {
    d3.select('.text')
        .html('Climate scientists agree: the earth is warming largely due to greenhouse gas emissions. Logically, the most important step is reducing emissions.  But one concern is dealing with historic emissions trapped in the atmosphere.')
}
//load data
d3.json("https://gitcdn.link/repo/ripleycleghorn/thesis/main/project-code/data/text.json").then(data => {
    text_data = data;
});

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
d3.xml("https://gitcdn.link/repo/ripleycleghorn/thesis/main/project-code/svg/land-1.svg").then(data => {
    land_visual = data.documentElement
});

// setTimeout(function () {
//     console.log()
// }, 1000);

//page counter
function buttonIncrease() {
    document.getElementById("counter").value++;
    counter = document.getElementById("counter").value
    pageCheck(counter)
    highlight(counter)
}

function buttonDecrease() {
    document.getElementById("counter").value -= 1;
    counter = document.getElementById("counter").value
    pageCheck(counter)
    highlight(counter)
}

function pageCheck(counter) {
    // console.log(counter)
    //text pages
    if((counter < 7 && counter != 3) || (counter > 16)) {
        d3.select('.text')
            .html(text_data['text-' + counter])
            .classed('hidden', false)
        if(counter > 3 && counter < 8) {
            d3.select('.diagram')
                .attr('class', 'diagram hidden')
        } else if (counter == 17) {
            d3.select('.annotation')
                .attr('class', 'annotation hidden')
            d3.select('.graph-center')
                .attr('class', 'graph-center hidden')
        } else if(counter == 18) {
            //land 1 diagram
            d3.select('.text')
                .attr('class', 'text hidden')
            d3.select('.land-visual-1')
                .node()
                .append(land_visual);      
        }
    } else if(counter == 3) {
        //beccs diagram
        d3.select('.text')
            .attr('class', 'text hidden')
        d3.select('.diagram')
            .node()
            .append(diagram);       
    }
    //historical emissions charts, charts 7 through 12
    else if(counter < 13 && counter > 6) {
        var historicArray = response.filter(d => d.Entity == 'historic')
        var startDate = new Date(1860, 0, 1);
        
        d3.select('.text')
            .attr('class', 'text hidden')
        d3.select('.annotation')
                .html(text_data['annotation-' + counter])
                .attr('id', 'annotation' + counter)
        
        if (counter == 7) {
            var filteredArray = response.filter(d => d.numericYear < 1860)
        }
        else if (counter == 8) {
            var filteredArray = response.filter(d => d.numericYear < 1885)
        }
        else if (counter == 9) {
            var filteredArray = response.filter(d => d.numericYear < 1970)
        }
        else if (counter == 10) {
            var filteredArray = response.filter(d => d.numericYear > 1970)
            startDate = new Date(1970, 0, 1);
        }
        else if (counter == 11 || counter == 12) {
            var filteredArray = response.filter(d => d.numericYear < 2020)
        }

        var emissions = d3.extent(historicArray, d => d.emissions)
        var dates = d3.extent(historicArray, d => d.year)
        var dataNest = Array.from(
            d3.group(filteredArray, d => d.Entity), ([key, value]) => ({key, value})
        );
        drawGraph(startDate, dates[1], emissions[0], emissions[1], dataNest)
    //future emissions charts, charts 13 through 16
    } else if(counter > 12 && counter < 17) {
        d3.select('.annotation')
                .html(text_data['annotation-' + counter])
                .attr('id', 'annotation' + counter)
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
    let previous_counter = counter - 1;
    //hide previous line
    d3.select('.chart' + previous_counter)
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
            .attr("class", "chart" + counter + " path" + i)
            .attr("d", valueLine(d.value))
            .attr('fill', 'none')
            // .attr('stroke', '#070C0D')
            .attr('stroke-width', 1)
            .attr('stroke', function(d) {
                if(i == 0) { return '#070C0D'}
                if(counter == 13) {
                    return (i == 4 ? '#0468BF' : '#F2F2F2')
                }
                else if(counter == 14) {
                    if (i == 3) {return '#F2B705'}
                    return (i == 4 ? '#0468BF' : '#F2F2F2')
                }
                else if(counter == 15) {
                    if (i == 1) {return '#93A603'}
                    else if (i == 2) {return '#049DBF'}
                    return (i == 3 ? '#F2B705' : '#0468BF')
                }
                else if(counter == 16) {
                    if (i == 0) {return '#cdcecf'}
                    else if (i == 1) {return '#93A603'}
                    else if (i == 2) {return '#049DBF'}
                    return (i == 3 ? '#fcf1cd' : '#e6f0f9')
                }
                else {return '#070C0D'};
            })
            // .attr('stroke-opacity', '0.2')
            // .attr('stroke-opacity', function(d) {
            //     if(counter == 15) {
            //         return ((i == 4 || i ==0) ? '0.2' : '1')
            //     } else { return '1.0'}
            // })


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
        .attr("x",0 - (height / 2))
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

function highlight(counter) {
    console.log(counter)
    //this will not work if my headers become clickable and people switch sections!!!!
    if(counter > 2 && counter < 6) {
        if(d3.select('.beccs').classed('highlight') == false) {
            d3.select('.beccs')
                .attr('class', 'nav beccs highlight')
        }
        if(d3.select('.introduction').classed('highlight') == true) {
            d3.select('.introduction').classed('highlight', false)
        }
    }
    else if(counter > 5 && counter < 17) {
        if(d3.select('.emissions').classed('highlight') == false) {
            d3.select('.emissions')
                .attr('class', 'nav emissions highlight')
        }
        if(d3.select('.beccs').classed('highlight') == true) {
            d3.select('.beccs').classed('highlight', false)
        }
    } 
    else if(counter > 16 && counter < 19) {
        if(d3.select('.land').classed('highlight') == false) {
            d3.select('.land')
                .attr('class', 'nav land highlight')
        }
        if(d3.select('.emissions').classed('highlight') == true) {
            d3.select('.emissions').classed('highlight', false)
        }
    }
}