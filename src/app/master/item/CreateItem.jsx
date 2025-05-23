import {
  CATEGORY_DATA,
  ITEM_CREATE,
  ITEM_EDIT_GET,
  ITEM_EDIT_SUMBIT,
} from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IMAGE_URL, NO_IMAGE_URL } from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Edit, Loader2, SquarePlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const CreateItem = ({ editId = null }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const [formData, setFormData] = useState({
    item_category_id: "",
    item_name: "",
    item_size: "",
    item_brand: "",
    item_weight: "",
    item_minimum_stock: "",
    item_image: "",
    item_status: editId ? "" : null,
  });
  const { toast } = useToast();
  const token = usetoken();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

  const { data: categoryData, isFetching: fetch } = useQuery({
    queryKey: ["itemcategory"],
    queryFn: async () => {
      const response = await apiClient.get(`${CATEGORY_DATA}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: open,
  });
  const fetchItem = async () => {
    if (editId && open) {
      try {
        setIsFetching(true);
        const response = await apiClient.get(`${ITEM_EDIT_GET}/${editId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedData = response.data.items;
        setFormData({
          item_category_id: fetchedData?.item_category_id || "",
          item_name: fetchedData?.item_name || "",
          item_size: fetchedData?.item_size || "",
          item_brand: fetchedData?.item_brand || "",
          item_weight: fetchedData?.item_weight || "",
          item_minimum_stock: fetchedData?.item_minimum_stock || "",
          item_image: fetchedData?.item_image || "",
          item_status: fetchedData?.item_status || "Active",
        });
        setOriginalData({
          item_category_id: fetchedData?.item_category_id || "",
          item_name: fetchedData?.item_name || "",
          item_size: fetchedData?.item_size || "",
          item_brand: fetchedData?.item_brand || "",
          item_weight: fetchedData?.item_weight || "",
          item_minimum_stock: fetchedData?.item_minimum_stock || "",
          item_image: fetchedData?.item_image || "",
          item_status: fetchedData?.item_status || "Active",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch item details",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    }
  };

  useEffect(() => {
    fetchItem();
  }, [editId, open]);

  const handleSubmit = async () => {
    const missingFields = [];
    if (!formData.item_category_id) missingFields.push("Category ID");
    if (!formData.item_name) missingFields.push("Item Name");
    if (!formData.item_size) missingFields.push("Item Size");
    if (editId && !formData.item_status) missingFields.push("Status");

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
      const data = new FormData();
      data.append("_method", "PUT");
      data.append("item_category_id", formData.item_category_id);
      data.append("item_name", formData.item_name);
      data.append("item_size", formData.item_size);
      data.append("item_brand", formData.item_brand);
      data.append("item_weight", formData.item_weight);
      data.append("item_minimum_stock", formData.item_minimum_stock);
      if (formData.item_image) {
        data.append("item_image", formData.item_image);
      }
      if (editId) {
        data.append("item_status", formData.item_status);
      }

      let response;
      if (editId) {
        response = await apiClient.post(`${ITEM_EDIT_SUMBIT}/${editId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await apiClient.post(ITEM_CREATE, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response?.data.code === 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });
        setFormData({
          item_category_id: "",
          item_name: "",
          item_size: "",
          item_brand: "",
          item_weight: "",
          item_minimum_stock: "",
          item_image: null,
          item_status: "Active",
        });
        queryClient.invalidateQueries(["item"]);
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
        description: error.response?.data?.message || "Failed to save item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value, files } = e.target;

    if (id == "item_image") {
      setFormData((prev) => ({
        ...prev,
        item_image: files && files.length > 0 ? files[0] : null,
      }));
    } else if (id === "item_minimum_stock" || id === "item_weight") {
      if (/^\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [id]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSelectChange = (field) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const hasChanges =
    originalData &&
    Object.keys(formData).some((key) => formData[key] !== originalData[key]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {pathname == "/master/item" ? (
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
                  <SquarePlus className="h-4 w-4" /> Item
                </Button>
              </div>
              <div className="hidden sm:block">
                <Button
                  variant="default"
                  className={`md:ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                >
                  <SquarePlus className="h-4 w-4 mr-2" /> Item
                </Button>
              </div>
            </div>
          )
        ) : pathname === "/purchase/create" ||
          pathname === "/dispatch/create" ? (
          <p className="text-xs text-red-600 w-32 hover:text-red-300 cursor-pointer">
            Item
          </p>
        ) : (
          <span />
        )}
      </DialogTrigger>

      <DialogContent className="md:w-96" aria-describedby={undefined}>
        {isFetching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {editId ? "Update Item" : "Create New Item"}
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              <div>
                <label htmlFor="category" className="text-sm font-medium">
                  Category *
                </label>
                <Select
                  value={formData.item_category_id}
                  onValueChange={handleSelectChange("item_category_id")}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Item Category *" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categoryData?.category?.map((product, index) => (
                      <SelectItem key={index} value={product.id}>
                        {product.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="item_name" className="text-sm font-medium">
                  Item Name *
                </label>
                <Input
                  id="item_name"
                  placeholder="Item Name"
                  value={formData.item_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="item_size" className="text-sm font-medium">
                    Item Size *
                  </label>
                  <Input
                    id="item_size"
                    placeholder="Item Size (e.g. 24x24)"
                    value={formData.item_size}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="item_brand" className="text-sm font-medium">
                    Item Brand
                  </label>
                  <Input
                    id="item_brand"
                    placeholder="Item Brand"
                    value={formData.item_brand}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label htmlFor="item_weight" className="text-sm font-medium">
                    Item Weight
                  </label>
                  <Input
                    id="item_weight"
                    placeholder="Item Weight"
                    value={formData.item_weight}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label
                    htmlFor="item_minimum_stock"
                    className="text-sm font-medium"
                  >
                    Minimum Stock
                  </label>
                  <Input
                    id="item_minimum_stock"
                    placeholder="Minimum Stock"
                    value={formData.item_minimum_stock}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="grid col-span-2">
                  <label htmlFor="item_image" className="text-sm font-medium">
                    Image
                  </label>
                  <Input
                    id="item_image"
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                </div>

                {(editId || formData.item_image) && (
                  <div>
                    <p className="text-xs text-gray-500">Current Image:</p>
                    <img
                      src={
                        typeof formData.item_image === "string"
                          ? `${IMAGE_URL}${formData.item_image}`
                          : formData.item_image instanceof File
                          ? URL.createObjectURL(formData.item_image)
                          : NO_IMAGE_URL
                      }
                      alt="Item Preview"
                      className="w-24 h-14 mt-1 rounded border object-cover"
                    />
                  </div>
                )}
              </div>
              <div>
                {editId && (
                  <div className="grid gap-1">
                    <label
                      htmlFor="item_status"
                      className="text-sm font-medium"
                    >
                      Status
                    </label>
                    <Select
                      value={formData.item_status}
                      onValueChange={handleSelectChange("item_status")}
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
                  className={`mt-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} w-full`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editId ? "Updating..." : "Creating..."}
                    </>
                  ) : editId ? (
                    "Update Item"
                  ) : (
                    "Create Item"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateItem;
