console.log("hello world!") // You can see this in the browser console if you run the server correctly
// Don't edit skeleton code!!


d3.csv('data/owid-covid-data.csv')
    .then(data => {

        /*
        -------------------------------------------
        YOUR CODE STARTS HERE

        TASK 1 - Data Processing 

        TO-DO-LIST
        1. Exclude data which contain missing values on columns you need
        2. Exclude data all data except the data where the continent is Asia 
        3. Calculate the rate of fully vaccinated people, partially vaccinated people, and total rate of vaccinated people
        4. Exclude data where total rate of vaccinated people is over 100%
        5. Exclude all data except the latest data for each country
        6. Sort the data with descending order by total reat of vaccinated people
        7. Extract Top 15 countries 
        -------------------------------------------
        */

        // 전체 데이터 로드 후 확인
        console.log(data); // 📌 원본 CSV 데이터를 콘솔에 출력해서 데이터 구조 및 컬럼명을 눈으로 확인
        // 예: d.iso_code, d.continent, d.date 등이 잘 들어왔는지, 누락된 값이 있는지 사전 점검

        // 1. 필요한 컬럼 중 하나라도 빠져 있으면 제거
        // - 실제 사용할 컬럼: iso_code, continent, location, date, population, people_vaccinated, people_fully_vaccinated
        // - 문자열/숫자가 빠진 데이터는 시각화 계산에서 오류를 일으킬 수 있기 때문에 사전에 제거
        let processedData = data.filter(
        (d) =>
            d.iso_code &&
            d.continent &&
            d.location &&
            d.date &&
            d.population &&
            d.people_vaccinated &&
            d.people_fully_vaccinated
        );
        console.log(processedData); // 📌 null 제거 후 데이터가 얼마나 남았는지 확인

        // 2. 아시아(Asia) 대륙 국가만 필터링
        // - 문제 조건에서 "continent가 Asia인 나라만"을 대상으로 시각화해야 하기 때문
        processedData = processedData.filter((d) => d.continent === "Asia");
        console.log(processedData); // 📌 아시아 국가만 잘 추출됐는지 확인

        // 3. 백신 접종률 계산
        // - 전처리된 국가별로 다음 3가지 비율 계산:
        //   (1) 완전 접종률 (fully_vaccinated_rate)
        //   (2) 부분 접종률 (partially_vaccinated_rate) = 1회만 맞은 사람 비율
        //   (3) 총 접종률 (people_vaccinated_rate)
        processedData = processedData.map((d) => ({
        ...d, // 원본 속성 유지
        fully_vaccinated_rate: (d.people_fully_vaccinated / d.population) * 100,
        partially_vaccinated_rate: ((d.people_vaccinated - d.people_fully_vaccinated) / d.population) * 100,
        people_vaccinated_rate: (d.people_vaccinated / d.population) * 100,
        }));
        console.log(processedData); // 📌 비율 필드가 잘 추가되었는지 확인

        // 4. 총 접종률이 100%를 초과한 데이터 제거
        // - 데이터 오류 또는 중복 집계로 인해 100%를 초과할 수 있으므로 제거하여 시각화 왜곡 방지
        processedData = processedData.filter(
        (d) => d.people_vaccinated_rate <= 100
        );
        console.log(processedData); // 📌 이상치 제거 후 남은 국가 수 확인

        // 5. 국가별로 가장 최신 날짜의 데이터만 남기기
        // - 여러 날짜가 존재할 수 있으므로 국가당 최신 데이터 1개만 사용
        let latestDataByCountry = {}; // iso_code 기준으로 최신 데이터 저장할 객체
        processedData.forEach((d) => {
        const iso = d.iso_code;
        const isExist = latestDataByCountry[iso];
        // 기존 데이터가 없거나 현재 데이터의 날짜가 더 최신이면 교체
        if (!isExist || latestDataByCountry[iso].date < d.date) {
            latestDataByCountry[iso] = d;
        }
        });
        processedData = Object.values(latestDataByCountry); // 객체에서 값만 뽑아 배열로 변환
        console.log(processedData); // 📌 국가당 1개만 남았는지 확인

        // 6. 총 접종률 기준으로 내림차순 정렬
        // - 막대그래프에서 위에서부터 접종률이 높은 순서대로 배치하기 위함
        processedData = processedData.sort(
        (a, b) => b.people_vaccinated_rate - a.people_vaccinated_rate
        );
        console.log(processedData); // 📌 정렬이 제대로 되었는지 확인

        // 7. 상위 15개 국가만 추출
        // - 시각화 과제에서 "Top 15"만 시각화하도록 요구함
        processedData = processedData.slice(0, 15);
        console.log(processedData); // 📌 최종 시각화 대상 15개 국가 데이터 확인

            

        /*
        -------------------------------------------
        YOUR CODE ENDS HERE
        -------------------------------------------
        */

        drawBarChart(processedData);

    })
    .catch(error => {
        console.error(error);
    });

