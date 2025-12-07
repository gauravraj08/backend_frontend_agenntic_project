import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  UploadCloud,
  FileText,
  Loader2,
  Search,
  X,
  Eye,
  Send,
  Bot,
  User,
  LayoutDashboard,
  ShieldCheck,
  MessageSquare,
  LogOut,
  Bell,
} from "lucide-react";
import { invoiceService } from "./services/api";

const API_BASE_URL = "http://localhost:8000";

// Toast Notification Component
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-xl border-l-4 flex items-center gap-3 bg-white ${
      type === "success" ? "border-emerald-500" : "border-rose-500"
    }`}
  >
    {type === "success" ? (
      <CheckCircle size={20} className="text-emerald-500" />
    ) : (
      <AlertTriangle size={20} className="text-rose-500" />
    )}
    <div>
      <h4
        className={`font-bold text-sm ${
          type === "success" ? "text-emerald-700" : "text-rose-700"
        }`}
      >
        {type === "success" ? "Success" : "Alert"}
      </h4>
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
    <button
      onClick={onClose}
      className="ml-4 text-slate-400 hover:text-slate-600"
    >
      <X size={16} />
    </button>
  </motion.div>
);

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: "dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "upload", label: "Processing Studio", icon: UploadCloud },
    { id: "audit", label: "Audit Vault", icon: ShieldCheck },
    { id: "chat", label: "AI Insights", icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col justify-between z-10 shadow-xl">
      <div>
        <div className="p-8 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center bg-blue-500">
            <Activity size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">InvoiceAI</span>
        </div>
        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon
                size={20}
                className={
                  activeTab === item.id
                    ? "animate-pulse"
                    : "group-hover:scale-110 transition-transform"
                }
              />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
          <LogOut size={20} />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

// StatCard Component
const StatCard = ({ title, value, subtext, icon: Icon, color }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    red: "bg-rose-50 text-rose-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
        {color === "red" && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
      <p className="text-slate-400 text-xs">{subtext}</p>
    </div>
  );
};

// Add this constant at the top of your file if not already present

const ChatWidget = () => {
  // Initial state with a welcome message
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello Auditor. I've analyzed the recent batch. How can I help you regarding specific invoices or anomalies?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Add User Message to UI immediately
    const userText = input; // Capture text before clearing
    const userMsg = { id: Date.now(), sender: "user", text: userText };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // 2. Prepare History (Format current messages for Context)
      // We format them as strings "User: ..." or "Assistant: ..."
      const historyPayload = messages.map(
        (msg) => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`
      );

      // 3. Call the Backend API
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userText,
          history: historyPayload, // Pass conversation history for RAG context
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      // 4. Add Bot Response to UI
      const botMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: data.answer || "I'm sorry, I couldn't generate a response.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat API Error:", error);

      // 5. Handle Errors gracefully in UI
      const errorMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text: "⚠️ Connection failed. Is the backend server running on port 8000?",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <Bot size={20} className="text-blue-500" /> AI Assistant
        </h3>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          RAG Enabled
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F9FB]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white border border-slate-200 text-slate-700 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isTyping && handleSend()}
            disabled={isTyping}
            placeholder="Ask about invoices, trends, or anomalies..."
            className="flex-1 px-4 py-3 bg-slate-50 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// const InvoiceModal = ({ invoice, onClose }) => {
//   const [viewMode, setViewMode] = useState("details");

//   if (!invoice) return null;

//   // SAFE DATA ACCESS HELPER
//   // This extracts data safely from the nested structure
//   const data = invoice.audit_trail?.invoice_data || {};
//   const vendor = data.vendor_name || "Unknown Vendor";
//   const amount = data.total_amount
//     ? `${data.currency || "$"}${data.total_amount}`
//     : "N/A";
//   const date = data.invoice_date || "N/A";
//   const confidence = data.translation_confidence || 0;
//   const lineItems = data.line_items || [];

