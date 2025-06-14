import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { STOCK_REPORT } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Loader from "@/components/loader/Loader";
import { Input } from "@/components/ui/input";
import { ButtonConfig } from "@/config/ButtonConfig";
import moment from "moment";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";

const Stock = () => {
  const containerRef = useRef();
  const singlebranch = useSelector((state) => state.auth.branch_s_unit);
  const doublebranch = useSelector((state) => state.auth.branch_d_unit);
  // const doublebranch = "No";
  const sliderTrackRefTop = useRef(null);
  const sliderTrackRefBottom = useRef(null);
  const [maxTotal, setMaxTotal] = useState(0);
  const [range, setRange] = useState([0, 0]);
  const [minTotal, setMinTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
  });
  const token = usetoken();

  const fetchBuyerData = async () => {
    const response = await apiClient.post(
      `${STOCK_REPORT}`,
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
    data: buyerData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["buyerData", formData],
    queryFn: fetchBuyerData,
  });

  useEffect(() => {
    if (buyerData && buyerData.length > 0) {
      const allTotals = buyerData.map((buyer) => {
        const itemPiece = Number(buyer.item_piece) || 1;
        const opening =
          Number(buyer.openpurch) * itemPiece +
          Number(buyer.openpurch_piece) -
          (Number(buyer.closesale) * itemPiece +
            Number(buyer.closesale_piece)) -
          (Number(buyer.openpurchR) * itemPiece +
            Number(buyer.openpurchR_piece)) +
          (Number(buyer.closesaleR) * itemPiece +
            Number(buyer.closesaleR_piece));

        const purchase =
          Number(buyer.purch) * itemPiece + Number(buyer.purch_piece);
        const purchaseR =
          Number(buyer.purchR) * itemPiece + Number(buyer.purchR_piece);
        const sale = Number(buyer.sale) * itemPiece + Number(buyer.sale_piece);
        const saleR =
          Number(buyer.saleR) * itemPiece + Number(buyer.saleR_piece);

        return opening + purchase - purchaseR - sale + saleR;
      });

      const min = Math.min(...allTotals);
      const max = Math.max(...allTotals);

      setMinTotal(min);
      setMaxTotal(max);
      setRange([min, max]);
    }
  }, [buyerData]);

  const handleTrackClick = (e, sliderRef) => {
    setLoading(true);
    const rect = sliderRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    let clickedValue = Math.round(
      (clickX / width) * (maxTotal - minTotal) + minTotal
    );

    clickedValue = Math.max(minTotal, Math.min(maxTotal, clickedValue));

    const [start, end] = range;

    let newRange;
    if (Math.abs(clickedValue - start) < Math.abs(clickedValue - end)) {
      newRange = [Math.min(clickedValue, end), end];
    } else {
      newRange = [start, Math.max(clickedValue, start)];
    }

    setTimeout(() => {
      setRange(newRange);
      setLoading(false);
    }, 200);
  };

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
  // if (isLoading || loading) {
  //   return (
  //     <Page>
  //       <div className="flex justify-center items-center h-full">
  //         <Loader />
  //       </div>
  //     </Page>
  //   );
  // }

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
                  Stock Summary
                </h1>
              </div>

              {/* Date Inputs */}
              <div className="flex  flex-row items-center gap-2 w-full md:w-auto">
                <div className="w-full sm:w-auto">
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-xs mb-1 font-medium`}
                  >
                    From Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.from_date}
                    className="bg-white w-full sm:w-auto text-sm p-1"
                    onChange={(e) => handleInputChange("from_date", e)}
                    placeholder="From Date"
                  />
                </div>

                <div className="w-full sm:w-auto">
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-xs mb-1 font-medium`}
                  >
                    To Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    className="bg-white w-full sm:w-auto text-sm p-1"
                    value={formData.to_date}
                    onChange={(e) => handleInputChange("to_date", e)}
                    placeholder="To Date"
                  />
                </div>
              </div>
              <div className="w-full sm:w-96 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 select-none font-sans">
                <div className="flex justify-between items-center mb-3">
                  <label className="font-semibold text-gray-700 dark:text-gray-200">
                    Available Between:{" "}
                    <span className="text-blue-600 font-mono">{range[0]}</span>{" "}
                    –{" "}
                    <span className="text-blue-600 font-mono">{range[1]}</span>
                  </label>
                  <button
                    onClick={() => setRange([minTotal, maxTotal])}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Reset Range
                  </button>
                </div>

                <div
                  className="relative h-10 flex items-center cursor-pointer"
                  ref={sliderTrackRefBottom}
                  onClick={(e) => handleTrackClick(e, sliderTrackRefBottom)}
                >
                  <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-300 rounded-full -translate-y-1/2" />
                  <div
                    className="absolute top-1/2 h-2 bg-blue-600 rounded-full -translate-y-1/2 transition-all duration-150 ease-in-out "
                    style={{
                      left: `${
                        ((range[0] - minTotal) / (maxTotal - minTotal)) * 100
                      }%`,
                      width: `${
                        ((range[1] - range[0]) / (maxTotal - minTotal)) * 100
                      }%`,
                    }}
                  />

                  <input
                    type="range"
                    min={minTotal}
                    max={maxTotal}
                    value={range[0]}
                    onChange={(e) => {
                      const val = Math.min(Number(e.target.value), range[1]);
                      setRange([Math.max(minTotal, val), range[1]]);
                    }}
                    className="absolute w-full h-10 appearance-none bg-transparent pointer-events-none"
                    style={{ zIndex: range[0] === range[1] ? 5 : 3 }}
                  />
                  <div
                    className="absolute top-1/2 rounded-full bg-white border-4 border-blue-600 w-6 h-6 shadow-lg -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      left: `${
                        ((range[0] - minTotal) / (maxTotal - minTotal)) * 100
                      }%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 10,
                    }}
                  />

                  <input
                    type="range"
                    min={minTotal}
                    max={maxTotal}
                    value={range[1]}
                    onChange={(e) => {
                      const val = Math.max(Number(e.target.value), range[0]);
                      setRange([range[0], Math.min(maxTotal, val)]);
                    }}
                    className="absolute w-full h-10 appearance-none bg-transparent pointer-events-none"
                    style={{ zIndex: 4 }}
                  />
                  <div
                    className="absolute top-1/2 rounded-full bg-white border-4 border-blue-600 w-6 h-6 shadow-lg -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      left: `${
                        ((range[1] - minTotal) / (maxTotal - minTotal)) * 100
                      }%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 10,
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                  <span>{minTotal}</span>
                  <span>{maxTotal}</span>
                </div>
              </div>
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
          <div
            className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-4 mb-2`}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-8">
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Stock Summary
                </h1>
                <p className="text-gray-600 mt-1">
                  Add a Stock to Visit Report
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                <div>
                  <div className="w-full sm:w-auto">
                    <label
                      className={`block ${ButtonConfig.cardLabel} text-sm mb-1 font-medium`}
                    >
                      From Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.from_date}
                      className="bg-white w-full sm:w-auto rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => handleInputChange("from_date", e)}
                      placeholder="Enter From Date"
                    />
                  </div>

                  <div className="w-full sm:w-auto">
                    <label
                      className={`block ${ButtonConfig.cardLabel} text-sm mb-1 font-medium`}
                    >
                      To Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.to_date}
                      className="bg-white w-full sm:w-auto rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => handleInputChange("to_date", e)}
                      placeholder="Enter To Date"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-96 p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 select-none font-sans">
                  <div className="flex justify-between items-center mb-3">
                    <label className="font-semibold text-gray-700 dark:text-gray-200">
                      Available Between:{" "}
                      <span className="text-blue-600 font-mono">
                        {range[0]}
                      </span>{" "}
                      –{" "}
                      <span className="text-blue-600 font-mono">
                        {range[1]}
                      </span>
                    </label>
                    <button
                      onClick={() => setRange([minTotal, maxTotal])}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Reset Range
                    </button>
                  </div>

                  <div
                    className="relative h-10 flex items-center cursor-pointer"
                    ref={sliderTrackRefTop}
                    onClick={(e) => handleTrackClick(e, sliderTrackRefTop)}
                  >
                    <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-300 rounded-full -translate-y-1/2" />
                    <div
                      className="absolute top-1/2 h-2 bg-blue-600 rounded-full -translate-y-1/2 transition-all duration-150 ease-in-out "
                      style={{
                        left: `${
                          ((range[0] - minTotal) / (maxTotal - minTotal)) * 100
                        }%`,
                        width: `${
                          ((range[1] - range[0]) / (maxTotal - minTotal)) * 100
                        }%`,
                      }}
                    />

                    {/* Left thumb input and handle */}
                    <input
                      type="range"
                      min={minTotal}
                      max={maxTotal}
                      value={range[0]}
                      onChange={(e) => {
                        const val = Math.min(Number(e.target.value), range[1]);
                        setRange([Math.max(minTotal, val), range[1]]);
                      }}
                      className="absolute w-full h-10 appearance-none bg-transparent pointer-events-none"
                      style={{ zIndex: range[0] === range[1] ? 5 : 3 }}
                    />
                    <div
                      className="absolute top-1/2 rounded-full bg-white border-4 border-blue-600 w-6 h-6 shadow-lg -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        left: `${
                          ((range[0] - minTotal) / (maxTotal - minTotal)) * 100
                        }%`,
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                      }}
                    />

                    {/* Right thumb input and handle */}
                    <input
                      type="range"
                      min={minTotal}
                      max={maxTotal}
                      value={range[1]}
                      onChange={(e) => {
                        const val = Math.max(Number(e.target.value), range[0]);
                        setRange([range[0], Math.min(maxTotal, val)]);
                      }}
                      className="absolute w-full h-10 appearance-none bg-transparent pointer-events-none"
                      style={{ zIndex: 4 }}
                    />
                    <div
                      className="absolute top-1/2 rounded-full bg-white border-4 border-blue-600 w-6 h-6 shadow-lg -translate-y-1/2 pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        left: `${
                          ((range[1] - minTotal) / (maxTotal - minTotal)) * 100
                        }%`,
                        transform: "translate(-50%, -50%)",
                        zIndex: 10,
                      }}
                    />
                  </div>

                  {/* Min and Max labels */}
                  <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
                    <span>{minTotal}</span>
                    <span>{maxTotal}</span>
                  </div>
                </div>
              </div>

              {/* Print Button */}
              <div className="flex justify-center md:justify-end w-full md:w-auto">
                <Button
                  className={`w-full sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                  onClick={handlePrintPdf}
                >
                  <Printer className="h-4 w-4 mr-1" /> Print
                </Button>
              </div>
            </div>
          </div>
        </div>
        {loading || isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader />
          </div>
        ) : (
          <div
            className="overflow-x-auto text-[11px] grid grid-cols-1 p-6 print:p-4"
            ref={containerRef}
          >
            <div className="hidden print:block">
              <div className="flex justify-between ">
                <h1 className="text-left text-2xl font-semibold mb-3 ">
                  Stock Summary
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
              <thead className="bg-gray-100 sticky top-0 z-10">
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

              {buyerData && (
                <tbody>
                  {buyerData
                    .filter((buyer) => {
                      const itemPiece = Number(buyer.item_piece) || 1;

                      const openingPurch =
                        Number(buyer.openpurch) * itemPiece +
                        Number(buyer.openpurch_piece);
                      const openingSale =
                        Number(buyer.closesale) * itemPiece +
                        Number(buyer.closesale_piece);
                      const openingPurchR =
                        Number(buyer.openpurchR) * itemPiece +
                        Number(buyer.openpurchR_piece);
                      const openingSaleR =
                        Number(buyer.closesaleR) * itemPiece +
                        Number(buyer.closesaleR_piece);

                      const opening =
                        openingPurch -
                        openingSale -
                        openingPurchR +
                        openingSaleR;

                      const purchase =
                        Number(buyer.purch) * itemPiece +
                        Number(buyer.purch_piece);
                      const purchaseR =
                        Number(buyer.purchR) * itemPiece +
                        Number(buyer.purchR_piece);
                      const sale =
                        Number(buyer.sale) * itemPiece +
                        Number(buyer.sale_piece);
                      const saleR =
                        Number(buyer.saleR) * itemPiece +
                        Number(buyer.saleR_piece);

                      const total =
                        opening + purchase - purchaseR - sale + saleR;
                      return total >= range[0] && total <= range[1];
                    })
                    .map((buyer, index) => {
                      const itemPiece = Number(buyer.item_piece) || 1;

                      const openingPurch =
                        Number(buyer.openpurch) * itemPiece +
                        Number(buyer.openpurch_piece);
                      const openingSale =
                        Number(buyer.closesale) * itemPiece +
                        Number(buyer.closesale_piece);
                      const openingPurchR =
                        Number(buyer.openpurchR) * itemPiece +
                        Number(buyer.openpurchR_piece);
                      const openingSaleR =
                        Number(buyer.closesaleR) * itemPiece +
                        Number(buyer.closesaleR_piece);

                      const opening =
                        openingPurch -
                        openingSale -
                        openingPurchR +
                        openingSaleR;

                      const purchase =
                        Number(buyer.purch) * itemPiece +
                        Number(buyer.purch_piece);
                      const purchaseR =
                        Number(buyer.purchR) * itemPiece +
                        Number(buyer.purchR_piece);
                      const sale =
                        Number(buyer.sale) * itemPiece +
                        Number(buyer.sale_piece);
                      const saleR =
                        Number(buyer.saleR) * itemPiece +
                        Number(buyer.saleR_piece);

                      const total =
                        opening + purchase - purchaseR - sale + saleR;

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
                        <tr
                          key={buyer.id || buyer.item_name}
                          className="hover:bg-gray-50"
                        >
                          <td className="border border-black px-2 py-2">
                            {buyer.item_name}
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
                                {" "}
                                {openingBP.piece}
                              </td>

                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  purchaseBP.box == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {purchaseBP.box}
                              </td>
                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  purchaseBP.piece == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {purchaseBP.piece}
                              </td>

                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  purchaseRBP.box == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {purchaseRBP.box}
                              </td>
                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  purchaseRBP.piece == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {purchaseRBP.piece}
                              </td>

                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  saleBP.box == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {saleBP.box}
                              </td>
                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  saleBP.piece == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {saleBP.piece}
                              </td>

                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  saleRBP.box == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {saleRBP.box}
                              </td>
                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  saleRBP.piece == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {saleRBP.piece}
                              </td>

                              <td
                                className={`border border-black px-2 py-2 text-right ${
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
                          ) : (
                            <>
                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  opening == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {opening}
                              </td>
                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  purchase == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {purchase}
                              </td>
                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  purchaseR == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {purchaseR}
                              </td>
                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  sale == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {sale}
                              </td>
                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  saleR == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {saleR}
                              </td>
                              <td
                                className={`border border-black px-2 py-2 text-right ${
                                  total == "0" ? "opacity-50" : ""
                                }`}
                              >
                                {" "}
                                {total}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                </tbody>
              )}
            </table>
          </div>
        )}
      </div>
    </Page>
  );
};

export default Stock;
