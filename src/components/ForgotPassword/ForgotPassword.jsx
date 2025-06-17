import apiClient from "@/api/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/json/logo";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import companyname from "../../json/company.json";
import AnimatedBackgroundLines from "../common/AnimatedBackgroundLines";
import StockIllustrationCycle from "../common/stock-illustration.";
import { PANEL_FORGOT_PASSWORD } from "@/api";

export default function LoginAuth() {
  const [email, setEmail] = useState("");
  const [username, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadingMessages = [
    "Setting things up for you...",
    "Checking your credentials...",
    "Preparing your dashboard...",
    "Almost there...",
  ];

  useEffect(() => {
    let index = 0;
    let intervalId;
    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      intervalId = setInterval(() => {
        index = (index + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[index]);
      }, 1000);
    }
    return () => intervalId && clearInterval(intervalId);
  }, [isLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("name", username);

    try {
      const res = await apiClient.post(`${PANEL_FORGOT_PASSWORD}`, formData);
      if (res.status === 200) {
        const response = res.data;

        if (response.code === 200) {
          toast({
            title: "Success",
            description: response.msg,
          });
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
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 px-4">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatedBackgroundLines />
      </div>

      <motion.div
        className="flex flex-col md:flex-row shadow-2xl rounded-2xl overflow-hidden max-w-5xl w-full bg-white relative z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="hidden md:flex flex-col items-center justify-center p-6 w-1/2 bg-yellow-100">
          <div className="flex justify-center items-center">
            <StockIllustrationCycle className="w-96 h-64" />
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none shadow-none">
              <CardHeader className="mb-4">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut",
                    }}
                  >
                    <Logo />
                  </motion.div>{" "}
                  <span className="text-xl font-bold text-yellow-800">
                    {companyname?.CompanyName}
                  </span>
                </div>
                <CardTitle className="text-3xl text-yellow-900 mt-4">
                  Forgot Password
                </CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="username" className="text-yellow-900">
                      Username
                    </Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      className="mt-1 bg-white text-black"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-yellow-900">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="mt-1 bg-white text-black"
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <motion.span
                          key={loadingMessage}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm"
                        >
                          {loadingMessage}
                        </motion.span>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </motion.div>

                  <CardDescription className="text-right mt-2">
                    <span
                      onClick={() => navigate("/")}
                      className="text-yellow-800 underline cursor-pointer"
                    >
                      Sign In
                    </span>
                  </CardDescription>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
