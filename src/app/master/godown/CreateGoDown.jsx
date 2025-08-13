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
import {
  CATEGORY_CREATE,
  CATEGORY_UPDATE,
  GODOWN_CREATE,
  GODOWN_UPDATE,
} from "@/api";
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

const CreateGoDownForm = ({ editId = null }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [formData, setFormData] = useState({
    godown: "",
    godown_status: "",
  });
  const { toast } = useToast();
  const token = usetoken();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

  const fetchGoDown = async () => {
    if (editId && open) {
      try {
        setIsFetching(true);
        const response = await apiClient.get(`${GODOWN_UPDATE}/${editId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedData = response.data.godown;
        setFormData({
          godown: fetchedData?.godown || "",
          godown_status: fetchedData?.godown_status || "",
        });
        setOriginalData({
          godown: fetchedData?.godown || "",
          godown_status: fetchedData?.godown_status || "",
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
    fetchGoDown();
  }, [editId, open]);

  const handleSubmit = async () => {
    const missingFields = [];
    if (!formData.godown) missingFields.push("Godown");
    if (editId && !formData.godown_status) missingFields.push("Status");

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
        response = await apiClient.put(`${GODOWN_UPDATE}/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await apiClient.post(GODOWN_CREATE, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (response?.data.code === 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });
        setFormData({ godown: "", godown_status: "" });
        queryClient.invalidateQueries(["godown"]);
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
    (formData.godown !== originalData.godown ||
      formData.godown_status !== originalData.godown_status);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {pathname === "/master/go-down" ? (
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
                  <SquarePlus className="h-4 w-4" /> Godown
                </Button>
              </div>
              <div className="hidden sm:block">
                <Button
                  variant="default"
                  className={`md:ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                >
                  <SquarePlus className="h-4 w-4 mr-2" /> Godown
                </Button>
              </div>
            </div>
          )
        ) : pathname === "/purchase/create" ||
          pathname === "/dispatch/create" ? (
          <p className="text-xs text-red-600 w-32 hover:text-red-300 cursor-pointer">
            Godown
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
                {editId ? "Update Godown" : "Create New Godown"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {editId
                  ? "Update the details for the selected Godown"
                  : "Enter the details for the new Godown"}
              </p>
            </div>

            <div className="grid gap-2">
              <label htmlFor="godown" className="text-sm font-medium">
                Godown *
              </label>
              <Input
                id="godown"
                placeholder="Enter Godown"
                value={formData.godown}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, godown: e.target.value }))
                }
              />
              {editId && (
                <div className="grid gap-1">
                  <label
                    htmlFor="godown_status"
                    className="text-sm font-medium"
                  >
                    Status
                  </label>
                  <Select
                    value={formData.godown_status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        godown_status: value,
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
                  "Update Godown"
                ) : (
                  "Create Godown"
                )}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default CreateGoDownForm;
