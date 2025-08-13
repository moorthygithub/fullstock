import { fetchPreBookingById } from "@/api";
import usetoken from "@/api/usetoken";
import Loader from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";
import { IMAGE_URL, NO_IMAGE_URL } from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useQuery } from "@tanstack/react-query";
import html2pdf from "html2pdf.js";
import { Printer } from "lucide-react";
import moment from "moment";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import Page from "../dashboard/page";
import { toggleDispatchColumn } from "@/redux/dispatchColumnVisibilitySlice";

const PreBookingView = () => {
  const dispatch = useDispatch();

  const { id } = useParams();
  const containerRef = useRef();
  const token = usetoken();
  const singlebranch = useSelector((state) => state.auth.branch_s_unit);
  const doublebranch = useSelector((state) => state.auth.branch_d_unit);
  const columnVisibility = useSelector(
    (state) => state.dispatchcolumnVisibility
  );
  const handleToggle = (key) => {
    dispatch(toggleDispatchColumn(key));
  };
  console.log(columnVisibility, "columnVisibility");

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "PreBooking",
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

  const { data: prebookingByid, isLoading } = useQuery({
    queryKey: ["prebookingByid", id],
    queryFn: () => fetchPreBookingById(id, token),
    enabled: !!id,
  });
  const totalPrebookingSubPiece = prebookingByid?.prebookingsub?.reduce(
    (total, row) => total + row.pre_booking_sub_piece,
    0
  );
  const totalPreBookingSubBox = prebookingByid?.prebookingsub?.reduce(
    (total, row) => total + row.pre_booking_sub_box,
    0
  );
  const totalPreBookingWeight = prebookingByid?.prebookingsub?.reduce(
    (total, row) => total + row.item_weight * row.pre_booking_sub_box,
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
        margin: 10,
        filename: "PreBooking.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();
  };
  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      </Page>
    );
  }
  return (
    <Page>
      <div
        className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-4 mb-2 grid grid-cols-1 overflow-x-auto`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Title Section */}
          <h1 className="text-lg sm:text-xl font-bold text-center sm:text-left">
            PreBooking{" "}
          </h1>

          {/* Button Section */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {Object.keys(columnVisibility)
              .filter((key) => key === "prebookimage")
              .map((key) => (
                <div key={key} className="flex items-center space-x-2">
                  <span className="capitalize">Image</span>
                  <label className="flex cursor-pointer items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg shadow hover:bg-gray-200 transition duration-200">
                    <input
                      type="checkbox"
                      checked={columnVisibility[key]}
                      onChange={() => handleToggle(key)}
                      className="accent-blue-600 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              ))}

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
        <h2 className="text-center font-bold text-lg py-2 ">PRE BOOK</h2>

        <div className="w-full border border-black mb-4 grid grid-cols-2">
          <div className="border-r border-black">
            <div className="p-2 border-b border-black">
              <span className="font-medium">Name:</span>{" "}
              {prebookingByid?.buyer.buyer_name || ""}
            </div>
            <div className="p-2">
              <span className="font-medium">Ref No:</span>{" "}
              {prebookingByid?.prebooking?.pre_booking_ref_no || ""}
            </div>
          </div>
          <div>
            <div className="p-2 border-b border-black">
              <span className="font-medium">City:</span>{" "}
              {prebookingByid?.buyer.buyer_city || ""}
            </div>
            <div className="p-2">
              <span className="font-medium">Date:</span>{" "}
              {prebookingByid?.prebooking?.pre_booking_date
                ? moment(prebookingByid?.prebooking.pre_booking_date).format(
                    "DD-MMM-YYYY"
                  )
                : ""}
            </div>
          </div>
        </div>

        <table className="w-full border-collapse border border-black">
          <thead className="bg-gray-200 border border-black">
            <tr className="border border-black">
              <th className="p-2 border border-black" rowSpan={2}>
                ITEM NAME
              </th>
              {columnVisibility.prebookimage && (
                <th className="p-2 border border-black">IMAGE</th>
              )}
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
            {prebookingByid?.prebookingsub?.map((row, index) => {
              return (
                <tr key={index} className="border border-black">
                  <td className="p-2 border border-black">{row.item_name}</td>
                  {columnVisibility.prebookimage && (
                    <td className="p-2  flex justify-center">
                      {row.item_image && (
                        <img
                          src={
                            row.item_image
                              ? `${IMAGE_URL}${row.item_image}`
                              : NO_IMAGE_URL
                          }
                          alt={row.item_name}
                          className="w-auto h-10 object-cover inline-block mr-2"
                        />
                      )}
                    </td>
                  )}
                  <td className="p-2 border border-black">{row.item_size}</td>

                  {singlebranch === "Yes" && doublebranch === "Yes" ? (
                    <>
                      <td className="border border-black px-2 py-2 text-center">
                        {row.pre_booking_sub_box}
                      </td>
                      <td className="border border-black px-2 py-2 text-center">
                        {row.pre_booking_sub_piece}
                      </td>
                    </>
                  ) : (
                    <td className="border border-black px-2 py-2 text-right">
                      {row.pre_booking_sub_box}
                    </td>
                  )}
                </tr>
              );
            })}

            <tr className="border border-black bg-gray-200 font-semibold">
              <td className="p-2 border border-black">TOTAL</td>
              <td className="p-2 border-l border-black" />
              {columnVisibility.prebookimage && <td />}
              {singlebranch == "Yes" && doublebranch == "Yes" ? (
                <>
                  <td className="border border-black px-2 py-2 text-center">
                    {totalPreBookingSubBox}
                  </td>
                  <td className="border border-black px-2 py-2 text-center">
                    {totalPrebookingSubPiece}
                  </td>
                </>
              ) : (
                <td className="border border-black px-2 py-2 text-right">
                  {totalPreBookingSubBox}
                </td>
              )}
            </tr>
          </tbody>
        </table>

        {/* Footer Details */}
        <div className="mt-2 text-sm border border-black">
          {totalPreBookingWeight ? (
            <p className="py-1 px-2 border-b border-black">
              WEIGHT : {totalPreBookingWeight} KG
            </p>
          ) : (
            ""
          )}
          <p className="py-1 px-2 border-b border-black">
            VEHICLE : {prebookingByid?.prebooking?.pre_booking_vehicle_no || ""}
          </p>
          <p className="py-1 px-2">
            REMARK : {prebookingByid?.prebooking?.pre_booking_remark || ""}
          </p>
        </div>
      </div>
    </Page>
  );
};

export default PreBookingView;
