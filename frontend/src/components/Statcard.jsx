import React from "react";
import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  color = "blue",
}) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-rose-50 text-rose-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${colorStyles[color]}`}>
          <Icon size={22} />
        </div>
      </div>
      {subtext && (
        <div className="mt-4 flex items-center text-xs">
          <span
            className={
              subtext.includes("+")
                ? "text-emerald-500 font-semibold"
                : "text-slate-400"
            }
          >
            {subtext}
          </span>
          <span className="text-slate-400 ml-1">vs last week</span>
        </div>
      )}
    </motion.div>
  );
}
