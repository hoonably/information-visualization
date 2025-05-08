// SVG 캔버스를 선택해서 생성하고, 너비 1000, 높이 2160px로 설정
const svg = d3.select("#chart")
    .append("svg")
    .attr('width', 1000)
    .attr('height', 2160)


// Sample 1 - 마우스 클릭 이벤트를 활용한 카운터 증가
var i = 0  // 카운터 변수 초기화

// 텍스트로 현재 카운터 값 표시
svg.append("text")
    .attr("id", "sp1txt")
    .attr("text-anchor", "start")
    .attr("x", 200)
    .attr("y", 75)
    .style("fill", "black")
    .attr("font-size", 42)
    .text("Counter: " + i)

// 빨간색 네모를 클릭할 수 있도록 만들고, 클릭 시 카운터 증가
svg.append("rect")
    .attr("width", 100)
    .attr("height", 100)
    .attr("x", 10)
    .attr("y", 10)
    .style("fill", "red")
    .style("stroke", "black")
    .style("stroke-width", "3px")
    .style("pointer-events", "all")  // 마우스 이벤트를 받을 수 있도록 설정
    .on("click", function () {
        i = i + 1  // 클릭할 때마다 카운터 증가
        svg.select("#sp1txt")  // 텍스트 갱신
            .text("Counter: " + i)
    })

// 네모 안에 텍스트 추가 (클릭 안내)
svg.append("text")
    .attr("text-anchor", "start")
    .attr("x", 15)
    .attr("y", 60)
    .style("fill", "white")
    .attr("font-size", 18)
    .text("Click Here!")
    .style("pointer-events", "none")  // 텍스트는 클릭 안 되도록 설정



// Sample 2 - 키보드 이벤트 감지
// 텍스트를 미리 화면에 배치
svg.append("text")
    .attr("id", "sp2txt")
    .attr("text-anchor", "start")
    .attr("x", 10)
    .attr("y", 200)
    .style("fill", "black")
    .attr("font-size", 32)
    .text("This text detects your keystroke!")

// 키보드를 누르면 해당 키를 출력
d3.select(document).on("keydown", function (event) {
    svg.select("#sp2txt")
        .text("You pressed " + event.key + "!")
})



// Sample 3 - 슬라이더로 원 크기 제어
// HTML의 input range를 foreignObject를 통해 SVG 내에 넣음
svg.append('foreignObject')
    .attr('x', 10)
    .attr('y', 400)
    .attr('width', 150)
    .attr('height', 40)
    .html('<input type="range" min="10" max="100" value="100">')  // 초기값 100
    .on("input", function (event) {
        svg.select("#sp3cir")
            .attr("r", event.target.value)  // 슬라이더에 따라 원 크기 변경
    })

// 실제 원 생성
svg.append("circle")
    .attr("id", "sp3cir")
    .attr("cx", 400)
    .attr("cy", 400)
    .attr("r", 100)
    .style("fill", "blue")
    .attr("stroke", "black")



// Sample 4 - 간단한 트랜지션 (변형 애니메이션)
svg.append('foreignObject')
    .attr('x', 10)
    .attr('y', 600)
    .attr('width', 80)
    .attr('height', 80)
    .html('<button>Click here!</button>')  // 클릭 시 트랜지션
    .on("click", function () {
        svg.select("#sp4rect")
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .style("x", "400")  // 사각형 위치 변경 (주의: `.style`은 실제 x좌표를 바꾸지 않음)
            .style("fill", "red")
    })

// 사각형 생성
svg.append("rect")
    .attr("id", "sp4rect")
    .attr("width", 100)
    .attr("height", 100)
    .attr("x", 10)
    .attr("y", 650)
    .style("fill", "green")
    .style("stroke", "black")



