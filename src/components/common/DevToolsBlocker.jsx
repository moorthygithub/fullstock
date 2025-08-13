import { useEffect, useState } from "react";
import DevToolsDialog from "./DevToolsDialog";

const DevToolsBlocker = () => {
  const [devToolsDetected, setDevToolsDetected] = useState(false);

  useEffect(() => {
    let devtoolsOpen = false;

    function detectDevTools() {
      const threshold = 160;
      const widthInRange = window.innerWidth >= 813 && window.innerWidth <= 815;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold =
        window.outerHeight - window.innerHeight > threshold;

      // Run debugger detection only if NOT in the 800–815 range
      let debuggerDetected = false;
      if (!widthInRange) {
        const start = performance.now();
        debugger; 
        const end = performance.now();
        if (end - start > 100) {
          debuggerDetected = true;
        }
      }

      return (
        (widthThreshold || heightThreshold || debuggerDetected) && !widthInRange
      );
    }

    const interval = setInterval(() => {
      const isOpen = detectDevTools();

      if (isOpen && !devtoolsOpen) {
        devtoolsOpen = true;
        setDevToolsDetected(true);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (devToolsDetected) {
    return <DevToolsDialog />;
  }

  return null;
};

export default DevToolsBlocker;
