import { DOT_ENV, PANEL_CHECK } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/redux/authSlice";
import { persistor } from "@/redux/store";
import { setShowUpdateDialog } from "@/redux/versionSlice";
import CryptoJS from "crypto-js";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const secretKey = import.meta.env.VITE_SECRET_KEY;
const validationKey = import.meta.env.VITE_SECRET_VALIDATION;

const ValidationWrapper = ({ children }) => {
  const [status, setStatus] = useState("pending");
  const token = usetoken();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const localVersion = useSelector((state) => state.auth?.version);

  useEffect(() => {
    const validateEnvironment = async () => {
      try {
        const statusRes = await apiClient.get(`${PANEL_CHECK}`);

        if (statusRes.data?.msg !== "success") {
          throw new Error("Panel status check failed");
        }

        const serverVer = statusRes?.data?.version?.version_panel;
        if (token && statusRes.data?.msg == "success") {
          dispatch(
            setShowUpdateDialog({
              showUpdateDialog: false,
              version: serverVer,
            })
          );
          if (localVersion !== serverVer) {
            dispatch(
              setShowUpdateDialog({
                showUpdateDialog: true,
                version: serverVer,
              })
            );
          }
        }
        const dotenvRes = await apiClient.get(`${DOT_ENV}`);
        const dynamicValidationKey = dotenvRes.data?.hashKey;

        if (!dynamicValidationKey) {
          throw new Error("Validation key missing from response");
        }

        const computedHash = validationKey
          ? CryptoJS.MD5(validationKey).toString()
          : "";

        if (!secretKey || computedHash !== dynamicValidationKey) {
          throw new Error("Unauthorized environment file detected");
        }

        setStatus("valid");
        if (location.pathname === "/maintenance") {
          navigate("/");
        }
      } catch (error) {
        console.error("❌ Validation Error:", error.message);
        if (status != "valid") {
          await persistor.flush();
          localStorage.clear();
          dispatch(logout());
          setTimeout(() => persistor.purge(), 1000);
        }

        toast({
          title: "Environment Error",
          description: "Environment validation failed. Redirecting...",
          variant: "destructive",
        });

        setStatus("invalid");

        if (location.pathname !== "/maintenance") {
          navigate("/maintenance");
        }
      }
    };

    validateEnvironment();
  }, [dispatch]);

  return children;
};

export default ValidationWrapper;
