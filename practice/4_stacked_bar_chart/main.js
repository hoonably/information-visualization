// 차트 크기 설정
const margin = { top: 50, right: 30, bottom: 50, left: 70 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// CSV 로딩
d3.csv("data.csv").then(rawData => {
  // 데이터 정리
  const keys = rawData.columns.slice(2); // A, B, C 같은 항목들
  const data = rawData.map(d => {
    const total = d3.sum(keys, k => +d[k]);
    return {
      country: d.country,
      year: d.year,
      total: total,
      ...Object.fromEntries(keys.map(k => [k, +d[k]]))
    };
  });

  // 1. X축 scale: 나라 이름 기준
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.country))
    .range([0, width])
    .padding(0.2);

  // 2. Y축 scale: 값의 누적 합 기준
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.total)])
    .range([height, 0]);

  // 3. 색상 scale
  const color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeSet2); // 예쁜 색 8종

  // 4. d3.stack()을 이용한 누적 구조 생성
  const stacked = d3.stack()
    .keys(keys)(data);

  // 5. 막대 추가
  svg.selectAll("g.layer")
    .data(stacked)
    .enter()
    .append("g")
    .attr("class", "layer")
    .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .enter()
    .append("rect")
    .attr("x", d => xScale(d.data.country))
    .attr("y", d => yScale(d[1]))     // [0]: 아래쪽, [1]: 위쪽
    .attr("height", d => yScale(d[0]) - yScale(d[1])) // 높이 계산
    .attr("width", xScale.bandwidth());

  // 6. X/Y 축 추가
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .call(d3.axisLeft(yScale));

  // 7. 범례 추가
  const legend = svg.selectAll(".legend")
    .data(keys)
    .enter()
    .append("g")
    .attr("transform", (d, i) => `translate(${i * 80}, -30)`);

  legend.append("rect")
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", d => color(d));

  legend.append("text")
    .attr("x", 15)
    .attr("y", 10)
    .text(d => d)
    .attr("font-size", "12px");
});
