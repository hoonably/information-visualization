// 버튼 클릭 시 <p id="target">의 내용을 바꾸는 함수
function SampleFunction() {
    document.getElementById("target").innerHTML = "Text Changed!";
}

// ------------------------------
// D3.js를 활용한 DOM 조작
// ------------------------------

// 모든 <li> 요소의 글자 색을 파란색으로 변경
d3.selectAll("li").style("color", "#0000FF");

// <body> 맨 끝에 새로운 <p> 요소 추가
d3.select("body").append("p").text("D3 appended me!");

// <ul> 요소 앞에 <p> 요소 삽입
d3.select("body").insert("p", "ul").text("And D3 insterted me before list!");

// ------------------------------
// D3 데이터 바인딩 실습
// ------------------------------

// 샘플 데이터 배열
const sampleData = [1, 2, 3, 4, 5, 6];

// 기존 <ul>의 <li> 요소에 데이터 바인딩 및 텍스트 업데이트
const li = d3.select("ul")
    .selectAll("li")
    .data(sampleData)
    .text(function (d) { return d; }); // 기존 li에 데이터 바인딩된 값으로 텍스트 설정

// 데이터 수가 li 개수보다 많을 경우, 부족한 개수만큼 새로 추가
li.enter()
  .append("li")
  .text(function (d) { return d; });

// ------------------------------
// D3 막대 그래프 생성 (수평 바 차트)
// ------------------------------

// 과일 카테고리별 값 정의
const data = [
    { "Category": "Apples", "Value": 10 },
    { "Category": "Bananas", "Value": 40 },
    { "Category": "Oranges", "Value": 30 },
    { "Category": "Grapes", "Value": 35 },
    { "Category": "Mangoes", "Value": 50 }
];

// 그래프의 가로 폭, 값 비례 배수, 바 높이 설정
const width = 700,
      scaleFactor = 10,         // 값에 곱해서 막대 길이로 변환
      barHeight = 25;

// SVG 요소 생성 및 높이는 데이터 개수 * 바 높이만큼
const graph = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", barHeight * data.length);

// 각 데이터를 담을 <g> 그룹 요소 생성
const bar = graph.selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
        return "translate(0," + i * barHeight + ")"; // 각 바마다 y좌표 다르게 설정
    });

// 각 그룹 안에 막대 <rect> 추가
bar.append("rect")
    .attr("width", function (d) {
        return d.Value * scaleFactor; // 값에 비례한 길이
    })
    .attr("height", barHeight - 1) // 약간의 여백 확보
    .attr("fill", "#88AADD"); // 막대 색상

// 각 바 옆에 텍스트(카테고리 이름) 추가
bar.append("text")
    .attr("x", function (d) { return (d.Value * scaleFactor + 5); }) // 막대 끝에서 약간 오른쪽에 배치
    .attr("y", barHeight / 2) // 바의 수직 중앙에 배치
    .attr("dy", ".35em") // 약간의 세로 미세조정
    .text(function (d) { return d.Category; }); // 텍스트는 카테고리 이름
