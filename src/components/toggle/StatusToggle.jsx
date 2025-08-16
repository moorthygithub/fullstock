import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import BASE_URL from "@/config/BaseUrl";
import { useLocation } from "react-router-dom";
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
import { ButtonConfig } from "@/config/ButtonConfig";
import { DISPATCH_STATUS, PURCHASE_STATUS, QUOTATION_STATUS } from "@/api";
import usetoken from "@/api/usetoken";
const StatusToggle = ({ initialStatus, teamId, onStatusChange }) => {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const token = usetoken();
  const handleToggleClick = () => {
    setIsDialogOpen(true);
  };

  const handleToggle = async () => {
    setIsDialogOpen(false);
    setIsLoading(true);
    const newStatus = status == "Active" ? "Inactive" : "Active";

    let apiUrl = "";
    if (
      location.pathname.includes("/purchase") ||
      location.pathname.includes("/purchase-return")
    ) {
      apiUrl = `${PURCHASE_STATUS}/${teamId}`;
    } else if (
      location.pathname.includes("/dispatch") ||
      location.pathname.includes("/dispatch-return")
    ) {
      apiUrl = `${DISPATCH_STATUS}/${teamId}`;
    } else if (location.pathname.includes("/quotation")) {
      apiUrl = `${QUOTATION_STATUS}/${teamId}`;
    } else {
      toast({
        title: "Error",
        description: "Invalid page for status update.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await axios.put(
        apiUrl,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      toast({
        title: "Status Updated",
        description: `Dispatch status changed to ${
          newStatus === "Active" ? "Open" : "Closed"
        }`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggleClick}
        disabled={isLoading}
        className={`inline-flex items-center space-x-1 px-0 md:px-2 py-0 md:py-1 rounded 
          ${
            status === "Active"
              ? "text-green-800 hover:bg-green-100"
              : "text-gray-800 hover:bg-gray-100"
          } transition-colors`}
      >
        <RefreshCcw
          className={`hidden sm:block h-4 w-4 ${
            isLoading ? "animate-spin" : ""
          }`}
        />
        <span>{status === "Active" ? "Open" : "Closed"}</span>
      </button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will change the status from{" "}
              {status === "Active" ? "Open" : "Closed"} to{" "}
              {status === "Active" ? "Closed" : "Open"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggle}
              disabled={isLoading}
              className={`${ButtonConfig.backgroundColor}  ${ButtonConfig.textColor} text-black hover:bg-red-600`}
            >
              {isLoading ? "Updating..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StatusToggle;
