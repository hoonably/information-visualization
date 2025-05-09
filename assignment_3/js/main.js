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
            ...d, // ⭐️  d 객체 안에 있는 기존 필드들 (iso_code, location, date, people_vaccinated, ...)을 그대로 복사해서 새 객체에 포함
            fully_vaccinated_rate: (d.people_fully_vaccinated / d.population) * 100,  // 이후에 추가 필드 붙이기
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
            (a, b) => b.people_vaccinated_rate - a.people_vaccinated_rate  // 내림차순
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
    // - 접종률은 0%~100%로 연속된 수이므로 선형 스케일(linear scale) 사용
    const xScale = d3.scaleLinear()
    .domain([0, 100])    // 데이터 입력 범위: 0% ~ 100%
    .range([0, width]);  // 화면 출력 범위: 왼쪽(0) ~ 오른쪽 끝(width)

    // 2. y축 스케일 생성
    // - 국가 이름은 범주형이므로 band scale 사용 (막대 간 간격 자동 조정)
    const yScale = d3.scaleBand()
    .domain(data.map((d) => d.location))  // 국가 이름 배열을 범주로 설정
    .range([0, height])                   // 화면에서 위(0) ~ 아래(height)까지 배치
    .padding(0.1);                        // 막대 사이 여백 설정 (10%)

    // 3. 색상 스케일 생성
    // - 누적 막대 내부에서 항목별 색상을 구분하기 위해 ordinal scale 사용
    const cScale = d3.scaleOrdinal(
    ["fully_vaccinated_rate", "partially_vaccinated_rate"], // key 이름 기준
    ["#7bccc4", "#2b8cbe"]                                   // 해당하는 색상 지정
    // 청록 = 완전 접종률 / 파랑 = 부분 접종률
    );

    // 4. 누적 막대 데이터 생성
    // - d3.stack()을 사용하여 각 key(접종률 항목)별로 누적된 위치 계산
    const stackedData = d3.stack()
    .keys(["fully_vaccinated_rate", "partially_vaccinated_rate"]) // 누적 항목 순서
    (data); // 최종 입력 데이터로 스택 배열 생성

    console.log(stackedData); // 생성된 누적 구조 확인 (디버깅용)

    // 5. 누적 막대 그리기 시작
    // - stackedData는 항목(key)별로 그룹화되어 있으므로 key마다 <g> 요소를 만든다
    const group = svg
    .selectAll("g")         // 모든 <g> 요소 선택 (없으면 생성)
    .data(stackedData)      // 각 key 그룹 데이터를 바인딩
    .join("g")              // enter/update 병합
    .attr("fill", (d) => cScale(d.key)); // 각 그룹에 대해 색상 지정 (key 기준)

    // - 각 그룹 안에서 막대(rect) 개별 그리기
    group
    .selectAll("rect")        // 각 그룹 내 모든 rect 선택
    .data((d) => d)           // 이 그룹에 속한 국가별 [x0, x1] 데이터 바인딩
    .join("rect")             // enter/update 병합
    .attr("y", (d) => yScale(d.data.location))           // y 위치: 해당 국가 이름의 위치
    .attr("x", (d) => xScale(d[0]))                      // x 시작 위치: 누적 막대의 왼쪽 경계
    .attr("width", (d) => xScale(d[1]) - xScale(d[0]))   // 폭: 오른쪽 끝 - 왼쪽 끝
    .attr("height", yScale.bandwidth());                // 높이: yScale의 막대 높이값


    // 6-1. 완전 접종률 라벨 표시 (fully vaccinated rate)
    // - 각 막대의 오른쪽 끝에 숫자(%) 텍스트 표시
    // - x: 막대 끝보다 살짝 왼쪽 (text-anchor: end로 정렬)
    svg
    .selectAll("text.fully")                        // 이미 존재하는 .fully 클래스 선택 (없으면 생성됨)
    .data(data)                                     // 현재 막대에 해당하는 데이터 바인딩
    .join("text")                                   // enter + update 병합
    .attr("class", "fully")                         // 라벨 구분을 위한 클래스 설정 (CSS 스타일링 가능)
    .attr("x", (d) => xScale(d.fully_vaccinated_rate) - 5)  // 막대의 끝점보다 5px 왼쪽 위치 (퍼센트 수치 위치)
    .attr("y", (d) => yScale(d.location) + yScale.bandwidth() / 2 + 3)  
    // 막대 중앙 높이 + 약간 아래로 (세로 정렬)
    .text((d) => `${d.fully_vaccinated_rate.toFixed()}%`)   // 소수점 없이 백분율 표시 (예: "81%")
    .style("font-size", "10px")                    // 라벨 글자 크기 설정
    .style("text-anchor", "end");                  // 텍스트 우측 정렬 (x 좌표 기준 오른쪽 끝 맞춤)


    // 6-2. 부분 접종률 라벨 표시 (partially vaccinated rate)
    // - 총 접종률 위치 오른쪽에 부분 접종률 텍스트 표시
    // - x: 막대 끝보다 살짝 오른쪽 (text-anchor: start로 정렬)
    svg
    .selectAll("text.partially")                   // .partially 클래스 선택 (없으면 생성됨)
    .data(data)                                     // 동일한 데이터 사용
    .join("text")                                   // enter + update 병합
    .attr("class", "partially")                     // 라벨 클래스 설정
    .attr("x", (d) => xScale(d.people_vaccinated_rate) + 5) 
    // 전체 막대 끝점 기준 오른쪽 5px 위치 (부분 접종률 수치 위치)
    .attr("y", (d) => yScale(d.location) + yScale.bandwidth() / 2 + 3) 
    // y 위치는 동일하게 막대 중앙 정렬
    .text((d) => `${d.partially_vaccinated_rate.toFixed()}%`) 
    // 부분 접종률을 정수로 출력 (예: "12%")
    .style("font-size", "10px")                    // 글자 크기 설정
    .style("text-anchor", "start");                // 텍스트 좌측 정렬 (x 좌표 기준 왼쪽에서 시작)



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
