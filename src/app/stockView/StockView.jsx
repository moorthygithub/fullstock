import { STOCK_REPORT } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayDate } from "@/utils/currentDate";
import { useQuery } from "@tanstack/react-query";
import ExcelJS from "exceljs";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import Page from "../dashboard/page";
import StockTableSection from "../home/StockTableSection";

const StockView = () => {
  const containerRef = useRef();
  const currentDate = getTodayDate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [categories, setCategories] = useState(["All Categories"]);
  const [brands, setBrands] = useState(["All Brands"]);
  const [selectedBrands, setSelectedBrands] = useState("All Brands");
  const token = usetoken();

  const fetchStockData = async () => {
    const response = await apiClient.post(
      `${STOCK_REPORT}`,
      {
        from_date: "2024-01-01",
        to_date: currentDate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.stock;
  };

  const {
    data: stockData,
    isFetching,
    isError: isErrorStock,
    refetch: refetchStock,
  } = useQuery({
    queryKey: ["stockData"],
    queryFn: fetchStockData,
  });

  useEffect(() => {
    if (stockData && stockData.length > 0) {
      const uniqueCategories = [
        ...new Set(stockData.map((item) => item.item_category)),
      ];
      const uniqueBrands = [
        ...new Set(stockData.map((item) => item.item_brand)),
      ];
      setBrands(["All Brands", ...uniqueBrands]);
      setCategories(["All Categories", ...uniqueCategories]);
    }
  }, [stockData]);

  const filteredItems =
    stockData?.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item?.item_name?.toLowerCase().includes(searchLower) ||
        item?.item_category?.toLowerCase().includes(searchLower) ||
        item?.item_size?.toLowerCase().includes(searchLower) ||
        (item.openpurch - item.closesale + (item.purch - item.sale))
          .toString()
          .toLowerCase()
          .includes(searchLower);

      const matchesCategory =
        selectedCategory === "All Categories" ||
        item.item_category === selectedCategory;
      const matchesBrand =
        selectedBrands === "All Brands" || item.item_brand === selectedBrands;

      return matchesSearch && matchesCategory && matchesBrand;
    }) || [];

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Stock",
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

  const downloadCSV = async (stockData) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Stock Summary");

    // Add headers
    const headers = ["Item Name", "Category", "Size", "Available"];
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: "000000" },
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" }, // Yellow background
      };
      cell.alignment = { horizontal: "center" };
    });

    // Add data rows
    filteredItems.forEach((item) => {
      const row = [
        item.item_name,
        item.item_category,
        item.item_size,
        (
          item.openpurch -
          item.closesale +
          (item.purch - item.sale)
        ).toLocaleString(),
      ];
      worksheet.addRow(row);
    });
    const totalAvailable = filteredItems.reduce(
      (total, item) =>
        total + (item.openpurch - item.closesale + (item.purch - item.sale)),
      0
    );

    // Add total row
    const totalRow = worksheet.addRow([
      "",
      "",
      "Total Available:",
      totalAvailable,
    ]);
    totalRow.eachCell((cell, colNumber) => {
      if (colNumber >= 3) {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D9EAD3" },
        };
      }
    });
    // Generate and download Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stock_summary_${getTodayDate()}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Render error state
  if (isErrorStock) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Home
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetchStock()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <Card className="shadow-sm border-0">
        <CardContent className="p-2">
          <StockTableSection
            title="Stock View"
            selectedCategory={selectedCategory}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredItems={filteredItems}
            categories={categories}
            containerRef={containerRef}
            handlePrintPdf={handlePrintPdf}
            downloadCSV={downloadCSV}
            currentDate={currentDate}
            print="true"
            brands={brands}
            loading={isFetching}
          />
        </CardContent>
      </Card>
    </Page>
  );
};

export default StockView;
