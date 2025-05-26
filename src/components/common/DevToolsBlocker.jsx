import { useEffect, useState } from "react";
import DevToolsDialog from "./DevToolsDialog";
import devtools from "devtools-detect";

const DevToolsBlocker = () => {
  const [devToolsDetected, setDevToolsDetected] = useState(false);

  useEffect(() => {
    const handleChange = () => {
      if (devtools.isOpen) {
        setDevToolsDetected(true);
      }
    };

    window.addEventListener("devtoolschange", handleChange);

    return () => {
      window.removeEventListener("devtoolschange", handleChange);
    };
  }, []);

  return <DevToolsDialog open={devToolsDetected} />;
};

export default DevToolsBlocker;
