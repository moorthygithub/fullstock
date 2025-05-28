// import ExcelJS from "exceljs";
// import moment from "moment";

// const downloadExcel = async ({
//   data,
//   sheetName = "Report",
//   headers = [],
//   getRowData,
//   fileNamePrefix = "report",
//   emptyDataCallback,
//   toast,
// }) => {
//   if (!data || data.length === 0) {
//     if (toast && emptyDataCallback) {
//       toast(emptyDataCallback());
//     }
//     return;
//   }

//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet(sheetName);

//   worksheet.addRow([`${sheetName}`]).font = { bold: true };
//   worksheet.addRow([]);

//   const headerRow = worksheet.addRow(headers);
//   headerRow.eachCell((cell) => {
//     cell.font = { bold: true };
//     cell.fill = {
//       type: "pattern",
//       pattern: "solid",
//       fgColor: { argb: "F3F4F6" },
//     };
//     cell.alignment = { horizontal: "center" };
//     cell.border = {
//       top: { style: "thin" },
//       bottom: { style: "thin" },
//     };
//   });

//   data.forEach((item) => {
//     const row = getRowData(item);
//     worksheet.addRow(row);
//   });

//   const buffer = await workbook.xlsx.writeBuffer();
//   const blob = new Blob([buffer], {
//     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement("a");
//   link.href = url;
//   link.download = `${fileNamePrefix}_${moment().format("YYYY-MM-DD")}.xlsx`;
//   link.click();
//   URL.revokeObjectURL(url);
// };
// export default downloadExcel;
import ExcelJS from "exceljs";
import moment from "moment";

const downloadExcel = async ({
  data,
  sheetName = "Report",
  headers = [],
  getRowData,
  fileNamePrefix = "report",
  emptyDataCallback,
  toast,
}) => {
  if (!data || data.length === 0) {
    if (toast && emptyDataCallback) toast(emptyDataCallback());
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Title row
  worksheet.addRow([sheetName]).font = { bold: true };
  worksheet.addRow([]);

  // Header row
  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "000000" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFF00" }, 
    };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
    };
  });

  const numericTotals = Array(headers.length).fill(0);

  // Data rows
  data.forEach((item) => {
    const rowData = getRowData(item);
    if (!Array.isArray(rowData)) return;
    worksheet.addRow(rowData);

    rowData.forEach((val, i) => {
      if (typeof val === "number") {
        numericTotals[i] += val;
      }
    });
  });

  // Add total row
  const totalLabelIndex = headers.findIndex((h) => /total|amount/i.test(h));
  const totalRowData = headers.map((_, i) =>
    i === totalLabelIndex
      ? "Total"
      : typeof numericTotals[i] === "number" && numericTotals[i] !== 0
      ? numericTotals[i]
      : ""
  );

  const totalRow = worksheet.addRow(totalRowData);
  totalRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "D9EAD3" },
    };
  });

  worksheet.columns.forEach((col) => {
    col.width = 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileNamePrefix}_${moment().format("YYYY-MM-DD")}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

export default downloadExcel;
