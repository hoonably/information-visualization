// 브라우저 콘솔에서 메시지를 확인할 수 있음 (서버가 정상 작동 중일 때만 보임)
console.log("hello world!") 

// CSV 파일을 비동기적으로 불러옴
d3.csv('data/owid-covid-data.csv')
    .then(data => {

        // 필수 데이터가 모두 있는 행만 필터링
        var filteredData = data.filter(d => {
            return d.life_expectancy && d.gdp_per_capita && d.date && d.location && d.population && d.continent
        })

        console.log(filteredData)

        // 날짜 문자열을 Date 객체로 파싱하고, 숫자 데이터도 실제 숫자로 변환
        filteredData = filteredData.map(d => {
            return {
                location: d.location,
                date: d3.timeParse("%Y-%m-%d")(d.date),  // "2023-01-01" 같은 문자열 → 날짜 객체
                life_expectancy: Number(d.life_expectancy),
                gdp_per_capita: Number(d.gdp_per_capita),
                continent: d.continent,
                population: Number(d.population),
            }
        })

        // 날짜 기준 내림차순 정렬 → 가장 최근 데이터가 앞에 오도록
        filteredData = filteredData.sort((a, b) => b.date - a.date)

        console.log(filteredData)

        // 각 국가별로 가장 최신 데이터만 남기기 (중복 제거)
        processedData = []
        countryList = []
        for (d of filteredData) {
            if (!countryList.includes(d.location)) {
                processedData.push(d)
                countryList.push(d.location)
            }
        }

        // 기대 수명 기준 내림차순 정렬
        processedData = processedData.sort((a, b) => b.life_expectancy - a.life_expectancy)

        console.log(processedData)

        // 버블 차트 그리기
        drawBubbleChart(processedData)

    })
    .catch(error => {
        // 데이터 로딩 중 오류 발생 시 콘솔에 출력
        console.error(error);
    });


