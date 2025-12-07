import axios from "axios";

// Point to your FastAPI Gateway (Port 8000)
const API_BASE = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export const invoiceService = {
  // 1. Upload & Process
  uploadInvoice: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // Uploads usually take time, so we increase timeout
    const response = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000, // 60 seconds timeout for long agent chains
    });
    return response.data;
  },

  // 2. Get Dashboard Data
  getReports: async () => {
    const response = await api.get("/reports");
    return response.data;
  },

  // 3. RAG Chat
  chat: async (question, history) => {
    const response = await api.post("/chat", { question, history });
    return response.data;
  },

  // 4. Human Approval/Rejection
  submitAction: async (invoiceId, action, notes = "") => {
    const response = await api.post("/action", {
      invoice_id: invoiceId,
      action: action,
      notes: notes,
    });
    return response.data;
  },

  getDownloadUrl: (filename) => {
    return `${API_BASE}/download/${filename}`;
  },

  // 5. Edit & Re-run
  rerunValidation: async (invoiceId, updatedData) => {
    const response = await api.post("/rerun", {
      invoice_id: invoiceId,
      updated_data: updatedData,
    });
    return response.data;
  },
};
