import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// export const AnimatedBackgroundBubble = () => {
//   const bubbleCount = 100;
//   const [seed, setSeed] = useState(0);

//   // Every few seconds, reset seed to regenerate bubbles
//   useEffect(() => {
//     const interval = setInterval(() => setSeed(Math.random()), 4000); // every 6s
//     return () => clearInterval(interval);
//   }, []);

//   const centerX = window.innerWidth / 2;
//   const centerY = window.innerHeight / 2;

//   return (
//     <div className="relative h-96 overflow-hidden flex items-center justify-center">
//       <div className="absolute inset-0 pointer-events-none">
//         {[...Array(bubbleCount)].map((_, i) => {
//           const side = Math.floor(Math.random() * 4);
//           let startX = 0,
//             startY = 0;
//           if (side === 0) {
//             startX = Math.random() * window.innerWidth;
//             startY = -20;
//           } else if (side === 1) {
//             startX = window.innerWidth + 20;
//             startY = Math.random() * window.innerHeight;
//           } else if (side === 2) {
//             startX = Math.random() * window.innerWidth;
//             startY = window.innerHeight + 20;
//           } else {
//             startX = -20;
//             startY = Math.random() * window.innerHeight;
//           }

//           return (
//             <motion.div
//               key={`${seed}-${i}`} // 👈 changes every "seed" reset
//               className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-40"
//               initial={{
//                 x: startX,
//                 y: startY,
//                 scale: Math.random() * 1.5,
//                 opacity: 0,
//               }}
//               animate={{
//                 x: centerX + (Math.random() * 40 - 20),
//                 y: centerY + (Math.random() * 40 - 20),
//                 opacity: [0, 0.5, 0],
//               }}
//               transition={{
//                 duration: 4 + Math.random() * 4,
//                 ease: "easeInOut",
//               }}
//             />
//           );
//         })}
//       </div>
//     </div>
//   );
// };
export const AnimatedBackgroundBubble = () => {
  return (

      <div className="relative h-96 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(80)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-40"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 1.2,
                opacity: 0,
              }}
              animate={{
                y: -100,
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>
      </div>
 
  );
};
