import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { invoiceService } from "../services/api"; // Import the API

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I have access to all processed invoice data. Ask me anything.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userQ = input;
    setInput(""); // Clear input immediately

    // 1. Add User Message
    const newMsg = { role: "user", content: userQ };
    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      // 2. Prepare History for Context
      const history = messages.map((m) => `${m.role}: ${m.content}`);

      // 3. CALL THE REAL BACKEND
      const response = await invoiceService.chat(userQ, history);

      // 4. Format the AI Response
      let replyText = response.answer;

      // Add Confidence/Safety Badge
      if (response.is_safe) {
        const conf = Math.round((response.score?.score || 0) * 100);
        replyText += `\n\n*(🛡️ Verified | Confidence: ${conf}%)*`;
      } else {
        replyText = `⚠️ I cannot answer this safely.\nReason: ${
          response.score?.reason || "Unknown Policy Violation"
        }`;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyText },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Error connecting to RAG Agent. Is the backend running?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-brand-primary p-4 flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg">
          <Sparkles className="text-brand-accent" size={20} />
        </div>
        <div>
          <h3 className="text-white font-medium">Auditor Intelligence</h3>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />{" "}
            Online
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`
              w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${
                msg.role === "assistant"
                  ? "bg-brand-primary text-white"
                  : "bg-slate-200 text-slate-600"
              }
            `}
            >
              {msg.role === "assistant" ? (
                <Bot size={16} />
              ) : (
                <User size={16} />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`
              max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${
                msg.role === "user"
                  ? "bg-brand-accent text-white rounded-tr-none"
                  : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none"
              }
            `}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {/* Loading State */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 flex items-center gap-2 text-slate-400 text-xs">
              <Loader2 size={14} className="animate-spin" /> Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about invoice discrepancies..."
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-brand-accent text-white rounded-lg hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
