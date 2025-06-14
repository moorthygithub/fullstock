import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"; // assuming you're using a wrapped component
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { WEB_ENQUIRY } from "@/api";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/axios";

export default function EnquiryDrawer({ isDrawerOpen, setDrawerOpen }) {
  const [formData, setFormData] = useState({
    enquiryFullName: "",
    enquiryCompanyName: "",
    enquiryMobile: "",
    enquiryEmail: "",
    enquiryProduct: "",
    enquiryMessage: "",
  });
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await apiClient.post(`${WEB_ENQUIRY}`, formData);
      if (res.status === 200) {
        const response = res.data;

        if (response.code === 200) {
          toast({
            title: "Success",
            description: response.msg,
          });
          setDrawerOpen(false);
        } else if (response.code === 400) {
          toast({
            title: "Duplicate Entry",
            description: response.msg,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Unexpected Response",
            description: response.msg,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Unexpected response from the server.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: error.response?.data?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerContent className="p-6 max-w-md ml-auto w-full">
        <DrawerHeader>
          <DrawerTitle className="text-xl text-yellow-900">
            Web Enquiry
          </DrawerTitle>
          <DrawerDescription>
            Please fill the form and submit.
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div>
            <Label htmlFor="enquiryFullName">
              Full Name<span className="text-red-500 ml-2">*</span>
            </Label>
            <Input
              name="enquiryFullName"
              value={formData.enquiryFullName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="enquiryCompanyName">
              Company Name<span className="text-red-500 ml-2">*</span>
            </Label>
            <Input
              name="enquiryCompanyName"
              value={formData.enquiryCompanyName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="enquiryMobile">
              Mobile<span className="text-red-500 ml-2">*</span>
            </Label>
            <Input
              name="enquiryMobile"
              value={formData.enquiryMobile}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="enquiryEmail">
              Email<span className="text-red-500 ml-2">*</span>
            </Label>
            <Input
              type="email"
              name="enquiryEmail"
              value={formData.enquiryEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="enquiryProduct">
              Product<span className="text-red-500 ml-2">*</span>
            </Label>
            <Input
              name="enquiryProduct"
              value={formData.enquiryProduct}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="enquiryMessage">Message</Label>
            <Textarea
              name="enquiryMessage"
              rows={3}
              value={formData.enquiryMessage}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Enquiry"}
          </Button>

          <DrawerClose className="text-sm text-center text-yellow-700 underline mt-2">
            Cancel
          </DrawerClose>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
