import Loader from "@/components/loader/Loader";
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
import {
  setColumnVisibility,
  toggleColumn,
} from "@/redux/columnVisibilitySlice";
import { ChevronDown, Download, Printer, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import ColumnVisibilityDropdown from "./ColumnVisibilityDropdown";

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
  const singlebranch = useSelector((state) => state.auth.branch_s_unit);
  const doublebranch = useSelector((state) => state.auth.branch_d_unit);
  // const doublebranch = "Yes";
  const dispatch = useDispatch();
  const columnVisibility = useSelector((state) => state.columnVisibility);
  const handleToggle = (key) => {
    const newVisibility = {
      ...columnVisibility,
      [key]: !columnVisibility[key],
    };

    const isDoubleBranch = singlebranch === "Yes" && doublebranch === "Yes";
    const mainColumns = Object.keys(newVisibility).filter(
      (k) => k !== "box" && k !== "piece"
    );
    const isMainColumnSelected = mainColumns.some((k) => newVisibility[k]);

    if (!isMainColumnSelected) {
      toast({
        title: "Error",
        description: "At least one main column must be selected.",
        variant: "destructive",
      });
      return;
    }

    if (isDoubleBranch && (key === "box" || key === "piece")) {
      const boxVisible =
        key === "box" ? !columnVisibility.box : columnVisibility.box;
      const pieceVisible =
        key === "piece" ? !columnVisibility.piece : columnVisibility.piece;

      if (!boxVisible && !pieceVisible) {
        toast({
          title: "Error",
          description: "At least one of Box or Piece must be selected.",
          variant: "destructive",
        });
        return;
      }
    }

    if (isDoubleBranch) {
      if (key === "available_box" && !newVisibility[key]) {
        newVisibility.box = false;
        newVisibility.piece = false;
      }
      if (key === "available_box" && newVisibility[key]) {
        newVisibility.box = true;
      }
    }
    dispatch(setColumnVisibility(newVisibility));
  };

  const totals = filteredItems.reduce(
    (acc, item) => {
      if (singlebranch === "Yes" && doublebranch === "Yes") {
        const total =
          Number(item.openpurch) -
          Number(item.closesale) +
          (Number(item.purch) - Number(item.sale)) * Number(item.item_piece) +
          Number(item.openpurch_piece) -
          Number(item.closesale_piece) +
          (Number(item.purch_piece) - Number(item.sale_piece));

        const itemPiece = Number(item.item_piece) || 1;
        const box = Math.floor(total / itemPiece);
        const piece = total % itemPiece;
        acc.box += box;
        acc.piece += piece;
      }
      return acc;
    },
    { box: 0, piece: 0 }
  );

  const convertPiecesToBoxes = (boxTotal, pieceTotal, piecePerBox) => {
    if (!piecePerBox) return { boxTotal, pieceTotal };
    return {
      boxTotal: boxTotal,
      pieceTotal: pieceTotal,
    };
  };

  const piecePerBox = filteredItems[0]?.item_piece
    ? Number(filteredItems[0].item_piece)
    : 1;

  const totalBoxesAndPieces = convertPiecesToBoxes(
    totals.box,
    totals.piece,
    piecePerBox
  );

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="px-3 py-2 border-b">
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-sm md:text-lg font-semibold text-black">
              {title}
            </CardTitle>

            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-32 truncate">
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

              {title === "Stock View" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-32 truncate"
                    >
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

              {print === "true" && (
                <button
                  className={`flex items-center justify-center w-full sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-2 rounded-lg`}
                  onClick={handlePrintPdf}
                >
                  <Printer className="h-4 w-4 mr-1" />
                </button>
              )}

              <button
                className={`flex items-center justify-center w-full sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-2 rounded-lg`}
                onClick={() => downloadCSV(filteredItems, toast)}
              >
                <Download className="h-4 w-4 mr-1" />
              </button>
            </div>
          </div>

          {/* <div className="flex items-center justify-between space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                autoFocus
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full text-sm"
              />
            </div>
            <div>
              <ColumnVisibilityDropdown
                columnVisibility={columnVisibility}
                singlebranch={singlebranch}
                doublebranch={doublebranch}
                handleToggle={handleToggle}
              />
            </div>
            <div className="text-sm text-gray-600">
              {filteredItems.length} items
            </div>
          </div> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                autoFocus
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200 w-full text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="w-full flex justify-end">
                <ColumnVisibilityDropdown
                  columnVisibility={columnVisibility}
                  singlebranch={singlebranch}
                  doublebranch={doublebranch}
                  handleToggle={handleToggle}
                />
              </div>

              {/* Item Count */}
              <div className="text-sm text-gray-600 text-right sm:text-left w-full sm:w-auto">
                {filteredItems.length} items
              </div>
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
            <>
              {/* <div className="flex justify-center">
                <div className="flex flex-wrap justify-center gap-4 p-4  rounded-xl  w-full max-w-4xl ">
                  {Object.entries(columnVisibility).map(([key, value]) => {
                    if (
                      (key === "box" || key === "piece") &&
                      !(singlebranch === "Yes" && doublebranch === "Yes")
                    ) {
                      return null;
                    }

                    return (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition duration-200"
                      >
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleToggle(key)}
                          className="accent-blue-600 w-4 h-4"
                        />
                        <span className="capitalize text-[10px] sm:text-sm font-medium text-gray-700">
                          {key.replace("_", " ")}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div> */}
              {/* <ColumnVisibilityDropdown
                columnVisibility={columnVisibility}
                singlebranch={singlebranch}
                doublebranch={doublebranch}
                handleToggle={handleToggle}
              /> */}
              <div
                className="overflow-x-auto text-[11px] grid grid-cols-1 p-0 md:p-6 print:p-4"
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

                <table className="w-full border border-black border-collapse">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      {columnVisibility.item_name && (
                        <th
                          className="border border-black px-2 py-2 text-center"
                          rowSpan={2}
                        >
                          Item Name
                        </th>
                      )}
                      {columnVisibility.category && (
                        <th
                          className="border border-black px-2 py-2 text-center"
                          rowSpan={2}
                        >
                          Category
                        </th>
                      )}
                      {columnVisibility.brand && (
                        <th
                          className="border border-black px-2 py-2 text-center"
                          rowSpan={2}
                        >
                          Brand
                        </th>
                      )}
                      {columnVisibility.size &&
                        filteredItems[0]?.item_size !== undefined && (
                          <th
                            className="hidden print:table-cell border border-black px-2 py-2 text-center"
                            rowSpan={2}
                          >
                            Size
                          </th>
                        )}

                      {/* Single Branch Mode */}
                      {(singlebranch === "Yes" || doublebranch === "Yes") &&
                        singlebranch !== doublebranch &&
                        columnVisibility.available_box && (
                          <th
                            className="border border-black px-2 py-2 text-center"
                            rowSpan={2}
                          >
                            Available
                          </th>
                        )}

                      {/* Double Branch Mode */}
                      {singlebranch === "Yes" &&
                        doublebranch === "Yes" &&
                        columnVisibility.available_box && (
                          <th
                            className="border border-black px-2 py-2 text-center"
                            colSpan={2}
                          >
                            Available
                          </th>
                        )}
                    </tr>

                    {singlebranch === "Yes" &&
                      doublebranch === "Yes" &&
                      columnVisibility.available_box && (
                        <tr>
                          {columnVisibility.box && (
                            <th className="border border-black px-2 py-2 text-center">
                              Box
                            </th>
                          )}
                          {columnVisibility.piece && (
                            <th className="border border-black px-2 py-2 text-center">
                              Piece
                            </th>
                          )}
                        </tr>
                      )}
                  </thead>

                  <tbody>
                    {filteredItems.map((item, index) => {
                      const itemPiece = Number(item.item_piece) || 1;

                      const openingPurch =
                        Number(item.openpurch) * itemPiece +
                        Number(item.openpurch_piece);
                      const openingSale =
                        Number(item.closesale) * itemPiece +
                        Number(item.closesale_piece);
                      const openingPurchR =
                        Number(item.openpurchR) * itemPiece +
                        Number(item.openpurchR_piece);
                      const openingSaleR =
                        Number(item.closesaleR) * itemPiece +
                        Number(item.closesaleR_piece);

                      const opening =
                        openingPurch -
                        openingSale -
                        openingPurchR +
                        openingSaleR;

                      const purchase =
                        Number(item.purch) * itemPiece +
                        Number(item.purch_piece);
                      const purchaseR =
                        Number(item.purchR) * itemPiece +
                        Number(item.purchR_piece);
                      const sale =
                        Number(item.sale) * itemPiece + Number(item.sale_piece);
                      const saleR =
                        Number(item.saleR) * itemPiece +
                        Number(item.saleR_piece);

                      const total =
                        opening + purchase - purchaseR - sale + saleR;
                      const box = Math.floor(total / itemPiece);
                      const piece = total % itemPiece;

                      return (
                        <tr
                          key={index}
                          className={`hover:bg-gray-50 ${
                            item.pre_box > 0 || item.pre_piece > 0
                              ? "bg-pink-100 hover:bg-pink-100"
                              : ""
                          }`}
                        >
                          {columnVisibility.item_name && (
                            <td className="border border-black px-2 py-2">
                              {item.item_name}
                            </td>
                          )}
                          {columnVisibility.category && (
                            <td className="border border-black px-2 py-2 text-right">
                              {item.item_category}
                            </td>
                          )}
                          {columnVisibility.brand && (
                            <td className="border border-black px-2 py-2 text-right">
                              {item.item_brand || "-"}
                            </td>
                          )}
                          {columnVisibility.size &&
                            item.item_size !== undefined && (
                              <td className="hidden print:table-cell border border-black px-2 py-2 text-right">
                                {item.item_size}
                              </td>
                            )}

                          {(singlebranch === "Yes" || doublebranch === "Yes") &&
                            singlebranch !== doublebranch &&
                            columnVisibility.available_box && (
                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  total === 0 ? "opacity-50" : ""
                                }`}
                              >
                                {total}
                              </td>
                            )}

                          {singlebranch === "Yes" &&
                            doublebranch === "Yes" &&
                            columnVisibility.available_box && (
                              <>
                                {columnVisibility.box && (
                                  <td
                                    className={`border border-black px-2 py-2 text-center ${
                                      box === 0 ? "opacity-50" : ""
                                    }`}
                                  >
                                    {box}
                                  </td>
                                )}
                                {columnVisibility.piece && (
                                  <td
                                    className={`border border-black px-2 py-2 text-center ${
                                      piece === 0 ? "opacity-50" : ""
                                    }`}
                                  >
                                    {piece}
                                  </td>
                                )}
                              </>
                            )}
                        </tr>
                      );
                    })}

                    {/* Total Row */}
                    {(title === "Stock" || title === "Stock View") && (
                      <tr className="font-bold bg-gray-200">
                        <td
                          className="border border-black px-2 py-2 text-right"
                          colSpan={
                            [
                              columnVisibility.item_name,
                              columnVisibility.category,
                              columnVisibility.brand,
                            ].filter(Boolean).length
                          }
                        >
                          Total:
                        </td>

                        {columnVisibility.size &&
                          filteredItems[0]?.item_size !== undefined && (
                            <td className="hidden print:table-cell border border-black px-2 py-2 text-right" />
                          )}

                        {(singlebranch === "Yes" || doublebranch === "Yes") &&
                          singlebranch !== doublebranch &&
                          columnVisibility.available_box && (
                            <td className="border border-black px-2 py-2 text-right">
                              {filteredItems
                                .reduce((total, item) => {
                                  const itemPiece =
                                    Number(item.item_piece) || 1;
                                  const openingPurch =
                                    Number(item.openpurch) * itemPiece +
                                    Number(item.openpurch_piece);
                                  const openingSale =
                                    Number(item.closesale) * itemPiece +
                                    Number(item.closesale_piece);
                                  const openingPurchR =
                                    Number(item.openpurchR) * itemPiece +
                                    Number(item.openpurchR_piece);
                                  const openingSaleR =
                                    Number(item.closesaleR) * itemPiece +
                                    Number(item.closesaleR_piece);
                                  const opening =
                                    openingPurch -
                                    openingSale -
                                    openingPurchR +
                                    openingSaleR;

                                  const purchase =
                                    Number(item.purch) * itemPiece +
                                    Number(item.purch_piece);
                                  const purchaseR =
                                    Number(item.purchR) * itemPiece +
                                    Number(item.purchR_piece);
                                  const sale =
                                    Number(item.sale) * itemPiece +
                                    Number(item.sale_piece);
                                  const saleR =
                                    Number(item.saleR) * itemPiece +
                                    Number(item.saleR_piece);

                                  return (
                                    total +
                                    (opening +
                                      purchase -
                                      purchaseR -
                                      sale +
                                      saleR)
                                  );
                                }, 0)
                                .toLocaleString()}
                            </td>
                          )}

                        {singlebranch === "Yes" &&
                          doublebranch === "Yes" &&
                          columnVisibility.available_box && (
                            <>
                              {columnVisibility.box && (
                                <td className="border border-black px-2 py-2 text-center">
                                  {totalBoxesAndPieces.boxTotal}
                                </td>
                              )}
                              {columnVisibility.piece && (
                                <td className="border border-black px-2 py-2 text-center">
                                  {totalBoxesAndPieces.pieceTotal}
                                </td>
                              )}
                            </>
                          )}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
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
