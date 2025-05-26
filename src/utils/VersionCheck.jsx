import { PANEL_CHECK } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useLogout from "@/hooks/useLogout";
import { setShowUpdateDialog } from "@/redux/versionSlice";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const VersionCheck = () => {
  const token = usetoken();
  const localVersion = useSelector((state) => state.auth?.version);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const Logout = useLogout();
  const [retryPopup, setRetryPopup] = useState(false);
  const isDialogOpen = useSelector((state) => state.version.showUpdateDialog);
  const serverVersion = useSelector((state) => state?.version?.version);
  // console.log(
  //   localVersion,
  //   "localVersion in ",
  //   serverVersion,
  //   "serverVersion in"
  // );
  const handleCloseDialog = () => {
    dispatch(
      setShowUpdateDialog({
        showUpdateDialog: false,
        version: serverVersion,
      })
    );
  };
  const handleLogout = async () => {
    setLoading(true);

    try {
      await new Promise((res) => setTimeout(res, 1000));
      await Logout();
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (retryPopup) {
      const timeout = setTimeout(() => {
        dispatch(
          setShowUpdateDialog({
            showUpdateDialog: true,
            version: serverVersion,
          })
        );
        setRetryPopup(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [retryPopup]);

  if (!token) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
      <DialogContent
        className="max-w-md p-6 rounded-2xl shadow-2xl border bg-gradient-to-br from-white to-gray-100 dark:from-zinc-900 dark:to-zinc-800 [&>button.absolute]:hidden"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideClose={true}
      >
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-600 mb-3">
            <RefreshCw className="w-6 h-6 animate-spin-slow" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Update Available
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            A new version of the panel is ready. Update now to version{" "}
            <span className="font-medium text-blue-600">{serverVersion}</span>.
          </p>
        </DialogHeader>

        <DialogFooter className="mt-6 flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              handleCloseDialog();
              setRetryPopup(true);
            }}
            className="rounded-full px-6 py-2"
          >
            Do It Later
          </Button>
          <Button
            onClick={handleLogout}
            disable={loading}
            className="rounded-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Updating" : "Update Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VersionCheck;
