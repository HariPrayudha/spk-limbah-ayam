export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export interface Criterion {
  code: string;
  name: string;
  type: "Benefit" | "Cost";
  description?: string;
  weight?: number;
}

export interface Alternative {
  code: string;
  name: string;
  description?: string;
}

export type DecisionMatrix = Record<string, Record<string, number>>;

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

export interface AnalysisPayload {
  use_initial_weights: boolean;
  combine_weights: boolean;
  alpha: number;
}
