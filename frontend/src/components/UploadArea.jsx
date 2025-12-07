import React, { useCallback, useState } from "react";
import { UploadCloud, File, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadArea({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileSelect(file); // Pass to parent
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        layout
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300
          ${
            isDragging
              ? "border-brand-accent bg-brand-accent/5 scale-[1.02]"
              : "border-slate-200 hover:border-brand-accent/50 hover:bg-slate-50"
          }
        `}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
          accept=".pdf,.png,.jpg,.jpeg"
        />

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-brand-accent">
                <UploadCloud size={32} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-700">
                  Click or Drag invoice here
                </h4>
                <p className="text-sm text-slate-400 mt-1">
                  Supports PDF, PNG, JPG (Max 10MB)
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="file"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
                  <File size={20} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-700">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <CheckCircle className="text-emerald-500" size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
