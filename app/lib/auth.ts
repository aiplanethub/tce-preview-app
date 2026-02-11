import axios from "axios";

export function redirectToLogin() {
  const params = new URLSearchParams();
  params.set("client", "TCE-TEST-APP");
  params.set("redirectUri", `${window.location.origin}/auth/callback`);
  window.location.href = `${import.meta.env.VITE_LOGIN_BASE_URL}/#/login/?${params.toString()}`;
}

export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("refreshToken");
  redirectToLogin();
}

export async function validateToken(): Promise<TokenValidateResponse> {
  const token = sessionStorage.getItem("token");
  const response = await axios.get<TokenValidateResponse>(
    `${import.meta.env.VITE_API_URL}/v1/api/user/oauth/token/validate`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = sessionStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post<TokenRefreshResponse>(
    `${import.meta.env.VITE_API_URL}/v1/api/user/oauth/token/refresh`,
    { refresh_token: refreshToken },
  );

  sessionStorage.setItem("token", response.data.access_token);
  return response.data.access_token;
}

/**
 * Validates the stored access token on app load.
 * If invalid, attempts a refresh. If refresh fails, redirects to login.
 * Returns the validated user info on success.
 */
export async function ensureAuthenticated(): Promise<TokenValidateResponse> {
  const token = sessionStorage.getItem("token");
  if (!token) {
    redirectToLogin();
    // Return a never-resolving promise since we're navigating away
    return new Promise(() => {});
  }

  try {
    return await validateToken();
  } catch {
    // Token invalid — try refreshing
    try {
      await refreshAccessToken();
      return await validateToken();
    } catch {
      logout();
      return new Promise(() => {});
    }
  }
}
