var div = d3.select("#geoengineering").append("div")
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


