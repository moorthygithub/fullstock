import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Edit, Loader2, SquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocation } from "react-router-dom";
import { ButtonConfig } from "@/config/ButtonConfig";
import { CATEGORY_CREATE, CATEGORY_UPDATE } from "@/api";
import usetoken from "@/api/usetoken";
import apiClient from "@/api/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CreateCategory = ({ editId = null }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    category_status: "",
  });
  const { toast } = useToast();
  const token = usetoken();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

  const fetchCategory = async () => {
    if (editId && open) {
      try {
        setIsFetching(true);
        const response = await apiClient.get(`${CATEGORY_UPDATE}/${editId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedData = response.data.category;
        setFormData({
          category: fetchedData?.category || "",
          category_status: fetchedData?.category_status || "",
        });
        setOriginalData({
          category: fetchedData?.category || "",
          category_status: fetchedData?.category_status || "",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch category details",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    }
  };
  useEffect(() => {
    fetchCategory();
  }, [editId, open]);

  const handleSubmit = async () => {
    const missingFields = [];
    if (!formData.category) missingFields.push("Category");
    if (editId && !formData.category_status) missingFields.push("Status");

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <div>
            <p>Please fill in the following fields:</p>
            <ul className="list-disc pl-5">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
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
      let response;
      if (editId) {
        response = await apiClient.put(
          `${CATEGORY_UPDATE}/${editId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        response = await apiClient.post(CATEGORY_CREATE, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (response?.data.code === 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });
        setFormData({ category: "", category_status: "" });
        queryClient.invalidateQueries(["category"]);
        setOpen(false);
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
        description: error.response?.data?.message || "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const hasChanges =
    originalData &&
    (formData.category !== originalData.category ||
      formData.category_status !== originalData.category_status);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {pathname === "/master/category" ? (
          editId ? (
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
          ) : (
            <div>
              <div className="sm:hidden">
                <Button
                  variant="default"
                  className={`md:ml-2 bg-yellow-400 hover:bg-yellow-600 text-black rounded-l-full`}
                >
                  <SquarePlus className="h-4 w-4" /> Category
                </Button>
              </div>
              <div className="hidden sm:block">
                <Button
                  variant="default"
                  className={`md:ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                >
                  <SquarePlus className="h-4 w-4 mr-2" /> Category
                </Button>
              </div>
            </div>
          )
        ) : pathname === "/purchase/create" ||
          pathname === "/dispatch/create" ? (
          <p className="text-xs text-red-600 w-32 hover:text-red-300 cursor-pointer">
            Category
          </p>
        ) : (
          <span />
        )}
      </PopoverTrigger>

      <PopoverContent className="md:w-80">
        {isFetching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">
                {editId ? "Update Category" : "Create New Category"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {editId
                  ? "Update the details for the selected category"
                  : "Enter the details for the new Category"}
              </p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category *
              </label>
              <Input
                id="category"
                placeholder="Enter category"
                value={formData.category}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^[a-zA-Z0-9 Xx]*$/.test(value)) {
                    setFormData((prev) => ({ ...prev, category: value }));
                  }
                }}
              />
              {editId && (
                <div className="grid gap-1">
                  <label
                    htmlFor="category_status"
                    className="text-sm font-medium"
                  >
                    Status
                  </label>
                  <Select
                    value={formData.category_status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        category_status: value,
                      }))
                    }
                  >
                    <SelectTrigger>
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
              {hasChanges && (
                <Alert className="bg-blue-50 border-blue-200 mt-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-600 text-sm mt-1">
                    You have unsaved changes
                  </AlertDescription>
                </Alert>
              )}
              <Button
                onClick={handleSubmit}
                disabled={editId ? !hasChanges : isLoading}
                className={`mt-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editId ? "Updating..." : "Creating..."}
                  </>
                ) : editId ? (
                  "Update Category"
                ) : (
                  "Create Category"
                )}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default CreateCategory;
