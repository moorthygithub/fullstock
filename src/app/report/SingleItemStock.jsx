import React, { useRef, useState, useMemo } from "react";
import Page from "../dashboard/page";
import { Download, Printer, Search } from "lucide-react";
import { ButtonConfig } from "@/config/ButtonConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/components/loader/Loader";
import { SINGLE_ITEM_STOCK_REPORT } from "@/api";
import { useFetchItems } from "@/hooks/useApi";
import { useReactToPrint } from "react-to-print";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import ExcelJS from "exceljs";
import { RiFileExcel2Line } from "react-icons/ri";
import usetoken from "@/api/usetoken";
import apiClient from "@/api/axios";
import { useSelector } from "react-redux";
const SingleItemStock = () => {
  const containerRef = useRef(null);
  const [formData, setFormData] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),

    to_date: moment().format("YYYY-MM-DD"),
    item_name: "",
  });
  const singlebranch = useSelector((state) => state.auth.branch_s_unit);
  const doublebranch = useSelector((state) => state.auth.branch_d_unit);
  // const doublebranch = "No";
  const { toast } = useToast();
  const token = usetoken();

  const handleInputChange = (field, e) => {
    const value = e.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.item_name) {
      toast({
        title: "Missing Information",
        description: "Please select an item name",
        variant: "destructive",
      });
      return;
    }
    refetch();
  };

  const fetchSingleItemStock = async () => {
    const response = await apiClient.post(
      `${SINGLE_ITEM_STOCK_REPORT}`,
      { ...formData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  };

  const {
    data: reportData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["singleItemStockData", formData],
    queryFn: fetchSingleItemStock,
    enabled: false,
  });

  const { data: itemsData } = useFetchItems();

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Single_Item_Stock",
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 5mm;
      }
      @media print {
        body {
          font-size: 10px; 
          margin: 0mm;
          padding: 0mm;
        }
        table {
          font-size: 11px;
        }
        .print-hide {
          display: none;
        }
      }
    `,
  });
  // const downloadExcel = async () => {
  //   if (!reportData) {
  //     toast({
  //       title: "No Data",
  //       description: "No data available to export",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet("Single Item Stock");

  //   const stock = reportData.stock[0];

  //   // Title Rows
  //   worksheet.addRow([`Stock Report - ${stock.item_name}`]);
  //   worksheet.addRow([
  //     `From: ${moment(formData.from_date).format("DD-MM-YYYY")} To: ${moment(
  //       formData.to_date
  //     ).format("DD-MM-YYYY")}`,
  //   ]);
  //   worksheet.addRow([]);

  //   // Header rows setup (3 header rows to mimic your table)
  //   // First header row
  //   worksheet.addRow([
  //     "Date",
  //     "Reference",
  //     "Transaction",
  //     "",
  //     "",
  //     "",
  //     "",
  //     "",
  //     "",
  //     "",
  //     // 8 columns for Transaction spanning 8 cols
  //     "Balance",
  //     "",
  //   ]);
  //   worksheet.mergeCells("C4:J4"); // Transaction - colSpan=8
  //   worksheet.mergeCells("K1:L2");
  //   worksheet.addRow([
  //     "",
  //     "",
  //     "Inward",
  //     "",
  //     "Inward Return",
  //     "",
  //     "Outward",
  //     "",
  //     "Outward Return",
  //     "",
  //     "",
  //     "",
  //   ]);
  //   // Merge cells under Transaction groups
  //   worksheet.mergeCells("C5:D5"); // Inward colSpan=2
  //   worksheet.mergeCells("E5:F5"); // Inward Return colSpan=2
  //   worksheet.mergeCells("G5:H5"); // Outward colSpan=2
  //   worksheet.mergeCells("I5:J5"); // Outward Return colSpan=2

  //   // Third header row (Box and Pc under each group)
  //   worksheet.addRow([
  //     "",
  //     "",
  //     "Box",
  //     "Pc",
  //     "Box",
  //     "Pc",
  //     "Box",
  //     "Pc",
  //     "Box",
  //     "Pc",
  //     "Box",
  //     "Pc",
  //   ]);

  //   // Style all header rows (rows 4,5,6)
  //   [4, 5, 6].forEach((rowNumber) => {
  //     const row = worksheet.getRow(rowNumber);
  //     row.eachCell((cell) => {
  //       cell.font = { bold: true };
  //       cell.fill = {
  //         type: "pattern",
  //         pattern: "solid",
  //         fgColor: { argb: "F3F4F6" },
  //       };
  //       cell.alignment = { horizontal: "center", vertical: "middle" };
  //       cell.border = {
  //         top: { style: "thin" },
  //         left: { style: "thin" },
  //         bottom: { style: "thin" },
  //         right: { style: "thin" },
  //       };
  //     });
  //   });

  //   // Opening Stock Row (row 7)
  //   const openingRowValues = [
  //     moment(formData.from_date).format("DD MMM YYYY"),
  //     "Opening Stock",
  //   ];

  //   if (singlebranch === "Yes" && doublebranch === "Yes") {
  //     openingRowValues.push(
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       openingStock?.box || "",
  //       openingStock?.piece || ""
  //     );
  //   } else {
  //     openingRowValues.push(
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       openingStock?.box || "",
  //       ""
  //     );
  //   }
  //   worksheet.addRow(openingRowValues);

  //   transactions.forEach((transaction) => {
  //     const rowVals = [
  //       moment(transaction.date).format("DD MMM YYYY"),
  //       transaction.ref,
  //     ];

  //     if (singlebranch === "Yes" && doublebranch === "Yes") {
  //       // Inward
  //       rowVals.push(
  //         transaction.type === "purchase" ? transaction.boxes : "",
  //         transaction.type === "purchase" ? transaction.piece : ""
  //       );
  //       // Inward Return
  //       rowVals.push(
  //         transaction.type === "purchasereturn" ? transaction.boxes : "",
  //         transaction.type === "purchasereturn" ? transaction.piece : ""
  //       );
  //       // Outward
  //       rowVals.push(
  //         transaction.type === "sale" ? transaction.boxes : "",
  //         transaction.type === "sale" ? transaction.piece : ""
  //       );
  //       // Outward Return
  //       rowVals.push(
  //         transaction.type === "salereturn" ? transaction.boxes : "",
  //         transaction.type === "salereturn" ? transaction.piece : ""
  //       );
  //       // Balance
  //       rowVals.push(
  //         transaction.balance?.box ?? "",
  //         transaction.balance?.piece ?? ""
  //       );
  //     } else {
  //       // Single branch or box only (no piece columns)
  //       rowVals.push(
  //         transaction.type === "purchase" ? transaction.boxes : "",
  //         "", // placeholder for pc col removed, so colspan merges
  //         transaction.type === "purchasereturn" ? transaction.boxes : "",
  //         "",
  //         transaction.type === "sale" ? transaction.boxes : "",
  //         "",
  //         transaction.type === "salereturn" ? transaction.boxes : "",
  //         "",
  //         transaction.balance?.box ?? "",
  //         ""
  //       );
  //     }
  //     worksheet.addRow(rowVals);
  //   });

  //   // Closing Stock row (last row)
  //   const closingRowValues = [
  //     moment(formData.to_date).format("DD MMM YYYY"),
  //     "Closing Stock",
  //   ];

  //   if (singlebranch === "Yes" && doublebranch === "Yes") {
  //     closingRowValues.push(
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       total?.box ?? "",
  //       total?.piece ?? ""
  //     );
  //   } else {
  //     closingRowValues.push(
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       "",
  //       total?.box ?? "",
  //       ""
  //     );
  //   }
  //   const closingRow = worksheet.addRow(closingRowValues);

  //   // Style Closing row bold
  //   closingRow.eachCell((cell) => {
  //     cell.font = { bold: true };
  //   });

  //   // Adjust columns width for readability
  //   worksheet.columns = [
  //     { width: 14 }, // Date
  //     { width: 20 }, // Reference
  //     { width: 8 },
  //     { width: 6 }, // Inward Box, Pc
  //     { width: 8 },
  //     { width: 6 }, // Inward Return Box, Pc
  //     { width: 8 },
  //     { width: 6 }, // Outward Box, Pc
  //     { width: 8 },
  //     { width: 6 }, // Outward Return Box, Pc
  //     { width: 8 },
  //     { width: 6 },
  //     { width: 6 }, // Balance Box, Pc
  //   ];

  //   // Final save/export
  //   const buffer = await workbook.xlsx.writeBuffer();
  //   const blob = new Blob([buffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = `single_item_stock_${stock.item_name}_${moment().format(
  //     "YYYYMMDD"
  //   )}.xlsx`;
  //   link.click();
  //   URL.revokeObjectURL(url);
  // };
  const downloadExcel = async () => {
    if (!reportData) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Single Item Stock");

    const stock = reportData.stock[0];

    // Title rows
    worksheet.addRow([`Stock Report - ${stock.item_name}`]);
    worksheet.addRow([
      `From: ${moment(formData.from_date).format("DD-MM-YYYY")} To: ${moment(
        formData.to_date
      ).format("DD-MM-YYYY")}`,
    ]);
    worksheet.addRow([]);

    const isYesYes = singlebranch === "Yes" && doublebranch === "Yes";

    if (isYesYes) {
      worksheet.addRow([
        "Date",
        "Reference",
        "Transaction",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "Balance",
        "",
      ]);
      worksheet.mergeCells("C4:J4");
      worksheet.mergeCells("K4:L4");
      worksheet.addRow([
        "",
        "",
        "Inward",
        "",
        "Inward Return",
        "",
        "Outward",
        "",
        "Outward Return",
        "",
        "",
        "",
      ]);
      worksheet.mergeCells("C5:D5");
      worksheet.mergeCells("E5:F5");
      worksheet.mergeCells("G5:H5");
      worksheet.mergeCells("I5:J5");

      worksheet.addRow([
        "",
        "",
        "Box",
        "Pc",
        "Box",
        "Pc",
        "Box",
        "Pc",
        "Box",
        "Pc",
        "Box",
        "Pc",
      ]);

      [4, 5, 6].forEach((rowNumber) => {
        const row = worksheet.getRow(rowNumber);
        row.eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F3F4F6" },
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });
    } else {
      worksheet.addRow([
        "Date",
        "Reference",
        "Transaction",
        "",
        "",
        "",
        "Balance",
      ]);
      worksheet.mergeCells("C4:F4");

      worksheet.addRow([
        "",
        "",
        "Inward",
        "Inward Return",
        "Outward",
        "Outward Return",
        "",
      ]);
      const headerRow = worksheet.getRow(4);
      [4, 5].forEach((rowNumber) => {
        const row = worksheet.getRow(rowNumber);
        row.eachCell((cell) => {
          cell.font = { bold: true };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F3F4F6" },
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });
    }

    const openingRow = [
      moment(formData.from_date).format("DD MMM YYYY"),
      "Opening Stock",
    ];

    if (isYesYes) {
      openingRow.push(
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        openingStock?.box || "",
        openingStock?.piece || ""
      );
    } else {
      openingRow.push("", "", "", "", openingStock?.box || "");
    }

    worksheet.addRow(openingRow);

    transactions.forEach((transaction) => {
      const row = [
        moment(transaction.date).format("DD MMM YYYY"),
        transaction.ref,
      ];

      if (isYesYes) {
        row.push(
          transaction.type === "purchase" ? transaction.boxes : "",
          transaction.type === "purchase" ? transaction.piece : "",
          transaction.type === "purchasereturn" ? transaction.boxes : "",
          transaction.type === "purchasereturn" ? transaction.piece : "",
          transaction.type === "sale" ? transaction.boxes : "",
          transaction.type === "sale" ? transaction.piece : "",
          transaction.type === "salereturn" ? transaction.boxes : "",
          transaction.type === "salereturn" ? transaction.piece : "",
          transaction.balance?.box ?? "",
          transaction.balance?.piece ?? ""
        );
      } else {
        row.push(
          transaction.type === "purchase" ? transaction.boxes : "",
          transaction.type === "purchasereturn" ? transaction.boxes : "",
          transaction.type === "sale" ? transaction.boxes : "",
          transaction.type === "salereturn" ? transaction.boxes : "",
          transaction.balance?.box ?? ""
        );
      }

      worksheet.addRow(row);
    });

    const closingRow = [
      moment(formData.to_date).format("DD MMM YYYY"),
      "Closing Stock",
    ];

    if (isYesYes) {
      closingRow.push(
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        total?.box ?? "",
        total?.piece ?? ""
      );
    } else {
      closingRow.push("", "", "", "", total?.box ?? "");
    }

    const finalRow = worksheet.addRow(closingRow);
    finalRow.eachCell((cell) => {
      cell.font = { bold: true };
    });

    worksheet.columns = isYesYes
      ? [
          { width: 14 },
          { width: 20 },
          { width: 8 },
          { width: 6 },
          { width: 8 },
          { width: 6 },
          { width: 8 },
          { width: 6 },
          { width: 8 },
          { width: 6 },
          { width: 8 },
          { width: 6 },
        ]
      : [
          { width: 14 },
          { width: 20 },
          { width: 12 },
          { width: 16 },
          { width: 12 },
          { width: 16 },
          { width: 14 },
        ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `single_item_stock_${stock.item_name}_${moment().format(
      "YYYYMMDD"
    )}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const { openingStock, closingStock, transactions, itemDetails, total } =
    useMemo(() => {
      if (!reportData) {
        return {
          openingStock: 0,
          closingStock: 0,
          transactions: [],
          itemDetails: null,
        };
      }
      const stock = reportData?.stock[0];
      const itemPiece = Number(stock.item_piece) || 1;
      const openingPurch =
        Number(stock.openpurch) * itemPiece + Number(stock.openpurch_piece);
      const openingSale =
        Number(stock.closesale) * itemPiece + Number(stock.closesale_piece);
      const openingPurchR =
        Number(stock.openpurchR) * itemPiece + Number(stock.openpurchR_piece);
      const openingSaleR =
        Number(stock.closesaleR) * itemPiece + Number(stock.closesaleR_piece);

      const openingStockes =
        openingPurch - openingSale - openingPurchR + openingSaleR;
      const purchase =
        Number(stock.purch) * itemPiece + Number(stock.purch_piece);
      const purchaseR =
        Number(stock.purchR) * itemPiece + Number(stock.purchR_piece);
      const sale = Number(stock.sale) * itemPiece + Number(stock.sale_piece);
      const saleR = Number(stock.saleR) * itemPiece + Number(stock.saleR_piece);

      const totals = openingStockes + purchase - purchaseR - sale + saleR;

      const toBoxPiece = (val) => ({
        box: Math.floor(val / itemPiece),
        piece: val % itemPiece,
      });
      const openingStock = toBoxPiece(openingStockes);
      const total = toBoxPiece(totals);
      const purchaseTransactions =
        reportData?.purchase?.map((p) => {
          const purchase =
            (p?.purchase_sub_box ?? 0) + (p?.purchase_sub_piece ?? 0);

          const purchaseBP = toBoxPiece(purchase);

          return {
            date: p?.purchase_date,
            ref: `P-${(p?.purchase_ref || "").split("-").pop() || ""}`,
            boxes: purchaseBP.box,
            piece: purchaseBP.piece,
            type: "purchase",
            rawDate: new Date(p?.purchase_date),
          };
        }) || [];

      const purchaseReturnTransactions =
        reportData?.purchaseR?.map((p) => {
          const purchasereturn =
            (p?.purchase_sub_box ?? 0) + (p?.purchase_sub_piece ?? 0);

          const purchaseBPR = toBoxPiece(purchasereturn);
          return {
            date: p?.purchase_date,
            ref: `PR-${(p?.purchase_ref || "").split("-").pop() || ""}`,
            boxes: purchaseBPR.box,
            piece: purchaseBPR.piece,
            type: "purchasereturn",
            rawDate: new Date(p?.purchase_date),
          };
        }) || [];

      const saleTransactions =
        reportData?.sale?.map((s) => {
          // const dispatch = s?.dispatch_sub_box + s?.dispatch_sub_piece ?? 0;
          const dispatch =
            (s?.dispatch_sub_box ?? 0) + (s?.dispatch_sub_piece ?? 0);
          const dispatchBP = toBoxPiece(dispatch);
          return {
            date: s?.dispatch_date,
            ref: `S-${(s?.dispatch_ref || "").split("-").pop() || ""}`,
            boxes: dispatchBP?.box,
            piece: dispatchBP.piece,
            type: "sale",
            rawDate: new Date(s?.dispatch_date),
          };
        }) || [];

      const saleReturnTransactions =
        reportData?.saleR?.map((s) => {
          // const dispatchreturn =
          //   s?.dispatch_sub_box + s?.dispatch_sub_piece ?? 0;
          const dispatchreturn =
            (s?.dispatch_sub_box ?? 0) + (s?.dispatch_sub_piece ?? 0);
          const dispatchBPR = toBoxPiece(dispatchreturn);
          return {
            date: s?.dispatch_date,
            ref: `SR-${(s?.dispatch_ref || "").split("-").pop() || ""}`,
            boxes: dispatchBPR?.box,
            piece: dispatchBPR.piece,
            type: "salereturn",
            rawDate: new Date(s?.dispatch_date),
          };
        }) || [];

      // Combine all transactions
      const allTransactions = [
        ...purchaseTransactions,
        ...purchaseReturnTransactions,
        ...saleTransactions,
        ...saleReturnTransactions,
      ].sort((a, b) => a.rawDate - b.rawDate);

      function addStock(stock, toAdd) {
        const totalPcs =
          stock.box * itemPiece +
          stock.piece +
          (toAdd.boxes * itemPiece + (toAdd.piece || 0));
        return {
          box: Math.floor(totalPcs / itemPiece),
          piece: totalPcs % itemPiece,
        };
      }

      function subtractStock(stock, toSubtract) {
        const totalPcs =
          stock.box * itemPiece +
          stock.piece -
          (toSubtract.boxes * itemPiece + (toSubtract.piece || 0));
        return {
          box: Math.floor(totalPcs / itemPiece),
          piece: totalPcs % itemPiece,
        };
      }

      const fromDate = new Date(formData.from_date);
      const toDate = new Date(formData.to_date);
      let runningBalance = { ...openingStock };
      allTransactions.forEach((t) => {
        if (t.rawDate < fromDate) {
          if (t.type === "purchase" || t.type === "salereturn") {
            runningBalance = addStock(runningBalance, t);
          } else if (t.type === "purchasereturn" || t.type === "sale") {
            runningBalance = subtractStock(runningBalance, t);
          }
        }
      });
      const filteredTransactions = [];

      allTransactions.forEach((t) => {
        if (t.rawDate >= fromDate && t.rawDate <= toDate) {
          if (t.type === "purchase" || t.type === "salereturn") {
            runningBalance = addStock(runningBalance, t);
          } else if (t.type === "purchasereturn" || t.type === "sale") {
            runningBalance = subtractStock(runningBalance, t);
          }

          filteredTransactions.push({
            ...t,
            balance: { ...runningBalance },
          });
        }
      });
      const closingStock = runningBalance;
      return {
        openingStock,
        closingStock,
        total,
        transactions: filteredTransactions,
        itemDetails: stock,
      };
    }, [reportData, formData.from_date, formData.to_date]);
  const formatQuantity = (box, piece) => {
    if (singlebranch === "Yes" && doublebranch === "Yes") {
      return `${box} Box, ${piece} Pc`;
    }
    return `${box} Box`;
  };
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      );
    }

    if (isError) {
      return (
        <Card className="w-full max-w-md mx-auto mt-6">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Stock Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Unable to retrieve stock information. Please try again.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (reportData) {
      const stock = reportData?.stock[0];
      return (
        <div ref={containerRef} className="mt-4">
          <div className="bg-white rounded-lg shadow-sm p-0 md:p-4">
            <h2 className="text-lg font-bold mb-4">
              Stock Transactions - {stock?.item_name}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-[11px]">
                <thead className="bg-gray-100 text-[11px]">
                  <tr>
                    <th
                      rowSpan="3"
                      className="border border-gray-300 px-2 py-2 text-left w-[120px]"
                    >
                      Date
                    </th>
                    <th
                      rowSpan="3"
                      className="border border-gray-300 px-2 py-2 text-left"
                    >
                      Reference
                    </th>
                    <th
                      colSpan="8"
                      className="border border-gray-300 px-2 py-2 text-center"
                    >
                      Transaction
                    </th>
                    <th
                      colSpan="3"
                      rowSpan="2"
                      className="border border-gray-300 px-2 py-2 text-center"
                    >
                      Balance
                    </th>
                  </tr>
                  <tr>
                    <th
                      colSpan="2"
                      className="border border-gray-300 px-2 py-2 text-center"
                    >
                      Inward
                    </th>
                    <th
                      colSpan="2"
                      className="border border-gray-300 px-2 py-2 text-center"
                    >
                      Inward Return
                    </th>
                    <th
                      colSpan="2"
                      className="border border-gray-300 px-2 py-2 text-center"
                    >
                      Outward
                    </th>
                    <th
                      colSpan="2"
                      className="border border-gray-300 px-2 py-2 text-center"
                    >
                      Outward Return
                    </th>
                  </tr>
                  {singlebranch === "Yes" && doublebranch === "Yes" && (
                    <tr>
                      <th className="border border-gray-300 px-2 py-2 text-center">
                        Box
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center">
                        Pc
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center">
                        Box
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center">
                        Pc
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center">
                        Box
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center">
                        Pc
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center">
                        Box
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center">
                        Pc
                      </th>

                      <th className="border border-gray-300 px-2 py-2 text-center">
                        Box
                      </th>
                      <th className="border border-gray-300 px-2 py-2 text-center">
                        Pc
                      </th>
                    </tr>
                  )}
                </thead>

                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1 font-medium">
                      {moment(formData.from_date).format("DD MMM YYYY")}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      Opening Stock
                    </td>

                    {singlebranch === "Yes" && doublebranch === "Yes" ? (
                      <>
                        <td
                          className="border border-gray-300 px-2 py-1 text-right font-medium"
                          colSpan={9}
                        >
                          {openingStock?.box ?? ""}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right font-medium">
                          {openingStock?.piece ?? ""}
                        </td>
                      </>
                    ) : (
                      <>
                        <td
                          className="border border-gray-300 px-2 py-1 text-right font-medium"
                          colSpan={9}
                        >
                          {openingStock?.box ?? ""}
                        </td>
                      </>
                    )}
                  </tr>

                  {transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-2 py-1 font-medium">
                        {moment(transaction.date).format("DD MMM YYYY")}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {transaction.ref}
                      </td>

                      {singlebranch === "Yes" && doublebranch === "Yes" ? (
                        <>
                          <td className="border border-gray-300 px-2 py-1 text-right">
                            {transaction.type === "purchase"
                              ? transaction.boxes
                              : ""}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-right">
                            {transaction.type === "purchase"
                              ? transaction.piece
                              : ""}
                          </td>

                          <td className="border border-gray-300 px-2 py-1 text-right">
                            {transaction.type === "purchasereturn"
                              ? transaction.boxes
                              : ""}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-right">
                            {transaction.type === "purchasereturn"
                              ? transaction.piece
                              : ""}
                          </td>

                          <td className="border border-gray-300 px-2 py-1 text-right">
                            {transaction.type === "sale"
                              ? transaction.boxes
                              : ""}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-right">
                            {transaction.type === "sale"
                              ? transaction.piece
                              : ""}
                          </td>

                          <td className="border border-gray-300 px-2 py-1 text-right">
                            {transaction.type === "salereturn"
                              ? transaction.boxes
                              : ""}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-right">
                            {transaction.type === "salereturn"
                              ? transaction.piece
                              : ""}
                          </td>

                          <td className="border border-gray-300 px-2 py-1 text-right font-medium">
                            {transaction.balance?.box ?? ""}
                          </td>
                          <td className="border border-gray-300 px-2 py-1 text-right font-medium">
                            {transaction.balance?.piece ?? ""}
                          </td>
                        </>
                      ) : (
                        <>
                          <td
                            className="border border-gray-300 px-2 py-1 text-right"
                            colSpan={2}
                          >
                            {transaction.type === "purchase"
                              ? transaction.boxes
                              : ""}
                          </td>
                          <td
                            className="border border-gray-300 px-2 py-1 text-right"
                            colSpan={2}
                          >
                            {transaction.type === "purchasereturn"
                              ? transaction.boxes
                              : ""}
                          </td>
                          <td
                            className="border border-gray-300 px-2 py-1 text-right"
                            colSpan={2}
                          >
                            {transaction.type === "sale"
                              ? transaction.boxes
                              : ""}
                          </td>
                          <td
                            className="border border-gray-300 px-2 py-1 text-right"
                            colSpan={2}
                          >
                            {transaction.type === "salereturn"
                              ? transaction.boxes
                              : ""}
                          </td>

                          <td
                            className="border border-gray-300 px-2 py-1 text-right font-medium"
                            colSpan={2}
                          >
                            {transaction.balance?.box ?? ""}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}

                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1 font-medium">
                      {moment(formData.to_date).format("DD MMM YYYY")}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      Closing Stock
                    </td>

                    {singlebranch === "Yes" && doublebranch === "Yes" ? (
                      <>
                        <td
                          className="border border-gray-300 px-2 py-1 text-right font-bold"
                          colSpan={9}
                        >
                          {total?.box ?? ""}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right font-bold">
                          {total?.piece ?? ""}
                        </td>
                      </>
                    ) : (
                      <>
                        <td
                          className="border border-gray-300 px-2 py-1 text-right font-bold"
                          colSpan={9}
                        >
                          {total?.box ?? ""}
                        </td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Search className="h-12 w-12 mb-2 opacity-30" />
        <p className="text-md">Search for an item to view stock details</p>
      </div>
    );
  };

  return (
    <Page>
      <div className="p-0 md:p-4">
        <div className="sm:hidden">
          <div
            className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h1 className="text-base font-bold text-gray-800 px-2">
                  Single Item Stock
                </h1>
                <div className="flex gap-[2px]">
                  <button
                    className={` sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md `}
                    onClick={downloadExcel}
                  >
                    <RiFileExcel2Line className="h-3 w-3 " />
                  </button>
                  <button
                    className={` sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md `}
                    onClick={handlePrintPdf}
                  >
                    <Printer className="h-3 w-3 " />
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-white p-2 rounded-md shadow-xs"
              >
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="space-y-1">
                    <Input
                      type="date"
                      value={formData.from_date}
                      className="text-xs h-7"
                      onChange={(e) => handleInputChange("from_date", e)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="date"
                      value={formData.to_date}
                      className="text-xs h-7"
                      onChange={(e) => handleInputChange("to_date", e)}
                    />
                  </div>

                  <div className="space-y-1">
                    <MemoizedSelect
                      value={formData.item_name}
                      onChange={(e) => handleInputChange("item_name", e)}
                      options={
                        itemsData?.items?.map((product) => ({
                          value: product.item_name,
                          label: product.item_name,
                        })) || []
                      }
                      placeholder="Select Item"
                      className="text-xs h-7 flex-1"
                    />
                  </div>
                  <div className="space-y-1">
                    <Button
                      type="submit"
                      size="sm"
                      className={`h-9 w-full ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                    >
                      <Search className="h-3 w-3 mr-1" /> Search
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="hidden sm:block">
          <div
            className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="lg:w-64 xl:w-72 shrink-0">
                <h1 className="text-xl font-bold text-gray-800 truncate">
                  Single Item Stock
                </h1>
                <p className="text-md text-gray-500 truncate">
                  View item stock transactions
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-white p-3 rounded-md shadow-xs  "
              >
                <div className="flex flex-col lg:flex-col lg:items-end gap-3  ">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1  items-center">
                    <div className="space-y-1 ">
                      <label
                        className={`text-xs ${ButtonConfig.cardLabel} block`}
                      >
                        From Date
                      </label>
                      <Input
                        type="date"
                        value={formData.from_date}
                        className="text-xs h-8 w-full"
                        onChange={(e) => handleInputChange("from_date", e)}
                      />
                    </div>
                    <div className="space-y-1 ">
                      <label
                        className={`text-xs ${ButtonConfig.cardLabel} block`}
                      >
                        To Date
                      </label>
                      <Input
                        type="date"
                        value={formData.to_date}
                        className="text-xs h-8 w-full"
                        onChange={(e) => handleInputChange("to_date", e)}
                      />
                    </div>
                    <div className="space-y-1 ">
                      <label
                        className={`text-xs ${ButtonConfig.cardLabel} block`}
                      >
                        Item
                      </label>
                      <MemoizedSelect
                        value={formData.item_name}
                        onChange={(e) => handleInputChange("item_name", e)}
                        options={
                          itemsData?.items?.map((product) => ({
                            value: product.item_name,
                            label: product.item_name,
                          })) || []
                        }
                        placeholder="Select Item"
                        className="text-xs h-8 w-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2  ">
                    <Button
                      type="submit"
                      size="sm"
                      className={`h-8 w-24 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                    >
                      <Search className="h-3 w-3 mr-1" /> Search
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 w-24"
                      onClick={handlePrintPdf}
                    >
                      <Printer className="h-3 w-3 mr-1" /> Print
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 w-24"
                      onClick={downloadExcel}
                    >
                      <RiFileExcel2Line className="h-3 w-3 mr-1" /> Excel
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </Page>
  );
};

export default SingleItemStock;