// Sample 5 - 서로 다른 트랜지션 지속시간 비교
svg.append('foreignObject')
    .attr('x', 10)
    .attr('y', 800)
    .attr('width', 80)
    .attr('height', 80)
    .html('<button>Click here!</button>')
    .on("click", function () {
        // 각 사각형에 서로 다른 duration 설정
        svg.select("#sp5rect1")
            .transition().duration(500).ease(d3.easeLinear)
            .style("x", "400")
            .on("end", () => svg.select("#sp5rect1").style("fill", "red"))

        svg.select("#sp5rect2")
            .transition().duration(1000).ease(d3.easeLinear)
            .style("x", "400")
            .on("end", () => svg.select("#sp5rect2").style("fill", "red"))

        svg.select("#sp5rect3")
            .transition().duration(1500).ease(d3.easeLinear)
            .style("x", "400")
            .on("end", () => svg.select("#sp5rect3").style("fill", "red"))
    })

// 사각형 3개 생성 (y좌표 다르게 배치)
for (let j = 0; j < 3; j++) {
    svg.append("rect")
        .attr("id", `sp5rect${j + 1}`)
        .attr("width", 50)
        .attr("height", 50)
        .attr("x", 10)
        .attr("y", 850 + j * 100)
        .style("fill", "white")
        .style("stroke", "black")
}



// Sample 6 - 서로 다른 트랜지션 딜레이 비교
svg.append('foreignObject')
    .attr('x', 10)
    .attr('y', 1200)
    .attr('width', 80)
    .attr('height', 80)
    .html('<button>Click here!</button>')
    .on("click", function () {
        svg.select("#sp6rect1")
            .transition().duration(1000).ease(d3.easeLinear)
            .style("x", "400")
            .on("end", () => svg.select("#sp6rect1").style("fill", "green"))

        svg.select("#sp6rect2")
            .transition().duration(1000).delay(1500).ease(d3.easeLinear)
            .style("x", "400")
            .on("end", () => svg.select("#sp6rect2").style("fill", "green"))

        svg.select("#sp6rect3")
            .transition().duration(1000).delay(3000).ease(d3.easeLinear)
            .style("x", "400")
            .on("end", () => svg.select("#sp6rect3").style("fill", "green"))
    })

// 3개의 사각형 생성
for (let j = 0; j < 3; j++) {
    svg.append("rect")
        .attr("id", `sp6rect${j + 1}`)
        .attr("width", 50)
        .attr("height", 50)
        .attr("x", 10)
        .attr("y", 1250 + j * 100)
        .style("fill", "white")
        .style("stroke", "black")
}



// Sample 7 - easing 함수에 따른 애니메이션 차이
svg.append('foreignObject')
    .attr('x', 10)
    .attr('y', 1600)
    .attr('width', 80)
    .attr('height', 80)
    .html('<button>Click here!</button>')
    .on("click", function () {
        svg.select("#sp7rect1")
            .transition().duration(1000).ease(d3.easeCubicIn)
            .style("x", "400")
            .on("end", () => svg.select("#sp7rect1").style("fill", "blue"))

        svg.select("#sp7rect2")
            .transition().duration(1000).ease(d3.easeCubicInOut)
            .style("x", "400")
            .on("end", () => svg.select("#sp7rect2").style("fill", "blue"))

        svg.select("#sp7rect3")
            .transition().duration(1000).ease(d3.easeLinear)
            .style("x", "400")
            .on("end", () => svg.select("#sp7rect3").style("fill", "blue"))

        svg.select("#sp7rect4")
            .transition().duration(1000).ease(d3.easeCubicOut)
            .style("x", "400")
            .on("end", () => svg.select("#sp7rect4").style("fill", "blue"))
    })

// 4개의 사각형 생성 (서로 다른 easing 비교)
for (let j = 0; j < 4; j++) {
    svg.append("rect")
        .attr("id", `sp7rect${j + 1}`)
        .attr("width", 50)
        .attr("height", 50)
        .attr("x", 10)
        .attr("y", 1650 + j * 100)
        .style("fill", "white")
        .style("stroke", "black")
}
