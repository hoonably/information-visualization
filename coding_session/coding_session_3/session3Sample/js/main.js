const bubble = new BubbleChart();
const bar = new barChart();

bubble.initData();
bar.initData();

function filterBarData(continent) {
    // Check target continent is in the list
    const index = bar.currentContinentList.indexOf(continent)
    // If it's in, delete it
    if (index > -1) {
        bar.currentContinentList.splice(index, 1)
    }
    // If not, append it
    else {
        bar.currentContinentList.push(continent)
    }

    const filteredData = bar.data.filter(d => {
        return bar.currentContinentList.includes(d.continent)
    })

    // Get latest datum of each country
    var processedData = []
    var countryList = []
    for (var d of filteredData) {
        if (!countryList.includes(d.location)) {
            processedData.push(d)
            countryList.push(d.location)
        }
    }
    // Sort by total rate and slice Top 15 elements
    processedData = processedData.sort((a, b) => (b.people_fully_vaccinated + b.people_partially_vaccinated) - (a.people_fully_vaccinated + a.people_partially_vaccinated)).slice(0, 15)
    console.log("p")
    console.log(processedData)

    // Delete data first
    d3.select("#barchart").select("svg").remove();
    d3.select("#barlegend").select("svg").remove();

    // draw the stacked bar chart
    bar.drawBarChart(processedData, countryList);

}

