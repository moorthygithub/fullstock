import DisabledRightClick from "./components/common/DisabledRightClick";
import SessionTimeoutTracker from "./components/SessionTimeoutTracker/SessionTimeoutTracker";
import { Toaster } from "./components/ui/toaster";
import useLogout from "./hooks/useLogout";
import AppRoutes from "./routes/AppRoutes";
import VersionCheck from "./utils/VersionCheck";

function App() {
  const time = localStorage.getItem("token-expire-time");
  const handleLogout = useLogout();

  return (
    <>
      {/* <DisabledRightClick /> */}
      <VersionCheck />
      <Toaster />
      <SessionTimeoutTracker expiryTime={time} onLogout={handleLogout} />
      <AppRoutes />
    </>
  );
}

export default App;
