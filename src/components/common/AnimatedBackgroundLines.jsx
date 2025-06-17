import { useEffect } from "react";

export default function AnimatedBackgroundLines() {
  const lines = Array.from({ length: 30 });

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
@keyframes dotFall {
  0% {
    top: 0%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="w-full h-full flex justify-between px-4 absolute inset-0 z-0 pointer-events-none">
      {lines.map((_, lineIdx) => (
        <div key={lineIdx} className="relative w-[1px] h-full bg-yellow-400/20">
          <div
            className="absolute top-0 w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              animation: "dotFall 12s linear infinite",
              animationDelay: `${
                lineIdx % 2 === 0 ? lineIdx * 0.2 : lineIdx * 0.2 + 6
              }s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
