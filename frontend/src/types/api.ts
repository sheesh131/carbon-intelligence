/**
 * API Type Definitions
 * Types for all backend API requests and responses
 */

// ============== Constants ==============
export const RiskLevel = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  VERY_HIGH: "very_high",
} as const;

export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const PredictionStatus = {
  SUCCESS: "success",
  ERROR: "error",
  PENDING: "pending",
  RATE_LIMITED: "rate_limited",
} as const;

export type PredictionStatus = (typeof PredictionStatus)[keyof typeof PredictionStatus];

// ============== Request Types ==============
export interface CreditApplication {
  age: number; // 18-100
  income: number; // >= 0
  employment_length: number; // 0-50 years
  debt_to_income_ratio: number; // 0-1
  credit_score: number; // 300-850
  loan_amount: number; // >= 1000
  loan_purpose: string; // debt_consolidation, home_improvement, etc.
  home_ownership: string; // own, rent, mortgage, other
  verification_status: string; // verified, source_verified, not_verified
  gender?: string; // Optional for fairness monitoring
  race?: string; // Optional for fairness monitoring
}

export interface PredictionRequest {
  application: CreditApplication;
  include_explanation?: boolean; // default: true
  explanation_type?: string; // default: "shap"
  track_sustainability?: boolean; // default: true
}

export interface BatchPredictionRequest {
  applications: CreditApplication[]; // max 100
  include_explanation?: boolean; // default: false
  explanation_type?: string; // default: "shap"
  track_sustainability?: boolean; // default: true
}

export const SustainabilityDataset = {
  BANK: "bank",
  GERMAN: "german",
} as const;

export type SustainabilityDataset =
  (typeof SustainabilityDataset)[keyof typeof SustainabilityDataset];

export interface SustainabilityRunRequest {
  dataset: SustainabilityDataset;
  preview_only?: boolean;
}

export interface SustainabilityRunResponse {
  dataset: SustainabilityDataset | string;
  status: string;
  message: string;
  total_candidates: number;
  summary: {
    total_candidates: number;
    baseline?: {
      precision?: string;
      exit_level?: number;
      carbon_cost?: number;
      metrics?: {
        auc?: number;
        ks?: number;
        brier?: number;
      };
    } | null;
    optimized?: {
      precision?: string;
      exit_level?: number;
      carbon_cost?: number;
      metrics?: {
        auc?: number;
        ks?: number;
        brier?: number;
      };
    } | null;
    carbon_reduction_pct: number;
    performance_retention_pct: number;
    efficiency_gain_pct: number;
  };
  best_candidate?: {
    precision?: string;
    exit_level?: number;
    carbon_cost?: number;
    metrics?: {
      auc?: number;
      ks?: number;
      brier?: number;
    };
  } | null;
}

export interface FederatedRunRequest {
  preview_only?: boolean;
  number_of_clients?: number;
  local_epochs?: number;
  batch_size?: number;
  learning_rate?: number;
  aggregation_rounds?: number;
  validation_split?: number;
  input_size?: number;
  hidden_size?: number;
  random_seed?: number;
  enable_early_stopping?: boolean;
  early_stopping_patience?: number;
  early_stopping_min_delta?: number;
}

export interface FederatedRunResponse {
  status: string;
  message: string;
  config: {
    number_of_clients: number;
    local_epochs: number;
    batch_size: number;
    learning_rate: number;
    aggregation_rounds: number;
    validation_split: number;
    input_size: number;
    hidden_size: number;
    random_seed: number;
    enable_early_stopping: boolean;
    early_stopping_patience: number;
    early_stopping_min_delta: number;
    best_model_path: string;
  };
  round_metrics: Array<{
    round_number: number;
    participating_clients: number;
    average_client_loss: number;
    average_client_accuracy: number;
    average_val_loss: number;
    average_val_accuracy: number;
  }>;
  global_keys: string[];
  best_round: number;
  best_val_loss: number;
  stopped_early: boolean;
  best_model_path: string;
}

export interface SustainabilityMetrics {
  experiment_id?: string;
  duration_seconds?: number;
  timestamp?: string;
  energy_kwh?: number;
  carbon_emissions?: number;
  total_energy_kwh?: number;
  total_emissions_kg?: number;
}

// ============== Response Types ==============
export interface PredictionResponse {
  prediction_id: string;
  risk_score: number; // 0-1
  risk_level: RiskLevel | string;
  confidence: number; // 0-1
  model_version: string;
  prediction_timestamp: string; // ISO datetime
  processing_time_ms: number;
  explanation?: {
    prediction?: number;
    risk_level?: string;
    feature_importance?: Record<string, number>;
    summary?: string;
    top_factors?: Array<{
      feature?: string;
      label?: string;
      name?: string;
      value?: string | number | boolean | null;
      impact?: string | number;
      contribution?: number;
      description?: string;
    }>;
  };
  sustainability_metrics?: SustainabilityMetrics;
  status: PredictionStatus | string;
  message: string;
}

export interface BatchPredictionResponse {
  batch_id: string;
  predictions: PredictionResponse[];
  batch_summary: {
    total_applications: number;
    successful_predictions: number;
    failed_predictions: number;
    average_risk_score: number;
    risk_distribution: {
      low: number;
      medium: number;
      high: number;
      very_high: number;
    };
  };
  processing_time_ms: number;
  sustainability_metrics?: SustainabilityMetrics;
}

// ============== System Endpoints ==============
export interface HealthResponse {
  status: "ok";
  data: {
    service_status: string;
    service: string;
    model_loaded?: boolean;
  };
}

export interface StatusResponse {
  status: "ok";
  data: {
    service_status: string;
    version: string;
    features: string[];
  };
}

export interface ModelInfoResponse {
  model_version: string;
  model_type: string;
  features_supported: string[];
  explanation_types: string[];
  sustainability_tracking: boolean;
}

// ============== API Error Response ==============
export interface ApiErrorResponse {
  status: "error";
  error: string;
}

// ============== Auth Responses ==============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export type RegisterResponse = LoginResponse;
