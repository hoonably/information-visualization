// BubbleChart와 barChart 인스턴스 생성
const bubble = new BubbleChart();
const bar = new barChart();

// 초기 데이터 로딩
bubble.initData();  // 버블 차트용 데이터 불러오기
bar.initData();     // 바 차트용 데이터 불러오기


// barChart를 특정 대륙 기준으로 필터링하는 함수
function filterBarData(continent) {
    
    // 선택한 대륙이 현재 선택 목록에 있는지 확인
    const index = bar.currentContinentList.indexOf(continent)

    // 있으면 목록에서 제거 (toggle OFF)
    if (index > -1) {
        bar.currentContinentList.splice(index, 1)
    }
    // 없으면 목록에 추가 (toggle ON)
    else {
        bar.currentContinentList.push(continent)
    }

    // 현재 선택된 대륙만 포함한 데이터 필터링
    const filteredData = bar.data.filter(d => {
        return bar.currentContinentList.includes(d.continent)
    })

    // 각 국가별로 가장 최신 데이터 1개씩만 남김
    var processedData = []
    var countryList = []
    for (var d of filteredData) {
        if (!countryList.includes(d.location)) {
            processedData.push(d)
            countryList.push(d.location)
        }
    }

    // 전체 접종률 기준으로 정렬하고 상위 15개 국가 선택
    processedData = processedData
        .sort((a, b) =>
            (b.people_fully_vaccinated + b.people_partially_vaccinated)
            - (a.people_fully_vaccinated + a.people_partially_vaccinated)
        )
        .slice(0, 15)

    console.log("p")
    console.log(processedData)

    // 기존 바 차트 및 범례 제거
    d3.select("#barchart").select("svg").remove();
    d3.select("#barlegend").select("svg").remove();

    // 새롭게 필터된 데이터를 기반으로 바 차트 다시 그림
    bar.drawBarChart(processedData, countryList);
}
