// 날짜별 값 데이터 배열 정의
const secondData = [
    { "Date": "2022-01-01", "Value": 105 },
    { "Date": "2022-01-02", "Value": 12 },
    { "Date": "2022-01-03", "Value": 167 },
    { "Date": "2022-01-04", "Value": 45 },
    { "Date": "2022-01-05", "Value": 82 },
    { "Date": "2022-01-06", "Value": 32 },
    { "Date": "2022-01-07", "Value": 190 },
    { "Date": "2022-01-08", "Value": 55 },
    { "Date": "2022-01-09", "Value": 88 },
    { "Date": "2022-01-10", "Value": 130 },
    { "Date": "2022-01-11", "Value": 175 },
    { "Date": "2022-01-12", "Value": 60 },
    { "Date": "2022-01-13", "Value": 100 },
    { "Date": "2022-01-14", "Value": 25 },
    { "Date": "2022-01-15", "Value": 140 },
    { "Date": "2022-01-16", "Value": 185 },
    { "Date": "2022-01-17", "Value": 72 },
    { "Date": "2022-01-18", "Value": 95 },
    { "Date": "2022-01-19", "Value": 150 },
    { "Date": "2022-01-20", "Value": 40 }
];

// 마진 설정 (그래프의 바깥 여백)
var margin = { top: 20, right: 30, bottom: 30, left: 60 },
// 전체 SVG 크기에서 마진을 뺀 실제 그래프 그릴 영역의 너비와 높이
    barChartWidth = 800 - margin.left - margin.right,
    barChartHeight = 400 - margin.top - margin.bottom,
// 각 바의 너비
    barWidth = 25;

// SVG 요소를 body에 추가
var svg = d3.select("body")
    .append("svg")
    .attr("width", barChartWidth + margin.left + margin.right) // 전체 너비
    .attr("height", barChartHeight + margin.top + margin.bottom) // 전체 높이
    .append("g") // 그래프 영역 그룹 <g> 추가
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")"); // 마진만큼 내부로 이동

// 문자열로 되어있는 날짜를 Date 객체로 변환
parsedData = secondData.map(d => {
    return { Date: d3.timeParse("%Y-%m-%d")(d.Date), Value: d.Value }
});
console.log(parsedData); // 변환된 데이터 확인용 로그

// x축의 범위를 위해 날짜의 최소/최대값 추출
var extent = d3.extent(parsedData, function (d) { return d.Date });
// 최대 날짜에 하루를 더해 x축 끝 여백 확보
extent[1] = d3.timeDay.offset(extent[1], 1);
console.log(extent); // 확장된 x축 범위 확인

// x축: 시간 스케일 정의 (도메인 → 픽셀로 매핑)
var x = d3.scaleTime()
          .domain(extent) // 입력 범위: 날짜 범위
          .range([0, barChartWidth]); // 출력 범위: 화면상 위치

// y축: 값 스케일 정의
var y = d3.scaleLinear()
          .domain([0, d3.max(parsedData, function (d) { return d.Value })]) // 입력 범위: 0 ~ 최대 값
          .range([barChartHeight, 0]); // 출력 범위: 아래(0) → 위(최댓값)

// x축 그리기
svg.append("g")
    .attr("transform", "translate(0," + barChartHeight + ")") // x축은 맨 아래에 위치
    .call(d3.axisBottom(x)) // x축 생성
    .append('text') // 축 라벨 추가 (중간에 놓기 위해선 추가 스타일 필요)
    .attr('text-anchor', 'middle')
    .text('Date');

// y축 그리기
svg.append("g")
    .call(d3.axisLeft(y)); // 왼쪽 y축 생성

// 실제 바 차트를 담을 그룹 <g> 생성
var g = svg.append("g");

// 데이터 바인딩 및 막대(rect) 생성
g.selectAll(".bar") // .bar 클래스를 가진 모든 요소 선택 (없다면 빈 selection)
    .data(parsedData) // 데이터 바인딩
    .enter() // 데이터 개수만큼 새로운 요소 만들 준비
    .append("rect") // rect 요소 추가
    .attr("class", "bar") // 클래스 이름 설정
    .attr("x", d => x(d.Date)) // 바의 x 위치 (날짜 기준)
    .attr("y", d => y(d.Value)) // 바의 y 위치 (값 기준)
    .attr("width", barWidth) // 바 너비
    .attr("height", d => barChartHeight - y(d.Value)) // 바의 높이 (y 기준 아래로)
    .attr("fill", "#88AADD"); // 바 색상
