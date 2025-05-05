const svg = d3.select("body")
  .append("svg")
  .attr("width", 500)
  .attr("height", 300);

const data1 = [30, 80, 45, 60, 20];
const data2 = [70, 40, 60, 10, 90];

const x = d3.scaleBand().domain(d3.range(data1.length)).range([50, 450]).padding(0.1);
const y = d3.scaleLinear().domain([0, 100]).range([250, 50]);

const drawBars = (data) => {
  const bars = svg.selectAll("rect").data(data);

  // enter
  bars.enter()
    .append("rect")
    .attr("x", (d, i) => x(i))
    .attr("y", y(0)) // 초기 높이
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", "steelblue")
    .transition()
    .duration(800)
    .attr("y", d => y(d))
    .attr("height", d => 250 - y(d));

  // update
  bars.transition()
    .duration(800)
    .attr("y", d => y(d))
    .attr("height", d => 250 - y(d))
    .attr("fill", d => d > 60 ? "tomato" : "steelblue");

  // exit
  bars.exit()
    .transition()
    .duration(500)
    .attr("y", y(0))
    .attr("height", 0)
    .remove();
};

// 처음 그리기
drawBars(data1);

// 버튼 클릭 시 데이터 바꾸기
d3.select("#update").on("click", () => {
  drawBars(data2);
});
