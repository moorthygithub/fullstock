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
import SalesBarChart from "./SalesBarChart";
import StockTableBoth from "./StockTableBoth";
import StockTableSection from "./StockTableSection";
const tabs = [
  { value: "stock-view", label: "Stock View" },
  { value: "purchase", label: "Stock < 0" },
  { value: "dispatch", label: "Stock < 100" },
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
  const [selectedCategoryHundered, setSelectedCategoryHundered] =
    useState("All Categories");
  const [categories, setCategories] = useState(["All Categories"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryZero, setSearchQueryZero] = useState("");
  const [searchQueryHundered, setSearchQueryHundered] = useState("");
  const currentDates = new Date();
  const currentYear = currentDates.getFullYear();
  const currentMonthIndex = currentDates.getMonth();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState(months[currentMonthIndex]);
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
    isLoading: isLoadingStock,
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
        item.item_name.toLowerCase().includes(searchLower) ||
        item.item_category.toLowerCase().includes(searchLower) ||
        item.item_size.toLowerCase().includes(searchLower) ||
        (item.openpurch - item.closesale + (item.purch - item.sale))
          .toString()
          .toLowerCase()
          .includes(searchLower);

      const matchesCategory =
        selectedCategory === "All Categories" ||
        item.item_category === selectedCategory;

      return matchesSearch && matchesCategory;
    }) || [];
  //THIS IS >0 FILTER DATA
  const filteredItemsZero = (stockData || []).filter((item) => {
    const available =
      item.openpurch - item.closesale + (item.purch - item.sale);
    if (available >= 0) return false;
    const searchLower = searchQueryZero.toLowerCase();
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchLower) ||
      item.item_category.toLowerCase().includes(searchLower) ||
      available.toString().toLowerCase().includes(searchLower);
    const matchesCategory =
      selectedCategoryZero === "All Categories" ||
      item.item_category === selectedCategoryZero;

    return matchesSearch && matchesCategory;
  });
  //THIS IS >100 FILTER DATA
  const filteredItemsHundered = (stockData || []).filter((item) => {
    const available =
      item.openpurch - item.closesale + (item.purch - item.sale);

    if (available >= 100) return false;
    const searchLower = searchQueryHundered.toLowerCase();
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchLower) ||
      item.item_category.toLowerCase().includes(searchLower) ||
      available.toString().toLowerCase().includes(searchLower);
    const matchesCategory =
      selectedCategoryHundered == "All Categories" ||
      item.item_category === selectedCategoryHundered;

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
  const downloadCSV = (stockData, toast) => {
    downloadExcel({
      data: stockData,
      sheetName: "Stock Summary",
      headers: ["Item Name", "Category", "Size", "Available"],
      getRowData: (item) => [
        item.item_name,
        item.item_category,
        item.item_size,
        Number(item.openpurch) -
          Number(item.closesale) +
          (Number(item.purch) - Number(item.sale)) -
          Number(item.purchR) +
          Number(item.saleR),
      ],
      fileNamePrefix: "stock_summary",
      toast,
      emptyDataCallback: () => ({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      }),
    });
  };

  const downloadLessThanZeroExcel = (filteredItemsZero, toast) => {
    downloadExcel({
      data: filteredItemsZero,
      sheetName: "Stock < 0 Report",
      headers: ["Item Name", "Category", "Available"],
      getRowData: (transaction) => [
        transaction.item_name,
        transaction.item_category,
        Number(transaction.openpurch) -
          Number(transaction.closesale) +
          (Number(transaction.purch) - Number(transaction.sale)) -
          Number(transaction.purchR) +
          Number(transaction.saleR),
      ],
      fileNamePrefix: "Stock_Report_Less_Than_Zero",
      toast,
      emptyDataCallback: () => ({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      }),
    });
  };

  const downloadLessThanHunderedExcel = (filteredItemsHundered, toast) => {
    downloadExcel({
      data: filteredItemsHundered,
      sheetName: "Stock < 100 Report",
      headers: ["Item Name", "Category", "Available"],
      getRowData: (transaction) => [
        transaction.item_name,
        transaction.item_category,
        Number(transaction.openpurch) -
          Number(transaction.closesale) +
          (Number(transaction.purch) - Number(transaction.sale)) -
          Number(transaction.purchR) +
          Number(transaction.saleR),
      ],
      fileNamePrefix: "Stock_Report_Less_Than_Hundred",
      toast,
      emptyDataCallback: () => ({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      }),
    });
  };

  if (isLoadingStock) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      </Page>
    );
  }

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
            <TabsList className="grid w-full grid-cols-4">
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
              />
            </TabsContent>
            <TabsContent value="purchase">
              <StockTableSection
                title="Stock < 0"
                selectedCategory={selectedCategoryZero}
                setSelectedCategory={setSelectedCategoryZero}
                searchQuery={searchQueryZero}
                setSearchQuery={setSearchQueryZero}
                filteredItems={filteredItemsZero}
                categories={categories}
                containerRef={containerRef}
                // handlePrintPdf={handlePrintPdf}
                print="false"
                downloadCSV={downloadLessThanZeroExcel}
                currentDate={currentDate}
              />
            </TabsContent>
            <TabsContent value="dispatch">
              <StockTableSection
                title="Stock < 100"
                selectedCategory={selectedCategoryHundered}
                setSelectedCategory={setSelectedCategoryHundered}
                searchQuery={searchQueryHundered}
                setSearchQuery={setSearchQueryHundered}
                filteredItems={filteredItemsHundered}
                categories={categories}
                containerRef={containerRef}
                print="false"
                downloadCSV={downloadLessThanHunderedExcel}
                currentDate={currentDate}
              />
            </TabsContent>
            <TabsContent value="graph">
              <SalesBarChart
                title="Monthly Sales"
                dispatch={dashbordstock?.dispatch}
                isLoadingdashboord={isLoadingdashboord}
                isErrordashboord={isErrordashboord}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                years={years}
                months={months}
                handleChange={handleChange}
                currentYear={currentYear}
                refetch={refetchdashboord}
                currentMonthIndex={currentMonthIndex}
              />
            </TabsContent>
          </Tabs>
        </>

        <>
          <div className="hidden sm:block rounded-md border max-h-[500px] overflow-y-auto mb-4">
            <SalesBarChart
              title="Monthly Sales"
              dispatch={dashbordstock?.dispatch}
              isLoadingdashboord={isLoadingdashboord}
              isErrordashboord={isErrordashboord}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              years={years}
              months={months}
              handleChange={handleChange}
              currentYear={currentYear}
              refetch={refetchdashboord}
              currentMonthIndex={currentMonthIndex}
            />
          </div>

          <StockTableBoth
            title="Stock Less Than 0"
            data={filteredItemsZero}
            onDownload={downloadLessThanZeroExcel}
          />

          <StockTableBoth
            title="Stock Less Than 100"
            data={filteredItemsHundered}
            onDownload={downloadLessThanHunderedExcel}
          />
        </>
      </div>
    </Page>
  );
};

export default Home;
