import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Loader from "@/components/loader/Loader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const transformStockData = (stock) => {
  if (!Array.isArray(stock)) return [];

  return stock.map((item) => ({
    item_name: moment(item.date).format("DD"),
    Purchase: Number(item.total_p || 0),
    Purchased_boxes: Number(item.total_p_box || 0),
    Purchased_pcs: Number(item.total_p_piece || 0),

    Dispatch: Number(item.total_d || 0),
    Sold_boxes: Number(item.total_d_box || 0),
    Sold_pcs: Number(item.total_d_piece || 0),

    PurchaseReturn: Number(item.total_pr || 0),
    PurchaseReturned_boxes: Number(item.total_pr_box || 0),
    PurchaseReturned_pcs: Number(item.total_pr_piece || 0),

    DispatchReturn: Number(item.total_dr || 0),
    DispatchReturned_boxes: Number(item.total_dr_box || 0),
    DispatchReturned_pcs: Number(item.total_dr_piece || 0),
  }));
};

const transformStockSingleBranch = (stock) => {
  if (!Array.isArray(stock)) return [];

  return stock.map((item) => ({
    item_name: moment(item.date).format("DD"),
    Purchase: Number(item.total_p_box || 0),
    Purchased_boxes: Number(item.total_p_box || 0),

    Dispatch: Number(item.total_d_box || 0),
    Sold_boxes: Number(item.total_d_box || 0),

    PurchaseReturn: Number(item.total_pr_box || 0),
    PurchaseReturned_boxes: Number(item.total_pr_box || 0),

    DispatchReturn: Number(item.total_dr_box || 0),
    DispatchReturned_boxes: Number(item.total_dr_box || 0),
  }));
};
const transformDoubleBranch = (stock) => {
  if (!Array.isArray(stock)) return [];

  return stock.map((item) => ({
    item_name: moment(item.date).format("DD"),
    Purchase: Number(item.total_p_piece || 0),
    Purchased_pcs: Number(item.total_p_piece || 0),

    Dispatch: Number(item.total_d_piece || 0),
    Sold_pcs: Number(item.total_d_piece || 0),

    PurchaseReturn: Number(item.total_pr_piece || 0),
    PurchaseReturned_pcs: Number(item.total_pr_piece || 0),

    DispatchReturn: Number(item.total_dr_piece || 0),
    DispatchReturned_pcs: Number(item.total_dr_piece || 0),
  }));
};

