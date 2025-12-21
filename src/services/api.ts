import axios from "axios";
import type {
  Alternative,
  AnalysisResponse,
  ApiResponse,
  Criterion,
} from "../types/api";

// Sesuaikan IP Laptop/Emulator
const BASE_URL = "http://10.0.2.2:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor log error tetap berguna
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log("❌ API Error Status:", error.response.status);
      console.log(
        "❌ API Error Data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // ... checkHealth, getCriteria, getAlternatives TETAP SAMA ...
  checkHealth: async () => {
    try {
      const res = await api.get("/health");
      return res.data;
    } catch (error) {
      return null;
    }
  },

  getCriteria: async () => {
    const res = await api.get<ApiResponse<Criterion[]>>("/criteria");
    return res.data.data;
  },

  getAlternatives: async () => {
    const res = await api.get<ApiResponse<Alternative[]>>("/alternatives");
    return res.data.data;
  },

  resetMatrix: async () => {
    try {
      await api.delete("/decision-matrix");
      return true;
    } catch (e) {
      return false;
    }
  },

  // --- PERBAIKAN DI SINI (WRAPPER ENTRIES) ---
  submitMatrixBulk: async (entries: any[]) => {
    // Backend Schema: class BulkMatrixCreate(BaseModel): entries: List[...]
    const payload = { entries: entries };
    const res = await api.post("/decision-matrix/bulk", payload);
    return res.data;
  },

  runAnalysis: async (payload: { alpha: number } = { alpha: 0.5 }) => {
    const res = await api.post<AnalysisResponse>("/analysis/run", {
      use_initial_weights: false,
      combine_weights: false,
      alpha: payload.alpha,
    });
    return res.data;
  },

  runSensitivity: async () => {
    const payload = {
      weight_variations: [
        0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
      ],
    };

    const res = await api.post("/analysis/sensitivity", payload);
    return res.data;
  },
};

export default api;
