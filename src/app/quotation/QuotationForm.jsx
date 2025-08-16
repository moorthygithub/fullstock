import {
  fetchAvaiableItem,
  fetchQuotationById,
  QUOTATION_FORM,
  QUOTATION_SUB_DELETE,
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
  useFetchItems,
  useFetchQuotationRef,
} from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  MinusCircle,
  PlusCircle,
  SquarePlus,
  Trash2,
} from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import CreateItem from "../master/item/CreateItem";
const QuotationForm = () => {
  const { id } = useParams();
  const decryptedId = decryptId(id);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const userType = useSelector((state) => state.auth.user_type);
  const editId = Boolean(id);
  const { toast } = useToast();
  const navigate = useNavigate();
  const boxInputRefs = useRef([]);
  const today = moment().format("YYYY-MM-DD");
  const [isLoading, setIsLoading] = useState(false);
  const singlebranch = useSelector((state) => state.auth.branch_s_unit);
  const doublebranch = useSelector((state) => state.auth.branch_d_unit);
  const token = usetoken();

  const [formData, setFormData] = useState({
    quotation_date: today,
    quotation_buyer_id: "",
    quotation_ref_no: "",
    quotation_vehicle_no: "",
    quotation_remark: "",
    quotation_status: editId ? "" : null,
  });

  const [invoiceData, setInvoiceData] = useState([
    {
      id: editId ? "" : null,
      quotation_sub_item_id: "",
      quotation_sub_godown_id: "",
      quotation_sub_rate: "",
      quotation_sub_box: 0,
      item_brand: "",
      item_size: "",
      quotation_sub_piece: 0,
      stockData: {
        total: 0,
        total_box: 0,
        total_piece: 0,
      },
    },
  ]);

  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
      ...prev,
      {
        quotation_sub_item_id: "",
        quotation_sub_godown_id: "",
        quotation_sub_rate: "",
        quotation_sub_box: 0,
        quotation_sub_piece: 0,
      },
    ]);
  }, []);
  const removeRow = useCallback(
    (index) => {
      if (invoiceData.length > 1) {
        setInvoiceData((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [invoiceData.length]
  );
  const focusBoxInput = (rowIndex) => {
    if (boxInputRefs.current[rowIndex]) {
      boxInputRefs.current[rowIndex].focus();
    }
  };
  const { data: QuotationByid, isFetching } = useQuery({
    queryKey: ["quotationByid", id],
    queryFn: () => fetchQuotationById(id, token),
    enabled: !!id,
  });
  useEffect(() => {
    if (editId && QuotationByid?.quotation) {
      console.log(QuotationByid, "quotation");
      setFormData({
        quotation_date: QuotationByid.quotation.quotation_date || "",
        quotation_buyer_id: QuotationByid.quotation.quotation_buyer_id || "",
        quotation_ref_no: QuotationByid.quotation.quotation_ref_no || "",
        quotation_vehicle_no:
          QuotationByid.quotation.quotation_vehicle_no || "",
        quotation_remark: QuotationByid.quotation.quotation_remark || "",
        quotation_status: QuotationByid.quotation.quotation_status || "",
      });

      // Set invoice line items
      const mappedData = Array.isArray(QuotationByid.quotationSub)
        ? QuotationByid.quotationSub.map((sub) => ({
            id: sub.id || "",
            quotation_sub_item_id: sub.quotation_sub_item_id || "",
            quotation_sub_box: sub.quotation_sub_box || 0,
            quotation_sub_piece: sub.quotation_sub_piece || 0,
            item_brand: sub.item_brand || "",
            item_size: sub.item_size || "",
            quotation_sub_godown_id: sub.quotation_sub_godown_id,
            quotation_sub_rate: sub.quotation_sub_rate,
          }))
        : [
            {
              quotation_sub_item_id: "",
              quotation_sub_box: "",
              item_brand: "",
              item_size: "",
              quotation_sub_piece: "",
              quotation_sub_godown_id: "",
              quotation_sub_rate: "",
            },
          ];

      setInvoiceData(mappedData);
    }
  }, [editId, QuotationByid]);

  const { data: buyerData, isLoading: loadingbuyer } = useFetchBuyers();
  const { data: itemsData, isLoading: loadingitem } = useFetchItems();
  const { data: godownData, isLoading: loadinggodown } = useFetchGoDown();
  const { data: quotationRef, isLoading: loadingref } = useFetchQuotationRef();

  const fetchAndSetStock = async (rowIndex, itemId, godownId, updatedData) => {
    if (!itemId || !godownId) return;

    try {
      const response = await fetchAvaiableItem(itemId, godownId, token);
      const buyer = response?.stock?.[0];

      const itemPiece = Number(buyer?.item_piece || 1);
      const safeNumber = (val) => Number(val) || 0;

      const openingPurch =
        safeNumber(buyer?.openpurch) * itemPiece +
        safeNumber(buyer?.openpurch_piece);
      const openingSale =
        safeNumber(buyer?.closesale) * itemPiece +
        safeNumber(buyer?.closesale_piece);
      const openingPurchR =
        safeNumber(buyer?.openpurchR) * itemPiece +
        safeNumber(buyer?.openpurchR_piece);
      const openingSaleR =
        safeNumber(buyer?.closesaleR) * itemPiece +
        safeNumber(buyer?.closesaleR_piece);

      const opening = openingPurch - openingSale - openingPurchR + openingSaleR;

      const purchase =
        safeNumber(buyer?.purch) * itemPiece + safeNumber(buyer?.purch_piece);
      const purchaseR =
        safeNumber(buyer?.purchR) * itemPiece + safeNumber(buyer?.purchR_piece);
      const sale =
        safeNumber(buyer?.sale) * itemPiece + safeNumber(buyer?.sale_piece);
      const saleR =
        safeNumber(buyer?.saleR) * itemPiece + safeNumber(buyer?.saleR_piece);

      const total = opening + purchase - purchaseR - sale + saleR;

      const toBoxPiece = (val) => ({
        box: Math.floor(val / itemPiece),
        piece: val % itemPiece,
      });

      const totalBP = toBoxPiece(total);

      updatedData[rowIndex].stockData = {
        total,
        total_box: totalBP.box,
        total_piece: totalBP.piece,
      };
    } catch (err) {
      console.error("Stock fetch error:", err);
      updatedData[rowIndex].stockData = {
        total: 0,
        total_box: 0,
        total_piece: 0,
      };
    }

    setInvoiceData([...updatedData]);
  };
  useEffect(() => {
    if (!editId) {
      invoiceData.forEach((row, index) => {
        const { quotation_sub_item_id, quotation_sub_godown_id } = row;
        if (quotation_sub_item_id && quotation_sub_godown_id) {
          fetchAndSetStock(
            index,
            quotation_sub_item_id,
            quotation_sub_godown_id,
            [...invoiceData]
          );
        }
      });
    }
  }, [
    editId,
    invoiceData
      .map(
        (row) => row?.quotation_sub_item_id + "-" + row?.quotation_sub_godown_id
      )
      .join(","),
  ]);
  const handlePaymentChange = (selectedValue, rowIndex, fieldName) => {
    let value = selectedValue?.target?.value ?? selectedValue;
    const updatedData = [...invoiceData];

    if (fieldName == "quotation_sub_item_id") {
      updatedData[rowIndex][fieldName] = value;
      const selectedItem = itemsData?.items?.find((item) => item.id === value);
      if (selectedItem) {
        updatedData[rowIndex]["item_size"] = selectedItem.item_size;
        updatedData[rowIndex]["item_brand"] = selectedItem.item_brand;
      }
      focusBoxInput(rowIndex);
    } else {
      if (
        ["quotation_sub_box", "quotation_sub_piece"].includes(fieldName) &&
        !/^\d*$/.test(value)
      ) {
        console.log("Invalid input. Only digits are allowed.");
        return;
      }
      updatedData[rowIndex][fieldName] = value;
    }

    setInvoiceData(updatedData);
  };

  const handleInputChange = (e, field) => {
    const value = e.target ? e.target.value : e;
    let updatedFormData = { ...formData, [field]: value };

    if (field == "quotation_buyer_id") {
      console.log(value, "value");

      const selectedBuyer = buyerData?.buyers.find(
        (buyer) => buyer.id == value
      );
      //   if (selectedBuyer) {
      //     updatedFormData.dispatch_buyer_city = selectedBuyer.buyer_city;
      //   } else {
      //     updatedFormData.dispatch_buyer_city = "";
      //   }
    }

    setFormData(updatedFormData);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingFields = [];
    if (!formData.quotation_date) missingFields.push("Date");
    if (!formData.quotation_buyer_id) missingFields.push("Buyer Id");
    if (!formData.quotation_ref_no) missingFields.push("Bill Ref No");
    if (!formData.quotation_status && editId) {
      missingFields.push("Status");
    }
    invoiceData.forEach((row, index) => {
      if (!row.quotation_sub_godown_id)
        missingFields.push(`Row ${index + 1}: Godown`);
      if (!row.quotation_sub_rate) missingFields.push(`Row ${index + 1}: Rate`);
      if (!row.quotation_sub_item_id)
        missingFields.push(`Row ${index + 1}: Item`);
      if (singlebranch == "Yes") {
        if (
          row.quotation_sub_box === null ||
          row.quotation_sub_box === undefined ||
          row.quotation_sub_box === ""
        ) {
          missingFields.push(`Row ${index + 1}: Box`);
        }
      }
      if (doublebranch == "Yes") {
        if (
          row.quotation_sub_piece === null ||
          row.quotation_sub_piece === undefined ||
          row.quotation_sub_piece === ""
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
        quotation_product_data: invoiceData,
      };

      if (editId) {
        payload.item_status = formData.item_status;
      }

      const url = editId ? `${QUOTATION_FORM}/${decryptedId}` : QUOTATION_FORM;
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
        navigate("/quotation");
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
        description: error?.response?.data?.message || "Failed to save",
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
        `${QUOTATION_SUB_DELETE}/${deleteItemId}`,
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
                  onClick={() => navigate("/quotation")}
                  quotation_ref
                  className="p-1.5 bg-white/20 rounded-full text-white mr-3 shadow-sm hover:bg-white/30 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold tracking-wide">
                    {editId ? "Update Quotation" : "Create  Quotation"}
                  </h1>
                  <p className="text-xs text-yellow-100 mt-0.5 opacity-90">
                    {editId
                      ? "Update new quotation details"
                      : "Add new quotation details"}
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
                    value={formData.quotation_date}
                    onChange={(e) => handleInputChange(e, "quotation_date")}
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
                    value={formData.quotation_buyer_id}
                    onChange={(e) => handleInputChange(e, "quotation_buyer_id")}
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
                        value={formData.quotation_ref_no}
                        onChange={(e) =>
                          handleInputChange(e, "quotation_ref_no")
                        }
                        options={
                          quotationRef
                            ? [
                                {
                                  value: quotationRef.quotation_ref,
                                  label: quotationRef.quotation_ref,
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
                  <div className="mb-4">
                    <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <span className="w-1 h-4 bg-yellow-500 rounded-full mr-2"></span>
                      Ref<span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                      value={formData.quotation_ref_no}
                      onChange={(e) => handleInputChange(e, "quotation_ref_no")}
                      disabled
                    />
                  </div>
                )}
                <div className="mb-4">
                  <label className="sm:block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <span className="w-1 h-4 bg-gray-300 rounded-full mr-2"></span>
                    Vehicle No
                  </label>
                  <Input
                    className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                    value={formData.quotation_vehicle_no}
                    onChange={(e) =>
                      handleInputChange(e, "quotation_vehicle_no")
                    }
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
                  value={formData.quotation_remark}
                  onChange={(e) => handleInputChange(e, "quotation_remark")}
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
                    {!editId && (
                      <button
                        type="button"
                        className="flex items-center text-xs text-yellow-600 font-medium bg-yellow-50 px-2 py-0.5 rounded-full"
                      >
                        <SquarePlus className="h-3 w-3 mr-1" />
                        <CreateItem />
                      </button>
                    )}
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

                {/*  Item Table */}
                <div className="overflow-hidden rounded-xl border border-yellow-200">
                  <Table className="w-full border-collapse">
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-yellow-100 to-yellow-50">
                        <TableHead className="text-xs font-semibold text-gray-700 py-3 px-4">
                          Item
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-700 py-3 px-4">
                          Godown<span className="text-red-500 ml-1">*</span>
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-gray-700 py-3 px-4">
                          Rate<span className="text-red-500 ml-1">*</span>
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
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {invoiceData.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className="border-b border-yellow-100 hover:bg-yellow-50 transition-colors relative"
                        >
                          {/* Item Select */}
                          <TableCell className="px-4 py-3 min-w-[200px] align-top">
                            <div className="space-y-1">
                              <MemoizedProductSelect
                                value={row.quotation_sub_item_id}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "quotation_sub_item_id"
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

                            {/* Delete Row Button */}
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

                          {/* Godown Select */}
                          <TableCell className="px-4 py-3 min-w-[150px] align-top">
                            <div className="space-y-1">
                              <MemoizedProductSelect
                                value={row.quotation_sub_godown_id}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "quotation_sub_godown_id"
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
                                <div className="text-xs text-gray-600">
                                  <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded">
                                    {row.item_brand}
                                  </span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 min-w-[150px] align-top">
                            <div className="space-y-1">
                              <Input
                                className="bg-white border border-gray-300 w-full text-xs"
                                value={row.quotation_sub_rate}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "quotation_sub_rate"
                                  )
                                }
                                placeholder="Rate"
                              />
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
                                  value={row.quotation_sub_box}
                                  onChange={(e) =>
                                    handlePaymentChange(
                                      e,
                                      rowIndex,
                                      "quotation_sub_box"
                                    )
                                  }
                                  placeholder="Qty"
                                />
                                {!editId &&
                                  row?.quotation_sub_godown_id &&
                                  row?.quotation_sub_item_id && (
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
                                  value={row.quotation_sub_piece}
                                  onChange={(e) =>
                                    handlePaymentChange(
                                      e,
                                      rowIndex,
                                      "quotation_sub_piece"
                                    )
                                  }
                                  placeholder="Piece"
                                />
                                {!editId &&
                                  row?.quotation_sub_godown_id &&
                                  row?.quotation_sub_item_id && (
                                    <div className="text-xs text-gray-600">
                                      <span className="inline-block bg-gray-100 px-1.5 py-0.5 rounded">
                                        {row.stockData?.total_piece}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Item count  */}
                <div className="mt-2 text-xs text-gray-500 flex items-center">
                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                  Total Items: {invoiceData.length}
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
                    "Update Quotation"
                  ) : (
                    "Create Quotation"
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
                  {editId ? "Update Quotation" : "Create New Quotation"}
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
                        value={formData.quotation_date}
                        onChange={(e) => handleInputChange(e, "quotation_date")}
                        type="date"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        className={`text-sm font-medium ${ButtonConfig.cardLabel}`}
                      >
                        Buyer <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <MemoizedSelect
                      value={formData.quotation_buyer_id}
                      onChange={(e) =>
                        handleInputChange(e, "quotation_buyer_id")
                      }
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
                          Ref No <span className="text-red-500">*</span>
                        </label>

                        <MemoizedSelect
                          value={formData.quotation_ref_no}
                          onChange={(e) =>
                            handleInputChange(e, "quotation_ref_no")
                          }
                          options={
                            quotationRef
                              ? [
                                  {
                                    value: quotationRef.quotation_ref,
                                    label: quotationRef.quotation_ref,
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
                        Ref No <span className="text-red-500">*</span>
                      </label>
                      <Input
                        className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-yellow-300 focus:border-yellow-400"
                        value={formData.quotation_ref_no}
                        onChange={(e) =>
                          handleInputChange(e, "quotation_ref_no")
                        }
                        disabled
                      />
                    </div>
                  )}
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                    >
                      Vehicle No
                    </label>
                    <Input
                      className="bg-white"
                      value={formData.quotation_vehicle_no}
                      onChange={(e) =>
                        handleInputChange(e, "quotation_vehicle_no")
                      }
                      placeholder="Enter Vehicle No"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-4">
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                    >
                      Remark
                    </label>
                    <Textarea
                      className="bg-white"
                      value={formData.quotation_remark}
                      onChange={(e) => handleInputChange(e, "quotation_remark")}
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
                              Item
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                            {!editId && (
                              <div className="flex items-center gap-1">
                                <SquarePlus className="h-4 w-4 text-red-600" />
                                <CreateItem />
                              </div>
                            )}
                          </div>
                        </TableHead>

                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3">
                          Godown
                          <span className="text-red-500 ml-1 text-xs">*</span>
                        </TableHead>
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3">
                          Rate
                          <span className="text-red-500 ml-1 text-xs">*</span>
                        </TableHead>

                        {singlebranch == "Yes" && (
                          <TableHead className="text-sm font-semibold text-gray-700 py-3 px-4">
                            Box<span className="text-red-500 ml-1">*</span>
                          </TableHead>
                        )}
                        {doublebranch == "Yes" && (
                          <TableHead className="text-sm font-semibold text-gray-700 py-3 px-4">
                            Piece<span className="text-red-500 ml-1">*</span>
                          </TableHead>
                        )}
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
                              <MemoizedProductSelect
                                value={row.quotation_sub_item_id}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "quotation_sub_item_id"
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
                          <TableCell className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <MemoizedProductSelect
                                value={row.quotation_sub_godown_id}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "quotation_sub_godown_id"
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
                          <TableCell className="px-4 py-3 align-top">
                            <div className="space-y-1">
                              <Input
                                className="bg-white border border-gray-300 w-full text-xs"
                                value={row.quotation_sub_rate}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "quotation_sub_rate"
                                  )
                                }
                                placeholder="Rate"
                              />
                            </div>
                          </TableCell>

                          {singlebranch == "Yes" && (
                            <TableCell className="px-4 py-3 align-top min-w-28">
                              <div className="flex flex-col gap-1">
                                <Input
                                  className="bg-white border border-gray-300 text-sm"
                                  value={row.quotation_sub_box}
                                  onChange={(e) =>
                                    handlePaymentChange(
                                      e,
                                      rowIndex,
                                      "quotation_sub_box"
                                    )
                                  }
                                  placeholder="Enter Box"
                                />

                                {!editId &&
                                  row?.quotation_sub_godown_id &&
                                  row?.quotation_sub_item_id && (
                                    <div className="text-xs text-gray-700">
                                      • Available Box:{" "}
                                      {row?.stockData?.total_box ?? 0}
                                    </div>
                                  )}
                              </div>
                            </TableCell>
                          )}

                          {doublebranch == "Yes" && (
                            <TableCell className="px-4 py-3 align-top min-w-28">
                              <div className="flex flex-col gap-1">
                                <Input
                                  className="bg-white border border-gray-300 text-sm"
                                  value={row.quotation_sub_piece}
                                  onChange={(e) =>
                                    handlePaymentChange(
                                      e,
                                      rowIndex,
                                      "quotation_sub_piece"
                                    )
                                  }
                                  placeholder="Enter Piece"
                                />
                                {!editId &&
                                  row?.quotation_sub_godown_id &&
                                  row?.quotation_sub_item_id && (
                                    <div className="text-xs text-gray-700">
                                      • Available Piece:{" "}
                                      {row?.stockData?.total_piece ?? 0}
                                    </div>
                                  )}
                              </div>
                            </TableCell>
                          )}
                          {/* Delete Button */}
                          {/* <TableCell className="p-2 text-center align-middle">
                              {row.id ? (
                                userType == 2 && (
                                  <Button
                                    variant="ghost"
                                    onClick={() => handleDeleteRow(row.id)}
                                    className="text-red-500"
                                    type="button"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )
                              ) : (
                                <Button
                                  variant="ghost"
                                  onClick={() => removeRow(rowIndex)}
                                  disabled={invoiceData.length === 1}
                                  className="text-red-500"
                                  type="button"
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell> */}
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
                  "Update Quotation"
                ) : (
                  "Create Quotation"
                )}{" "}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  navigate("/quotation");
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
              quotation.
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

export default QuotationForm;
