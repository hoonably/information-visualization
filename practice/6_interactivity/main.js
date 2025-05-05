const data = [
    { country: "Korea", value: 23 },
    { country: "Japan", value: 45 },
    { country: "China", value: 67 },
    { country: "India", value: 38 },
    { country: "Nepal", value: 20 },
  ];
  
  const margin = { top: 30, right: 30, bottom: 50, left: 40 };
  const width = 500 - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;
  
  const svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  const x = d3.scaleBand()
    .domain(data.map(d => d.country))
    .range([0, width])
    .padding(0.2);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.value)])
    .range([height, 0]);
  
  // 축 추가
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));
  
  svg.append("g")
    .call(d3.axisLeft(y));
  
  // 막대 생성
  svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.country))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => height - y(d.value))
    .attr("fill", "#69b3a2")
  
    // 🟡 mouseover 효과
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("fill", "orange");
    })
  
    // 🔵 mouseout → 원래 색 복원
    .on("mouseout", function(event, d) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr("fill", "#69b3a2");
    })
  
    // 🔴 click → 콘솔에 값 출력
    .on("click", function(event, d) {
      console.log(`You clicked: ${d.country} (${d.value})`);
    });
  