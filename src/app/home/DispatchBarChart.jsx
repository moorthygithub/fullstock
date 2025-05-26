import React from "react";
import moment from "moment";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Loader from "@/components/loader/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DispatchBarChart = ({
  dispatch,
  isLoadingdashboord,
  isErrordashboord,
  selectedYear,
  selectedMonth,
  years,
  months,
  handleChange,
  currentYear,
  currentMonthIndex,
  refetch,
  title = "Graph",
}) => {
  const maxValue = Math.max(
    ...(dispatch?.map((item) => Number(item.total_box)) || [0])
  );
  const yMax = Math.ceil(maxValue / 100) * 100 + 100;

  return (
    <div className="md:p-4">
      <div className="flex flex-col md:flex-row items-center md:justify-between mb-4 space-y-2 md:space-y-0 md:space-x-4">
        <CardTitle className="text-lg font-semibold text-black">
          {title}
        </CardTitle>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full md:w-auto">
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

      <div className="w-full h-[400px] min-h-[400px]">
        {isLoadingdashboord ? (
          <div className="flex justify-center items-center min-h-80">
            <Loader />
          </div>
        ) : isErrordashboord ? (
          <div className="text-center text-red-500 min-h-80">
            <Card className="w-full max-w-md mx-auto mt-10">
              <CardHeader>
                <CardTitle className="text-destructive">
                  Error Fetching Graph
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>{" "}
          </div>
        ) : !dispatch || dispatch.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 min-h-full">
            No Data Available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dispatch}
              margin={{ top: 20, right: 10, left: -10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dispatch_date"
                tickFormatter={(date) => moment(date).format("DD")}
              />
              <YAxis
                domain={[0, yMax]}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <Tooltip
                formatter={(value) => [`${value} Boxes`, "Total"]}
                labelFormatter={(label) =>
                  `Date: ${moment(label).format("DD-MM-YYYY")}`
                }
              />
              <Legend formatter={() => "Total Sales"} />
              <Bar dataKey="total_box" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default DispatchBarChart;
