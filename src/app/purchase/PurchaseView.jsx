import { PURCHASE_EDIT_LIST } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { decryptId } from "@/components/common/Encryption";
import { Button } from "@/components/ui/button";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useQuery } from "@tanstack/react-query";
import html2pdf from "html2pdf.js";
import { Printer } from "lucide-react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Page from "../dashboard/page";

const PurchaseView = () => {
  const { id } = useParams();
  const decryptedId = decryptId(id);
  const containerRef = useRef();
  const token = usetoken();
  const [purchase, setPurchase] = useState({});
  const [buyer, setBuyer] = useState({});
  const [purchasesubData, setPurchaseSubData] = useState([]);
  const singlebranch = useSelector((state) => state.auth.branch_s_unit);
  const doublebranch = useSelector((state) => state.auth.branch_d_unit);
  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Purchase",
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
  const {
    data: PurchaseId,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["purchaseByid", decryptedId],
    queryFn: async () => {
      const response = await apiClient.get(
        `${PURCHASE_EDIT_LIST}/${decryptedId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
  });

  useEffect(() => {
    if (PurchaseId) {
      setPurchase(PurchaseId.purchase);
      setBuyer(PurchaseId.buyer);
      setPurchaseSubData(PurchaseId.purchaseSub);
    }
  }, [PurchaseId]);
  const totalPurchaseSubPiece = purchasesubData.reduce(
    (total, row) => total + row.purchase_sub_piece,
    0
  );
  const totalPurchaseSubBox = purchasesubData.reduce(
    (total, row) => total + row.purchase_sub_box,
    0
  );
  const totalPurchaseWeight = purchasesubData.reduce(
    (total, row) => total + row.item_weight * row.purchase_sub_box,
    0
  );

  const handleSaveAsPdf = () => {
    if (!containerRef.current) {
      console.error("Element not found");
      return;
    }

    html2pdf()
      .from(containerRef.current)
      .set({
        margin: 10, // Standard margin
        filename: "Purchase.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();
  };

  return (
    <Page>
      <div
        className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-4 mb-2 grid grid-cols-1 overflow-x-auto`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Title Section */}
          <h1 className="text-lg sm:text-xl font-bold text-center sm:text-left">
            Purchase
          </h1>

          {/* Button Section */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              className={`w-full sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              onClick={handlePrintPdf}
            >
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
            <Button
              className={`w-full sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              onClick={handleSaveAsPdf}
            >
              <Printer className="h-4 w-4 mr-1" /> PDF
            </Button>
          </div>
        </div>
      </div>{" "}
      <div
        className="w-full max-w-3xl mx-auto px-4 pb-4 border border-black bg-white"
        ref={containerRef}
      >
        <h2 className="text-center font-bold text-lg py-2 ">PURCHASE</h2>

        <div className="w-full border border-black mb-4 grid grid-cols-2">
          <div className="border-r border-black">
            <div className="p-2 border-b border-black">
              <span className="font-medium">Name:</span> {buyer.buyer_name}
            </div>
            <div className="p-2">
              <span className="font-medium">Ref No:</span>{" "}
              {purchase.purchase_ref}
            </div>
          </div>
          <div>
            <div className="p-2 border-b border-black">
              <span className="font-medium">City:</span> {buyer.buyer_city}
            </div>
            <div className="p-2">
              <span className="font-medium">Date:</span>{" "}
              {moment(purchase.purchase_date).format("DD-MMM-YYYY")}
            </div>
          </div>
        </div>

        <table className="w-full border-collapse border border-black">
          <thead className="bg-gray-200 border border-black">
            <tr className="border border-black">
              <th className="p-2 border border-black" rowSpan={2}>
                ITEM NAME
              </th>
              <th className="p-2 border border-black" rowSpan={2}>
                SIZE
              </th>

              {singlebranch === "Yes" && doublebranch === "Yes" ? (
                <th
                  className="border border-black px-2 py-2 text-center"
                  colSpan={2}
                >
                  QUANTITY
                </th>
              ) : (
                <th
                  className="border border-black px-2 py-2 text-center"
                  rowSpan={2}
                >
                  QUANTITY
                </th>
              )}
            </tr>
            {singlebranch == "Yes" && doublebranch == "Yes" && (
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

          {/* Table Body */}
          <tbody>
            {purchasesubData.map((row, index) => {
              return (
                <tr key={index} className="border border-black">
                  <td className="p-2 border border-black">{row.item_name}</td>
                  <td className="p-2 border border-black">{row.item_size}</td>

                  {singlebranch === "Yes" && doublebranch === "Yes" ? (
                    <>
                      <td className="border border-black px-2 py-2 text-center">
                        {row.purchase_sub_box}
                      </td>
                      <td className="border border-black px-2 py-2 text-center">
                        {row.purchase_sub_piece}
                      </td>
                    </>
                  ) : (
                    <td className="border border-black px-2 py-2 text-right">
                      {row.purchase_sub_box}
                    </td>
                  )}
                </tr>
              );
            })}

            {/* Total Row */}
            <tr className="border border-black bg-gray-200 font-semibold">
              <td className="p-2 border border-black">TOTAL</td>
              <td className="p-2 border border-black"></td>

              {singlebranch == "Yes" && doublebranch == "Yes" ? (
                <>
                  <td className="border border-black px-2 py-2 text-center">
                    {totalPurchaseSubBox}
                  </td>
                  <td className="border border-black px-2 py-2 text-center">
                    {totalPurchaseSubPiece}
                  </td>
                </>
              ) : (
                <td className="border border-black px-2 py-2 text-right">
                  {totalPurchaseSubBox}
                </td>
              )}
            </tr>
          </tbody>
        </table>

        <div className="mt-2 text-sm border border-black">
          {totalPurchaseWeight ? (
            <p className="py-1 px-2 border-b border-black">
              WEIGHT : {totalPurchaseWeight} KG
            </p>
          ) : (
            ""
          )}
          <p className="py-1 px-2 border-b border-black">
            VEHICLE : {purchase.purchase_vehicle_no}
          </p>
          <p className="py-1 px-2">REMARK : {purchase.purchase_remark}</p>
        </div>
      </div>
    </Page>
  );
};

export default PurchaseView;
