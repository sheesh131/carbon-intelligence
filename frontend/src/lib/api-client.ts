/**
 * Centralized API Client
 * Axios instance with base configuration, interceptors, and utility methods
 */

import axios, { AxiosError } from "axios";
import type {
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import type {
  PredictionRequest,
  PredictionResponse,
  BatchPredictionRequest,
  BatchPredictionResponse,
  SustainabilityRunRequest,
  SustainabilityRunResponse,
  FederatedRunRequest,
  FederatedRunResponse,
  HealthResponse,
  StatusResponse,
  ModelInfoResponse,
  CreditApplication,
} from "@/types/api";

const humanizeFeatureName = (featureName: string): string =>
  featureName.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const normalizePredictionResponse = (
  response: PredictionResponse
): PredictionResponse => {
  if (!response.explanation?.top_factors) {
    return response;
  }

  return {
    ...response,
    explanation: {
      ...response.explanation,
      top_factors: response.explanation.top_factors.map((factor) => {
        const featureName =
          factor.feature ?? factor.name ?? factor.label ?? "unknown_factor";
        const contribution =
          typeof factor.contribution === "number"
            ? factor.contribution
            : typeof factor.impact === "number"
              ? factor.impact
              : 0;
        const displayLabel =
          factor.label ?? factor.name ?? factor.feature ?? humanizeFeatureName(featureName);
        const impact =
          factor.impact === "risk_increase" ||
          factor.impact === "risk_decrease" ||
          factor.impact === "neutral"
            ? factor.impact
            : contribution > 0
              ? "risk_increase"
              : contribution < 0
                ? "risk_decrease"
                : "neutral";
        const description =
          factor.description ??
          `${displayLabel} is ${
            impact === "risk_increase"
              ? "increasing"
              : impact === "risk_decrease"
                ? "reducing"
                : "having little effect on"
          } the predicted risk.`;

        return {
          ...factor,
          feature: factor.feature ?? featureName,
          label: displayLabel,
          name: factor.name ?? displayLabel,
          impact,
          contribution,
          description,
        };
      }),
    },
  };
};

type ApiErrorPayload = {
  error?: string;
};

// Get API base URL from environment or use localhost default
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export { API_BASE_URL };

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any auth headers if needed in the future
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      let errorMessage = "An error occurred";

      switch (status) {
        case 400:
          errorMessage = "Invalid request data";
          break;
        case 401:
          errorMessage = "Authentication required";
          break;
        case 403:
          errorMessage = "Access forbidden";
          break;
        case 404:
          errorMessage = "Resource not found";
          break;
        case 429:
          errorMessage = "Too many requests. Please try again later.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        case 503:
          errorMessage = "Service unavailable. Model may not be loaded.";
          break;
        default:
          errorMessage =
            (error.response.data as ApiErrorPayload | undefined)?.error ||
            `Error: ${status} ${error.response.statusText}`;
      }

      error.message = errorMessage;
    } else if (error.request) {
      // Request made but no response received
      error.message =
        "No response from server. Please check your connection.";
    } else {
      // Error in request setup
      error.message = "Error setting up request";
    }

    console.error("API Error:", error.message);
    return Promise.reject(error);
  }
);

// ============== API Methods ==============

/**
 * System Health & Status Endpoints
 */
export const systemAPI = {
  health: async (): Promise<HealthResponse> => {
    const response = await axiosInstance.get("/health");
    return response.data;
  },

  status: async (): Promise<StatusResponse> => {
    const response = await axiosInstance.get("/api/v1/status");
    return response.data;
  },

  ready: async (): Promise<HealthResponse> => {
    const response = await axiosInstance.get("/ready");
    return response.data;
  },
};

/**
 * Model Information
 */
export const modelAPI = {
  info: async (): Promise<ModelInfoResponse> => {
    const response = await axiosInstance.get("/model/info");
    return response.data;
  },
};

/**
 * Credit Risk Prediction Endpoints
 */
export const predictionAPI = {
  /**
   * Make a single credit risk prediction
   * @param request Prediction request with application data
   * @returns Prediction response with risk score and explanation
   */
  predict: async (request: PredictionRequest): Promise<PredictionResponse> => {
    const response = await axiosInstance.post("/predict", request);
    return normalizePredictionResponse(response.data);
  },

  /**
   * Make batch credit risk predictions (up to 100 applications)
   * @param request Batch prediction request
   * @returns Batch prediction response with summary statistics
   */
  predictBatch: async (
    request: BatchPredictionRequest
  ): Promise<BatchPredictionResponse> => {
    const response = await axiosInstance.post("/predict/batch", request);
    return {
      ...response.data,
      predictions: response.data.predictions.map(normalizePredictionResponse),
    };
  },
};

/**
 * Sustainability evaluation endpoints
 */
export const sustainabilityAPI = {
  run: async (
    request: SustainabilityRunRequest
  ): Promise<SustainabilityRunResponse> => {
    const response = await axiosInstance.post("/sustainability/run", request);
    return response.data;
  },
};

export const federatedAPI = {
  run: async (
    request: FederatedRunRequest = {}
  ): Promise<FederatedRunResponse> => {
    const response = await axiosInstance.post("/federated/run", request);
    return response.data;
  },
};

/**
 * Utility function to validate application data before submission
 */
export const validateApplicationData = (
  app: Partial<CreditApplication>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Basic validation
  if (!app.age || app.age < 18 || app.age > 100)
    errors.push("Age must be between 18 and 100");
  if (!app.income || app.income < 0) errors.push("Income must be positive");
  if (
    !app.employment_length ||
    app.employment_length < 0 ||
    app.employment_length > 50
  )
    errors.push("Employment length must be between 0 and 50 years");
  if (!app.debt_to_income_ratio || app.debt_to_income_ratio < 0)
    errors.push("Debt-to-income ratio must be non-negative");
  if (!app.credit_score || app.credit_score < 300 || app.credit_score > 850)
    errors.push("Credit score must be between 300 and 850");
  if (!app.loan_amount || app.loan_amount < 1000)
    errors.push("Loan amount must be at least 1000");
  if (!app.loan_purpose) errors.push("Loan purpose is required");
  if (!app.home_ownership) errors.push("Home ownership is required");
  if (!app.verification_status) errors.push("Verification status is required");

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Export the axios instance for advanced usage if needed
 */
export default axiosInstance;
