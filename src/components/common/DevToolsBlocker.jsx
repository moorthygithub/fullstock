import { useEffect, useState } from "react";
import DevToolsDialog from "./DevToolsDialog";

const DevToolsBlocker = () => {
  const [devToolsDetected, setDevToolsDetected] = useState(false);

  useEffect(() => {
    let devtoolsOpen = false;

    function detectDevTools() {
      const threshold = 160;

      // Check for window size manipulation
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      // Check for debugger statement
      let debuggerDetected = false;
      const start = performance.now();
      debugger; // This will pause execution if DevTools is open
      const end = performance.now();
      if (end - start > 100) {
        debuggerDetected = true;
      }

      return widthThreshold || heightThreshold || debuggerDetected;
    }

    const interval1 = setInterval(() => {
      const isOpen = detectDevTools();
      if (isOpen && !devtoolsOpen) {
        devtoolsOpen = true;
        setDevToolsDetected(true);
      }
    }, 1000);

    return () => {
      clearInterval(interval1);
    };
  }, []);

  if (devToolsDetected) {
    return <DevToolsDialog />;
  }

  return null;
};

export default DevToolsBlocker;
