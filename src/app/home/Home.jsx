import { DASHBOARD_LIST, STOCK_REPORT } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/dashboard/page";
import downloadExcel from "@/components/common/downloadExcel";
import Loader from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getTodayDate } from "@/utils/currentDate";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import DispatchBarChart from "./DispatchBarChart";
import StockTableBoth from "./StockTableBoth";
import StockTableSection from "./StockTableSection";
import { useSelector } from "react-redux";
const tabs = [
  { value: "stock-view", label: "Stock View" },
  { value: "outofstock", label: "Out of Stock" },
  // { value: "dispatch", label: "Stock < 100" },
  { value: "graph", label: "Graph" },
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const Home = () => {
  const containerRef = useRef();
  const currentDate = getTodayDate();
  const token = usetoken();
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedCategoryZero, setSelectedCategoryZero] =
    useState("All Categories");
  const [categories, setCategories] = useState(["All Categories"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryZero, setSearchQueryZero] = useState("");
  const currentDates = new Date();
  const currentYear = currentDates.getFullYear();
  const currentMonthIndex = currentDates.getMonth();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState(months[currentMonthIndex]);
  const singlebranch = useSelector((state) => state.auth.branch_s_unit);
  const doublebranch = useSelector((state) => state.auth.branch_d_unit);
  // const doublebranch ="No"
  const getYears = () => {
    const startYear = 2025;
    const currentYear = new Date().getFullYear();
    const years = [];

    if (currentYear < startYear) {
      return [startYear.toString()];
    }

    for (let year = startYear; year <= currentYear; year++) {
      years.push(year.toString());
    }

    return years;
  };
  const years = getYears();
  const fetchDashboardData = async () => {
    const year_month = `${selectedMonth} ${selectedYear}`;

    const response = await apiClient.post(
      `${DASHBOARD_LIST}`,

      {
        year_month,
      },

      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  };
  const {
    data: dashbordstock,
    isLoading: isLoadingdashboord,
    isError: isErrordashboord,
    refetch: refetchdashboord,
  } = useQuery({
    queryKey: ["dashboardData", selectedYear, selectedMonth],
    queryFn: fetchDashboardData,
  });
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
    isFetching: isLoadingStock,
    isError: isErrorStock,
    refetch: refetchStock,
  } = useQuery({
    queryKey: ["stockData"],
    queryFn: fetchStockData,
  });

  const handleChange = (year, month) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    refetchdashboord();
  };

  useEffect(() => {
    if (stockData && stockData.length > 0) {
      const uniqueCategories = [
        ...new Set(stockData.map((item) => item.item_category)),
      ];
      setCategories(["All Categories", ...uniqueCategories]);
    }
  }, [stockData]);
  //THIS IS STOCK DATA REPORT  IN SMALL SCREEN

  const filteredItems =
    stockData?.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        item?.item_name?.toLowerCase().includes(searchLower) ||
        item?.item_category?.toLowerCase().includes(searchLower) ||
        item?.item_size?.toLowerCase().includes(searchLower) ||
        (item?.openpurch - item?.closesale + (item?.purch - item?.sale))
          .toString()
          .toLowerCase()
          .includes(searchLower);

      const matchesCategory =
        selectedCategory === "All Categories" ||
        item.item_category === selectedCategory;

      return matchesSearch && matchesCategory;
    }) || [];

  const filteredItemsZero = (stockData || []).filter((item) => {
    const searchLower = searchQueryZero.toLowerCase();
    const matchesSearch =
      item?.item_name?.toLowerCase().includes(searchLower) ||
      item?.item_category?.toLowerCase().includes(searchLower) ||
      available.toString().toLowerCase().includes(searchLower);
    const matchesCategory =
      selectedCategoryZero === "All Categories" ||
      item.item_category === selectedCategoryZero;

    return matchesSearch && matchesCategory;
  });

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
  const downloadourofstockCSV = (filteredItemsZero, toast) => {
    if (!filteredItemsZero || filteredItemsZero.length === 0) {
      toast?.({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Item Name", "Category"];
    let showAvailable = false;
    let showBoxPiece = false;

    if (
      (singlebranch === "Yes" && doublebranch === "No") ||
      (singlebranch === "No" && doublebranch === "Yes")
    ) {
      headers.push("Minimum Stock", "Available");
      showAvailable = true;
    } else if (singlebranch === "Yes" && doublebranch === "Yes") {
      headers.push(
        "Minimum Box",
        "Minimum Piece",
        "Available Box",
        "Available Piece"
      );
      showBoxPiece = true;
    }

    const getRowData = (item) => {
      const itemPiece = Number(item?.item_piece) || 1;
      const minimumStock = Number(item?.item_minimum_stock) || 0;

      const openingPurch =
        Number(item.openpurch) * itemPiece + Number(item.openpurch_piece || 0);
      const openingSale =
        Number(item.closesale) * itemPiece + Number(item.closesale_piece || 0);
      const openingPurchR =
        Number(item.openpurchR) * itemPiece +
        Number(item.openpurchR_piece || 0);
      const openingSaleR =
        Number(item.closesaleR) * itemPiece +
        Number(item.closesaleR_piece || 0);
      const opening = openingPurch - openingSale - openingPurchR + openingSaleR;

      const purchase =
        Number(item.purch) * itemPiece + Number(item.purch_piece || 0);
      const purchaseR =
        Number(item.purchR) * itemPiece + Number(item.purchR_piece || 0);
      const sale = Number(item.sale) * itemPiece + Number(item.sale_piece || 0);
      const saleR =
        Number(item.saleR) * itemPiece + Number(item.saleR_piece || 0);

      const total = opening + purchase - purchaseR - sale + saleR;

      if (total < minimumStock) {
        const minimumBox = Math.round(minimumStock / itemPiece);
        const minimumPiece = minimumStock % itemPiece;

        const availableBox = Math.round(total / itemPiece);
        const availablePiece = total % itemPiece;

        const row = [item.item_name || "", item.item_category || ""];

        if (showAvailable) {
          row.push(minimumStock, total);
        } else if (showBoxPiece) {
          row.push(minimumBox, minimumPiece, availableBox, availablePiece);
        }
        // console.log(row,"row data")
        return row;
      }

      // return row;
    };
    console.log("downloadExcel data:", filteredItemsZero);
    console.log("downloadExcel getRowData:", getRowData);

    downloadExcel({
      data: filteredItemsZero,
      sheetName: "Out of Stock",
      headers,
      getRowData,
      fileNamePrefix: "out_of_stock_summary",
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
      <div className=" w-full p-0  md:p-4 sm:grid grid-cols-1">
        <>
          <Tabs defaultValue="stock-view" className="sm:hidden">
            <TabsList className="grid w-full grid-cols-3">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="stock-view">
              <StockTableSection
                title="Stock"
                selectedCategory={selectedCategory}
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
                loading={isLoadingStock}
              />
            </TabsContent>
            <TabsContent value="outofstock">
              <StockTableBoth
                title="Out of Stock"
                selectedCategory={selectedCategoryZero}
                setSelectedCategory={setSelectedCategoryZero}
                searchQuery={searchQueryZero}
                setSearchQuery={setSearchQueryZero}
                filteredItems={filteredItemsZero}
                categories={categories}
                containerRef={containerRef}
                handlePrintPdf={handlePrintPdf}
                print="true"
                downloadCSV={downloadourofstockCSV}
                currentDate={currentDate}
                loading={isLoadingStock}
              />
            </TabsContent>
            <TabsContent value="graph">
              <DispatchBarChart
                title="Monthly Calendar"
                stock={dashbordstock}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                years={years}
                months={months}
                handleChange={handleChange}
                currentYear={currentYear}
                isLoadingdashboord={isLoadingdashboord}
                isErrordashboord={isErrordashboord}
                refetch={refetchdashboord}
                currentMonthIndex={currentMonthIndex}
              />
            </TabsContent>
          </Tabs>
        </>

        <>
          <div className="hidden sm:block rounded-md border max-h-[500px] overflow-y-auto mb-4">
            <DispatchBarChart
              title="Monthly Calendar"
              stock={dashbordstock}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              years={years}
              months={months}
              handleChange={handleChange}
              currentYear={currentYear}
              isLoadingdashboord={isLoadingdashboord}
              isErrordashboord={isErrordashboord}
              refetch={refetchdashboord}
              currentMonthIndex={currentMonthIndex}
            />
          </div>
          <div className="hidden sm:block rounded-md  border max-h-[500px] overflow-y-auto mb-4">
            <StockTableBoth
              title="Out of Stock"
              selectedCategory={selectedCategoryZero}
              setSelectedCategory={setSelectedCategoryZero}
              searchQuery={searchQueryZero}
              setSearchQuery={setSearchQueryZero}
              filteredItems={filteredItemsZero}
              categories={categories}
              containerRef={containerRef}
              handlePrintPdf={handlePrintPdf}
              print="true"
              downloadCSV={downloadourofstockCSV}
              currentDate={currentDate}
              loading={isLoadingStock}
            />
          </div>
        </>
      </div>
    </Page>
  );
};

export default Home;
