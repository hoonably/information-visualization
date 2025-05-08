const svg = d3.select("#chart")
    .append("svg")
    .attr('width', 1000)
    .attr('height', 2160)

// Sample 1 - Mouse Event
var i = 0

svg.append("text")
    .attr("id", "sp1txt")
    .attr("text-anchor", "start")
    .attr("x", 200)
    .attr("y", 75)
    .style("fill", "black")
    .attr("font-size", 42)
    .text("Counter: " + i)

svg.append("rect")
    .attr("width", 100)
    .attr("height", 100)
    .attr("x", 10)
    .attr("y", 10)
    .style("fill", "red")
    .style("stroke", "black")
    .style("stroke-width", "3px")
    .style("pointer-events", "all")
    .on("click", function () {
        i = i + 1
        svg.select("#sp1txt")
            .text("Counter: " + i)
    })

svg.append("text")
    .attr("text-anchor", "start")
    .attr("x", 15)
    .attr("y", 60)
    .style("fill", "white")
    .attr("font-size", 18)
    .text("Click Here!")
    .style("pointer-events", "none")



// Sample 2 - Keyboard event
svg.append("text")
    .attr("id", "sp2txt")
    .attr("text-anchor", "start")
    .attr("x", 10)
    .attr("y", 200)
    .style("fill", "black")
    .attr("font-size", 32)
    .text("This text detects your keystroke!")


d3.select(document).on("keydown", function (event) {
    svg.select("#sp2txt")
        .text("You pressed " + event.key + "!")
})



// Sample 3 - Range input event 
svg.append('foreignObject')
    .attr('x', 10) // Adjust x position
    .attr('y', 400)  // Adjust y position
    .attr('width', 150)
    .attr('height', 40)
    .html('<input type="range" min="10" max="100" value="100">')
    .on("input", function (event) {
        svg.select("#sp3cir")
            .attr("r", event.target.value)
    })

svg.append("circle")
    .attr("id", "sp3cir")
    .attr("cx", 400)
    .attr("cy", 400)
    .attr("r", 100)
    .style("fill", "blue")
    .attr("stroke", "black")



// Sample 4 - Simple transition
svg.append('foreignObject')
    .attr('x', 10)
    .attr('y', 600)
    .attr('width', 80)
    .attr('height', 80)
    .html('<button>Click here!</button>')
    .on("click", function () {
        svg.select("#sp4rect")
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .style("x", "400")
            .style("fill", "red")
    })

svg.append("rect")
    .attr("id", "sp4rect")
    .attr("width", 100)
    .attr("height", 100)
    .attr("x", 10)
    .attr("y", 650)
    .style("fill", "green")
    .style("stroke", "black")



// Sample 5 - Different duration
svg.append('foreignObject')
    .attr('x', 10)
    .attr('y', 800)
    .attr('width', 80)
    .attr('height', 80)
    .html('<button>Click here!</button>')
    .on("click", function () {
        svg.select("#sp5rect1")
            .transition()
            .duration(500)
            .ease(d3.easeLinear)
            .style("x", "400")
            .on("end", function () {
                svg.select("#sp5rect1")
                    .style("fill", "red")
            })

        svg.select("#sp5rect2")
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .style("x", "400")
            .on("end", function () {
                svg.select("#sp5rect2")
                    .style("fill", "red")
            })

        svg.select("#sp5rect3")
            .transition()
            .duration(1500)
            .ease(d3.easeLinear)
            .style("x", "400")
            .on("end", function () {
                svg.select("#sp5rect3")
                    .style("fill", "red")
            })
    })

svg.append("rect")
    .attr("id", "sp5rect1")
    .attr("width", 50)
    .attr("height", 50)
    .attr("x", 10)
    .attr("y", 850)
    .style("fill", "white")
    .style("stroke", "black")

svg.append("rect")
    .attr("id", "sp5rect2")
    .attr("width", 50)
    .attr("height", 50)
    .attr("x", 10)
    .attr("y", 950)
    .style("fill", "white")
    .style("stroke", "black")

