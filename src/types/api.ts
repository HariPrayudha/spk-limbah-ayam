export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
}

export interface Criterion {
  id: number; // WAJIB ADA (Hapus tanda tanya ?)
  code: string;
  name: string;
  type: string; // string biasa agar support 'cost'/'benefit' variatif
  initial_weight?: number;
  description?: string;
}

export interface Alternative {
  id: number; // WAJIB ADA (Hapus tanda tanya ?)
  code: string;
  name: string;
  description?: string;
}

export interface RankingResult {
  rank: number;
  alternative_code: string;
  alternative_name: string;
  score: number;
}

export interface AnalysisResponse {
  weight_method: string;
  weights_used: Record<string, number>;
  final_ranking: RankingResult[];
  recommendation: string;
}
