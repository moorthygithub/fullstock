import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  BUYER_CREATE,
  BUYER_EDIT_GET,
  BUYER_EDIT_SUMBIT,
  FETCH_STATE,
} from "@/api";
import { Loader2, SquarePlus, Edit, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ButtonConfig } from "@/config/ButtonConfig";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import usetoken from "@/api/usetoken";
import apiClient from "@/api/axios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";

const BuyerForm = ({ buyerId = null }) => {
  const [open, setOpen] = useState(false);
  const token = usetoken();
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    buyer_name: "",
    buyer_mobile: "",
    buyer_city: "",
    buyer_type: "",
    buyer_state: "",
    buyer_state_code: "",
    buyer_status: "Active",
  });
  const [originalData, setOriginalData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const location = useLocation();
  const pathname = location.pathname;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEditMode = Boolean(buyerId);
  const { data: stateData } = useQuery({
    queryKey: ["statedata"],
    queryFn: async () => {
      const response = await apiClient.get(`${FETCH_STATE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.state || [];
    },
    enabled: open,
  });
  const fetchBuyerData = async () => {
    try {
      setIsFetching(true);

      const response = await apiClient.get(`${BUYER_EDIT_GET}/${buyerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.buyers || {};
      setFormData({
        buyer_name: data.buyer_name || "",
        buyer_mobile: data.buyer_mobile || "",
        buyer_city: data.buyer_city || "",
        buyer_type: data.buyer_type || "",
        buyer_state: data.buyer_state || "",
        buyer_state_code: data.buyer_state_code || "",
        buyer_status: data.buyer_status || "Active",
      });
      setOriginalData({
        buyer_name: data.buyer_name || "",
        buyer_mobile: data.buyer_mobile || "",
        buyer_type: data.buyer_type || "",
        buyer_state: data.buyer_state || "",
        buyer_state_code: data.buyer_state_code || "",
        buyer_city: data.buyer_city || "",
        buyer_status: data.buyer_status || "Active",
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
    if (!formData.buyer_name) missingFields.push("Buyer Name");
    if (!formData.buyer_city) missingFields.push("Buyer City");
    if (!formData.buyer_mobile) missingFields.push("Mobile");
    if (!formData.buyer_type) missingFields.push("Buyer Type");
    if (!formData.buyer_state) missingFields.push("Buyer State");

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
    const payload = {
      ...formData,
      buyer_type: Array.isArray(formData.buyer_type)
        ? formData.buyer_type.join(",")
        : formData.buyer_type,
    };
    try {
      const apiCall = isEditMode
        ? apiClient.put(`${BUYER_EDIT_SUMBIT}/${buyerId}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : apiClient.post(BUYER_CREATE, payload, {
            headers: { Authorization: `Bearer ${token}` },
          });

      const response = await apiCall;

      if (response.data.code === 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });
        await queryClient.invalidateQueries(["buyers"]);
        setOpen(false);
        if (!isEditMode) {
          setFormData({
            buyer_name: "",
            buyer_city: "",
            buyer_status: "Active",
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

    if (pathname == "/master/buyer") {
      return (
        <div>
          <div className="sm:hidden">
            <Button className="bg-yellow-400 hover:bg-yellow-600 text-black rounded-l-full">
              <SquarePlus className="h-4 w-4" /> Buyer
            </Button>
          </div>
          <div className="hidden sm:block">
            <Button
              className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            >
              <SquarePlus className="h-4 w-4 mr-2" /> Buyer
            </Button>
          </div>
        </div>
      );
    }
    if (
      [
        "/purchase/create",
        "/purchase/edit/:id",
        "/dispatch/create",
        "/purchase/edit",
        "/dispatch-return/create",
        "/purchase-return/create",
      ].includes(pathname)
    ) {
      return (
        <div className="flex items-center space-x-2 text-yellow-600 cursor-pointer group">
          <div className="sm:flex items-center text-xs group-hover:text-yellow-400 transition-colors duration-150">
            Buyer
          </div>
        </div>
      );
    }

    return <span />;
  };
  const hasChanges =
    originalData &&
    (formData.buyer_city !== originalData.buyer_city ||
      formData.buyer_status !== originalData.buyer_status ||
      formData.buyer_name !== originalData.buyer_name ||
      formData.buyer_mobile !== originalData.buyer_mobile ||
      formData.buyer_type !== originalData.buyer_type ||
      formData.buyer_state !== originalData.buyer_state ||
      formData.buyer_state_code !== originalData.buyer_state_code);
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
                {isEditMode ? "Edit Buyer" : "Create New Buyer"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? "Update the buyer details below"
                  : "Enter the details for the new Buyer"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="buyer_name" className="text-sm font-medium">
                  Buyer Name *
                </label>
                <Input
                  placeholder="Buyer Name"
                  value={formData.buyer_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      buyer_name: e.target.value,
                    }))
                  }
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="buyer_mobile" className="text-sm font-medium">
                  Mobile *
                </label>
                <Input
                  placeholder="Mobile"
                  value={formData.buyer_mobile}
                  maxLength={10}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setFormData((prev) => ({
                        ...prev,
                        buyer_mobile: value,
                      }));
                    }
                  }}
                />
              </div>
              <div>
                <label htmlFor="category" className="text-sm font-medium">
                  Buyer City *
                </label>
                <Input
                  placeholder="Buyer City"
                  value={formData.buyer_city}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      buyer_city: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label htmlFor="buyer_type" className="text-sm font-medium">
                  Buyer Type *
                </label>
                <MemoizedSelect
                  isMulti
                  value={formData.buyer_type}
                  onChange={(vals) =>
                    setFormData({ ...formData, buyer_type: vals })
                  }
                  options={[
                    { value: 1, label: "Buyer" },
                    { value: 2, label: "Vendor" },
                  ]}
                  placeholder="Select buyer types"
                />
              </div>
              <div>
                <label htmlFor="buyer_state" className="text-sm font-medium">
                  State *
                </label>
                <Select
                  value={formData.buyer_state}
                  onValueChange={(value) => {
                    const selectedState = stateData?.find(
                      (s) => s.state_name === value
                    );
                    setFormData((prev) => ({
                      ...prev,
                      buyer_state: selectedState?.state_name || value,
                      buyer_state_code: selectedState?.state_code || "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {stateData?.map((state) => (
                      <SelectItem
                        key={state.state_code}
                        value={state.state_name}
                      >
                        {state.state_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isEditMode && (
                <div className="grid gap-1">
                  <label htmlFor="buyer_status" className="text-sm font-medium">
                    Status *
                  </label>
                  <Select
                    value={formData.buyer_status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, buyer_status: value }))
                    }
                  >
                    <SelectTrigger
                      className={hasChanges ? "border-blue-200" : ""}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="Inactive">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                          Inactive
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
                "Update Buyer"
              ) : (
                "Create Buyer"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuyerForm;
