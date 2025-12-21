import axios from "axios";
import type { Alternative, AnalysisResponse, Criterion } from "../types/api";
// -------------------------------------------------------------------

// GANTI IP INI DENGAN IP LAPTOP KAMU JIKA RUN DI HP FISIK
// JIKA DI EMULATOR ANDROID (Android Studio), GUNAKAN "http://10.0.2.2:8000/api/v1"
// JIKA DI IOS SIMULATOR, GUNAKAN "http://localhost:8000/api/v1"
const BASE_URL = "http://10.0.2.2:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const apiService = {
  checkHealth: async () => {
    try {
      const res = await api.get("/health");
      return res.data;
    } catch (error) {
      console.error("Server mati:", error);
      return null;
    }
  },

  getCriteria: async () => {
    const res = await api.get<Criterion[]>("/criteria");
    return res.data;
  },

  getAlternatives: async () => {
    const res = await api.get<Alternative[]>("/alternatives");
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
};

export default api;
