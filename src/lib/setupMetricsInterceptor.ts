/**
 * Axios Interceptor for Frontend API Metrics
 * Automatically tracks all API calls made through axios
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { frontendMetrics } from './metrics';

export function setupMetricsInterceptor(axiosInstance: AxiosInstance): void {
  // Request interceptor - start timing
  axiosInstance.interceptors.request.use(
    (config: AxiosRequestConfig & { __startTime?: number }) => {
      config.__startTime = performance.now();
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - record metrics
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse & { config: AxiosRequestConfig & { __startTime?: number } }) => {
      const startTime = response.config.__startTime || 0;
      const duration = performance.now() - startTime;

      frontendMetrics.recordApiCall(
        response.config.url || '',
        (response.config.method || 'GET').toUpperCase(),
        response.status,
        duration
      );

      return response;
    },
    (error) => {
      if (error.config?.__startTime) {
        const duration = performance.now() - error.config.__startTime;

        frontendMetrics.recordApiCall(
          error.config.url || '',
          (error.config.method || 'GET').toUpperCase(),
          error.response?.status || 0,
          duration
        );
      }

      return Promise.reject(error);
    }
  );
}

export default setupMetricsInterceptor;
