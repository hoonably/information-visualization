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

        /*
        | 메서드         | 리턴                | 주 용도                              | 데이터 수정       |
        | ----------- | ----------------- | --------------------------------- | ------------ |
        | `map()`     | 새로운 배열            | 각 원소를 가공/변형해서 새 배열 만들기            | ✅            |
        | `filter()`  | 조건 만족 원소만 남은 새 배열 | 특정 조건 필터링                         | ❌ 내부 수정 안 함  |
        | `forEach()` | 없음 (`undefined`)  | 각 원소에 대해 부수 효과 수행 (값 수정, 콘솔 출력 등) | ✅ 객체 자체 수정 시 |
        */
        
        // 1. 필요한 컬럼 중 null 값 제거
        const processedData = data.map(d => ({  // map은 전처리(가공)
            countrycode: d.iso_code,
            location: d.location,
            continent: d.continent,
            date: new Date(d.date),
            population: +d.population,
            people_vaccinated: +d.people_vaccinated,
            people_fully_vaccinated: +d.people_fully_vaccinated
        }))
            .filter(d =>
                d.countrycode &&          // ISO 코드가 존재하고 (null/"" 방지)
                d.location &&             // 국가 이름 존재
                d.continent &&            // 대륙명 존재
                !isNaN(d.population) &&   // 숫자 변환 실패한 경우 제거
                !isNaN(d.partially) &&
                !isNaN(d.fully) &&
                d.population > 0          // 음수나 0 제거
        );

        // 2. continent가 아시아가 아닌거 제외
        processedData = processedData.filter(d =>
            // = 하나만 쓰면 값이 바뀌는 연산이 되어버림
            d.continent === "Asia"
        )
        
        // 3.  rate of fully vaccinated people, partially vaccinated people, and total rate of vaccinated people 계산하여 변수로 넣기
        processedData.forEach(d => {  // foreach는 리턴값 없이 즉시 수정
            d.fullyRate = d.people_fully_vaccinated / d.population * 100;
            d.partialRate = (d.people_vaccinated - d.people_fully_vaccinated) / d.population * 100;
            d.totalRate = d.fullyRate + d.partialRate;
        });
        
        /*
        processedData = processedData.map(d => ({
            ...d,  // map을 쓸거면 이렇게 기존 필드 복사해줘야 함.
            fullyRate: d.people_fully_vaccinated / d.population * 100,
            partialRate: (d.people_vaccinated - d.people_fully_vaccinated) / d.population * 100,
            totalRate: d.people_vaccinated / d.population * 100  // or fully + partial
        }));
        */

        // 4. total rate of vaccinated people 이 100% 넘는거 삭제
        processedData = processedData.filter(d=>
            d.totalRate <= 100
        );

        // 5. 각 나라별 가장 최근의 데이터만 남김
        processedData = processedData.rollups(
            

        )
          


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

    // 1. Create a scale for x-axis
    // const xScale
    // const xScale = 

    // 2. Create a scale for y-axis
    // const yScale

    // 3. Define a scale for color
    // const cScale

    // 4. Process the data for a stacked bar chart
    // * Hint - Try to utilze d3.stack()
    // const stackedData

    // 5.  Draw Stacked bars

    // 6. Draw the labels for bars



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
