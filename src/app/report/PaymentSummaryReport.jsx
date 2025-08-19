import { PAYMENT_SUMMARY_REPORT } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Loader from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useQuery } from "@tanstack/react-query";
import { Printer, Search } from "lucide-react";
import moment from "moment";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import Page from "../dashboard/page";
const PaymentSummaryReport = () => {
  const containerRef = useRef(null);
  const [formData, setFormData] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
  });
  const token = usetoken();

  const handleInputChange = (field, e) => {
    const value = e.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    refetch();
  };

  const PaymentSummaryData = async () => {
    const response = await apiClient.post(
      `${PAYMENT_SUMMARY_REPORT}`,
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
    data: reportData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["paymentsummaryreport", formData],
    queryFn: PaymentSummaryData,
    enabled: false,
  });
  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Payment_Summary_Report",
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

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      );
    }

    if (isError) {
      return (
        <Card className="w-full max-w-md mx-auto mt-6">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Dispatch Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Unable to retrieve Dispatch information. Please try again.
            </p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    const hasPaymentSummary = reportData?.paymentSummary?.length > 0;
    const hasBuyerSummary = reportData?.buyerpaymentSummary?.length > 0;

    if (hasPaymentSummary || hasBuyerSummary) {
      return (
        <div ref={containerRef} className="mt-4 space-y-6 max-w-4xl mx-auto">
          {hasPaymentSummary && (
            <div className="bg-white rounded-lg shadow-sm p-0 md:p-4">
              <div className="flex justify-between">
                <h2 className="text-lg font-bold mb-4">
                  Payment Summary Report
                </h2>
                <div className="hidden print:block">
                  <h2 className="text-sm font-bold mb-4 flex justify-center">
                    From - {moment(formData.from_date).format("DD MMM YYYY")} To
                    - {moment(formData.to_date).format("DD MMM YYYY")}
                  </h2>
                </div>
              </div>
              <table className="w-full border-collapse border border-gray-300 text-[11px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-2 text-center">
                      Payment Mode
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.paymentSummary.map((transaction, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-2 py-1 text-center border-l border-r">
                        {transaction?.payment_mode || ""}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {transaction?.total_amount || ""}
                      </td>
                    </tr>
                  ))}
                  {reportData?.paymentSummarySum && (
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        Total
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {reportData.paymentSummarySum.total_amount || ""}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {hasBuyerSummary && (
            <div className="bg-white rounded-lg shadow-sm p-0 md:p-4">
              <div className="flex justify-between">
                <h2 className="text-lg font-bold mb-4">
                  Payment Buyer Summary
                </h2>
                <div className="hidden print:block">
                  <h2 className="text-sm font-bold mb-4 flex justify-center">
                    From - {moment(formData.from_date).format("DD MMM YYYY")} To
                    - {moment(formData.to_date).format("DD MMM YYYY")}
                  </h2>
                </div>
              </div>
              <table className="w-full border-collapse border border-gray-300 text-[11px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-2 py-2 text-center">
                      Buyer Name
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.buyerpaymentSummary.map((transaction, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-2 py-1 text-center border-l border-r">
                        {transaction?.buyer_name || ""}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {transaction?.total_amount || ""}
                      </td>
                    </tr>
                  ))}
                  {reportData?.paymentSummarySum && (
                    <tr>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        Total
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {reportData.paymentSummarySum.total_amount || ""}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    // Empty state
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Search className="h-12 w-12 mb-2 opacity-30" />
        <p className="text-md">
          Search for an item to view payment summary details
        </p>
      </div>
    );
  };

  return (
    <Page>
      <div className="p-0 md:p-4">
        {/* Mobile View (sm:hidden) */}
        <div className="sm:hidden">
          <div
            className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-0 mb-2`}
          >
            <div className="flex flex-col gap-2">
              {/* Title + Print Button */}
              <div className="flex justify-between items-center">
                <h1 className="text-base font-bold text-gray-800 px-2">
                  Payment Summary
                </h1>
                <div className="flex gap-[2px]">
                  <button
                    button="submit"
                    form="payment-form"
                    className={` sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md `}
                  >
                    <Search className="h-3 w-3 " />
                  </button>
                  <button
                    className={` sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md `}
                    onClick={handlePrintPdf}
                  >
                    <Printer className="h-3 w-3 " />
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                id="payment-form"
                className="bg-white p-2 rounded-md shadow-xs"
              >
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="space-y-1">
                    <Input
                      type="date"
                      value={formData.from_date}
                      className="text-xs h-7"
                      onChange={(e) => handleInputChange("from_date", e)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="date"
                      value={formData.to_date}
                      className="text-xs h-7"
                      onChange={(e) => handleInputChange("to_date", e)}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* Desktop View (hidden sm:block) */}
        <div className="hidden sm:block">
          <div
            className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="lg:w-64 xl:w-72 shrink-0">
                <h1 className="text-xl font-bold text-gray-800 truncate">
                  Payment Summary
                </h1>
                <p className="text-md text-gray-500 truncate">
                  View payment summary
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-white p-3 rounded-md shadow-xs  "
              >
                <div className="flex flex-col lg:flex-col lg:items-end gap-3  ">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 flex-1  items-center">
                    <div className="space-y-1 ">
                      <label
                        className={`text-xs ${ButtonConfig.cardLabel} block`}
                      >
                        From Date
                      </label>
                      <Input
                        type="date"
                        value={formData.from_date}
                        className="text-xs h-8 w-full"
                        onChange={(e) => handleInputChange("from_date", e)}
                      />
                    </div>
                    <div className="space-y-1 ">
                      <label
                        className={`text-xs ${ButtonConfig.cardLabel} block`}
                      >
                        To Date
                      </label>
                      <Input
                        type="date"
                        value={formData.to_date}
                        className="text-xs h-8 w-full"
                        onChange={(e) => handleInputChange("to_date", e)}
                      />
                    </div>

                    <div className="md:mt-5 flex space-x-3">
                      <Button
                        type="submit"
                        size="sm"
                        className={`h-8  ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                      >
                        <Search className="h-3 w-3 mr-1" />
                        Search
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handlePrintPdf}
                      >
                        <Printer className="h-3 w-3 mr-1" />
                        Print
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        {renderContent()}
      </div>
    </Page>
  );
};

export default PaymentSummaryReport;
