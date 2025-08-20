import { PAYMENT_FORM, PAYMENT_MODE } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useFetchBuyers } from "@/hooks/useApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Edit, Loader2, SquarePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PaymentForm = ({ paymentId = null }) => {
  const [open, setOpen] = useState(false);
  const token = usetoken();
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    payment_date: "",
    payment_buyer_id: "",
    payment_mode: "",
    payment_amount: "",
    payment_transaction: "",
  });
  const [originalData, setOriginalData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const { data: buyerData } = useFetchBuyers();

  const location = useLocation();
  const pathname = location.pathname;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditMode = Boolean(paymentId);
  const { data: paymentmodeData } = useQuery({
    queryKey: ["modedata"],
    queryFn: async () => {
      const response = await apiClient.get(`${PAYMENT_MODE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.paymentMode || [];
    },
    enabled: open,
  });
  const fetchBuyerData = async () => {
    try {
      setIsFetching(true);

      const response = await apiClient.get(`${PAYMENT_FORM}/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.payment || {};
      setFormData({
        payment_date: data.payment_date || "",
        payment_buyer_id: data.payment_buyer_id || "",
        payment_mode: data.payment_mode || "",
        payment_amount: data.payment_amount || "",
        payment_transaction: data.payment_transaction || "",
      });
      setOriginalData({
        payment_date: data.payment_date || "",
        payment_buyer_id: data.payment_buyer_id || "",
        payment_mode: data.payment_mode || "",
        payment_amount: data.payment_amount || "",
        payment_transaction: data.payment_transaction || "",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch buyer data.",
        variant: "destructive",
      });
      setOpen(false);
    } finally {
      setIsFetching(false);
    }
  };
  useEffect(() => {
    if (isEditMode && open) {
      fetchBuyerData();
    }
  }, [open]);
  const handleSubmit = async () => {
    const missingFields = [];
    if (!formData.payment_date) missingFields.push("Date");
    if (!formData.payment_buyer_id) missingFields.push("Buyer");
    if (!formData.payment_mode) missingFields.push("Payment Mode");

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <ul className="list-disc pl-5">
            {missingFields.map((field, index) => (
              <li key={index}>{field}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const apiCall = isEditMode
        ? apiClient.put(`${PAYMENT_FORM}/${paymentId}`, formData, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : apiClient.post(PAYMENT_FORM, formData, {
            headers: { Authorization: `Bearer ${token}` },
          });

      const response = await apiCall;

      if (response.data.code === 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });
        await queryClient.invalidateQueries(["payment"]);
        setOpen(false);
        if (!isEditMode) {
          setFormData({
            payment_date: "",
          });
        }
      } else {
        toast({
          title: "Error",
          description: response.data.msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit form",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderTrigger = () => {
    if (isEditMode) {
      return (
        <div>
          <div className="sm:hidden">
            <button
              variant="default"
              className={`px-2 py-1 bg-yellow-400 hover:bg-yellow-600 rounded-lg text-black text-xs`}
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden sm:block">
            <Button
              variant="ghost"
              size="icon"
              className={`transition-all duration-200 ${
                isHovered ? "bg-blue-50" : ""
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Edit
                className={`h-4 w-4 transition-all duration-200 ${
                  isHovered ? "text-blue-500" : ""
                }`}
              />
            </Button>
          </div>
        </div>
      );
    }

    if (pathname == "/payment") {
      return (
        <div>
          <div className="sm:hidden">
            <Button className="bg-yellow-400 hover:bg-yellow-600 text-black rounded-l-full">
              <SquarePlus className="h-4 w-4" /> Payment
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button
              className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            >
              <SquarePlus className="h-4 w-4 mr-2" /> Payment
            </Button>
          </div>
        </div>
      );
    }

    return <span />;
  };
  const hasChanges =
    originalData &&
    (formData.payment_date !== originalData.payment_date ||
      formData.payment_buyer_id !== originalData.payment_buyer_id ||
      formData.payment_mode !== originalData.payment_mode ||
      formData.payment_amount !== originalData.payment_amount ||
      formData.payment_transaction !== originalData.payment_transaction);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{renderTrigger()}</DialogTrigger>

      <DialogContent
        className="xs:w-96 md:max-w-xl"
        aria-describedby={undefined}
      >
        {" "}
        {isFetching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">
                {isEditMode ? "Edit Payment" : "Create New Payment"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? "Update the payment details below"
                  : "Enter the details for the new Buyer"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="payment_date" className="text-sm font-medium">
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment_date: e.target.value,
                    }))
                  }
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="payment_buyer_id"
                  className="text-sm font-medium"
                >
                  Buyer *
                </label>

                <MemoizedSelect
                  value={formData.payment_buyer_id}
                  onChange={(vals) =>
                    setFormData({ ...formData, payment_buyer_id: vals })
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

              <div>
                <label htmlFor="payment_mode" className="text-sm font-medium">
                  Payment Type *
                </label>
                <MemoizedSelect
                  value={formData.buyepayment_moder_type}
                  onChange={(vals) =>
                    setFormData({ ...formData, payment_mode: vals })
                  }
                  options={
                    paymentmodeData?.map((item) => ({
                      value: item.paymentMode,
                      label: item.paymentMode,
                    })) || []
                  }
                  placeholder="Select payment types"
                />
              </div>
              <div>
                <label htmlFor="payment_amount" className="text-sm font-medium">
                  Amount *
                </label>
                <Input
                  placeholder="Amount"
                  value={formData.payment_amount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment_amount: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="payment_transaction"
                  className="text-sm font-medium"
                >
                  Transaction
                </label>
                <Textarea
                  placeholder="Transaction"
                  value={formData.payment_transaction}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      payment_transaction: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {hasChanges && (
              <Alert className="bg-blue-50 border-blue-200 mt-2">
                <AlertCircle className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-600 text-sm">
                  You have unsaved changes
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleSubmit}
              disabled={isEditMode ? !hasChanges : isLoading}
              className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : isEditMode ? (
                "Update Payment"
              ) : (
                "Create Payment"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm;
