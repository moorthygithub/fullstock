import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Printer, Search } from "lucide-react";
import React, { useRef, useState } from "react";

import { STOCK_GODOWN_REPORT, STOCK_REPORT } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Loader from "@/components/loader/Loader";
import { Input } from "@/components/ui/input";
import { ButtonConfig } from "@/config/ButtonConfig";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import { useFetchGoDown, useFetchItems } from "@/hooks/useApi";
import { RiFileExcel2Line } from "react-icons/ri";
import { useSelector } from "react-redux";

const StockGoDown = () => {
  const containerRef = useRef();
  const [formData, setFormData] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
    item_id: "",
    godown_id: "",
  });
  const token = usetoken();
  const singlebranch = useSelector((state) => state.auth.branch_s_unit);
  const doublebranch = useSelector((state) => state.auth.branch_d_unit);

  const fetchGodownData = async () => {
    const response = await apiClient.post(
      `${STOCK_GODOWN_REPORT}`,
      { ...formData },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.stock;
  };

  const {
    data: stock,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["godownData", formData],
    queryFn: fetchGodownData,
  });
  const { data: itemsData } = useFetchItems();
  const { data: godownData } = useFetchGoDown();

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Stock",
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 15mm 20mm 15mm 20mm; /* top right bottom left */
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

  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      </Page>
    );
  }

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
  const processedStock = stock.map((godown) => {
    let opening = 0;
    let purchase = 0;
    let purchaseR = 0;
    let sale = 0;
    let saleR = 0;
    let total = 0;

    godown.items.forEach((item) => {
      // const itemPiece = 1;
      const itemPiece = item?.item_piece;

      const openPurch =
        Number(item.open_purchase_box) * itemPiece +
        Number(item.open_purchase_piece);
      const openSale =
        Number(item.closing_sale_box) * itemPiece +
        Number(item.closing_sale_piece);
      const openPurchR =
        Number(item.open_purchase_return_box) * itemPiece +
        Number(item.open_purchase_return_piece);
      const openSaleR =
        Number(item.closing_sale_return_box) * itemPiece +
        Number(item.closing_sale_return_piece);
      const openingVal = openPurch - openSale - openPurchR + openSaleR;

      const purchaseVal =
        Number(item.purchase_box) * itemPiece + Number(item.purchase_piece);
      const purchaseRVal =
        Number(item.purchase_return_box) * itemPiece +
        Number(item.purchase_return_piece);
      const saleVal =
        Number(item.sale_box) * itemPiece + Number(item.sale_piece);
      const saleRVal =
        Number(item.sale_return_box) * itemPiece +
        Number(item.sale_return_piece);

      const totalVal =
        openingVal + purchaseVal - purchaseRVal - saleVal + saleRVal;

      opening += openingVal;
      purchase += purchaseVal;
      purchaseR += purchaseRVal;
      sale += saleVal;
      saleR += saleRVal;
      total += totalVal;
    });

    return {
      ...godown,
      opening,
      purchase,
      purchaseR,
      sale,
      saleR,
      total,
    };
  });

  const BranchHeader = () => (
    <div
      className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="lg:w-64 xl:w-72 shrink-0">
          <h1 className="text-xl font-bold text-gray-800 truncate">
            Stock Go Down Summary{" "}
          </h1>
          <p className="text-md text-gray-500 truncate">
            Add a Stock godown to Visit Report{" "}
          </p>
        </div>

        <form className="bg-white p-3 rounded-md shadow-xs  ">
          <div className="flex flex-col lg:flex-col lg:items-end gap-3  ">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1  items-center">
              <div className="space-y-1 ">
                <label className={`text-xs ${ButtonConfig.cardLabel} block`}>
                  From Date
                </label>
                <Input
                  type="date"
                  value={formData.from_date}
                  onChange={(e) => handleInputChange("from_date", e)}
                />
              </div>
              <div className="space-y-1 ">
                <label className={`text-xs ${ButtonConfig.cardLabel} block`}>
                  To Date
                </label>
                <Input
                  type="date"
                  value={formData.to_date}
                  onChange={(e) => handleInputChange("to_date", e)}
                />
              </div>
              <div className="w-full md:w-48">
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-1 font-medium`}
                >
                  Item
                </label>
                <MemoizedSelect
                  value={formData.item_id}
                  onChange={(e) => handleInputChange("item_id", e)}
                  options={
                    itemsData?.items?.map((product) => ({
                      value: product.id,
                      label: product.item_name,
                    })) || []
                  }
                  placeholder="Select Item"
                />
              </div>
            </div>

            <div className="flex gap-2  ">
              <div className="w-full md:w-48">
                <MemoizedSelect
                  value={formData.godown_id}
                  onChange={(e) => handleInputChange("godown_id", e)}
                  options={
                    godownData?.godown?.map((product) => ({
                      value: product.id,
                      label: product.godown,
                    })) || []
                  }
                  placeholder="Select GoDown"
                  className="text-xs h-8"
                />
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                className={` w-24 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={handlePrintPdf}
              >
                <Printer className="h-3 w-3 mr-1" /> Print
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
  const grand = {
    opening: processedStock.reduce((sum, g) => sum + g.opening, 0),
    purchase: processedStock.reduce((sum, g) => sum + g.purchase, 0),
    purchaseR: processedStock.reduce((sum, g) => sum + g.purchaseR, 0),
    sale: processedStock.reduce((sum, g) => sum + g.sale, 0),
    saleR: processedStock.reduce((sum, g) => sum + g.saleR, 0),
    total: processedStock.reduce((sum, g) => sum + g.total, 0),
  };
  return (
    <Page>
      <div className="p-0 md:p-4">
        <div className="sm:hidden">
          <div
            className={`sm:sticky relative top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-2 sm:gap-4">
              {/* Title Section */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Stock Go Down Summary
                </h1>
              </div>

              {/* Date Inputs */}
              <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4 w-full">
                {/* From Date */}
                <div className="w-full md:w-auto">
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-xs mb-1 font-medium`}
                  >
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.from_date}
                    className="bg-white w-full text-sm p-1"
                    onChange={(e) => handleInputChange("from_date", e)}
                    placeholder="From Date"
                  />
                </div>

                {/* To Date */}
                <div className="w-full md:w-auto">
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-xs mb-1 font-medium`}
                  >
                    To Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.to_date}
                    className="bg-white w-full text-sm p-1"
                    onChange={(e) => handleInputChange("to_date", e)}
                    placeholder="To Date"
                  />
                </div>

                {/* Select Item */}
                <div className="w-full md:w-48">
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-xs mb-1 font-medium`}
                  >
                    Item
                  </label>
                  <MemoizedSelect
                    value={formData.item_id}
                    onChange={(e) => handleInputChange("item_id", e)}
                    options={
                      itemsData?.items?.map((product) => ({
                        value: product.id,
                        label: product.item_name,
                      })) || []
                    }
                    placeholder="Select Item"
                    className="text-xs h-7"
                  />
                </div>

                {/* Select Godown */}
                <div className="w-full md:w-48">
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-xs mb-1 font-medium`}
                  >
                    GoDown
                  </label>
                  <MemoizedSelect
                    value={formData.godown_id}
                    onChange={(e) => handleInputChange("godown_id", e)}
                    options={
                      godownData?.godown?.map((product) => ({
                        value: product.id,
                        label: product.godown,
                      })) || []
                    }
                    placeholder="Select GoDown"
                    className="text-xs h-7"
                  />
                </div>
              </div>

              {/* Print Button */}
              <div className="absolute top-0 right-0 ">
                <button
                  className={` sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-bl-2xl `}
                  onClick={handlePrintPdf}
                >
                  <Printer className="h-3 w-3 " />
                </button>
              </div>
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
          <div className="hidden print:block">
            <div className="flex justify-between ">
              <h1 className="text-left text-2xl font-semibold mb-3 ">
                Stock Go Down Summary
              </h1>
              <div className="flex space-x-6">
                <h1>
                  {" "}
                  From - {moment(formData.from_date).format("DD-MMM-YYYY")}
                </h1>
                <h1>To -{moment(formData.to_date).format("DD-MMM-YYYY")}</h1>
              </div>
            </div>
          </div>

          <table className="w-full border-collapse border border-black">
            <thead className="bg-gray-100 ">
              <tr>
                <th
                  className="border border-black px-2 py-2 text-center"
                  rowSpan={2}
                >
                  Item Name
                </th>

                {singlebranch === "Yes" && doublebranch === "Yes" ? (
                  <>
                    <th
                      className="border border-black px-2 py-2 text-center"
                      colSpan={2}
                    >
                      Open Balance
                    </th>
                    <th
                      className="border border-black px-2 py-2 text-center"
                      colSpan={2}
                    >
                      Purchase
                    </th>
                    <th
                      className="border border-black px-2 py-2 text-center"
                      colSpan={2}
                    >
                      Purchase Return
                    </th>
                    <th
                      className="border border-black px-2 py-2 text-center"
                      colSpan={2}
                    >
                      Dispatch
                    </th>
                    <th
                      className="border border-black px-2 py-2 text-center"
                      colSpan={2}
                    >
                      Dispatch Return
                    </th>
                    <th
                      className="border border-black px-2 py-2 text-center"
                      colSpan={2}
                    >
                      Close Balance
                    </th>
                  </>
                ) : (
                  <>
                    <th
                      className="border border-black px-2 py-2 text-center"
                      rowSpan={2}
                    >
                      Open Balance
                    </th>
                    <th
                      className="border border-black px-2 py-2 text-center"
                      rowSpan={2}
                    >
                      Purchase
                    </th>
                    <th
                      className="border border-black px-2 py-2 text-center"
                      rowSpan={2}
                    >
                      Purchase Return
                    </th>
                    <th
                      className="border border-black px-2 py-2 text-center"
                      rowSpan={2}
                    >
                      Dispatch
                    </th>
                    <th
                      className="border border-black px-2 py-2 text-center"
                      rowSpan={2}
                    >
                      Dispatch Return
                    </th>
                    <th
                      className="border border-black px-2 py-2 text-center"
                      rowSpan={2}
                    >
                      Close Balance
                    </th>
                  </>
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
                  <th className="border border-black px-2 py-2 text-center">
                    Box
                  </th>
                  <th className="border border-black px-2 py-2 text-center">
                    Piece
                  </th>
                  <th className="border border-black px-2 py-2 text-center">
                    Box
                  </th>
                  <th className="border border-black px-2 py-2 text-center">
                    Piece
                  </th>
                  <th className="border border-black px-2 py-2 text-center">
                    Box
                  </th>
                  <th className="border border-black px-2 py-2 text-center">
                    Piece
                  </th>
                  <th className="border border-black px-2 py-2 text-center">
                    Box
                  </th>
                  <th className="border border-black px-2 py-2 text-center">
                    Piece
                  </th>
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
              {processedStock.map((godown) => (
                <React.Fragment key={godown.godown_id}>
                  <tr className="bg-blue-100">
                    {singlebranch === "Yes" && doublebranch === "Yes" ? (
                      <td
                        className="border border-black px-2 py-2 font-bold text-left"
                        colSpan={14}
                      >
                        {godown.godown_name}
                      </td>
                    ) : (
                      <td
                        className="border border-black px-2 py-2 font-bold text-left"
                        colSpan={7}
                      >
                        {godown.godown_name}
                      </td>
                    )}
                  </tr>

                  {godown.items.map((item) => {
                    const itemPiece = item.item_piece;

                    const openPurch =
                      Number(item.open_purchase_box) * itemPiece +
                      Number(item.open_purchase_piece);
                    const openSale =
                      Number(item.closing_sale_box) * itemPiece +
                      Number(item.closing_sale_piece);
                    const openPurchR =
                      Number(item.open_purchase_return_box) * itemPiece +
                      Number(item.open_purchase_return_piece);
                    const openSaleR =
                      Number(item.closing_sale_return_box) * itemPiece +
                      Number(item.closing_sale_return_piece);
                    const opening =
                      openPurch - openSale - openPurchR + openSaleR;

                    const purchase =
                      Number(item.purchase_box) * itemPiece +
                      Number(item.purchase_piece);
                    const purchaseR =
                      Number(item.purchase_return_box) * itemPiece +
                      Number(item.purchase_return_piece);
                    const sale =
                      Number(item.sale_box) * itemPiece +
                      Number(item.sale_piece);
                    const saleR =
                      Number(item.sale_return_box) * itemPiece +
                      Number(item.sale_return_piece);

                    const total = opening + purchase - purchaseR - sale + saleR;
                    const toBoxPiece = (val) => ({
                      box: Math.floor(val / itemPiece),
                      piece: val % itemPiece,
                    });

                    const openingBP = toBoxPiece(opening);
                    const purchaseBP = toBoxPiece(purchase);
                    const purchaseRBP = toBoxPiece(purchaseR);
                    const saleBP = toBoxPiece(sale);
                    const saleRBP = toBoxPiece(saleR);
                    const totalBP = toBoxPiece(total);

                    return (
                      <tr key={item.item_id} className="hover:bg-gray-50">
                        <td className="border border-black px-2 py-2">
                          {item.item_name}
                        </td>

                        {singlebranch === "Yes" && doublebranch === "Yes" ? (
                          <>
                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                openingBP.box == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {openingBP.box}
                            </td>

                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                openingBP.piece == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {openingBP.piece}
                            </td>

                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                purchaseBP.box == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {purchaseBP.box}
                            </td>
                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                purchaseBP.piece == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {purchaseBP.piece}
                            </td>

                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                purchaseRBP.box == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {purchaseRBP.box}
                            </td>
                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                purchaseRBP.piece == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {purchaseRBP.piece}
                            </td>

                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                saleBP.box == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {saleBP.box}
                            </td>
                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                saleBP.piece == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {saleBP.piece}
                            </td>

                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                saleRBP.box == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {saleRBP.box}
                            </td>
                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                saleRBP.piece == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {saleRBP.piece}
                            </td>

                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                totalBP.box == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {totalBP.box}
                            </td>
                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                totalBP.piece == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {totalBP.piece}
                            </td>
                          </>
                        ) : (
                          <>
                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                opening == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {opening}
                            </td>
                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                purchase == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {purchase}
                            </td>
                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                purchaseR == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {purchaseR}
                            </td>
                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                sale == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {sale}
                            </td>
                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                saleR == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {saleR}
                            </td>
                            <td
                              className={`border border-black px-2 py-2 text-right ${
                                total == "0" ? "opacity-50" : ""
                              }`}
                            >
                              {total}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}

                  <tr className="bg-yellow-100 font-semibold">
                    <td className="border border-black px-2 py-2 text-right">
                      Total:
                    </td>

                    {singlebranch === "Yes" && doublebranch === "Yes" ? (
                      <>
                        <td className="border border-black px-2 py-2 text-right">
                          {toBoxPiece(godown.opening).box}
                        </td>
                        <td className="border border-black px-2 py-2 text-right">
                          {toBoxPiece(godown.opening).piece}
                        </td>

                        <td className="border border-black px-2 py-2 text-right">
                          {toBoxPiece(godown.purchase).box}
                        </td>
                        <td className="border border-black px-2 py-2 text-right">
                          {toBoxPiece(godown.purchase).piece}
                        </td>

                        <td className="border border-black px-2 py-2 text-right">
                          {toBoxPiece(godown.purchaseR).box}
                        </td>
                        <td className="border border-black px-2 py-2 text-right">
                          {toBoxPiece(godown.purchaseR).piece}
                        </td>

                        <td className="border border-black px-2 py-2 text-right">
                          {toBoxPiece(godown.sale).box}
                        </td>
                        <td className="border border-black px-2 py-2 text-right">
                          {toBoxPiece(godown.sale).piece}
                        </td>

                        <td className="border border-black px-2 py-2 text-right">
                          {toBoxPiece(godown.saleR).box}
                        </td>
                        <td className="border border-black px-2 py-2 text-right">
                          {toBoxPiece(godown.saleR).piece}
                        </td>

                        <td className="border border-black px-2 py-2 text-right">
                          {toBoxPiece(godown.total).box}
                        </td>
                        <td className="border border-black px-2 py-2 text-right">
                          {toBoxPiece(godown.total).piece}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border border-black px-2 py-2 text-right">
                          {godown.opening}
                        </td>
                        <td className="border border-black px-2 py-2 text-right">
                          {godown.purchase}
                        </td>
                        <td className="border border-black px-2 py-2 text-right">
                          {godown.purchaseR}
                        </td>
                        <td className="border border-black px-2 py-2 text-right">
                          {godown.sale}
                        </td>
                        <td className="border border-black px-2 py-2 text-right">
                          {godown.saleR}
                        </td>
                        <td className="border border-black px-2 py-2 text-right">
                          {godown.total}
                        </td>
                      </>
                    )}
                  </tr>
                </React.Fragment>
              ))}

              <tr className="bg-green-200 font-bold">
                <td className="border border-black px-2 py-2 text-right">
                  Grand Total:
                </td>

                {singlebranch === "Yes" && doublebranch === "Yes" ? (
                  <>
                    <td className="border border-black px-2 py-2 text-right">
                      {toBoxPiece(grand.opening).box}
                    </td>
                    <td className="border border-black px-2 py-2 text-right">
                      {toBoxPiece(grand.opening).piece}
                    </td>

                    <td className="border border-black px-2 py-2 text-right">
                      {toBoxPiece(grand.purchase).box}
                    </td>
                    <td className="border border-black px-2 py-2 text-right">
                      {toBoxPiece(grand.purchase).piece}
                    </td>

                    <td className="border border-black px-2 py-2 text-right">
                      {toBoxPiece(grand.purchaseR).box}
                    </td>
                    <td className="border border-black px-2 py-2 text-right">
                      {toBoxPiece(grand.purchaseR).piece}
                    </td>

                    <td className="border border-black px-2 py-2 text-right">
                      {toBoxPiece(grand.sale).box}
                    </td>
                    <td className="border border-black px-2 py-2 text-right">
                      {toBoxPiece(grand.sale).piece}
                    </td>

                    <td className="border border-black px-2 py-2 text-right">
                      {toBoxPiece(grand.saleR).box}
                    </td>
                    <td className="border border-black px-2 py-2 text-right">
                      {toBoxPiece(grand.saleR).piece}
                    </td>

                    <td className="border border-black px-2 py-2 text-right">
                      {toBoxPiece(grand.total).box}
                    </td>
                    <td className="border border-black px-2 py-2 text-right">
                      {toBoxPiece(grand.total).piece}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="border border-black px-2 py-2 text-right">
                      {grand.opening}
                    </td>
                    <td className="border border-black px-2 py-2 text-right">
                      {grand.purchase}
                    </td>
                    <td className="border border-black px-2 py-2 text-right">
                      {grand.purchaseR}
                    </td>
                    <td className="border border-black px-2 py-2 text-right">
                      {grand.sale}
                    </td>
                    <td className="border border-black px-2 py-2 text-right">
                      {grand.saleR}
                    </td>
                    <td className="border border-black px-2 py-2 text-right">
                      {grand.total}
                    </td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
};

export default StockGoDown;
