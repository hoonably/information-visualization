console.log("hello world!") // You can see this in the browser console if you run the server correctly

d3.csv('data/owid-covid-data.csv')
    .then(data => {

        var filteredData = data.filter(d => {
            return d.life_expectancy && d.gdp_per_capita && d.date && d.location && d.population && d.continent
        })

        console.log(filteredData)

        // Parse data into D3 time format & calculate rate
        filteredData = filteredData.map(d => {
            return {
                location: d.location,
                date: d3.timeParse("%Y-%m-%d")(d.date),
                life_expectancy: Number(d.life_expectancy),
                gdp_per_capita: Number(d.gdp_per_capita),
                continent: d.continent,
                population: Number(d.population),
            }
        })

        // console.log(filteredData)

        // Sort by date (descending)
        filteredData = filteredData.sort((a, b) => b.date - a.date)

        console.log(filteredData)

        // Get latest datum of each country
        processedData = []
        countryList = []
        for (d of filteredData) {
            if (!countryList.includes(d.location)) {
                processedData.push(d)
                countryList.push(d.location)
            }
        }

        // Sort by life expectancy (descending)
        processedData = processedData.sort((a, b) => b.life_expectancy - a.life_expectancy)

        console.log(processedData)

        drawBubbleChart(processedData)

    })
    .catch(error => {
        console.error(error);
    });

function drawBubbleChart(data) {

    // Canvas Size
    const margin = { top: 5, right: 450, bottom: 50, left: 120 },
        width = 1800 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom;

    // Define the position of the chart 
    const svg = d3.select("#chart")
        .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set the visible area of bubbles
    const clip = svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height)

    // Add zoom event
    const zoom = d3.zoom()
        .scaleExtent([.5, 20]) // zoom scale from x0.5 to x20
        .on("zoom", updateChart);

    // Set the interaction area for zooming
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);


    const xScale = d3.scaleLinear().domain([0, d3.max(data, function (d) { return d.gdp_per_capita }) * 1.1]).range([0, width])

    // Create a scale for y-axis here!
    // const yScale
    const yScale = d3.scaleLinear().domain([d3.min(data, function (d) { return d.life_expectancy }) * 0.9, d3.max(data, function (d) { return d.life_expectancy }) * 1.1]).range([height, 0])

    const continentList = [...new Set(data.map(item => item.continent))];
    console.log(continentList)

    const cScale = d3.scaleOrdinal().domain(continentList).range(["#cce1f2", "#a6f8c5", "#fbf7d5", "#e9cec7", "#f59dae", "#d2bef1"])

    const sScale = d3.scaleSqrt().domain(d3.extent(data, function (d) { return d.population })).range([5, 50])

    const circle = svg.append('g')
    .attr("clip-path", "url(#clip)")

    const circle_enter = circle.append('g')
        .selectAll("dot")
        .data(data)
        .enter()

    circle_enter.append("circle")
        .attr("class", function (d) { return "bubbles " + d.continent })
        .attr("cx", function (d) { return xScale(d.gdp_per_capita); })
        .attr("cy", function (d) { return yScale(d.life_expectancy); })
        .attr("r", function (d) { return sScale(d.population); })
        .style("fill", function (d) { return cScale(d.continent); })
        .attr("stroke", "black")
    // Add mouse over event
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip)


    // Draw axes 
    const xAxis = svg.append("g")
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    const yAxis = svg.append("g")
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale))

    // Indicate the x-axis label 
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .attr("font-size", 17)
        .text("GDP Per Capita");

    // Indicate the y-axis label 
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -60)
        .attr("font-size", 17)
        .text("Life Expectency")
        .attr("transform", "rotate(270)");




    // Add legend
    const size = 30
    svg.selectAll("legend")
        .data(continentList)
        .enter()
        .append("circle")
        .attr("class", function (d) { return "legend " + d })
        .attr("cx", width + 100)
        .attr("cy", function (d, i) { return 10 + i * size })
        .attr("r", 10)
        .style("fill", function (d) { return cScale(d) })
        .attr("stroke", "black")
    .on("click", toggleContinent)

    // Add legend texts
    svg.selectAll("legend_label")
        .data(continentList)
        .enter()
        .append("text")
        .attr("class", function (d) { return "legendtext " + d })
        .attr("x", width + 100 + size)
        .attr("y", function (d, i) { return i * size + (size / 2) })
        .text(function (d) { return d })
        .attr("text-anchor", "start")
    .on("click", toggleContinent)


    // Define Tooltip Temlplate
    const tooltip = d3.select("#chart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")
        .style("display", "inline")
        .style("position", "fixed")
        .style("pointer-events", "none")


    function showTooltip(event, d) {
        tooltip
            .transition()
            .duration(10)
            .style("opacity", 1)
        tooltip
            .html("Country: " + d.location
                + "<br>Population: " + d.population
                + "<br>GDP per Capita: " + d.gdp_per_capita
                + "<br>Life Expectancy: " + d.life_expectancy)
            .style("left", (d3.pointer(event)[0] + 138) + "px")
            .style("top", (d3.pointer(event)[1] + 35) + "px")
    }

    function moveTooltip(event, d) {
        tooltip
            .style("left", (d3.pointer(event)[0] + 138) + "px")
            .style("top", (d3.pointer(event)[1] + 35) + "px")
    }

    function hideTooltip(event, d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }


    function toggleContinent(event, d) {

        // Parse continent into class name
        continentSplit = d.split(' ')
        className = continentSplit.join('.');

        // Get current opacity
        currentOpacity = d3.selectAll(".bubbles." + className).style("opacity")

        // Change the opacity: from 0 to 1 or from 1 to 0
        d3.selectAll(".bubbles." + className)
            .transition()
            .duration(200)
            .style("opacity", currentOpacity == 1 ? 0 : 1)
            .style("pointer-events", currentOpacity == 1 ? "none" : "auto")

        d3.select(".legend." + className)
            .transition()
            .duration(200)
            .style("opacity", currentOpacity == 1 ? 0.3 : 1)

        d3.select(".legendtext." + className)
            .transition()
            .duration(200)
            .style("opacity", currentOpacity == 1 ? 0.3 : 1)

    }

    function updateChart(event) {
        // create new scale
        const newX = event.transform.rescaleX(xScale);
        const newY = event.transform.rescaleY(yScale);

        // update axes
        xAxis.call(d3.axisBottom(newX))
        yAxis.call(d3.axisLeft(newY))

        // update bubble position
        circle
            .selectAll("circle")
            .attr('cx', function (d) { return newX(d.gdp_per_capita) })
            .attr('cy', function (d) { return newY(d.life_expectancy) });
    }

}



