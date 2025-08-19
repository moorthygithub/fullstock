import { PAYMENT_LEDGER_REPORT } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import Loader from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useFetchBuyers } from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import { Printer, Search } from "lucide-react";
import moment from "moment";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import Page from "../dashboard/page";
const PaymentLedgerReport = () => {
  const containerRef = useRef(null);
  const [filters, setFilters] = useState(null);
  const [formData, setFormData] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
    buyer_id: "",
  });
  const [errormsg, setErrorMsg] = useState("");
  const token = usetoken();
  const handleInputChange = (field, e) => {
    const value = e.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.buyer_id) {
      setErrorMsg("Select a Buyer");
      return;
    }
    setFilters({ ...formData });
  };

  const fetchPaymentLedger = async () => {
    const response = await apiClient.post(
      `${PAYMENT_LEDGER_REPORT}`,
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
    queryKey: ["paymentledgerdata", filters],
    queryFn: fetchPaymentLedger,
    enabled: !!filters,
  });

  const { data: buyerData } = useFetchBuyers();

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Ledger_report",
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
              Error Fetching ledger Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Unable to retrieve ledger information. Please try again.
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (reportData?.ledger) {
      const hasLedger = Object.keys(reportData.ledger).length > 0;

      if (!hasLedger) {
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-md">No Data Available</p>
          </div>
        );
      }
      return (
        <div ref={containerRef} className="mt-4 space-y-8 max-w-4xl mx-auto">
          <div className="hidden print:block">
            <div className="flex justify-between ">
              <h2 className="text-lg font-bold mb-4">Ledger Report</h2>
              <div>
                <h2 className="text-sm font-bold flex justify-center">
                  From - {moment(formData.from_date).format("DD MMM YYYY")} To -{" "}
                  {moment(formData.to_date).format("DD MMM YYYY")}
                </h2>
              </div>
            </div>
          </div>
          {Object.entries(reportData.ledger).map(
            ([ledgerName, ledgerData], idx) => (
              <div key={idx} className="bg-white p-4">
                <h2 className="text-lg font-bold mb-2">{ledgerName}</h2>

                <p className="text-sm flex justify-end">
                  <span className="font-semibold">Opening Balance:</span>{" "}
                  {Math.abs(ledgerData.opening_balance)}{" "}
                  {ledgerData.opening_balance < 0 ? "(DR)" : "(CR)"}
                </p>

                {/* Transactions Table */}
                <div className="overflow-x-auto my-2">
                  <table className="w-full border-collapse border border-gray-300 text-[11px]">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 px-2 py-2 text-left">
                          Date
                        </th>
                        <th className="border border-gray-300 px-2 py-2 text-left">
                          Type
                        </th>
                        <th className="border border-gray-300 px-2 py-2 text-right">
                          Debit
                        </th>
                        <th className="border border-gray-300 px-2 py-2 text-right">
                          Credit
                        </th>
                        <th className="border border-gray-300 px-2 py-2 text-right">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerData.transactions.length > 0 ? (
                        ledgerData.transactions.map((txn, i) => (
                          <tr key={i}>
                            <td className="border border-gray-300 px-2 py-1">
                              {moment(txn.date).format("DD MMM YYYY")}
                            </td>
                            <td className="border border-gray-300 px-2 py-1">
                              {txn.type}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right">
                              {Number(txn.debit) == 0 ? "" : txn.debit}
                            </td>
                            <td className="border border-gray-300 px-2 py-1 text-right">
                              {Number(txn.credit) == 0 ? "" : txn.credit}
                            </td>
                            <td
                              className={`border border-gray-300 px-2 py-1 text-right ${
                                txn.balance < 0 ? "bg-red-300" : ""
                              }`}
                            >
                              {txn.balance}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-2 text-gray-500 border border-gray-300"
                          >
                            No transactions
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <p className="text-sm flex justify-end">
                  <span className="font-semibold">Closing Balance:</span>{" "}
                  {Math.abs(ledgerData.closing_balance)}{" "}
                  {ledgerData.closing_balance < 0 ? "(DR)" : "(CR)"}
                </p>
              </div>
            )
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Search className="h-12 w-12 mb-2 opacity-30" />
        <p className="text-md">Search to view invoice & payment details</p>
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
                  Ledger
                </h1>
                <div className="flex gap-[2px]">
                  <button
                    className={` sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} text-sm p-3 rounded-b-md `}
                    onClick={handlePrintPdf}
                  >
                    <Printer className="h-3 w-3 " />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="bg-white p-2 rounded-md shadow-xs"
              >
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="space-y-1">
                    <Input
                      type="date"
                      value={formData.from_date}
                      // className="text-xs h-7"
                      onChange={(e) => handleInputChange("from_date", e)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="date"
                      value={formData.to_date}
                      // className="text-xs h-7"
                      onChange={(e) => handleInputChange("to_date", e)}
                    />
                  </div>

                  <div className="space-y-1">
                    <MemoizedSelect
                      value={formData.buyer_id}
                      onChange={(e) => {
                        handleInputChange("buyer_id", e);
                        if (e) setErrorMsg("");
                      }}
                      options={
                        buyerData?.buyers?.map((buyer) => ({
                          value: buyer.id,
                          label: buyer.buyer_name,
                        })) || []
                      }
                      placeholder="Select Buyer"
                      // className="text-xs h-7 flex-1"
                    />
                    {errormsg && (
                      <p className="text-red-500 text-xs mt-1">{errormsg}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Button
                      type="submit"
                      size="sm"
                      className={`h-9 w-full ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                    >
                      <Search className="h-3 w-3 mr-1" /> Search
                    </Button>
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
                  Ledger
                </h1>
                <p className="text-md text-gray-500 truncate">
                  View Invoice and Payments
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-white p-3 rounded-md shadow-xs  "
              >
                <div className="flex flex-col lg:flex-col lg:items-end gap-3  ">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 flex-1  items-center">
                    <div className="space-y-1 ">
                      <label
                        className={`text-xs ${ButtonConfig.cardLabel} block`}
                      >
                        From Date
                      </label>
                      <Input
                        type="date"
                        value={formData.from_date}
                        // className="text-xs h-8 w-full"
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
                        // className="text-xs h-8 w-full"
                        onChange={(e) => handleInputChange("to_date", e)}
                      />
                    </div>
                    <div className="space-y-1 ">
                      <label
                        className={`text-xs ${ButtonConfig.cardLabel} block`}
                      >
                        Buyer
                      </label>
                      <MemoizedSelect
                        value={formData.buyer_id}
                        onChange={(e) => {
                          handleInputChange("buyer_id", e);
                          if (e) setErrorMsg("");
                        }}
                        options={
                          buyerData?.buyers?.map((buyer) => ({
                            value: buyer.id,
                            label: buyer.buyer_name,
                          })) || []
                        }
                        placeholder="Select Buyer"
                        // className="text-xs h-7"
                      />
                      {errormsg && (
                        <p className="text-red-500 text-xs mt-1">{errormsg}</p>
                      )}
                    </div>
                    <div className="md:mt-5 flex space-x-3">
                      <Button
                        type="submit"
                        size="sm"
                        className={`h-8  ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                      >
                        <Search className="h-3 w-3 mr-1" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handlePrintPdf}
                      >
                        <Printer className="h-3 w-3 mr-1" />
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

export default PaymentLedgerReport;
