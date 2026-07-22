import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Activity } from "lucide-react";

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500";
  const Icon = type === "success" ? CheckCircle : type === "error" ? AlertCircle : Activity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`fixed bottom-6 right-6 ${bg} text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 font-medium`}
    >
      <Icon size={20} />
      {message}
    </motion.div>
  );
}
