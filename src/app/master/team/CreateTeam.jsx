import { BRANCH_LIST_FETCH, CREATE_TEAM } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, SquarePlus } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
const userTypes = [
  { label: "User", value: 1 },
  { label: "Admin", value: 2 },
];

const CreateTeam = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    branch_id: "",
    name: "",
    email: "",
    mobile: "",
    user_type: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

  const { data: branch, refetch } = useQuery({
    queryKey: ["branchs"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BRANCH_LIST_FETCH}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.branch;
    },
  });
  const handleInputChange = (e, key, value) => {
    if (e && e.target) {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };
  const handleSubmit = async () => {
    const missingFields = [];
    if (!formData.branch_id) missingFields.push("Branch Id");
    if (!formData.name) missingFields.push("Name");
    if (!formData.email) missingFields.push("Email");
    if (!formData.mobile) missingFields.push("Mobile");
    if (!formData.user_type) missingFields.push("UserType");
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
      const token = localStorage.getItem("token");
      const response = await axios.post(`${CREATE_TEAM}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data.code == 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });

        setFormData({
          branch_id: "",
          name: "",
          email: "",
          mobile: "",
          user_type: "",
        });
        await queryClient.invalidateQueries(["teams"]);
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
        description: error.response?.data?.message || "Failed to create Item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {pathname === "/master/team" ? (
          <div>
            <div className="sm:hidden">
              <Button
                variant="default"
                className={`md:ml-2 bg-yellow-400 hover:bg-yellow-600 text-black rounded-l-full`}
              >
                <SquarePlus className="h-4 w-4" /> Team
              </Button>
            </div>
            <div className="hidden sm:block">
              <Button
                variant="default"
                className={`md:ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              >
                <SquarePlus className="h-4 w-4 mr-2" /> Team
              </Button>
            </div>
          </div>
        ) : pathname === "/purchase/create" ||
          pathname === "/dispatch/create" ||
          "/purchase/edit" ? (
          <p className="text-xs text-red-600   hover:text-red-300 cursor-pointer">
            Item <span className="text-red-500">*</span>
          </p>
        ) : (
          <span />
        )}
      </PopoverTrigger>
      <PopoverContent className="md:w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Create New Team</h4>
            <p className="text-sm text-muted-foreground">
              Enter the details for the new Team
            </p>
          </div>
          <div className="grid gap-2">
            <div>
              <Select
                value={formData.branch_id}
                onValueChange={(value) =>
                  handleInputChange(null, "branch_id", value)
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Branch " />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {branch?.map((branch, index) => (
                    <SelectItem key={index} value={branch.id}>
                      {branch.branch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              id="name"
              placeholder="Enter  Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Input
              type="email"
              id="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <Input
              id="mobile"
              placeholder="Enter Mobile"
              value={formData.mobile}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,10}$/.test(value)) {
                  setFormData((prev) => ({ ...prev, mobile: value }));
                }
              }}
            />

            <div>
              <Select
                value={formData.user_type}
                onValueChange={(value) =>
                  handleInputChange(null, "user_type", value)
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select UserType" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {userTypes?.map((type, index) => (
                    <SelectItem key={index} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`mt-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Team"
              )}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CreateTeam;
