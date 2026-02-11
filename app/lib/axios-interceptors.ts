import axios, { type InternalAxiosRequestConfig } from "axios";
import { refreshAccessToken, logout } from "~/lib/auth";

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  for (const { resolve, reject } of pendingQueue) {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  }
  pendingQueue = [];
}

// Skip interceptor for auth endpoints to avoid infinite loops
const AUTH_PATHS = ["/token/refresh", "/token/validate", "/oauth/token"];

function isAuthRequest(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_PATHS.some((path) => url.includes(path));
}

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthRequest(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axios(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return axios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
