import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const imageUrls = [
  "/src/assets/img/boxes.gif",
  "/src/assets/img/warehouse.gif",
];

export default function StockIllustrationCycle({ className = "w-80 h-auto" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % imageUrls.length);
    }, 3000); 

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`${className} relative overflow-hidden`}>
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={imageUrls[index]}
          alt={`Illustration ${index + 1}`}
          className="absolute inset-0 w-full h-full object-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>
    </div>
  );
}
