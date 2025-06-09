import { STOCK_CATEGORY_REPORT, STOCK_GODOWN_REPORT } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/dashboard/page";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import Loader from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { IMAGE_URL, NO_IMAGE_URL } from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useFetchCategory } from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import html2pdf from "html2pdf.js";
import { ArrowDownToLine, Printer, Search } from "lucide-react";
import moment from "moment";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";

const CategoryStock = () => {
  const containerRef = useRef();
  const [formData, setFormData] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
    category_id: "",
  });
  const { toast } = useToast();
  const token = usetoken();
  const singlebranch = useSelector((state) => state.auth.branch_s_unit);
  const doublebranch = useSelector((state) => state.auth.branch_d_unit);
  // const doublebranch = "Yes";
  console.log(singlebranch, doublebranch);
  const fetchCategorystockdata = async () => {
    const response = await apiClient.post(
      `${STOCK_CATEGORY_REPORT}`,
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
    data: Categorystockdata,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["categorydata"],
    queryFn: fetchCategorystockdata,
    enabled: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.category_id) {
      toast({
        title: "Missing Information",
        description: "Please select an category name",
        variant: "destructive",
      });
      return;
    }
    refetch();
  };
  const { data: categoryData } = useFetchCategory();
  // const handlePrintPdf = useReactToPrint({
  //   if(Categorystockdata.stock.length < 0){
  //     toast({
  //       title: "No Data",
  //       description: "Please search the category data",
  //       variant: "destructive",
  //     });
  //   }
  //   content: () => containerRef.current,
  //   // documentTitle: "Category Stock Summary",
  //   pageStyle: `
  //     @page {
  //       size: A4 portrait;
  //     }
  //     @media print {
  //       body {
  //         font-size: 10px;
  //         margin: 0;
  //         padding: 0;
  //       }
  //       table {
  //         font-size: 11px;
  //       }
  //       .print-hide {
  //         display: none;
  //       }
  //     }
  //   `,
  // });
  const print = useReactToPrint({
    content: () => containerRef.current,
    pageStyle: `
    @page {
      size: A4 portrait;
    }
    @media print {
      body {
        font-size: 10px;
        margin: 0;
        padding: 0;
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
  const handlePrintPdf = () => {
    if (!Categorystockdata?.stock || Categorystockdata.stock.length === 0) {
      toast({
        title: "No Data",
        description: "Please search the category data",
        variant: "destructive",
      });
      return;
    }

    print();
  };

  const handleSaveAsPdf = () => {
    if (!containerRef.current) {
      console.error("Element not found");
      return;
    }

    html2pdf()
      .from(containerRef.current)
      .set({
        margin: 10,
        filename: "Category.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();
  };
  if (isError) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }
  const handleInputChange = (field, valueOrEvent) => {
    const value =
      typeof valueOrEvent === "object" && valueOrEvent.target
        ? valueOrEvent.target.value
        : valueOrEvent;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  const processedStock =
    Categorystockdata?.stock?.map((item) => {
      const itemPiece = item.item_piece || 1;

      const openPurch =
        (Number(item.openpurch) || 0) * itemPiece +
        (Number(item.openpurch_piece) || 0);
      const openSale =
        (Number(item.closesale) || 0) * itemPiece +
        (Number(item.closesale_piece) || 0);
      const openPurchR =
        (Number(item.openpurchR) || 0) * itemPiece +
        (Number(item.openpurchR_piece) || 0);
      const openSaleR =
        (Number(item.closesaleR) || 0) * itemPiece +
        (Number(item.closesaleR_piece) || 0);

      const opening = openPurch - openSale - openPurchR + openSaleR;

      const purchase =
        (Number(item.purch) || 0) * itemPiece + (Number(item.purch_piece) || 0);
      const purchaseR =
        (Number(item.purchR) || 0) * itemPiece +
        (Number(item.purchR_piece) || 0);
      const sale =
        (Number(item.sale) || 0) * itemPiece + (Number(item.sale_piece) || 0);
      const saleR =
        (Number(item.saleR) || 0) * itemPiece + (Number(item.saleR_piece) || 0);

      const total = opening + purchase - purchaseR - sale + saleR;

      return {
        ...item,
        itemPiece,
        total,
      };
    }) || [];
  const BranchHeader = () => (
    <div
      className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="lg:w-64 xl:w-72 shrink-0">
          <h1 className="text-xl font-bold text-gray-800 truncate">
            Category Stock Summary{" "}
          </h1>
          <p className="text-md text-gray-500 truncate">
            Add a Category Stock to Visit Report{" "}
          </p>
        </div>

        <form
          className="bg-white p-3 rounded-md shadow-xs  "
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-4">
            {/* Inputs Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className={`text-xs ${ButtonConfig.cardLabel} block`}>
                  From Date
                </label>
                <Input
                  type="date"
                  value={formData.from_date}
                  onChange={(e) => handleInputChange("from_date", e)}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-xs ${ButtonConfig.cardLabel} block`}>
                  To Date
                </label>
                <Input
                  type="date"
                  value={formData.to_date}
                  onChange={(e) => handleInputChange("to_date", e)}
                />
              </div>

              <div className="space-y-1">
                <label
                  className={`block ${ButtonConfig.cardLabel} text-xs font-medium`}
                >
                  Category
                </label>
                <MemoizedSelect
                  value={formData.category_id}
                  onChange={(e) => handleInputChange("category_id", e)}
                  options={
                    categoryData?.category?.map((category) => ({
                      value: category.id,
                      label: category.category,
                    })) || []
                  }
                  placeholder="Select Category"
                />
              </div>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col md:flex-row justify-end gap-2">
              <Button
                type="button"
                size="sm"
                className={`w-full md:w-24 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={handlePrintPdf}
              >
                <Printer className="h-3 w-3 mr-1" /> Print
              </Button>
              <Button
                type="button"
                size="sm"
                className={`w-full md:w-24 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={handleSaveAsPdf}
              >
                <ArrowDownToLine className="h-3 w-3 mr-1" /> PDF
              </Button>
              <Button
                type="submit"
                size="sm"
                className={`w-full md:w-24 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              >
                <Search className="h-3 w-3 mr-1" /> Search
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
  const toBoxPiece = (val, itemPiece = 1) => ({
    box: Math.floor(val / itemPiece),
    piece: val % itemPiece,
  });
  console.log(processedStock, "processedStock");
  const grandTotal = processedStock.reduce((acc, item) => acc + item.total, 0);

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
                  Category Stock Summary
                </h1>
                <div className="flex gap-[2px]">
                  <button
                    className={` sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md `}
                    onClick={handlePrintPdf}
                  >
                    <Printer className="h-3 w-3 " />
                  </button>
                  <button
                    className={` sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md `}
                    onClick={handleSaveAsPdf}
                  >
                    <ArrowDownToLine className="h-3 w-3 " />
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-white p-2 rounded-md shadow-xs"
              >
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="space-y-1">
                    <label
                      className={`text-xs ${ButtonConfig.cardLabel} block`}
                    >
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={formData.from_date}
                      className="bg-white w-full text-sm p-1"
                      onChange={(e) => handleInputChange("from_date", e)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      className={`text-xs ${ButtonConfig.cardLabel} block`}
                    >
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={formData.to_date}
                      className="bg-white w-full text-sm p-1"
                      onChange={(e) => handleInputChange("to_date", e)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      className={`block ${ButtonConfig.cardLabel} text-xs font-medium`}
                    >
                      Category
                    </label>
                    <MemoizedSelect
                      className="bg-white w-full text-sm p-1"
                      value={formData.category_id}
                      onChange={(e) => handleInputChange("category_id", e)}
                      options={
                        categoryData?.category?.map((category) => ({
                          value: category.id,
                          label: category.category,
                        })) || []
                      }
                      placeholder="Select Category"
                    />
                  </div>
                  <div className="space-y-1">
                    <Button
                      type="submit"
                      size="sm"
                      className={`h-9 mt-6 w-full ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
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
          <BranchHeader />
        </div>
        <div
          className="overflow-x-auto text-[11px] grid grid-cols-1 p-6 print:p-4"
          ref={containerRef}
        >
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader />
            </div>
          ) : (
            <>
              {processedStock?.length > 0 && (
                <>
                  <h1 className="text-lg mb-4 font-bold">
                    Category Stock Summary
                  </h1>
                  <table className="w-full border-collapse border border-black">
                    <thead className="bg-gray-100">
                      {singlebranch === "Yes" && doublebranch === "Yes" ? (
                        <tr>
                          <th
                            className="border border-black px-2 py-2 text-center"
                            colSpan={4}
                          >
                            <div className="flex items-center justify-center text-lg">
                              {Categorystockdata?.item?.category}
                            </div>
                          </th>
                        </tr>
                      ) : (
                        <tr>
                          <th
                            className="border border-black px-2 py-2 text-center"
                            colSpan={3}
                          >
                            <div className="flex items-center justify-center text-lg">
                              {Categorystockdata?.item?.category}
                            </div>
                          </th>
                        </tr>
                      )}

                      <tr>
                        <th
                          className="border border-black px-2 py-2 text-center w-[30%]"
                          rowSpan={2}
                        >
                          DESIGN
                        </th>
                        <th
                          className="border border-black px-2 py-2 text-center"
                          rowSpan={2}
                        >
                          PHOTO
                        </th>

                        {(singlebranch === "Yes" && doublebranch === "No") ||
                        (singlebranch === "No" && doublebranch === "Yes") ? (
                          <th
                            className="border border-black px-2 py-2 text-center  w-[10%] "
                            colSpan={2}
                          >
                            STOCK
                          </th>
                        ) : null}

                        {singlebranch === "Yes" && doublebranch === "Yes" && (
                          <th
                            className="border border-black px-2 py-2 text-center w-[15%]"
                            colSpan={2}
                          >
                            STOCK
                          </th>
                        )}
                      </tr>

                      {singlebranch === "Yes" && doublebranch === "Yes" && (
                        <tr>
                          <th className="border border-black px-2 py-2 text-center">
                            Box
                          </th>
                          <th className="border border-black px-2 py-2 text-center">
                            Piece
                          </th>
                        </tr>
                      )}
                    </thead>

                    <tbody>
                      <React.Fragment>
                        {processedStock?.map((item) => {
                          const itemPiece = item.item_piece || 1;

                          const openPurch =
                            (Number(item.openpurch) || 0) * itemPiece +
                            (Number(item.openpurch_piece) || 0);

                          const openSale =
                            (Number(item.closesale) || 0) * itemPiece +
                            (Number(item.closesale_piece) || 0);

                          const openPurchR =
                            (Number(item.openpurchR) || 0) * itemPiece +
                            (Number(item.openpurchR_piece) || 0);

                          const openSaleR =
                            (Number(item.closesaleR) || 0) * itemPiece +
                            (Number(item.closesaleR_piece) || 0);

                          const opening =
                            openPurch - openSale - openPurchR + openSaleR;

                          const purchase =
                            (Number(item.purch) || 0) * itemPiece +
                            (Number(item.purch_piece) || 0);

                          const purchaseR =
                            (Number(item.purchR) || 0) * itemPiece +
                            (Number(item.purchR_piece) || 0);

                          const sale =
                            (Number(item.sale) || 0) * itemPiece +
                            (Number(item.sale_piece) || 0);

                          const saleR =
                            (Number(item.saleR) || 0) * itemPiece +
                            (Number(item.saleR_piece) || 0);

                          const total =
                            opening + purchase - purchaseR - sale + saleR;

                          const toBoxPiece = (val) => ({
                            box: Math.floor(val / itemPiece),
                            piece: val % itemPiece,
                          });

                          const totalBP = toBoxPiece(
                            item.total,
                            item.itemPiece
                          );

                          return (
                            <tr key={item.item_id} className="hover:bg-gray-50">
                              <td className="border border-black px-2 py-2 text-sm text-center">
                                {item.item_name}
                              </td>
                              <td className="border border-black px-2 py-2 text-center">
                                <img
                                  src={
                                    item.item_image
                                      ? `${IMAGE_URL}/${item.item_image}`
                                      : NO_IMAGE_URL
                                  }
                                  alt={"Category Image"}
                                  className="w-full h-40 object-cover"
                                />
                              </td>

                              {(singlebranch == "Yes" &&
                                doublebranch == "No") ||
                              (singlebranch == "No" &&
                                doublebranch == "Yes") ? (
                                <td
                                  className={`border border-black px-2 py-2 text-right text-sm ${
                                    total == "0" ? "opacity-50" : ""
                                  }`}
                                >
                                  {item.total}{" "}
                                </td>
                              ) : null}

                              {singlebranch === "Yes" &&
                                doublebranch === "Yes" && (
                                  <>
                                    <td
                                      className={`border border-black px-2 py-2 text-right text-sm ${
                                        totalBP.box == "0" ? "opacity-50" : ""
                                      }`}
                                    >
                                      {" "}
                                      {totalBP.box}
                                    </td>
                                    <td
                                      className={`border border-black px-2 py-2 text-right ${
                                        totalBP.piece == "0" ? "opacity-50" : ""
                                      }`}
                                    >
                                      {" "}
                                      {totalBP.piece}
                                    </td>
                                  </>
                                )}
                            </tr>
                          );
                        })}
                      </React.Fragment>

                      {/* <tr className=" font-bold">
                        <td
                          className="border border-black px-2 py-2 text-center text-lg"
                          colSpan={2}
                        >
                          Total:
                        </td>
                        {singlebranch === "Yes" && doublebranch === "Yes" ? (
                          <>
                            <td className="border border-black px-2 py-2 text-right  text-lg">
                              {toBoxPiece(grand.total).box}
                            </td>
                            <td className="border border-black px-2 py-2 text-right  text-lg">
                              {toBoxPiece(grand.total).piece}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="border border-black px-2 py-2 text-right">
                              {grand.total}
                            </td>
                          </>
                        )}
                      </tr> */}
                      <tr className="font-bold">
                        <td
                          className="border border-black px-2 py-2 text-center text-lg"
                          colSpan={2}
                        >
                          Total:
                        </td>

                        {singlebranch === "Yes" && doublebranch === "Yes" ? (
                          <>
                            <td className="border border-black px-2 py-2 text-right text-lg">
                              {
                                toBoxPiece(
                                  grandTotal,
                                  processedStock[0]?.itemPiece || 1
                                ).box
                              }
                            </td>
                            <td className="border border-black px-2 py-2 text-right text-lg">
                              {
                                toBoxPiece(
                                  grandTotal,
                                  processedStock[0]?.itemPiece || 1
                                ).piece
                              }
                            </td>
                          </>
                        ) : (
                          <td className="border border-black px-2 py-2 text-right text-lg">
                            {grandTotal}
                          </td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Page>
  );
};

export default CategoryStock;
