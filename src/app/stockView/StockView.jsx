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
import { useSelector } from "react-redux";
import { useToast } from "@/hooks/use-toast";
import downloadExcel from "@/components/common/downloadExcel";

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
  const token = usetoken();
  const { toast } = useToast();
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
        size: A4;
        margin: 5mm;
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
      if (toast) {
        toast({
          title: "No Data",
          description: "No data available to export",
          variant: "destructive",
        });
      }
      return;
    }

    // 1. Determine headers
    const headers = ["Item Name", "Category", "Size"];
    let showAvailable = false;
    let showBoxPiece = false;

    if (
      (singlebranch == "Yes" && doublebranch == "No") ||
      (singlebranch == "No" && doublebranch == "Yes")
    ) {
      headers.push("Available");
      showAvailable = true;
    } else if (singlebranch === "Yes" && doublebranch === "Yes") {
      headers.push("Available Box", "Available Piece");
      showBoxPiece = true;
    }

    // 2. Define row data logic
    const getRowData = (item) => {
      const itemPiece = Number(item.item_piece) || 1;
      const total =
        Number(item.openpurch) -
        Number(item.closesale) +
        (Number(item.purch) - Number(item.sale)) * itemPiece +
        Number(item.openpurch_piece) -
        Number(item.closesale_piece) +
        (Number(item.purch_piece) - Number(item.sale_piece));

      const box = Math.floor(total / itemPiece);
      const piece = total % itemPiece;

      const row = [
        item.item_name || "",
        item.item_category || "",
        item.item_size || "",
      ];

      if (showAvailable) {
        row.push(total);
      } else if (showBoxPiece) {
        row.push(box, piece);
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
            title="Stock View "
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
