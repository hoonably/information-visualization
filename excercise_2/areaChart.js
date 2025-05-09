let areaChartSVG;
const marginArea = { top: 20, right: 20, bottom: 50, left: 60 };
const widthArea = 600 - marginArea.left - marginArea.right;
const heightArea = 300 - marginArea.top - marginArea.bottom;

export function createAreaChart(data) {
  const svg = d3.select("#area-chart")
    .append("svg")
    .attr("width", widthArea + marginArea.left + marginArea.right)
    .attr("height", heightArea + marginArea.top + marginArea.bottom)
    .append("g")
    .attr("transform", `translate(${marginArea.left},${marginArea.top})`);

  areaChartSVG = svg;

  // 1. x, y scale
  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.Date))
    .range([0, widthArea]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Amount)])
    .range([heightArea, 0]);

  // 2. area generator
  const area = d3.area()
    .x(d => xScale(d.Date))
    .y0(heightArea)
    .y1(d => yScale(d.Amount));

  // 3. draw path
  svg.append("path")
    .datum(data)
    .attr("class", "area")
    .attr("fill", "#a6bddb")
    .attr("d", area);

  // 4. axis
  svg.append("g")
    .attr("transform", `translate(0,${heightArea})`)
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .call(d3.axisLeft(yScale));

  // 5. brush
  const brush = d3.brushX()
    .extent([[0, 0], [widthArea, heightArea]])
    .on("end", (event) => {
      if (!event.selection) return;
      const [x0, x1] = event.selection.map(xScale.invert);
      appState.updateTimeRange([x0, x1]);
    });

  svg.append("g")
    .attr("class", "brush")
    .call(brush);
}

export function updateAreaChart(state) {
  // highlight brushed area (optional)
  const brushG = areaChartSVG.select(".brush");
  if (state.timeRange) {
    const xScale = d3.scaleTime()
      .domain(d3.extent(state.selectedRows.length ? state.selectedRows : state.allData, d => d.Date))
      .range([0, widthArea]);

    brushG.call(d3.brushX().move, state.timeRange.map(xScale));
  } else {
    brushG.call(d3.brushX().move, null);
  }
}