const StockBarChart = ({
  stock = [],
  title = "Stock Overview",
  selectedYear,
  selectedMonth,
  years,
  months,
  handleChange,
  currentYear,
  currentMonthIndex,
  isLoadingdashboord,
  isErrordashboord,
  refetchdashboord,
}) => {
  const singlebranch = useSelector((state) => state.auth.branch_s_unit);
  const doublebranch = useSelector((state) => state.auth.branch_d_unit);
  let data = [];

  if (singlebranch === "Yes" && doublebranch === "No") {
    data = transformStockSingleBranch(stock?.results);
  } else if (singlebranch === "Yes" && doublebranch === "Yes") {
    data = transformStockData(stock?.results);
  } else if (singlebranch === "No" && doublebranch === "Yes") {
    data = transformDoubleBranch(stock?.results);
  }

  // Chart.js dataset preparation
  const labels = data.map((d) => d.item_name);

  const datasets = [
    {
      label: "Purchase",
      data: data.map((d) => d.Purchase),
      backgroundColor: "#34D399",
      borderRadius: 4,
    },
    {
      label: "Dispatch",
      data: data.map((d) => d.Dispatch),
      backgroundColor: "#60A5FA",
      borderRadius: 4,
    },
    {
      label: "Purchase Return",
      data: data.map((d) => d.PurchaseReturn),
      backgroundColor: "#7B3FBF",
      borderRadius: 4,
    },
    {
      label: "Dispatch Return",
      data: data.map((d) => d.DispatchReturn),
      backgroundColor: "#F87171",
      borderRadius: 4,
    },
  ];

  const tooltipCallbacks = {
    label: function (context) {
      const datasetLabel = context.dataset.label;
      const index = context.dataIndex;
      const itemData = data[index];
      let result = "";

      if (singlebranch === "Yes" && doublebranch === "Yes") {
        let boxKey = "";
        let pcsKey = "";

        switch (datasetLabel) {
          case "Purchase":
            boxKey = "Purchased_boxes";
            pcsKey = "Purchased_pcs";
            break;
          case "Dispatch":
            boxKey = "Sold_boxes";
            pcsKey = "Sold_pcs";
            break;
          case "PurchaseReturn":
            boxKey = "PurchaseReturned_boxes";
            pcsKey = "PurchaseReturned_pcs";
            break;
          case "DispatchReturn":
            boxKey = "DispatchReturned_boxes";
            pcsKey = "DispatchReturned_pcs";
            break;
          default:
            boxKey = "";
            pcsKey = "";
        }

        result = `${datasetLabel}: ${itemData[boxKey] ?? 0} boxes and ${
          itemData[pcsKey] ?? 0
        } pieces`;
      } else if (singlebranch === "Yes" && doublebranch === "No") {
        let boxKey = "";

        switch (datasetLabel) {
          case "Purchase":
            boxKey = "Purchased_boxes";
            break;
          case "Dispatch":
            boxKey = "Sold_boxes";
            break;
          case "PurchaseReturn":
            boxKey = "PurchaseReturned_boxes";
            break;
          case "DispatchReturn":
            boxKey = "DispatchReturned_boxes";
            break;
          default:
            boxKey = "";
        }

        result = `${datasetLabel}: ${itemData[boxKey] ?? 0} boxes`;
      } else if (singlebranch === "No" && doublebranch === "Yes") {
        let pcsKey = "";

        switch (datasetLabel) {
          case "Purchase":
            pcsKey = "Purchased_pcs";
            break;
          case "Dispatch":
            pcsKey = "Sold_pcs";
            break;
          case "PurchaseReturn":
            pcsKey = "PurchaseReturned_pcs";
            break;
          case "DispatchReturn":
            pcsKey = "DispatchReturned_pcs";
            break;
          default:
            pcsKey = "";
        }

        result = `${datasetLabel}: ${itemData[pcsKey] ?? 0} pieces`;
      }
      return result;
    },
  };

  const maxY = Math.max(...datasets.flatMap((d) => d.data)) || 0;
  console.log(maxY, "maxY");
  return (
    <Card className="p-0 md:p-4">
      <CardHeader>
        <div className="flex flex-col md:flex-row items-center md:justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4 ">
          <CardTitle className="text-lg font-semibold text-black">
            {title}
          </CardTitle>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-32 truncate">
                  <span>{selectedYear}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {years?.map((year) => (
                  <DropdownMenuItem
                    key={year}
                    onSelect={() => handleChange(year, selectedMonth)}
                  >
                    {year}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-32 truncate">
                  <span>{selectedMonth}</span>
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {months?.map((month, index) => {
                  const isDisabled =
                    Number(selectedYear) === currentYear &&
                    index > currentMonthIndex;
                  return (
                    <DropdownMenuItem
                      key={month}
                      disabled={isDisabled}
                      onSelect={() => handleChange(selectedYear, month)}
                    >
                      {month}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoadingdashboord ? (
          <Loader />
        ) : isErrordashboord ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="text-red-600">Failed to load data.</p>
            <Button onClick={refetchdashboord}>Retry</Button>
          </div>
        ) : (
          <Bar
            data={{
              labels,
              datasets,
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: "index",
                intersect: false,
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: maxY + maxY * 0.1,
                  ticks: {
                    stepSize: Math.ceil((maxY + maxY * 0.1) / 5),
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Date",
                    font: { size: 14 },
                  },
                },
              },

              plugins: {
                tooltip: {
                  callbacks: tooltipCallbacks,
                },
                legend: {
                  position: "top",
                  labels: {
                    usePointStyle: true,
                  },
                },
                title: {
                  display: false,
                },
              },
              animation: {
                duration: 500,
              },
            }}
            height={300}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default StockBarChart;
