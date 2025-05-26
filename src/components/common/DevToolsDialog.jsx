import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ButtonConfig } from "@/config/ButtonConfig";

const DevToolsDialog = ({ open }) => {
  const navigate = useNavigate();

  const handleHomeRedirect = () => {
    navigate("/");
    window.location.reload();
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-lg p-6 sm:p-8 rounded-2xl border shadow-xl bg-background text-center [&>button.absolute]:hidden"
        aria-describedby={undefined}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideClose={true}
      >
        <div className="flex flex-col items-center gap-4">
          <AlertTriangle className="w-12 h-12 text-yellow-500" />

          <h2 className="text-2xl font-semibold text-destructive">
            Developer Tools Detected
          </h2>

          <p className="text-sm text-muted-foreground max-w-md">
            For security reasons, access to this page is restricted when browser
            developer tools are active.
            <br />
            If you believe this is an error or need assistance, please contact{" "}
            <strong>AG Solutions Support</strong>.
          </p>

          <Button
            type="button"
            onClick={handleHomeRedirect}
            className={`mt-4 w-full sm:w-auto ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} cursor-pointer`}
          >
            Go to Home
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DevToolsDialog;
