class BubbleChart {

    // CSV 데이터를 불러와 전처리 후 시각화
    initData() {
        d3.csv('data/owid-covid-data.csv')
            .then(data => {

                // 필요한 열이 모두 존재하는 행만 필터링
                var filteredData = data.filter(d => {
                    return d.life_expectancy && d.gdp_per_capita && d.date && d.location && d.population && d.continent
                })

                // 날짜 파싱 및 숫자형 변환
                filteredData = filteredData.map(d => {
                    return {
                        location: d.location,
                        date: d3.timeParse("%Y-%m-%d")(d.date),
                        life_expectancy: Number(d.life_expectancy),
                        gdp_per_capita: Number(d.gdp_per_capita),
                        continent: d.continent,
                        population: Number(d.population),
                    }
                })

                // 최신 데이터가 앞에 오도록 정렬
                filteredData = filteredData.sort((a, b) => b.date - a.date)

                // 각 국가별로 가장 최신 데이터만 선택
                var processedData = []
                var countryList = []
                for (var d of filteredData) {
                    if (!countryList.includes(d.location)) {
                        processedData.push(d)
                        countryList.push(d.location)
                    }
                }

                // 기대 수명 순으로 정렬
                processedData = processedData.sort((a, b) => b.life_expectancy - a.life_expectancy)

                // 버블 차트 그리기
                this.drawBubbleChart(processedData)

            })
            .catch(error => {
                console.error(error);
            });
    }

    drawBubbleChart(data) {

        // SVG 캔버스 크기 설정
        const margin = { top: 5, right: 250, bottom: 50, left: 120 },
              width = 1000 - margin.left - margin.right,
              height = 600 - margin.top - margin.bottom;

        // SVG 요소 생성 및 그룹(transform 포함) 추가
        const svg = d3.select("#bubblechart")
            .append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // 확대/축소에 대비한 clip-path 정의
        const clip = svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height)

        // 줌 설정: 최대 20배, 최소 0.5배
        const zoom = d3.zoom()
            .scaleExtent([.5, 20])
            .on("zoom", updateChart);  // 줌 이벤트 발생 시 updateChart 함수 호출

        // 줌 인터랙션이 가능한 투명 사각형 추가
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

        // 대륙 리스트 추출 및 색상 매핑
        const continentList = [...new Set(data.map(item => item.continent))]
        const cScale = d3.scaleOrdinal()
            .domain(continentList)
            .range(["#cce1f2", "#a6f8c5", "#fbf7d5", "#e9cec7", "#f59dae", "#d2bef1"])

        // 인구 크기에 따라 원 크기 지정
        const sScale = d3.scaleSqrt()
            .domain(d3.extent(data, d => d.population))
            .range([5, 50])

        // clip-path 영역 내 버블 그룹 생성
        const circle = svg.append('g')
            .attr("clip-path", "url(#clip)")

        const circle_enter = circle.append('g')
            .selectAll("dot")
            .data(data)
            .enter()

        // 버블 생성 및 위치 지정
        circle_enter.append("circle")
            .attr("class", d => "bubbles " + d.continent)
            .attr("cx", d => xScale(d.gdp_per_capita))
            .attr("cy", d => yScale(d.life_expectancy))
            .attr("r", d => sScale(d.population))
            .style("fill", d => cScale(d.continent))
            .attr("stroke", "black")
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)

        // 축 그리기
        const xAxis = svg.append("g")
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        const yAxis = svg.append("g")
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale))

        // 축 레이블 추가
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 40)
            .attr("font-size", 17)
            .text("GDP Per Capita");

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -60)
            .attr("font-size", 17)
            .text("Life Expectency")
            .attr("transform", "rotate(270)");

        // 범례 원 생성
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

        // 줌이나 팬 시 차트 갱신
        function updateChart(event) {
            const newX = event.transform.rescaleX(xScale);
            const newY = event.transform.rescaleY(yScale);

            xAxis.call(d3.axisBottom(newX))
            yAxis.call(d3.axisLeft(newY))

            circle.selectAll("circle")
                .attr("cx", d => newX(d.gdp_per_capita))
                .attr("cy", d => newY(d.life_expectancy))
        }

        // 툴팁 정의
        const tooltip = d3.select("#bubblechart")
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

        // 마우스 오버 시 툴팁 표시
        function showTooltip(event, d) {
            tooltip.transition().duration(10).style("opacity", 1)
            tooltip.html("Country: " + d.location
                + "<br>Population: " + d.population
                + "<br>GDP per Capita: " + d.gdp_per_capita
                + "<br>Life Expectancy: " + d.life_expectancy)
                .style("left", (d3.pointer(event)[0] + 138) + "px")
                .style("top", (d3.pointer(event)[1] + 35) + "px")
        }

        // 마우스 움직일 때 툴팁 위치 업데이트
        function moveTooltip(event, d) {
            tooltip.style("left", (d3.pointer(event)[0] + 138) + "px")
                   .style("top", (d3.pointer(event)[1] + 35) + "px")
        }

        // 마우스 떠나면 툴팁 숨김
        function hideTooltip(event, d) {
            tooltip.transition().duration(200).style("opacity", 0)
        }

        // 특정 대륙 범례 클릭 시 해당 대륙 버블만 숨기거나 보이게
        function toggleContinent(event, d) {
            var className = d.split(' ').join('.');
            var currentOpacity = d3.selectAll(".bubbles." + className).style("opacity")

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

            // 바 차트와 연동 시 사용할 수 있는 함수
            filterBarData(d)
        }
    }

    // 외부에서 특정 국가 강조 시 사용하는 함수 (예: 바차트 → 버블)
    enableHighlightBubble(event, d) {
        d3.select("#bubblechart")
            .select("svg").selectAll("circle")
            .select(function (b) {
                return b.location === d.data.location ? this : null;
            })
            .clone()
            .raise()
            .attr("class", "bubbleHighlight")
            .style('stroke', '#FF0000')
            .attr("stroke-width", "4px")
    }

    // 강조 해제
    disableHighlightBubble(event, d) {
        d3.select("#bubblechart")
            .select("svg").selectAll(".bubbleHighlight")
            .remove()
    }
}
