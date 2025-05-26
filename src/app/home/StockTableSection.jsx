import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, Download, Printer, Search } from "lucide-react";
import Page from "../dashboard/page";
import Loader from "@/components/loader/Loader";

function StockTableSection({
  title,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  filteredItems,
  categories,
  containerRef,
  handlePrintPdf,
  downloadCSV,
  currentDate,
  print,
  setSelectedBrands,
  selectedBrands,
  brands,
  loading,
}) {
  const { toast } = useToast();
  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="px-3 py-2 border-b">
        <div className="flex flex-col space-y-2">
          {/* Title and Buttons */}
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm md:text-lg font-semibold text-black">
              {title}
            </CardTitle>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-32 truncate">
                    <span className="truncate">{selectedCategory}</span>
                    <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
                  align="start"
                  sideOffset={5}
                  collisionPadding={10}
                >
                  {categories.map((category, index) => (
                    <DropdownMenuItem
                      key={index}
                      onSelect={() => setSelectedCategory(category)}
                      className="flex items-center justify-between"
                    >
                      <span className="truncate">{category}</span>
                      {selectedCategory === category && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="flex-shrink-0 ml-2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {title == "Stock View" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className=" w-32 truncate">
                      <span className="truncate">{selectedBrands}</span>
                      <ChevronDown className="ml-2 h-4 w-4 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    className="max-h-60 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
                    align="start"
                    sideOffset={5}
                    collisionPadding={10}
                  >
                    {brands.map((brands) => (
                      <DropdownMenuItem
                        key={brands}
                        onSelect={() => setSelectedBrands(brands)}
                        className="flex items-center justify-between"
                      >
                        <span className="truncate">{brands}</span>
                        {selectedCategory === brands && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="flex-shrink-0 ml-2"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {print == "true" && (
                <button
                  className={`flex items-center justify-center sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-2 rounded-lg`}
                  onClick={handlePrintPdf}
                >
                  <Printer className="h-4 w-4 mr-1" />
                </button>
              )}
              <button
                className={`flex items-center justify-center sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-2 rounded-lg`}
                onClick={() => downloadCSV(filteredItems, toast)}
              >
                <Download className="h-4 w-4 mr-1" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full text-sm"
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredItems.length} items
            </div>
          </div>
        </div>
      </CardHeader>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Loader />
        </div>
      ) : (
        <CardContent className="p-2">
          {filteredItems?.length ? (
            <div
              className="overflow-x-auto text-[11px] grid grid-cols-1"
              ref={containerRef}
            >
              <div className="hidden print:block">
                <div className="flex justify-between ">
                  <h1 className="text-left text-2xl font-semibold mb-3 ">
                    Stock Summary
                  </h1>
                  <div className="flex space-x-6">
                    <h1> From - 2024-01-01</h1>
                    <h1>To -{currentDate}</h1>
                  </div>
                </div>
              </div>

              <table className="w-full border-collapse border border-black">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="border border-black px-2 py-2 text-center">
                      Item Name
                    </th>
                    <th className="border border-black px-2 py-2 text-center">
                      Category
                    </th>
                    {/* Show size only if present in items */}
                    {filteredItems[0]?.item_size !== undefined && (
                      <th className="hidden print:block border border-black px-2 py-2 text-center">
                        Size
                      </th>
                    )}
                    <th className="border border-black px-2 py-2 text-center">
                      Available
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-black px-2 py-2">
                        {item.item_name}
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {item.item_category}
                      </td>
                      {item.item_size !== undefined && (
                        <td className="hidden print:block border border-black px-2 py-2 text-right">
                          {item.item_size}
                        </td>
                      )}
                      <td className="border border-black px-2 py-2 text-right">
                        {(
                          item.openpurch -
                          item.closesale +
                          (item.purch - item.sale)
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {title == "Stock" ||
                    (title == "Stock View" && (
                      <tr className="font-bold">
                        <td
                          colSpan="2"
                          className="border border-black px-2 py-2 text-right"
                        >
                          Total:
                        </td>
                        <td className="border border-black px-2 py-2 text-right">
                          {filteredItems
                            .reduce((total, item) => {
                              return (
                                total +
                                (item.openpurch -
                                  item.closesale +
                                  (item.purch - item.sale))
                              );
                            }, 0)
                            .toLocaleString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4 flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400 mb-2"
              >
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              No stock data available.
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
export default StockTableSection;
