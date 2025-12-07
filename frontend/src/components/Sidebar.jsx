import React from "react";
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  Bot,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "upload", label: "Processing Studio", icon: UploadCloud },
    { id: "audit", label: "Audit Vault", icon: FileText },
    { id: "chat", label: "AI Insights", icon: Bot },
  ];

  return (
    <div className="h-screen w-64 bg-brand-primary text-white flex flex-col shadow-2xl fixed left-0 top-0 z-50">
      {/* Logo Area */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-accent to-blue-400 bg-clip-text text-transparent">
          Lumina
        </h1>
        <p className="text-xs text-gray-400 mt-1">Agentic Invoice Auditor</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-brand-accent text-white shadow-lg shadow-brand-accent/20 translate-x-1"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon
                size={20}
                className={clsx(
                  isActive
                    ? "text-white"
                    : "text-gray-500 group-hover:text-white"
                )}
              />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors w-full px-4 py-2">
          <Settings size={16} />
          <span>System Settings</span>
        </button>
      </div>
    </div>
  );
}
