// import { useEffect, useState } from "react";
// import DevToolsDialog from "./DevToolsDialog";

// const DevToolsBlocker = () => {
//   const [devToolsDetected, setDevToolsDetected] = useState(false);

//   useEffect(() => {
//     let devtoolsOpen = false;

//     function detectDevTools() {
//       const threshold = 160;
//       const widthThreshold = window.outerWidth - window.innerWidth > threshold;
//       const heightThreshold =
//         window.outerHeight - window.innerHeight > threshold;
//       return widthThreshold || heightThreshold;
//     }

//     const interval1 = setInterval(() => {
//       const isOpen = detectDevTools();
//       if (isOpen && !devtoolsOpen) {
//         devtoolsOpen = true;
//         setDevToolsDetected(true);
//       }
//     }, 1000);

//     function detectDebugger() {
//       const start = performance.now();
//       debugger;
//       const end = performance.now();
//       return end - start > 100;

//     }

//     const interval2 = setInterval(() => {
//       if (detectDebugger()) {
//         setDevToolsDetected(true);
//       }
//     }, 2000);

//     return () => {
//       clearInterval(interval1);
//       clearInterval(interval2);
//     };
//   }, []);

//   return <DevToolsDialog open={devToolsDetected} />;
// };

// export default DevToolsBlocker;
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
