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
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/json/logo";
import { loginSuccess } from "@/redux/authSlice";
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import companyname from "../../json/company.json";
import apiClient from "@/api/axios";
import { PANEL_LOGIN } from "@/api";
export default function LoginAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();

  const loadingMessages = [
    "Setting things up for you...",
    "Checking your credentials...",
    "Preparing your dashboard...",
    "Almost there...",
  ];

  useEffect(() => {
    let messageIndex = 0;
    let intervalId;

    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 800);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);
    try {
      const res = await apiClient.post(`${PANEL_LOGIN}`, formData);
      if (res.status === 200) {
        if (!res.data.UserInfo || !res.data.UserInfo.token) {
          console.warn("⚠️ Login failed: Token missing in response");
          toast.error("Login Failed: No token received.");
          setIsLoading(false);
          return;
        }

        const { UserInfo } = res.data;

        const userData = {
          token: UserInfo.token,
          id: UserInfo.user.id,
          name: UserInfo.user?.name,
          user_type: UserInfo.user?.user_type,
          email: UserInfo.user.email,
          token_expire_time: UserInfo.token_expires_at,
          whatsapp_number: res?.data?.branch?.branch_whatsapp,
          version: res?.data?.version?.version_panel,
          branch_d_unit: res?.data?.branch?.branch_d_unit,
          branch_s_unit: res?.data?.branch?.branch_s_unit,
        };
        dispatch(loginSuccess(userData));

        const redirectPath = window.innerWidth < 768 ? "/home" : "/stock-view";
        console.log(`✅ Login successful! Redirecting to ${redirectPath}...`);
        navigate(redirectPath);
      } else {
        console.warn("⚠️ Unexpected API response:", res);
        toast.error("Login Failed: Unexpected response.");
      }
    } catch (error) {
      console.error("❌ Login Error:", error.response?.data || error.message);

      toast({
        variant: "destructive",
        title: "Login Failed",
        description:
          error.response?.data?.message || "Please check your credentials.",
      });

      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="relative flex flex-col justify-center items-center min-h-screen bg-gray-100"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 1, x: 0 }}
        exit={{
          opacity: 0,
          x: -window.innerWidth,
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
      >
        <Card
          className={`w-72 md:w-80 max-w-md ${ButtonConfig.loginBackground} ${ButtonConfig.loginText}`}
        >
          <CardHeader>
            <div className="font-semibold flex items-center space-x-2">
              <div className="flex items-center">
                <Logo />
              </div>
              <div className="flex flex-col">
                <span className="text-[1rem] font-bold text-yellow-900 leading-tight">
                  {companyname?.CompanyName}
                </span>
              </div>
            </div>
            {/* <Logo /> */}

            <CardTitle
              className={`text-2xl text-center${ButtonConfig.loginText}`}
            >
              Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="email"
                    className={`${ButtonConfig.loginText}`}
                  >
                    Username
                  </Label>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter your username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-white text-black placeholder-gray-400 border-white"
                    />
                  </motion.div>
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="password"
                    className={`${ButtonConfig.loginText}`}
                  >
                    Password
                  </Label>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Input
                      id="password"
                      type="password"
                      placeholder="*******"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-white text-black placeholder-gray-400 border-white"
                    />
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    type="submit"
                    className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} w-full`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.span
                        key={loadingMessage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm"
                      >
                        {loadingMessage}
                      </motion.span>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
            <CardDescription
              className={`flex justify-end mt-4 underline ${ButtonConfig.loginText}`}
            >
              <span
                onClick={() => navigate("/forgot-password")}
                className="cursor-pointer "
              >
                {" "}
                Forgot Password
              </span>
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
