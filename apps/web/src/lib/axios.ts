import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  const tokens = response.data.data.tokens as { accessToken: string; refreshToken: string };
  tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
  return tokens.accessToken;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const isAuthRoute = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        tokenStorage.clear();
        window.location.assign('/login');
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: { message?: string } } | undefined;
    if (data?.error?.message) return data.error.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}
