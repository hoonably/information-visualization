// 📊 SVG 초기 설정 
// SVG base setup
const svg = d3.select("#chart"); // HTML에서 <svg id="chart"> 선택 // Select the <svg id="chart"> element
const width = 1000;
const height = 600;
const margin = { top: 40, right: 250, bottom: 60, left: 60 };

// 🧭 툴팁 생성 
// Create tooltip
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// ✅ 필터 UI 담을 div 생성 
// Create div for filter checkboxes
const controlDiv = d3.select("body")
  .insert("div", "svg")
  .attr("id", "filter-controls")
  .style("margin-bottom", "10px");

// 📥 CSV 불러오고 전처리 
// Load CSV and preprocess data
d3.csv("Chocolate Sales.csv", d => {
  const parseDate = d3.timeParse("%d-%b-%y");
  d.date = parseDate(d.Date); // 문자열 → Date 객체 // Convert string to Date object
  d.amount = +d.Amount.replace(/[$, ]/g, ""); // "$5,320 " → 5320 // Remove $ and comma, convert to number
  d.product = d.Product;
  d.month = d3.timeFormat("%Y-%m")(d.date); // 예: "2022-01" // Format as "2022-01"
  return d;
}).then(data => {

  // 🍫 모든 제품 카테고리 추출 
  // Extract all product categories
  const allCategories = Array.from(new Set(data.map(d => d.product)));
  let selectedCategories = new Set(allCategories); // 기본 전체 선택됨 // All categories selected by default

  // ✅ 카테고리별 체크박스 필터 생성 
  // Generate checkbox filters for each category
  allCategories.forEach(cat => {
    const label = controlDiv.append("label").style("margin-right", "10px");
    label.append("input")
      .attr("type", "checkbox")
      .attr("checked", true)
      .on("change", function () {
        if (this.checked) {
          selectedCategories.add(cat);
        } else {
          selectedCategories.delete(cat);
        }
        renderChart(); // 변경 시 다시 그리기 // Redraw chart on change
      });
    label.append("span").text(cat);
  });

  renderChart(); // 초기 차트 렌더링 // Initial chart render

  // 📈 메인 차트 그리는 함수 
  // Main chart rendering function
  function renderChart() {
    const categories = allCategories;
    const visibleCategories = allCategories.filter(cat => selectedCategories.has(cat));

    // ✅ 월별로 그룹핑 후, 각 카테고리 합산 (선택 안 된 카테고리는 0) // Group by month and sum per category (zero for unselected)
    const nested = d3.rollup(
      data,
      v => {
        const obj = { month: v[0].month };
        categories.forEach(cat => {
          obj[cat] = visibleCategories.includes(cat)
            ? d3.sum(v.filter(d => d.product === cat), d => d.amount)
            : 0;
        });
        return obj;
      },
      d => d.month
    );

    // 📊 D3 스택형 데이터 준비 
    // Prepare stacked data
    const stackedData = Array.from(nested.values()).sort((a, b) => d3.ascending(a.month, b.month));
    const stack = d3.stack().keys(categories);
    const series = stack(stackedData);

    // 📏 X, Y 스케일 설정 
    // Set X and Y scales
    const xScale = d3.scaleBand()
      .domain(stackedData.map(d => d.month))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(stackedData, d => d3.sum(categories, k => d[k])) || 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // 🎨 색상 지정 (25개 고정 팔레트) 
    // Color palette (25 fixed colors)
    const customColors = [
      "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd",
      "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf",
      "#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99",
      "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a",
      "#ffff99", "#b15928", "#66c2a5", "#fc8d62", "#8da0cb"
    ];
    const color = d3.scaleOrdinal().domain(categories).range(customColors);

    // ✅ 그룹별 g.layer 갱신 
    // Update <g class="layer"> per category
    const groups = svg.selectAll("g.layer")
      .data(series, d => d.key);

    const groupsEnter = groups.enter()
      .append("g")
      .attr("class", "layer")
      .attr("fill", d => color(d.key));

    groupsEnter.merge(groups).attr("fill", d => color(d.key));
    groups.exit().remove();

    // ✅ 막대 (rect) 갱신 
    // Update each <rect> (bar)
    const rects = groupsEnter.merge(groups)
      .selectAll("rect")
      .data(d => d);

    rects.enter()
      .append("rect")
      .attr("x", d => xScale(d.data.month))
      .attr("width", xScale.bandwidth())
      .attr("y", yScale(0))
      .attr("height", 0)
      .merge(rects)
      .transition().duration(600)
      .attr("x", d => xScale(d.data.month))
      .attr("width", xScale.bandwidth())
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]));

    rects.exit().remove();

    // 🧠 툴팁 바인딩 
    // Bind tooltip events
    groupsEnter.merge(groups)
      .selectAll("rect")
      .on("mouseover", function (event, d) {
        const product = this.parentNode.__data__.key;
        const value = d.data[product];
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(`<strong>${product}</strong><br>월: ${d.data.month}<br>매출: $${value.toLocaleString()}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => tooltip.transition().duration(300).style("opacity", 0));

    // ✅ 축 (X, Y) 생성 
    // Render X and Y axes
    svg.selectAll(".x-axis").remove();
    svg.selectAll(".y-axis").remove();

    const parseMonth = d3.timeParse("%Y-%m");
    const formatMonth = d3.timeFormat("%Y-%b"); // 예: "2022-Jan" // Format: "2022-Jan"

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d => formatMonth(parseMonth(d))));

    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).tickFormat(d3.format("$,")));

    // ✅ 범례 생성 
    // Generate legend
    svg.selectAll(".legend").remove();
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);

    categories.forEach((cat, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      g.append("rect").attr("width", 15).attr("height", 15).attr("fill", color(cat));
      g.append("text").attr("x", 20).attr("y", 12).text(cat);
    });
  }
});