// 버블 차트를 실제로 그리는 함수
function drawBubbleChart(data) {

    // 그래프의 마진 및 전체 캔버스 크기 설정
    const margin = { top: 5, right: 450, bottom: 50, left: 120 },
        width = 1800 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom;

    // SVG 영역 생성 및 위치 조정
    const svg = d3.select("#chart")
        .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 줌 기능이 적용될 영역 지정
    const clip = svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height)

    // 줌(확대/축소) 기능 정의
    const zoom = d3.zoom()
        .scaleExtent([.5, 20]) // 0.5배 ~ 20배 확대
        .on("zoom", updateChart);

    // 전체 영역에 줌 이벤트 적용 (투명한 박스 사용)
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom);


    // x축: 1인당 GDP
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.gdp_per_capita) * 1.1])
        .range([0, width])

    // y축: 기대 수명
    const yScale = d3.scaleLinear()
        .domain([
            d3.min(data, d => d.life_expectancy) * 0.9,
            d3.max(data, d => d.life_expectancy) * 1.1
        ])
        .range([height, 0])

    // 대륙 리스트 추출 (중복 제거)
    const continentList = [...new Set(data.map(item => item.continent))];

    console.log(continentList)

    // 대륙별 색상 지정
    const cScale = d3.scaleOrdinal()
        .domain(continentList)
        .range(["#cce1f2", "#a6f8c5", "#fbf7d5", "#e9cec7", "#f59dae", "#d2bef1"])

    // 인구 크기 → 원의 반지름으로 매핑
    const sScale = d3.scaleSqrt()
        .domain(d3.extent(data, d => d.population))
        .range([5, 50])

    // 버블 그릴 그룹 생성 (clip-path 적용)
    const circle = svg.append('g')
        .attr("clip-path", "url(#clip)")

    // 버블 데이터 바인딩 및 생성
    const circle_enter = circle.append('g')
        .selectAll("dot")
        .data(data)
        .enter()

    circle_enter.append("circle")
        .attr("class", d => "bubbles " + d.continent)  // 대륙에 따라 class 부여 (후처리 용이)
        .attr("cx", d => xScale(d.gdp_per_capita))
        .attr("cy", d => yScale(d.life_expectancy))
        .attr("r", d => sScale(d.population))
        .style("fill", d => cScale(d.continent))
        .attr("stroke", "black")
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseleave", hideTooltip)

    // x축 그리기
    const xAxis = svg.append("g")
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    // y축 그리기
    const yAxis = svg.append("g")
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale))

    // x축 레이블
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .attr("font-size", 17)
        .text("GDP Per Capita");

    // y축 레이블
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", 0)
        .attr("y", -60)
        .attr("font-size", 17)
        .text("Life Expectency")
        .attr("transform", "rotate(270)");

    // 범례(legend) 원 생성
    const size = 30
    svg.selectAll("legend")
        .data(continentList)
        .enter()
        .append("circle")
        .attr("class", d => "legend " + d)
        .attr("cx", width + 100)
        .attr("cy", (d, i) => 10 + i * size)
        .attr("r", 10)
        .style("fill", d => cScale(d))
        .attr("stroke", "black")
        .on("click", toggleContinent)

    // 범례 텍스트 생성
    svg.selectAll("legend_label")
        .data(continentList)
        .enter()
        .append("text")
        .attr("class", d => "legendtext " + d)
        .attr("x", width + 100 + size)
        .attr("y", (d, i) => i * size + (size / 2))
        .text(d => d)
        .attr("text-anchor", "start")
        .on("click", toggleContinent)

    // 툴팁 생성 (초기 숨김)
    const tooltip = d3.select("#chart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")
        .style("display", "inline")
        .style("position", "fixed")
        .style("pointer-events", "none")

    // 마우스 오버 시 툴팁 보이기
    function showTooltip(event, d) {
        tooltip
            .transition()
            .duration(10)
            .style("opacity", 1)
        tooltip
            .html("Country: " + d.location
                + "<br>Population: " + d.population
                + "<br>GDP per Capita: " + d.gdp_per_capita
                + "<br>Life Expectancy: " + d.life_expectancy)
            .style("left", (d3.pointer(event)[0] + 138) + "px")
            .style("top", (d3.pointer(event)[1] + 35) + "px")
    }

    // 마우스 이동 시 툴팁 위치 업데이트
    function moveTooltip(event, d) {
        tooltip
            .style("left", (d3.pointer(event)[0] + 138) + "px")
            .style("top", (d3.pointer(event)[1] + 35) + "px")
    }

    // 마우스 떠나면 툴팁 숨김
    function hideTooltip(event, d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    // 대륙별로 버블 숨기기/보이기 토글
    function toggleContinent(event, d) {

        continentSplit = d.split(' ')
        className = continentSplit.join('.');

        // 현재 불투명도 확인
        currentOpacity = d3.selectAll(".bubbles." + className).style("opacity")

        // 불투명도 토글 (0 → 숨김, 1 → 표시)
        d3.selectAll(".bubbles." + className)
            .transition()
            .duration(200)
            .style("opacity", currentOpacity == 1 ? 0 : 1)
            .style("pointer-events", currentOpacity == 1 ? "none" : "auto")

        d3.select(".legend." + className)
            .transition()
            .duration(200)
            .style("opacity", currentOpacity == 1 ? 0.3 : 1)

        d3.select(".legendtext." + className)
            .transition()
            .duration(200)
            .style("opacity", currentOpacity == 1 ? 0.3 : 1)

    }

    // 줌 또는 팬 시 차트 업데이트
    function updateChart(event) {
        // 새 스케일 계산
        const newX = event.transform.rescaleX(xScale);
        const newY = event.transform.rescaleY(yScale);

        // 축 업데이트
        xAxis.call(d3.axisBottom(newX))
        yAxis.call(d3.axisLeft(newY))

        // 버블 위치 업데이트
        circle
            .selectAll("circle")
            .attr('cx', d => newX(d.gdp_per_capita))
            .attr('cy', d => newY(d.life_expectancy));
    }

}