function drawBarChart(data) {

    // Define the screen
    const margin = { top: 5, right: 30, bottom: 50, left: 120 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // Define the position of the chart 
    const svg = d3.select("#chart")
        .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    /*
    -------------------------------------------
    YOUR CODE STARTS HERE

    TASK 2 - Data processing 

    TO-DO-LIST
    1. Create a scale named xScale for x-axis
    2. Create a scale named yScale for x-axis
    3. Define a scale named cScale for color
    4. Process the data for a stacked bar chart 
    5. Draw Stacked bars
    6. Draw the labels for bars
    -------------------------------------------
    */

    // 1. x축 스케일 생성
    // - 백신 접종률은 0% ~ 100% 범위이므로 선형 스케일(linear scale) 사용
    // - .domain([0, 100]) → 실제 데이터 범위
    // - .range([0, width]) → 화면에 출력될 픽셀 위치 범위
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);

    // 2. y축 스케일 생성
    // - 국가 이름이 범주형 데이터이므로 band scale 사용
    // - 각 국가별로 막대 하나씩 그릴 수 있도록 .domain(data.map(...)) 설정
    // - .range([0, height]) → 전체 그래프 높이에 균등 분포
    // - .padding(0.1) → 막대 간 여백 추가
    const yScale = d3
    .scaleBand()
    .domain(data.map((d) => d.location))
    .range([0, height])
    .padding(0.1);

    // 3. 색상 스케일 생성
    // - 누적 막대에서 두 개의 항목을 구분할 색상 정의
    // - 도메인: stacked bar의 key 값 (fully / partially 접종률)
    // - range: 각 항목에 대응할 색상
    const cScale = d3.scaleOrdinal(
    ["fully_vaccinated_rate", "partially_vaccinated_rate"],
    ["#7bccc4", "#2b8cbe"] // 청록(완전접종), 파랑(부분접종)
    );

    // 4. 누적 막대 데이터 처리
    // - d3.stack()을 통해 stacked 구조 생성
    // - 각 항목의 시작점과 끝점 ([x0, x1]) 배열이 생성됨
    // - data: [{ location, ... }] → [[ [x0,x1], [x0,x1], ... ], [...]]
    const stackedData = d3
    .stack()
    .keys([
        "fully_vaccinated_rate",
        "partially_vaccinated_rate",
    ])(data);

    console.log(stackedData); // 구조 확인용 로그

    // 5. 누적 막대 그리기
    // - stackedData는 key별로 그룹화되어 있으므로 먼저 그룹(<g>) 생성
    // - 각 그룹 안에 <rect> 막대를 순서대로 추가
    const group = svg
    .selectAll("g")
    .data(stackedData)
    .join("g")
    .attr("fill", (d) => cScale(d.key)); // 각 그룹별 색상 지정

    group
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("y", (d) => yScale(d.data.location))                  // 국가별 y 위치
    .attr("x", (d) => xScale(d[0]))                             // 시작점
    .attr("width", (d) => xScale(d[1]) - xScale(d[0]))          // 길이 = 끝 - 시작
    .attr("height", yScale.bandwidth());                        // 막대 높이

    // 6-1. 완전 접종률 라벨 표시
    // - 각 막대의 끝에 텍스트로 백분율 출력
    // - x: 막대 오른쪽에 정렬 (text-anchor: end)
    svg
    .selectAll("text.fully")
    .data(data)
    .join("text")
    .attr("class", "fully")
    .attr("x", (d) => xScale(d.fully_vaccinated_rate) - 5)
    .attr("y", (d) => yScale(d.location) + yScale.bandwidth() / 2 + 3)
    .text((d) => `${d.fully_vaccinated_rate.toFixed()}%`)
    .style("font-size", "10px")
    .style("text-anchor", "end");

    svg
        .selectAll("text.partially")
        .data(data)
        .join("text")
        .attr("class", "partially")
        .attr("x", (d) => xScale(d.people_vaccinated_rate) + 5)
        .attr("y", (d) => yScale(d.location) + yScale.bandwidth() / 2 + 3)
        .text((d) => `${d.partially_vaccinated_rate.toFixed()}%`)
        .style("font-size", "10px")
        .style("text-anchor", "start");


    /*
    -------------------------------------------
    YOUR CODE ENDS HERE
    -------------------------------------------
    */

    // Define the position of each axis
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Draw axes 
    svg.append("g")
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .attr('class', 'y-axis')
        .call(yAxis)

    // Indicate the x-axis label 
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .attr("font-size", 17)
        .text("Share of people (%)");

    // Draw Legend
    const legend = d3.select("#legend")
        .append("svg")
        .attr('width', width)
        .attr('height', 70)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    legend.append("rect").attr('x', 0).attr('y', 18).attr('width', 12).attr('height', 12).style("fill", "#7bccc4")
    legend.append("rect").attr('x', 0).attr('y', 36).attr('width', 12).attr('height', 12).style("fill", "#2b8cbe")
    legend.append("text").attr("x", 18).attr("y", 18).text("The rate of fully vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');
    legend.append("text").attr("x", 18).attr("y", 36).text("The rate of partially vaccinated people").style("font-size", "15px").attr('text-anchor', 'start').attr('alignment-baseline', 'hanging');

}
