// barChart.js

let barSvg, xScaleBar, yScaleBar;

function createBarChart(data) {
  const margin = { top: 20, right: 30, bottom: 70, left: 60 },
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

  const svg = d3.select("#bar-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  barSvg = svg;

  // 그룹별로 합산 (제품별 총 판매량)
  const productSums = d3.rollups(
    data,
    v => d3.sum(v, d => d.Amount),
    d => d.Product
  ).map(([key, value]) => ({ Product: key, Total: value }));

  // x, y 스케일
  xScaleBar = d3.scaleBand()
    .domain(productSums.map(d => d.Product))
    .range([0, width])
    .padding(0.2);

  yScaleBar = d3.scaleLinear()
    .domain([0, d3.max(productSums, d => d.Total)])
    .range([height, 0]);

  // 축
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScaleBar))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

  svg.append("g")
    .call(d3.axisLeft(yScaleBar));

  // 막대
  svg.selectAll("rect")
    .data(productSums)
    .enter()
    .append("rect")
    .attr("x", d => xScaleBar(d.Product))
    .attr("y", d => yScaleBar(d.Total))
    .attr("width", xScaleBar.bandwidth())
    .attr("height", d => height - yScaleBar(d.Total))
    .attr("fill", "#2b8cbe")
    .on("click", (event, d) => {
      appState.updateSelectedProduct(d.Product);
    });
}

function updateBarChart(state) {
  barSvg.selectAll("rect")
    .attr("fill", d =>
      state.selectedProduct === null || state.selectedProduct === d.Product
        ? "#2b8cbe"
        : "#ccc"
    );
}
