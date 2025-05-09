// 📄 SVG 캔버스 생성 (가로 500px, 세로 300px)
const svg = d3.select("body")
  .append("svg")
  .attr("width", 500)
  .attr("height", 300);

// 📊 두 개의 데이터 배열 준비 (전환될 대상)
const data1 = [30, 80, 45, 60, 20];
const data2 = [70, 40, 60, 10, 90];

// 🧭 x축: 막대 위치 지정 (0~4의 인덱스를 기준으로 분포)
const x = d3.scaleBand()
  .domain(d3.range(data1.length))      // [0, 1, 2, 3, 4] 생성
  .range([50, 450])                    // 시작 위치: 50, 끝: 450
  .padding(0.1);                       // 막대 사이 간격 설정

// 📏 y축: 값(0~100)을 위에서 아래로 반전시켜 위치 지정
const y = d3.scaleLinear()
  .domain([0, 100])                    // 데이터 범위 0~100
  .range([250, 50]);                   // 화면에서는 아래가 0이므로 반전됨

// 🔄 막대를 그리는 함수 (데이터를 인자로 받음)
const drawBars = (data) => {
  // 현재 svg에 있는 모든 rect와 새 데이터 연결 (바인딩)
  const bars = svg.selectAll("rect").data(data);

  // ➕ enter: 새 데이터에 해당하는 막대가 없을 때 새로 추가
  bars.enter()
    .append("rect")                      // 새로운 막대 추가
    .attr("x", (d, i) => x(i))           // x 위치: 인덱스 기반 위치
    .attr("y", y(0))                     // 처음에는 y축 아래쪽에서 시작
    .attr("width", x.bandwidth())       // 막대 너비 설정
    .attr("height", 0)                  // 초기 높이는 0
    .attr("fill", "steelblue")          // 기본 색상
    .transition()                       // 애니메이션 적용
    .duration(800)                      // 0.8초 동안
    .attr("y", d => y(d))               // 최종 위치 위로 상승
    .attr("height", d => 250 - y(d));   // 최종 높이 계산

  // 🔁 update: 기존 막대가 새 데이터로 변경될 경우
  bars.transition()
    .duration(800)
    .attr("y", d => y(d))               // 값에 따라 위치 갱신
    .attr("height", d => 250 - y(d))    // 높이 갱신
    .attr("fill", d => d > 60 ? "tomato" : "steelblue"); // 조건에 따라 색상 변경

  // ➖ exit: 이전 데이터에는 있었지만 새로운 데이터에는 없는 막대 제거
  bars.exit()
    .transition()
    .duration(500)
    .attr("y", y(0))                    // 아래로 내려감
    .attr("height", 0)                  // 높이 0으로 줄이기
    .remove();                          // DOM에서 제거
};

// ✅ 초기 상태로 data1 막대들 그리기
drawBars(data1);

// 🔘 HTML에서 ID가 "update"인 버튼 클릭 시 데이터 전환
d3.select("#update").on("click", () => {
  drawBars(data2); // data2로 바 차트 갱신
});
