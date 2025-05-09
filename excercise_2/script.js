// script.js

import { createAreaChart, updateAreaChart } from './areaChart.js';
import { createBarChart, updateBarChart } from './barChart.js';
import { createDataTable, updateDataTable } from './dataTable.js';

// 전역 상태 객체
export const appState = {
  timeRange: null,
  selectedProduct: null,
  selectedRows: [],
  allData: [],

  updateTimeRange(range) {
    this.timeRange = range;
    this.notifyAll();
  },

  updateSelectedProduct(product) {
    this.selectedProduct = product;
    this.notifyAll();
  },

  updateSelectedRows(rows) {
    this.selectedRows = rows;
  },

  notifyAll() {
    updateAreaChart(this);
    updateBarChart(this);
    updateDataTable(this);
  }
};

// CSV 로드 및 초기화
const parseDate = d3.timeParse("%d-%b-%y");

d3.csv("Chocolate Sales.csv", d => ({
  SalesPerson: d["Sales Person"],
  Country: d.Country,
  Product: d.Product,
  Date: parseDate(d.Date.trim()),
  Amount: +d.Amount.replace(/[$,]/g, ""),
  BoxesShipped: +d["Boxes Shipped"]
})).then(data => {
  console.log("📦 CSV 로드 완료", data);

  appState.allData = data; // 원본 저장

  createAreaChart(data);
  createBarChart(data);
  createDataTable(data);

  d3.select("#reset-button").on("click", () => {
    appState.updateTimeRange(null);
    appState.updateSelectedProduct(null);
    appState.updateSelectedRows([]);
    appState.notifyAll();
  });
});