svg.append("rect")
    .attr("id", "sp5rect3")
    .attr("width", 50)
    .attr("height", 50)
    .attr("x", 10)
    .attr("y", 1050)
    .style("fill", "white")
    .style("stroke", "black")



// Sample 6 - Different delay
svg.append('foreignObject')
    .attr('x', 10)
    .attr('y', 1200)
    .attr('width', 80)
    .attr('height', 80)
    .html('<button>Click here!</button>')
    .on("click", function () {
        svg.select("#sp6rect1")
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .style("x", "400")
            .on("end", function () {
                svg.select("#sp6rect1")
                    .style("fill", "green")
            })

        svg.select("#sp6rect2")
            .transition()
            .duration(1000)
            .delay(1500)
            .ease(d3.easeLinear)
            .style("x", "400")
            .on("end", function () {
                svg.select("#sp6rect2")
                    .style("fill", "green")
            })

        svg.select("#sp6rect3")
            .transition()
            .duration(1000)
            .delay(3000)
            .ease(d3.easeLinear)
            .style("x", "400")
            .on("end", function () {
                svg.select("#sp6rect3")
                    .style("fill", "green")
            })
    })

svg.append("rect")
    .attr("id", "sp6rect1")
    .attr("width", 50)
    .attr("height", 50)
    .attr("x", 10)
    .attr("y", 1250)
    .style("fill", "white")
    .style("stroke", "black")

svg.append("rect")
    .attr("id", "sp6rect2")
    .attr("width", 50)
    .attr("height", 50)
    .attr("x", 10)
    .attr("y", 1350)
    .style("fill", "white")
    .style("stroke", "black")

svg.append("rect")
    .attr("id", "sp6rect3")
    .attr("width", 50)
    .attr("height", 50)
    .attr("x", 10)
    .attr("y", 1450)
    .style("fill", "white")
    .style("stroke", "black")



// Sample 7 - Different ease
svg.append('foreignObject')
    .attr('x', 10)
    .attr('y', 1600)
    .attr('width', 80)
    .attr('height', 80)
    .html('<button>Click here!</button>')
    .on("click", function () {
        svg.select("#sp7rect1")
            .transition()
            .duration(1000)
            .ease(d3.easeCubicIn)
            .style("x", "400")
            .on("end", function () {
                svg.select("#sp7rect1")
                    .style("fill", "blue")
            })

        svg.select("#sp7rect2")
            .transition()
            .duration(1000)
            .ease(d3.easeCubicInOut)
            .style("x", "400")
            .on("end", function () {
                svg.select("#sp7rect2")
                    .style("fill", "blue")
            })

        svg.select("#sp7rect3")
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .style("x", "400")
            .on("end", function () {
                svg.select("#sp7rect3")
                    .style("fill", "blue")
            })

        svg.select("#sp7rect4")
            .transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .style("x", "400")
            .on("end", function () {
                svg.select("#sp7rect4")
                    .style("fill", "blue")
            })
    })

svg.append("rect")
    .attr("id", "sp7rect1")
    .attr("width", 50)
    .attr("height", 50)
    .attr("x", 10)
    .attr("y", 1650)
    .style("fill", "white")
    .style("stroke", "black")

svg.append("rect")
    .attr("id", "sp7rect2")
    .attr("width", 50)
    .attr("height", 50)
    .attr("x", 10)
    .attr("y", 1750)
    .style("fill", "white")
    .style("stroke", "black")

svg.append("rect")
    .attr("id", "sp7rect3")
    .attr("width", 50)
    .attr("height", 50)
    .attr("x", 10)
    .attr("y", 1850)
    .style("fill", "white")
    .style("stroke", "black")

svg.append("rect")
    .attr("id", "sp7rect4")
    .attr("width", 50)
    .attr("height", 50)
    .attr("x", 10)
    .attr("y", 1950)
    .style("fill", "white")
    .style("stroke", "black")