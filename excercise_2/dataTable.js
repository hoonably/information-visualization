// dataTable.js

let tableSelection;

function createDataTable(data) {
  // 테이블 구조 만들기
  const table = d3.select("#data-table").append("table").attr("class", "data-table");
  const thead = table.append("thead");
  const tbody = table.append("tbody");
  tableSelection = tbody;

  // 헤더 정의
  thead.append("tr")
    .selectAll("th")
    .data(["SalesPerson", "Country", "Product", "Date", "Amount", "BoxesShipped"])
    .enter()
    .append("th")
    .text(d => d);

  // 초기 테이블 렌더링
  updateDataTable({ allData: data, timeRange: null, selectedProduct: null, selectedRows: [] });
}

function updateDataTable(state) {
  let filtered = state.allData;

  // 시간 필터 적용
  if (state.timeRange) {
    filtered = filtered.filter(d => d.Date >= state.timeRange[0] && d.Date <= state.timeRange[1]);
  }

  // 제품 필터 적용
  if (state.selectedProduct) {
    filtered = filtered.filter(d => d.Product === state.selectedProduct);
  }

  // 기존 행 삭제 후 다시 그리기
  const rows = tableSelection.selectAll("tr")
    .data(filtered, d => d.Date + d.SalesPerson)
    .join(
      enter => {
        const tr = enter.append("tr");
        tr.append("td").text(d => d.SalesPerson);
        tr.append("td").text(d => d.Country);
        tr.append("td").text(d => d.Product);
        tr.append("td").text(d => d3.timeFormat("%Y-%m-%d")(d.Date));
        tr.append("td").text(d => `$${d.Amount.toFixed(2)}`);
        tr.append("td").text(d => d.BoxesShipped);
        return tr;
      },
      update => update,
      exit => exit.remove()
    );

  // 선택된 행 상태 업데이트
  state.updateSelectedRows(filtered);
}
