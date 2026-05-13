/**
 * API Client for Velora Frontend
 * Provides a simple, axios-like interface for making HTTP requests
 */

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

interface ApiError extends Error {
  response?: ApiResponse;
  status?: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

/**
 * Fetch wrapper with error handling
 */
async function makeRequest<T = any>(
  method: string,
  url: string,
  data?: any,
  headers: Record<string, string> = {}
): Promise<ApiResponse<T>> {
  const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add auth token if available
  const token = localStorage.getItem("auth_token");
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, {
      method,
      headers: defaultHeaders,
      body: data ? JSON.stringify(data) : undefined,
    });

    const contentType = response.headers.get("content-type");
    let responseData: any;

    if (contentType?.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const error: ApiError = new Error(`HTTP Error: ${response.status}`);
      error.response = {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      };
      error.status = response.status;
      throw error;
    }

    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    if (error instanceof TypeError) {
      const networkError: ApiError = new Error("Network error: Failed to reach the server");
      throw networkError;
    }
    throw error;
  }
}

/**
 * API Client
 * Provides GET, POST, PUT, PATCH, DELETE methods
 */
const api = {
  get: <T = any>(url: string, headers?: Record<string, string>) =>
    makeRequest<T>("GET", url, undefined, headers),

  post: <T = any>(url: string, data?: any, headers?: Record<string, string>) =>
    makeRequest<T>("POST", url, data, headers),

  put: <T = any>(url: string, data?: any, headers?: Record<string, string>) =>
    makeRequest<T>("PUT", url, data, headers),

  patch: <T = any>(url: string, data?: any, headers?: Record<string, string>) =>
    makeRequest<T>("PATCH", url, data, headers),

  delete: <T = any>(url: string, headers?: Record<string, string>) =>
    makeRequest<T>("DELETE", url, undefined, headers),
};

export default api;
