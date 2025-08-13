import { STOCK_REPORT } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import downloadExcel from "@/components/common/downloadExcel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayDate } from "@/utils/currentDate";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
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
  const singlebranch = useSelector((state) => state.auth.branch_s_unit);
  const doublebranch = useSelector((state) => state.auth.branch_d_unit);
  // const doublebranch = "Yes";
  const columnVisibility = useSelector((state) => state.columnVisibility);
  console.log(doublebranch, singlebranch);
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
    // return response.data.stock;
    const sortedStock = response.data.stock.sort((a, b) => {
      const numA = parseFloat(a.item_name) || 0;
      const numB = parseFloat(b.item_name) || 0;

      if (numA !== numB) {
        return numA - numB;
      }
      return a.item_name.localeCompare(b.item_name);
    });

    return sortedStock;
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

  // useEffect(() => {
  //   if (stockData && stockData.length > 0) {
  //     const uniqueCategories = [
  //       ...new Set(stockData.map((item) => item.item_category)),
  //     ];
  //     const uniqueBrands = [
  //       ...new Set(stockData.map((item) => item.item_brand)),
  //     ];
  //     setBrands(["All Brands", ...uniqueBrands]);
  //     setCategories(["All Categories", ...uniqueCategories]);
  //   }
  // }, [stockData]);
  useEffect(() => {
    if (stockData && stockData.length > 0) {
      const uniqueCategories = [
        ...new Set(stockData.map((item) => item.item_category)),
      ];
      const uniqueBrands = [
        ...new Set(stockData.map((item) => item.item_brand)),
      ];
      const sortedBrands = uniqueBrands
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

      const sortedCategories = uniqueCategories
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

      setBrands(["All Brands", ...sortedBrands]);
      setCategories(["All Categories", ...sortedCategories]);
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
        size: A4;
      }
    
        @media print {
          body {
            font-size: 10px;
            margin: 0;
            padding: 0;
          }
    
          table {
            font-size: 11px;
            border-collapse: collapse;
            width: 100%;
          }
    
          .print-hide {
            display: none !important;
          }
    
          th, td {
            border: 1px solid black;
            padding: 4px;
            text-align: center;
          }
    
          thead {
            background-color: #f0f0f0;
          }
        }
      `,
  });

  const downloadCSV = (filteredItems, toast) => {
    if (!filteredItems || filteredItems.length === 0) {
      toast?.({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    const headers = [];
    let showAvailable = false;
    let showBoxPiece = false;

    // Push visible headers
    if (columnVisibility?.item_name) headers.push("Item Name");
    if (columnVisibility?.category) headers.push("Category");
    if (columnVisibility?.brand) headers.push("Brand");
    if (columnVisibility?.size) headers.push("Size");

    // Available logic
    const isSingleBranchOnly =
      (singlebranch === "Yes" && doublebranch === "No") ||
      (singlebranch === "No" && doublebranch === "Yes");

    const isDoubleBranch = singlebranch === "Yes" && doublebranch === "Yes";

    if (columnVisibility.available_box) {
      if (isSingleBranchOnly) {
        headers.push("Available");
        showAvailable = true;
      } else if (isDoubleBranch) {
        if (columnVisibility.box) headers.push("Available Box");
        if (columnVisibility.piece) headers.push("Available Piece");
        showBoxPiece = true;
      }
    }

    const getRowData = (item) => {
      const itemPiece = Number(item.item_piece) || 1;

      const openingPurch =
        Number(item.openpurch) * itemPiece + Number(item.openpurch_piece);
      const openingSale =
        Number(item.closesale) * itemPiece + Number(item.closesale_piece);
      const purchase =
        Number(item.purch) * itemPiece + Number(item.purch_piece);
      const sale = Number(item.sale) * itemPiece + Number(item.sale_piece);

      const total = openingPurch - openingSale + (purchase - sale);

      const box = Math.floor(total / itemPiece);
      const piece = total % itemPiece;

      const row = [];
      if (columnVisibility.item_name) row.push(item.item_name || "");
      if (columnVisibility.category) row.push(item.item_category || "");
      if (columnVisibility.brand) row.push(item.item_brand || "");
      if (columnVisibility.size) row.push(item.item_size || "");

      if (columnVisibility.available_box) {
        if (showAvailable) {
          row.push(total);
        } else if (showBoxPiece) {
          if (columnVisibility.box) row.push(box);
          if (columnVisibility.piece) row.push(piece);
        }
      }

      return row;
    };

    downloadExcel({
      data: filteredItems,
      sheetName: "Stock Summary",
      headers,
      getRowData,
      fileNamePrefix: "stock_summary",
      toast,
      emptyDataCallback: () => ({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      }),
    });
  };

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
