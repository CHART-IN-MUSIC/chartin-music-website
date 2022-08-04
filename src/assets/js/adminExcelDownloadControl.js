import $ from "jquery";

const XLSX = require("xlsx");

const excelDownloadBtn = document.getElementById("excel__download-btn");

const init = () => {
  $(() => {
    $("button#excel__download-btn").on("click", function () {
      const adminName = $(this).attr("name");
      const elt = document.getElementById("tableData");
      const wb = XLSX.utils.table_to_book(elt, { sheet: `${adminName}_리스트` });
      return XLSX.writeFile(wb, `${adminName}_리스트.xlsx`);
    });
  });
};

if (excelDownloadBtn) {
  init();
}