//   const downloadJSON = () => {
//     const dataStr =
//       "data:text/json;charset=utf-8," +
//       encodeURIComponent(JSON.stringify(invoice, null, 2));
//     const downloadAnchorNode = document.createElement("a");
//     downloadAnchorNode.setAttribute("href", dataStr);
//     downloadAnchorNode.setAttribute(
//       "download",
//       `${invoice.invoice_id}_data.json`
//     );
//     document.body.appendChild(downloadAnchorNode);
//     downloadAnchorNode.click();
//     downloadAnchorNode.remove();
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         exit={{ opacity: 0, scale: 0.95 }}
//         className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
//       >
//         {/* Header */}
//         <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
//           <div>
//             <h3 className="text-xl font-bold text-slate-800">
//               Invoice Inspector
//             </h3>
//             <p className="text-sm text-slate-500 font-mono">
//               {invoice.invoice_id}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-slate-200 rounded-full transition-colors"
//           >
//             <X size={20} className="text-slate-500" />
//           </button>
//         </div>

//         {/* Tabs */}
//         <div className="flex border-b border-slate-100 px-6">
//           <button
//             onClick={() => setViewMode("details")}
//             className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
//               viewMode === "details"
//                 ? "border-blue-500 text-blue-600"
//                 : "border-transparent text-slate-500 hover:text-slate-700"
//             }`}
//           >
//             Visual Summary
//           </button>
//           <button
//             onClick={() => setViewMode("json")}
//             className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
//               viewMode === "json"
//                 ? "border-blue-500 text-blue-600"
//                 : "border-transparent text-slate-500 hover:text-slate-700"
//             }`}
//           >
//             Raw JSON Data
//           </button>
//         </div>

//         {/* Scrollable Content */}
//         <div className="p-8 overflow-y-auto flex-1">
//           {viewMode === "details" ? (
//             <div className="space-y-6">
//               {/* Summary Section */}
//               <div
//                 className={`p-5 rounded-xl border ${
//                   invoice.status === "PASS"
//                     ? "bg-emerald-50 border-emerald-100"
//                     : "bg-amber-50 border-amber-100"
//                 }`}
//               >
//                 <div className="flex items-center gap-2 mb-2">
//                   <Bot
//                     size={18}
//                     className={
//                       invoice.status === "PASS"
//                         ? "text-emerald-600"
//                         : "text-amber-600"
//                     }
//                   />
//                   <label className="text-xs font-bold uppercase tracking-wider opacity-70">
//                     AI Analysis Summary
//                   </label>
//                 </div>
//                 <p className="text-slate-700 text-sm leading-relaxed">
//                   {invoice.human_readable_summary}
//                 </p>
//               </div>

//               {/* Key Fields Grid */}
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
//                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//                     Vendor
//                   </label>
//                   <p className="text-sm font-bold text-slate-800 truncate">
//                     {vendor}
//                   </p>
//                 </div>
//                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
//                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//                     Amount
//                   </label>
//                   <p className="text-sm font-bold text-slate-800">{amount}</p>
//                 </div>
//                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
//                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//                     Date
//                   </label>
//                   <p className="text-sm font-bold text-slate-800">{date}</p>
//                 </div>
//                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
//                   <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//                     Confidence
//                   </label>
//                   <div className="flex items-center gap-2 mt-1">
//                     <span
//                       className={`text-sm font-bold ${
//                         confidence > 0.8 ? "text-emerald-600" : "text-amber-600"
//                       }`}
//                     >
//                       {(confidence * 100).toFixed(0)}%
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Line Items Table (New Feature) */}
//               {lineItems.length > 0 && (
//                 <div className="border rounded-xl overflow-hidden">
//                   <table className="w-full text-sm text-left">
//                     <thead className="bg-slate-50 text-slate-500 font-medium">
//                       <tr>
//                         <th className="p-3">Description</th>
//                         <th className="p-3 text-right">Qty</th>
//                         <th className="p-3 text-right">Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {lineItems.map((item, idx) => (
//                         <tr key={idx} className="border-t border-slate-100">
//                           <td className="p-3 text-slate-700">
//                             {item.description}
//                           </td>
//                           <td className="p-3 text-right text-slate-600">
//                             {item.qty}
//                           </td>
//                           <td className="p-3 text-right font-medium">
//                             {item.total}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="relative">
//               <pre className="bg-slate-900 text-emerald-400 p-6 rounded-xl overflow-x-auto text-xs font-mono shadow-inner">
//                 {JSON.stringify(invoice, null, 2)}
//               </pre>
//             </div>
//           )}
//         </div>

