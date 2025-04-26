// Chocolate_Sales.csv 데이터 불러오기 및 전처리
d3.csv("Chocolate Sales.csv", d => ({
    SalesPerson: d["Sales Person"],
    Country: d.Country,
    Product: d.Product,
    Date: d3.timeParse("%d-%b-%y")(d.Date.trim()),
    Amount: +d.Amount.replace(/[\$,]/g, ""),
    BoxesShipped: +d["Boxes Shipped"]
  })).then(data => {
    console.log("Parsed Data:", data);
  
    // 여기서부터 차례대로 함수 호출 예정
    createDataTable(data);
    createAreaChart(data);
    createBarChart(data);
  
    // 상태관리 객체(appState)도 나중에 추가
  });
  