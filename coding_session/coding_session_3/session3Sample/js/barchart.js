// barChart라는 클래스 정의 (백신 접종률을 시각화하는 막대 차트용)
class barChart {

    constructor() {
        // 클래스 내부에서 사용할 변수 초기화
        this.data = null;  // 전체 데이터 저장용
        this.currentContinentList = null;  // 대륙 목록 저장용
    }

    // 데이터를 초기화하고 전처리하는 함수
    initData() {
        // 외부 CSV 파일 로딩 (비동기 방식)
        d3.csv('data/owid-covid-data.csv')
            .then(data => {

                // 필요한 컬럼만 존재하는 데이터 필터링
                var filteredData = data.filter(d => {
                    return d.people_vaccinated_per_hundred && d.people_fully_vaccinated_per_hundred && d.date && d.location && d.population && d.continent
                })

                console.log(filteredData)

                // 날짜 파싱, 백신 접종률 계산 및 숫자형 변환
                filteredData = filteredData.map(d => {
                    return {
                        location: d.location,
                        date: d3.timeParse("%Y-%m-%d")(d.date),  // 날짜 문자열 → Date 객체
                        people_vaccinated: Number(d.people_vaccinated_per_hundred),
                        people_fully_vaccinated: Number(d.people_fully_vaccinated_per_hundred),
                        people_partially_vaccinated: Number(d.people_vaccinated_per_hundred) - Number(d.people_fully_vaccinated_per_hundred),  // 일부 접종자는 전체 - 완전 접종
                        population: d.populationm,  // 이 부분 오타: d.population 으로 수정 필요
                        continent: d.continent
                    }
                })

                console.log(filteredData)

                // 백신 접종률이 100% 넘는 데이터 제거
                filteredData = filteredData.filter(d => {
                    return (d.people_fully_vaccinated + d.people_partially_vaccinated) <= 100 && d.people_fully_vaccinated <= d.people_vaccinated
                })

                console.log(filteredData)

                // 최신 데이터가 앞에 오도록 날짜 기준 정렬
                filteredData = filteredData.sort((a, b) => b.date - a.date)

                console.log(filteredData)

                // 국가별로 가장 최근 데이터 1개씩만 남김
                var processedData = []
                var countryList = []
                for (var d of filteredData) {
                    if (!countryList.includes(d.location)) {
                        processedData.push(d)
                        countryList.push(d.location)
                    }
                }
                console.log(processedData)

                // 총 접종률(일부+완전) 기준으로 상위 15개 국가 선택
                processedData = processedData
                    .sort((a, b) => (b.people_fully_vaccinated + b.people_partially_vaccinated) - (a.people_fully_vaccinated + a.people_partially_vaccinated))
                    .slice(0, 15)

                console.log(processedData)

                // 차트에 사용될 기본 데이터 및 대륙 정보 저장
                this.data = filteredData;
                this.currentContinentList = [...new Set(filteredData.map(item => item.continent))];
                console.log(this.currentContinentList)

                // 막대 차트 그리기 함수 호출
                this.drawBarChart(processedData, countryList);

            })
            .catch(error => {
                console.error(error);
            });
    }

    // 실제 막대 차트를 그리는 함수
    drawBarChart(data) {

        // 필요한 정보만 추출해서 새로운 배열 생성
        const filteredData = data.map(d => {
            return {
                location: d.location,
                people_fully_vaccinated: d.people_fully_vaccinated,
                people_partially_vaccinated: d.people_partially_vaccinated
            }
        })

        const keys = ["people_fully_vaccinated", "people_partially_vaccinated"]  // 스택 차트에 쓸 key

        // 국가 이름 리스트 추출
        var locations = d3.map(data, function (d) { return (d.location) })
        console.log(locations)

        // 차트 마진 및 전체 사이즈 설정
        const margin = { top: 5, right: 30, bottom: 50, left: 120 },
            width = 800 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        // SVG 영역 생성 및 위치 지정
        const svg = d3.select("#barchart")
            .append("svg")
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // x축: 접종률(0~100%)
        const xScale = d3.scaleLinear().domain([0, 100]).range([0, width])

        // y축: 국가 이름 (band scale)
        const yScale = d3.scaleBand().domain(locations).range([0, height]).padding(0.2)

        // 색상 스케일: 접종 유형별 색상 지정
        const cScale = d3.scaleOrdinal().domain(keys).range(["#7bccc4", "#2b8cbe"])

        // 스택 차트를 위한 데이터 재구성
        const stackedData = d3.stack().keys(keys)(filteredData)
        console.log(stackedData)

        // 막대 바 그룹 생성
        var bar = svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("fill", d => cScale(d))  // 색상 적용

        // 실제 사각형(rect) 데이터 바인딩
        var bar_enter = bar.selectAll("rect")
            .data(function (d) { return d; })  // 스택된 데이터 한 덩이씩
            .enter()

        // 막대 그리기
        bar_enter.append("rect")
            .attr("x", function (d) { return xScale(d[0]); })  // 시작 위치
            .attr("y", function (d, i) { return yScale(locations[i]); })  // 국가에 따라 y 위치
            .attr("width", function (d) { return xScale(d[1]) - xScale(d[0]); })  // 길이는 두 값 차이
            .attr("height", yScale.bandwidth())
            .on("mouseover", bubble.enableHighlightBubble)  // 마우스 오버 시 tooltip 등
            .on("mouseout", bubble.disableHighlightBubble)

        // 백분율 텍스트 표시
        bar_enter.append("text")
            .text(d => { return Math.round((d[1] - d[0])) + "%" })  // 길이만큼 퍼센트
            .attr("x", d => xScale(d[1] + (d[0] == 0 ? -5 : 1)))  // 끝 위치 기준으로 텍스트 배치
            .attr("y", function (d, i) { return yScale(locations[i]) + yScale.bandwidth() * 0.55; })
            .attr("font-size", 10)
            .style("fill", '#000000');

        // x축, y축 정의 및 그리기
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis);

        svg.append("g")
            .attr('class', 'y-axis')
            .call(yAxis)

        // x축 라벨
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 40)
            .attr("font-size", 17)
            .text("Share of people (%)");

        // 범례(legend) 생성
        const legend = d3.select("#barlegend")
            .append("svg")
            .attr('width', width)
            .attr('height', 70)
            .append("g")
            .attr("transform", `translate(${margin.left},${0})`);

        legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#7bccc4")
        legend.append("rect").attr('x', 0).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#2b8cbe")

        legend.append("text").attr("x", 18).attr("y", 18)
            .text("The rate of fully vaccinated people")
            .style("font-size", "15px")
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'hanging');

        legend.append("text").attr("x", 18).attr("y", 36)
            .text("The rate of partially vaccinated people")
            .style("font-size", "15px")
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'hanging');
    }

}
