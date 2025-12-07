import React from "react";
import { Eye, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function InvoiceList() {
  // Mock Data for UI Testing
  const invoices = [
    {
      id: "INV-1001",
      vendor: "Global Logistics",
      date: "2025-03-14",
      amount: "$1,617.00",
      status: "Approved",
    },
    {
      id: "INV-1005",
      vendor: "SwiftMove Couriers",
      date: "2025-05-25",
      amount: "$255.75",
      status: "Rejected",
    },
    {
      id: "INV-1006",
      vendor: "Acme Corp",
      date: "2025-06-01",
      amount: "$5,000.00",
      status: "Review",
    },
  ];

  const statusStyles = {
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-100 text-rose-700 border-rose-200",
    Review: "bg-amber-100 text-amber-700 border-amber-200",
  };

  const StatusIcon = {
    Approved: CheckCircle,
    Rejected: XCircle,
    Review: AlertCircle,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="p-4 font-semibold text-slate-600">Invoice ID</th>
            <th className="p-4 font-semibold text-slate-600">Vendor</th>
            <th className="p-4 font-semibold text-slate-600">Date</th>
            <th className="p-4 font-semibold text-slate-600">Amount</th>
            <th className="p-4 font-semibold text-slate-600">Status</th>
            <th className="p-4 font-semibold text-slate-600 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map((inv) => {
            const Icon = StatusIcon[inv.status];
            return (
              <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-brand-primary">{inv.id}</td>
                <td className="p-4 text-slate-600">{inv.vendor}</td>
                <td className="p-4 text-slate-500">{inv.date}</td>
                <td className="p-4 font-semibold text-slate-700">
                  {inv.amount}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      statusStyles[inv.status]
                    }`}
                  >
                    <Icon size={12} />
                    {inv.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-brand-accent hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Download size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
