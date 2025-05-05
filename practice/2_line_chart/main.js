// 1. 연습용 데이터: 연도별 기대수명
const data = [
  { year: 2000, value: 72.3 },
  { year: 2005, value: 74.1 },
  { year: 2010, value: 75.5 },
  { year: 2015, value: 76.9 },
  { year: 2020, value: 77.8 }
];

// 2. 차트의 크기 및 마진 설정
const margin = { top: 40, right: 40, bottom: 50, left: 60 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// 3. SVG 생성
const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)   // 전체 너비
  .attr("height", height + margin.top + margin.bottom) // 전체 높이
  .append("g") // 실제 차트가 들어갈 그룹 <g>
  .attr("transform", `translate(${margin.left}, ${margin.top})`); // 마진 적용

// 4. 스케일 정의
// x축: 연도 (정수), y축: 기대수명
const xScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.year)) // [2000, 2020]
  .range([0, width]);

const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.value)]) // [0, 77.8]
  .range([height, 0]); // y축은 값이 커질수록 위로 올라가야 하므로 반대로 설정

// 5. 축(axis) 생성 및 추가
const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d")); // 연도 숫자 포맷
const yAxis = d3.axisLeft(yScale);

svg.append("g")
  .attr("transform", `translate(0, ${height})`) // x축을 아래쪽으로 옮김
  .call(xAxis);

svg.append("g")
  .call(yAxis);

// 6. 선(line) 생성기 정의
const line = d3.line()
  .x(d => xScale(d.year))  // x좌표: 연도
  .y(d => yScale(d.value)); // y좌표: 값

// 7. 선 그래프 추가 (path 태그 사용)
svg.append("path")
  .datum(data) // path는 단일 데이터 묶음에 대해 사용
  .attr("fill", "none")
  .attr("stroke", "#2b8cbe")
  .attr("stroke-width", 2.5)
  .attr("d", line); // 실제 선의 경로 (path의 d attribute)

// 8. 데이터 점(circle) 추가
svg.selectAll(".dot")
  .data(data)
  .enter()
  .append("circle")
  .attr("class", "dot")
  .attr("cx", d => xScale(d.year))
  .attr("cy", d => yScale(d.value))
  .attr("r", 4)
  .attr("fill", "#7bccc4");

// 9. 축 라벨 추가
svg.append("text")
  .attr("x", width / 2)
  .attr("y", height + 40)
  .attr("text-anchor", "middle")
  .attr("font-size", 14)
  .text("Year");

svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", -40)
  .attr("text-anchor", "middle")
  .attr("font-size", 14)
  .text("Life Expectancy");
