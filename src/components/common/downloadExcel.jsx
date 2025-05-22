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
    if (toast && emptyDataCallback) {
      toast(emptyDataCallback());
    }
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.addRow([`${sheetName}`]).font = { bold: true };
  worksheet.addRow([]);

  const headerRow = worksheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "F3F4F6" },
    };
    cell.alignment = { horizontal: "center" };
    cell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
    };
  });

  data.forEach((item) => {
    const row = getRowData(item);
    worksheet.addRow(row);
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
