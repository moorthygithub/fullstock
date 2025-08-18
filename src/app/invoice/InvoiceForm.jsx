import {
    fetchDispatchInvoiceById,
    fetchDispatchInvoiceSubById,
    fetchInvoiceById,
    INVOICE_FORM,
    INVOICE_SUB,
} from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/dashboard/page";
import { decryptId } from "@/components/common/Encryption";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import Loader from "@/components/loader/Loader";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import {
    useFetchBuyers,
    useFetchGoDown,
    useFetchInvoiceRef,
    useFetchItems,
} from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    Loader2,
    MinusCircle,
    PlusCircle,
    Trash2
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
const InvoiceForm = () => {
  const { id } = useParams();
  const decryptedId = decryptId(id);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const singlebranch = useSelector((state) => state.auth.branch_s_unit);
  const doublebranch = useSelector((state) => state.auth.branch_d_unit);
  console.log(singlebranch, doublebranch);
  const userType = useSelector((state) => state.auth.user_type);
  const editId = Boolean(id);
  const { toast } = useToast();
  const navigate = useNavigate();
  const boxInputRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(false);

  const token = usetoken();

  const [formData, setFormData] = useState({
    invoice_date: "",
    invoice_buyer_id: "",
    invoice_ref_no: editId ? "" : null,
    invoice_vehicle_no: "",
    invoice_remark: "",
    invoice_status: "",
  });

  const [invoiceData, setInvoiceData] = useState([
    {
      id: editId ? "" : null,
      dispatch_ref: "",
      invoice_sub_item_id: "",
      invoice_sub_godown_id: "",
      invoice_sub_box: "",
      invoice_sub_piece: "",
      invoice_sub_rate: "",
      invoice_sub_amount: "",
    },
  ]);

  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
      ...prev,
      {
        dispatch_ref: "",
        invoice_sub_item_id: "",
        invoice_sub_godown_id: "",
        invoice_sub_box: "",
        invoice_sub_piece: "",
        invoice_sub_rate: "",
        invoice_sub_amount: "",
      },
    ]);
  }, []);

  const removeRow = useCallback((index) => {
    setInvoiceData((prev) => {
      if (prev.length <= 1) return prev;

      const refToRemove = prev[index]?.dispatch_ref;
      let updatedRows;

      if (!refToRemove) {
        updatedRows = prev.filter((_, i) => i !== index);
      } else {
        updatedRows = prev.filter((row) => row.dispatch_ref !== refToRemove);
      }
      if (updatedRows.length === 0) {
        return [
          {
            dispatch_ref: "",
            invoice_sub_item_id: "",
            invoice_sub_godown_id: "",
            invoice_sub_box: "",
            invoice_sub_piece: "",
            invoice_sub_rate: "",
            invoice_sub_amount: "",
          },
        ];
      }

      return updatedRows;
    });
  }, []);

  const focusBoxInput = (rowIndex) => {
    if (boxInputRefs.current[rowIndex]) {
      boxInputRefs.current[rowIndex].focus();
    }
  };
  const { data: dispatchinvoiceref } = useQuery({
    queryKey: ["dispatchinvoiceref", formData?.invoice_buyer_id],
    queryFn: () => fetchDispatchInvoiceById(formData?.invoice_buyer_id, token),
    enabled: !!formData?.invoice_buyer_id,
  });
  const { data: invoiceByid, isFetching } = useQuery({
    queryKey: ["invoicebyid", id],
    queryFn: () => fetchInvoiceById(id, token),
    enabled: !!id,
  });

  useEffect(() => {
    if (editId && invoiceByid?.invoice) {
      setFormData({
        invoice_date: invoiceByid.invoice.invoice_date || "",
        invoice_buyer_id: invoiceByid.invoice.invoice_buyer_id || "",
        invoice_vehicle_no: invoiceByid.invoice.invoice_vehicle_no || "",
        invoice_remark: invoiceByid.invoice.invoice_remark || "",
        invoice_status: invoiceByid.invoice.invoice_status || "",
        invoice_ref_no: invoiceByid.invoice.invoice_ref_no || "",
      });

      // Set invoice line items
      const mappedData = Array.isArray(invoiceByid.invoiceSub)
        ? invoiceByid.invoiceSub.map((sub) => ({
            id: sub.id || "",
            dispatch_ref: sub.dispatch_ref || "",
            invoice_sub_item_id: sub.invoice_sub_item_id || 0,
            invoice_sub_godown_id: sub.invoice_sub_godown_id || 0,
            invoice_sub_box: sub.invoice_sub_box || "",
            invoice_sub_piece: sub.invoice_sub_piece || "",
            invoice_sub_rate: sub.invoice_sub_rate || "",
            invoice_sub_amount: sub.invoice_sub_amount || "",
          }))
        : [
            {
              id: "",
              dispatch_ref: "",
              invoice_sub_item_id: "",
              invoice_sub_godown_id: "",
              invoice_sub_box: "",
              invoice_sub_piece: "",
              invoice_sub_rate: "",
              invoice_sub_amount: "",
            },
          ];

      setInvoiceData(mappedData);
    }
  }, [editId, invoiceByid]);

  const { data: buyerData, isLoading: loadingbuyer } = useFetchBuyers();
  const { data: itemsData, isLoading: loadingitem } = useFetchItems();
  const { data: godownData, isLoading: loadinggodown } = useFetchGoDown();
  const { data: invoiceRef, isLoading: loadingref } = useFetchInvoiceRef();
  const handlePaymentChange = async (selectedValue, rowIndex, fieldName) => {
    let value = selectedValue?.target?.value ?? selectedValue;
    const updatedData = [...invoiceData];
    if (fieldName == "dispatch_ref") {
      updatedData[rowIndex][fieldName] = value;
      try {
        const res = await fetchDispatchInvoiceSubById(value, token);
        if (res?.dispatchSub && res.dispatchSub.length > 0) {
          const subDataList = res.dispatchSub;
          const mappedRows = subDataList.map((sub) => {
            const box = Number(sub.dispatch_sub_box ?? 0);
            const piece = Number(sub.dispatch_sub_piece ?? 0);
            const rate = Number(sub.dispatch_sub_rate ?? 0);
            const itemPiece = Number(sub.item_piece ?? 0);
            const totalPieces = box * itemPiece + piece;
            const amount = totalPieces * rate;
            return {
              ...updatedData[rowIndex],
              invoice_sub_item_id: sub.dispatch_sub_item_id ?? "",
              invoice_sub_godown_id: sub.dispatch_sub_godown_id ?? "",
              invoice_sub_box: box,
              invoice_sub_piece: piece,
              invoice_sub_rate: rate,
              invoice_sub_amount: amount,
              item_piece: itemPiece,
            };
          });

          updatedData.splice(rowIndex, 1, ...mappedRows);
        }
      } catch (err) {
        console.error("Error fetching dispatch invoice sub:", err);
      }

      focusBoxInput(rowIndex);
    } else {
      if (
        ["invoice_sub_box", "invoice_sub_piece", "invoice_sub_rate"].includes(
          fieldName
        ) &&
        !/^\d*$/.test(value)
      ) {
        console.log("Invalid input. Only digits are allowed.");
        return;
      }

      updatedData[rowIndex][fieldName] = Number(value);

      const box = Number(updatedData[rowIndex].invoice_sub_box ?? 0);
      const piece = Number(updatedData[rowIndex].invoice_sub_piece ?? 0);
      const rate = Number(updatedData[rowIndex].invoice_sub_rate ?? 0);
      const itemPiece = Number(updatedData[rowIndex].item_piece ?? 0);

      const totalPieces = itemPiece * box + piece;
      updatedData[rowIndex].invoice_sub_amount = totalPieces * rate;
    }

    setInvoiceData(updatedData);
  };

  const handleInputChange = (e, field) => {
    const value = e.target ? e.target.value : e;
    console.log(value);
    let updatedFormData = { ...formData, [field]: value };

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingFields = [];
    if (!formData.invoice_date) missingFields.push("Date");
    if (!formData.invoice_buyer_id) missingFields.push("Buyer Id");
    if (!formData.invoice_ref_no) missingFields.push("Bill Ref No");
    if (!formData.invoice_status && editId) {
      missingFields.push("Status");
    }
    invoiceData.forEach((row, index) => {
      if (!row.dispatch_ref) missingFields.push(`Row ${index + 1}:Sub Ref`);
      if (!row.invoice_sub_godown_id)
        missingFields.push(`Row ${index + 1}: Godown`);
      if (!row.invoice_sub_item_id)
        missingFields.push(`Row ${index + 1}: Item`);
      if (!row.invoice_sub_amount)
        missingFields.push(`Row ${index + 1}: Amount`);
      if (!row.invoice_sub_rate) missingFields.push(`Row ${index + 1}: Rate`);
      if (singlebranch == "Yes") {
        if (
          row.invoice_sub_box === null ||
          row.invoice_sub_box === undefined ||
          row.invoice_sub_box === ""
        ) {
          missingFields.push(`Row ${index + 1}: Box`);
        }
      }
      if (doublebranch == "Yes") {
        if (
          row.invoice_sub_piece === null ||
          row.invoice_sub_piece === undefined ||
          row.invoice_sub_piece === ""
        ) {
          missingFields.push(`Row ${index + 1}: Piece`);
        }
      }
    });

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <div>
            <p>Please fill in the following fields:</p>
            <ul className="list-disc pl-5">
              {missingFields.map((field, i) => (
                <li key={i}>{field}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        invoice_product_data: invoiceData,
      };

      if (editId) {
        payload.item_status = formData.item_status;
      }

      const url = editId ? `${INVOICE_FORM}/${decryptedId}` : INVOICE_FORM;
      const method = editId ? "put" : "post";

      const response = await apiClient[method](url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response?.data.code == 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });
        navigate("/invoice");
      } else {
        toast({
          title: "Error",
          description: response.data.msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to save item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteRow = (productId) => {
    setDeleteConfirmOpen(true);
    setDeleteItemId(productId);
  };
  const handleDelete = async () => {
    try {
      const response = await apiClient.delete(
        `${INVOICE_SUB}/${deleteItemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (data.code === 200) {
        toast({
          title: "Success",
          description: data.msg,
        });

        setInvoiceData((prevData) =>
          prevData.filter((row) => row.id !== deleteItemId)
        );
      } else if (data.code === 400) {
        toast({
          title: "Duplicate Entry",
          description: data.msg,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unexpected Response",
          description: data.msg || "Something unexpected happened.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.msg || error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteItemId(null);
    }
  };

  if (
    isFetching ||
    loadingbuyer ||
    loadingitem ||
    loadinggodown ||
    loadingref
  ) {
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
      <div className="p-0 md:p-4">
        <div className="sm:hidden bg-gradient-to-b from-yellow-50 to-white min-h-screen">
          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            {/* Premium Header Section */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-white shadow-lg relative overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute top-10 -right-20 w-40 h-40 bg-white/5 rounded-full"></div>

              <div className="flex items-center px-4 py-5 relative z-10">
                <button
                  type="button"
                  onClick={() => navigate("/invoice")}
                  className="p-1.5 bg-white/20 rounded-full text-white mr-3 shadow-sm hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold tracking-wide">
                    {editId ? "Update Invoice" : "Create  Invoice"}
                  </h1>
                  <p className="text-xs text-yellow-100 mt-0.5 opacity-90">
                    {editId
                      ? "Update new invoice details"
                      : "Add new invoice details"}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="p-2">
              {/* Date and Buyer Row */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-yellow-100">
                <div className="mb-4">
                  <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <span className="w-1 h-4 bg-yellow-500 rounded-full mr-2"></span>
                    Date<span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                    value={formData.invoice_date}
                    onChange={(e) => handleInputChange(e, "invoice_date")}
                    type="date"
                  />
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <span className="w-1 h-4 bg-yellow-500 rounded-full mr-2"></span>
                      Buyer<span className="text-red-500">*</span>
                    </label>
                  </div>
                  <MemoizedSelect
                    value={formData.invoice_buyer_id}
                    onChange={(e) => handleInputChange(e, "invoice_buyer_id")}
                    options={
                      buyerData?.buyers?.map((buyer) => ({
                        value: buyer.id,
                        label: buyer.buyer_name,
                      })) || []
                    }
                    placeholder="Select Buyer"
                    className="bg-white focus:ring-2 focus:ring-yellow-300"
                  />
                </div>
                {!editId && (
                  <div className="mb-4">
                    <div>
                      <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <span className="w-1 h-4 bg-yellow-500 rounded-full mr-2"></span>
                        Ref No<span className="text-red-500">*</span>
                      </label>

                      <MemoizedSelect
                        value={formData.invoice_ref_no}
                        onChange={(e) => handleInputChange(e, "invoice_ref_no")}
                        options={
                          invoiceRef
                            ? [
                                {
                                  value: invoiceRef.invoice_ref,
                                  label: invoiceRef.invoice_ref,
                                },
                              ]
                            : []
                        }
                        placeholder="Select Ref"
                        className="bg-white focus:ring-2 focus:ring-yellow-300"
                      />
                    </div>
                  </div>
                )}

                {editId && (
                  <div>
                    <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <span className="w-1 h-4 bg-yellow-500 rounded-full mr-2"></span>
                      Ref<span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                      value={formData.invoice_ref_no}
                      onChange={(e) => handleInputChange(e, "invoice_ref_no")}
                      disabled
                    />
                  </div>
                )}

                <div>
                  <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <span className="w-1 h-4 bg-gray-300 rounded-full mr-2"></span>
                    Vehicle No
                  </label>
                  <Input
                    className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                    value={formData.invoice_vehicle_no}
                    onChange={(e) => handleInputChange(e, "invoice_vehicle_no")}
                    placeholder="Vehicle No"
                  />
                </div>
              </div>
              <div>
                <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <span className="w-1 h-4 bg-gray-300 rounded-full mr-2"></span>
                  Remark
                </label>
                <Textarea
                  className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                  value={formData.invoice_remark}
                  onChange={(e) => handleInputChange(e, "invoice_remark")}
                  placeholder="Add any notes here"
                  rows={2}
                />
              </div>
              {/* Items Section  Table */}
              <div className="bg-white rounded-xl shadow-sm p-2 mb-4 border border-yellow-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="w-1.5 h-5 bg-yellow-500 rounded-full mr-2"></span>
                    <h2 className="text-base font-semibold text-gray-800">
                      Items
                    </h2>
                  </div>
                </div>

                {/*  Item Table */}
                <div className="overflow-hidden rounded-xl border border-yellow-200">
                  <Table className="w-full border-collapse">
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                        <TableHead className="text-xs font-semibold text-gray-700 py-3 px-4">
                          Ref<span className="text-red-500 ml-1">*</span>
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-700 py-3 px-4">
                          Item<span className="text-red-500 ml-1">*</span>
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-700 py-3 px-4">
                          Godown<span className="text-red-500 ml-1">*</span>
                        </TableHead>
                        {singlebranch == "Yes" && (
                          <TableHead className="text-xs font-semibold text-gray-700 py-3 px-4">
                            Box<span className="text-red-500 ml-1">*</span>
                          </TableHead>
                        )}
                        {doublebranch == "Yes" && (
                          <TableHead className="text-xs font-semibold text-gray-700 py-3 px-4">
                            Piece<span className="text-red-500 ml-1">*</span>
                          </TableHead>
                        )}
                        <TableHead className="text-xs font-semibold text-gray-700 py-3 px-4">
                          Rate<span className="text-red-500 ml-1">*</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {invoiceData.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors relative"
                        >
                          <TableCell className="px-4 py-3 min-w-[150px] align-top">
                            {editId ? (
                              <Input
                                className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                                value={row.dispatch_ref}
                                disabled
                              />
                            ) : (
                              <div className="space-y-1">
                                <MemoizedProductSelect
                                  disabled={!!row.dispatch_ref}
                                  value={row.dispatch_ref}
                                  onChange={(e) =>
                                    handlePaymentChange(
                                      e,
                                      rowIndex,
                                      "dispatch_ref"
                                    )
                                  }
                                  options={
                                    dispatchinvoiceref?.dispatch_ref?.map(
                                      (ref) => ({
                                        value: ref.dispatch_ref,
                                        label: ref.dispatch_ref,
                                      })
                                    ) || []
                                  }
                                  placeholder="Select Ref"
                                />
                              </div>
                            )}
                            {row.id ? (
                              userType == 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(row.id)}
                                  className={`absolute top-2 right-2 rounded-full p-1 ${
                                    invoiceData.length === 1
                                      ? "bg-gray-200 text-gray-400"
                                      : "bg-red-100 text-red-500"
                                  }`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeRow(rowIndex)}
                                disabled={invoiceData.length === 1}
                                className={`absolute top-2 right-2 rounded-full p-1 ${
                                  invoiceData.length === 1
                                    ? "bg-gray-200 text-gray-400"
                                    : "bg-red-100 text-red-500"
                                }`}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </button>
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-3 min-w-[200px] align-top">
                            <div className="space-y-1">
                              <MemoizedProductSelect
                                value={row.invoice_sub_item_id}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "invoice_sub_item_id"
                                  )
                                }
                                options={
                                  itemsData?.items?.map((product) => ({
                                    value: product.id,
                                    label: product.item_name,
                                  })) || []
                                }
                                placeholder="Select Item"
                                className="text-xs"
                              />
                              {!editId && row.item_size && (
                                <div className="text-xs text-gray-600 flex gap-2">
                                  <span className="bg-yellow-100 px-1.5 py-0.5 rounded text-yellow-800">
                                    {row.item_size}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-3 min-w-[200px] align-top">
                            <div className="space-y-1">
                              <MemoizedProductSelect
                                value={row.invoice_sub_godown_id}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "invoice_sub_godown_id"
                                  )
                                }
                                options={
                                  godownData?.godown?.map((godown) => ({
                                    value: godown.id,
                                    label: godown.godown,
                                  })) || []
                                }
                                placeholder="Select Godown"
                                className="text-xs"
                              />
                              {!editId && row.item_brand && (
                                <div className="text-xs text-gray-600 ">
                                  <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded">
                                    {row.item_brand}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {singlebranch == "Yes" && (
                            <TableCell className="px-4 py-3 min-w-[150px] align-top">
                              <div className="space-y-1">
                                <Input
                                  ref={(el) =>
                                    (boxInputRefs.current[rowIndex] = el)
                                  }
                                  className="bg-white border border-gray-300 w-full text-xs"
                                  value={row.invoice_sub_box}
                                  onChange={(e) =>
                                    handlePaymentChange(
                                      e,
                                      rowIndex,
                                      "invoice_sub_box"
                                    )
                                  }
                                  placeholder="Enter Box"
                                />
                                {!editId &&
                                  row?.invoice_sub_godown_id &&
                                  row?.invoice_sub_item_id && (
                                    <div className="text-xs text-gray-600">
                                      <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded">
                                        {row.stockData?.total_box}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </TableCell>
                          )}
                          {doublebranch == "Yes" && (
                            <TableCell className="px-4 py-3 min-w-[150px] align-top">
                              <div className="space-y-1">
                                <Input
                                  className="bg-white border border-gray-300 w-full text-xs"
                                  value={row.invoice_sub_piece}
                                  onChange={(e) =>
                                    handlePaymentChange(
                                      e,
                                      rowIndex,
                                      "invoice_sub_piece"
                                    )
                                  }
                                  placeholder="Enter Piece"
                                />
                                {!editId &&
                                  row?.invoice_sub_godown_id &&
                                  row?.invoice_sub_item_id && (
                                    <div className="text-xs text-gray-600">
                                      <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded">
                                        {row.stockData?.total_piece}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </TableCell>
                          )}
                          <TableCell className="px-4 py-3 min-w-[150px] align-top">
                            <div className="space-y-1">
                              <Input
                                className="bg-white border border-gray-300 text-sm"
                                value={row.invoice_sub_rate}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "invoice_sub_rate"
                                  )
                                }
                                placeholder="Enter Rate"
                              />
                              { row.invoice_sub_rate && (
                                <div className="text-xs text-gray-700">
                                  • Amount {row.invoice_sub_amount}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Item count  */}
                <div className="mt-2 text-xs text-gray-500 flex justify-between items-center">
                  <div>
                    <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                    Total Items: {invoiceData.length}
                  </div>

                  <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs shadow-sm hover:bg-yellow-600 transition-colors"
                  >
                    <PlusCircle className="h-3 w-3 mr-1" />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mb-20">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-700 hover:to-yellow-500 text-white font-bold py-3.5 rounded-xl shadow-md transition-all transform hover:scale-[0.99]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editId ? "Updating..." : "Creating..."}
                    </>
                  ) : editId ? (
                    "Update Invoice"
                  ) : (
                    "Create Invoice"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        <div className="hidden sm:block">
          <form onSubmit={handleSubmit} className="w-full ">
            <div
              className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
            >
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-800">
                  {editId ? "Update Invoice" : "Create New Invoice"}
                </h1>
              </div>
            </div>{" "}
            <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div>
                    <div>
                      <label
                        className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                      >
                        Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        className="bg-white"
                        value={formData.invoice_date}
                        onChange={(e) => handleInputChange(e, "invoice_date")}
                        placeholder="Enter Payment Date"
                        type="date"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label
                        className={`text-sm font-medium ${ButtonConfig.cardLabel}`}
                      >
                        Buyer <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <MemoizedSelect
                      value={formData.invoice_buyer_id}
                      onChange={(e) => handleInputChange(e, "invoice_buyer_id")}
                      options={
                        buyerData?.buyers?.map((buyer) => ({
                          value: buyer.id,
                          label: buyer.buyer_name,
                        })) || []
                      }
                      placeholder="Select Buyer"
                      className="bg-white focus:ring-2 focus:ring-yellow-300"
                    />
                  </div>
                  {!editId && (
                    <div>
                      <div>
                        <label
                          className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                        >
                          Ref No<span className="text-red-500">*</span>
                        </label>

                        <MemoizedSelect
                          value={formData.invoice_ref_no}
                          onChange={(e) =>
                            handleInputChange(e, "invoice_ref_no")
                          }
                          options={
                            invoiceRef
                              ? [
                                  {
                                    value: invoiceRef.invoice_ref,
                                    label: invoiceRef.invoice_ref,
                                  },
                                ]
                              : []
                          }
                          placeholder="Select Ref"
                          className="bg-white focus:ring-2 focus:ring-yellow-300"
                        />
                      </div>
                    </div>
                  )}
                  {editId && (
                    <div>
                      <label
                        className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                      >
                        Ref No<span className="text-red-500">*</span>
                      </label>
                      <Input
                        className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                        value={formData.invoice_ref_no}
                        onChange={(e) => handleInputChange(e, "invoice_ref_no")}
                        disabled
                      />
                    </div>
                  )}
                  <div>
                    <div>
                      <label
                        className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                      >
                        Vehicle No
                      </label>
                      <Input
                        className="bg-white"
                        value={formData.invoice_vehicle_no}
                        onChange={(e) =>
                          handleInputChange(e, "invoice_vehicle_no")
                        }
                        placeholder="Enter Vehicle No"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                    >
                      Remark
                    </label>
                    <Textarea
                      className="bg-white"
                      value={formData.invoice_remark}
                      onChange={(e) => handleInputChange(e, "invoice_remark")}
                      placeholder="Enter Remark"
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1">
                  <Table className="border border-gray-300 rounded-lg shadow-sm">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <span>
                              Ref
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                          </div>
                        </TableHead>
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <span>
                              Item
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                          </div>
                        </TableHead>

                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3">
                          Godown
                          <span className="text-red-500 ml-1 text-xs">*</span>
                        </TableHead>
                        {singlebranch == "Yes" && (
                          <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3">
                            Box
                            <span className="text-red-500 ml-1 text-xs">*</span>
                          </TableHead>
                        )}
                        {doublebranch == "Yes" && (
                          <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3">
                            Piece
                            <span className="text-red-500 ml-1 text-xs">*</span>
                          </TableHead>
                        )}

                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3">
                          Rate
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {invoiceData.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className="border-t border-gray-200 hover:bg-gray-50 relative"
                        >
                          {/* Item Column */}
                          <TableCell className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              {row.id ? (
                                <Input
                                  className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                                  value={row.dispatch_ref}
                                  disabled
                                />
                              ) : (
                                <MemoizedProductSelect
                                  disabled={!!row.dispatch_ref}
                                  value={row.dispatch_ref}
                                  onChange={(e) =>
                                    handlePaymentChange(
                                      e,
                                      rowIndex,
                                      "dispatch_ref"
                                    )
                                  }
                                  options={
                                    dispatchinvoiceref?.dispatch_ref?.map(
                                      (ref) => ({
                                        value: ref.dispatch_ref,
                                        label: ref.dispatch_ref,
                                      })
                                    ) || []
                                  }
                                  placeholder="Select Ref"
                                />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <MemoizedProductSelect
                                value={row.invoice_sub_item_id}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "invoice_sub_item_id"
                                  )
                                }
                                options={
                                  itemsData?.items?.map((product) => ({
                                    value: product.id,
                                    label: product.item_name,
                                  })) || []
                                }
                                placeholder="Select Item"
                              />
                              {!editId && row.item_size && (
                                <div className="text-xs text-gray-700">
                                  • {row.item_size}
                                </div>
                              )}
                            </div>

                            {row.id ? (
                              userType == 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRow(row.id)}
                                  className={`absolute top-1 left-2 rounded-full p-1 ${
                                    invoiceData.length === 1
                                      ? "bg-gray-200 text-gray-400"
                                      : "bg-red-100 text-red-500"
                                  }`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeRow(rowIndex)}
                                disabled={invoiceData.length === 1}
                                className={`absolute top-1 left-2 rounded-full p-1 ${
                                  invoiceData.length === 1
                                    ? "bg-gray-200 text-gray-400"
                                    : "bg-red-100 text-red-500"
                                }`}
                              >
                                <MinusCircle className="h-4 w-4" />
                              </button>
                            )}
                          </TableCell>
                          {/* Godown Column */}
                          <TableCell className="px-4 py-3 align-top min-w-20">
                            <div className="flex flex-col gap-1">
                              <MemoizedProductSelect
                                value={row.invoice_sub_godown_id}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "invoice_sub_godown_id"
                                  )
                                }
                                options={
                                  godownData?.godown?.map((godown) => ({
                                    value: godown.id,
                                    label: godown.godown,
                                  })) || []
                                }
                                placeholder="Select Godown"
                              />
                              {!editId && row.item_brand && (
                                <div className="text-xs text-gray-700">
                                  • {row.item_brand}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          {singlebranch == "Yes" && (
                            <TableCell className="px-4 py-3 align-top max-w-32">
                              <div className="flex flex-col gap-1">
                                <Input
                                  className="bg-white border border-gray-300 text-sm"
                                  value={row.invoice_sub_box}
                                  onChange={(e) =>
                                    handlePaymentChange(
                                      e,
                                      rowIndex,
                                      "invoice_sub_box"
                                    )
                                  }
                                  placeholder="Enter Box"
                                />
                                {!editId &&
                                  row?.invoice_sub_godown_id &&
                                  row?.invoice_sub_item_id && (
                                    <div className="text-xs text-gray-700">
                                      • Available Box:{" "}
                                      {row?.stockData?.total_box ?? 0}
                                    </div>
                                  )}
                              </div>
                            </TableCell>
                          )}
                          {doublebranch == "Yes" && (
                            <TableCell className="px-4 py-3 align-top max-w-32">
                              <div className="flex flex-col gap-1">
                                <Input
                                  className="bg-white border border-gray-300 text-sm"
                                  value={row.invoice_sub_piece}
                                  onChange={(e) =>
                                    handlePaymentChange(
                                      e,
                                      rowIndex,
                                      "invoice_sub_piece"
                                    )
                                  }
                                  placeholder="Enter Piece"
                                />
                              </div>
                              {!editId &&
                                row?.invoice_sub_godown_id &&
                                row?.invoice_sub_item_id && (
                                  <div className="text-xs text-gray-700">
                                    • Available Piece:{" "}
                                    {row?.stockData?.total_piece ?? 0}
                                  </div>
                                )}
                            </TableCell>
                          )}

                          <TableCell className="px-4 py-3 align-top max-w-36">
                            <div className="flex flex-col gap-1">
                              <Input
                                className="bg-white border border-gray-300 text-sm"
                                value={row.invoice_sub_rate}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "invoice_sub_rate"
                                  )
                                }
                                placeholder="Enter Rate"
                              />
                              {row.invoice_sub_amount && (
                                <div className="text-xs text-gray-700">
                                  • Amount {row.invoice_sub_amount}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="mt-2">
                    <button
                      onClick={addRow}
                      type="button"
                      className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center gap-2  px-3 py-1.5 rounded-md shadow-md transition`}
                    >
                      <PlusCircle className="h-5 w-5" />
                      <span className="text-sm font-medium">Add More</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-row items-center gap-2 justify-end ">
              <Button
                type="submit"
                className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editId ? "Updating..." : "Creating..."}
                  </>
                ) : editId ? (
                  "Update Invoice"
                ) : (
                  "Create Invoice"
                )}{" "}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  navigate("/invoice");
                }}
                className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
              >
                Go Back
              </Button>
            </div>
          </form>
        </div>
      </div>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              Invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className={`${ButtonConfig.backgroundColor}  ${ButtonConfig.textColor} text-black hover:bg-red-600`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default InvoiceForm;