//         {/* Footer Actions */}
//         <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-slate-600 font-medium hover:bg-white rounded-lg"
//           >
//             Close
//           </button>
//           <button
//             onClick={downloadJSON}
//             className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
//           >
//             Download JSON
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };
const InvoiceModal = ({ invoice, onClose }) => {
  const [viewMode, setViewMode] = useState("details");

  if (!invoice) return null;

  // SAFE DATA ACCESS
  const data = invoice.audit_trail?.invoice_data || {};
  const vendor = data.vendor_name || "Unknown Vendor";
  const amount = data.total_amount
    ? `${data.currency || "$"}${data.total_amount}`
    : "N/A";
  const date = data.invoice_date || "N/A";
  const confidence = data.translation_confidence || 0;
  const lineItems = data.line_items || [];

  // Backend provides: "html_report_path": "INV-1001.html"
  const API_BASE_URL = "http://localhost:8000"; // Matches your uvicorn port

  const reportPath = invoice.html_report_path
    ? `${API_BASE_URL}/api/download/${invoice.html_report_path}`
    : "#";

  const downloadJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(invoice, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `${invoice.invoice_id}_data.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Invoice Inspector
            </h3>
            <p className="text-sm text-slate-500 font-mono">
              {invoice.invoice_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6">
          <button
            onClick={() => setViewMode("details")}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              viewMode === "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Visual Summary
          </button>
          <button
            onClick={() => setViewMode("json")}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              viewMode === "json"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Raw JSON Data
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto flex-1">
          {viewMode === "details" ? (
            <div className="space-y-6">
              {/* Summary Section */}
              <div
                className={`p-5 rounded-xl border ${
                  invoice.status === "PASS"
                    ? "bg-emerald-50 border-emerald-100"
                    : "bg-amber-50 border-amber-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Bot
                    size={18}
                    className={
                      invoice.status === "PASS"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  />
                  <label className="text-xs font-bold uppercase tracking-wider opacity-70">
                    AI Analysis Summary
                  </label>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {invoice.human_readable_summary}
                </p>
              </div>

              {/* Key Fields Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Vendor
                  </label>
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {vendor}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Amount
                  </label>
                  <p className="text-sm font-bold text-slate-800">{amount}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Date
                  </label>
                  <p className="text-sm font-bold text-slate-800">{date}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Confidence
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-sm font-bold ${
                        confidence > 0.8 ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {(confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              {lineItems.length > 0 && (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100">
                          <td className="p-3 text-slate-700">
                            {item.description}
                          </td>
                          <td className="p-3 text-right text-slate-600">
                            {item.qty}
                          </td>
                          <td className="p-3 text-right font-medium">
                            {item.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <pre className="bg-slate-900 text-emerald-400 p-6 rounded-xl overflow-x-auto text-xs font-mono shadow-inner">
                {JSON.stringify(invoice, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-white rounded-lg transition-colors"
          >
            Close
          </button>

          <button
            onClick={downloadJSON}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
          >
            <FileText size={16} /> JSON
          </button>

          {/* RE-ADDED DOWNLOAD BUTTON */}
          <a
            href={reportPath}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Download size={16} /> Download Report
          </a>
        </div>
      </motion.div>
    </div>
  );
};
// --- 3. MAIN APPLICATION ---

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null); // For Modal
  const [notification, setNotification] = useState(null); // For Toasts

  // --- DATA FETCHING ---
  const refreshData = async () => {
    try {
      const data = await invoiceService.getReports();
      setReports(data);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // --- COMPUTED LISTS ---
  const manualQueue = reports.filter((r) =>
    ["FAIL", "REJECTED", "Manual Review"].includes(r.status)
  );
  const processedQueue = reports.filter((r) =>
    ["PASS", "SUCCESS", "Approved", "Rejected"].includes(r.status)
  );

  const total = reports.length;
  const approvalRate =
    total > 0
      ? Math.round(
          (processedQueue.filter(
            (r) => r.status === "Approved" || r.status === "PASS"
          ).length /
            total) *
            100
        )
      : 0;

  // --- ANIMATIONS ---
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 },
  };
  const pageTransition = { type: "tween", ease: "anticipate", duration: 0.3 };

  return (
    <div className="flex h-screen bg-[#F9F9FB] font-sans text-slate-800 overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <Toast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <InvoiceModal
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
          />
        )}
      </AnimatePresence>

      {/* 1. Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "upload" && "Processing Studio"}
              {activeTab === "audit" && "Audit Vault"}
              {activeTab === "chat" && "AI Insights"}
            </h2>
            <p className="text-slate-500 mt-1 font-medium">
              Welcome back, Auditor.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
              <span className="text-sm font-bold text-slate-700">
                System Online
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <AnimatePresence mode="wait">
          {/* === DASHBOARD VIEW === */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Processed"
                  value={total}
                  subtext="All time"
                  icon={Activity}
                  color="blue"
                />
                <StatCard
                  title="Approval Rate"
                  value={`${approvalRate}%`}
                  subtext="Automated"
                  icon={CheckCircle}
                  color="green"
                />
                <StatCard
                  title="Action Required"
                  value={manualQueue.length}
                  subtext="Pending Review"
                  icon={AlertTriangle}
                  color="red"
                />
                <StatCard
                  title="Avg. Time"
                  value="1.2s"
                  subtext="Per invoice"
                  icon={Clock}
                  color="purple"
                />
              </div>

              {/* Recent Activity Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Recent Activity</h3>
                  <button
                    onClick={() => setActiveTab("audit")}
                    className="text-sm text-blue-600 font-medium hover:underline"
                  >
                    View All
                  </button>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="p-4 pl-6">Invoice ID</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Summary</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.slice(0, 5).map((r) => (
                      <tr
                        key={r.invoice_id}
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4 pl-6 font-bold text-slate-700">
                          {r.invoice_id}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              ["Approved", "PASS", "SUCCESS"].includes(r.status)
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : ["Manual Review"].includes(r.status)
                                ? "bg-amber-100 text-amber-700 border border-amber-200"
                                : "bg-rose-100 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 truncate max-w-xs">
                          {r.human_readable_summary}
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedInvoice(r)}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* === UPLOAD VIEW === */}
          {activeTab === "upload" && (
            <UploadComponent
              setLoading={setLoading}
              refreshData={refreshData}
              showNotification={showNotification}
            />
          )}

          {/* === AUDIT VIEW === */}
          {activeTab === "audit" && (
            <AuditVault
              manualQueue={manualQueue}
              processedQueue={processedQueue}
              refreshData={refreshData}
              showNotification={showNotification}
              setSelectedInvoice={setSelectedInvoice}
            />
          )}

          {/* === CHAT VIEW === */}
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="max-w-4xl mx-auto h-[calc(100vh-12rem)]"
            >
              <ChatWidget />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const UploadComponent = ({ setLoading, refreshData, showNotification }) => {
  const [status, setStatus] = useState("idle");

  const handleUpload = async (e) => {
    if (!e.target.files[0]) return;
    setStatus("processing");
    try {
      await invoiceService.uploadInvoice(e.target.files[0]);
      setStatus("success");
      refreshData();
      showNotification("Invoice uploaded successfully", "success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      showNotification("Upload failed", "error");
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mt-10"
    >
      <div
        className={`
        border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 relative overflow-hidden
        ${
          status === "processing"
            ? "border-blue-400 bg-blue-50"
            : "border-slate-300 hover:border-blue-400 hover:bg-white bg-white/50"
        }
      `}
      >
        {status === "processing" ? (
          <div className="flex flex-col items-center relative z-10">
            <Loader2 size={56} className="text-blue-500 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Agents Working...
            </h3>
            <div className="flex gap-4 text-sm font-medium text-slate-500 mt-2">
              <span className="animate-pulse delay-75">OCR</span> •
              <span className="animate-pulse delay-150">Translation</span> •
              <span className="animate-pulse delay-300">Validation</span>
            </div>
          </div>
        ) : status === "success" ? (
          <div className="flex flex-col items-center relative z-10">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-700 mb-2">
              Success!
            </h3>
            <p className="text-slate-500">
              Invoice processed and added to Vault.
            </p>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <UploadCloud size={32} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Upload Invoice
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Drag & drop your invoice PDF or image here, or click to browse
              files.
            </p>
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={handleUpload}
              accept=".pdf,.jpg,.png"
            />
            <label
              htmlFor="fileInput"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl cursor-pointer hover:bg-blue-700 transition-colors font-bold shadow-lg shadow-blue-600/20 inline-flex items-center gap-2"
            >
              <FileText size={18} /> Select File
            </label>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AuditVault = ({
  manualQueue,
  processedQueue,
  refreshData,
  showNotification,
  setSelectedInvoice,
}) => {
  const [subTab, setSubTab] = useState("review");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAction = async (id, action) => {
    // Note: ensure mockInvoiceService is imported or available in scope
    await invoiceService.submitAction(id, action);
    showNotification(
      `Invoice ${id} ${action === "APPROVE" ? "Approved" : "Rejected"}`,
      action === "APPROVE" ? "success" : "error"
    );
    refreshData();
  };

  const currentList = subTab === "review" ? manualQueue : processedQueue;
  const filteredList = currentList.filter(
    (item) =>
      item.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.human_readable_summary
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Sub Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setSubTab("review")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              subTab === "review"
                ? "bg-amber-100 text-amber-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            ⚠️ Review Queue ({manualQueue.length})
          </button>
          <button
            onClick={() => setSubTab("archive")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              subTab === "archive"
                ? "bg-slate-100 text-slate-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            🗄️ Archive ({processedQueue.length})
          </button>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search ID or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm w-full md:w-64"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredList.map((item) => {
          // --- FIX START: Extract nested data safely ---
          const data = item.audit_trail?.invoice_data || {};
          const displayAmount = data.total_amount
            ? `${data.currency || "$"}${data.total_amount}`
            : "N/A";
          const displayVendor = data.vendor_name || "Unknown Vendor";
          const displayDate =
            data.invoice_date || item.timestamp?.split("T")[0] || "N/A";
          // --- FIX END ---

          return (
            <div
              key={item.invoice_id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-slate-800">
                      {item.invoice_id}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        ["Approved", "PASS"].includes(item.status)
                          ? "bg-emerald-100 text-emerald-700"
                          : ["Manual Review"].includes(item.status)
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-slate-400 text-xs">
                      {" "}
                      • {displayDate}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100 inline-block">
                    {item.human_readable_summary}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <div className="text-slate-500">
                      Amount:{" "}
                      <span className="font-semibold text-slate-800">
                        {/* Use the extracted displayAmount */}
                        {displayAmount}
                      </span>
                    </div>
                    <div className="text-slate-500">
                      Vendor:{" "}
                      <span className="font-semibold text-slate-800">
                        {/* Use the extracted displayVendor */}
                        {displayVendor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end md:self-start">
                  <button
                    onClick={() => setSelectedInvoice(item)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye size={20} />
                  </button>
                  {subTab === "review" && (
                    <div className="flex gap-2 pl-3 border-l border-slate-100">
                      <button
                        onClick={() => handleAction(item.invoice_id, "APPROVE")}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(item.invoice_id, "REJECT")}
                        className="bg-white border border-slate-200 text-rose-600 px-4 py-2 rounded-lg hover:bg-rose-50 hover:border-rose-200 text-sm font-bold transition-colors active:scale-95"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filteredList.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-bold text-lg">
              No invoices found
            </h3>
            <p className="text-slate-500">
              Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default App;
