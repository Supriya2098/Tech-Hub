const ACCESS_TOKEN_KEY = 'techhub.accessToken';
const REFRESH_TOKEN_KEY = 'techhub.refreshToken';

/**
 * Tokens are kept in localStorage so a page refresh doesn't log the user out.
 * A production hardening step would move the refresh token into an httpOnly
 * cookie set by the API; kept simple here since the API is a separate origin
 * in some deployment modes and cookie/CORS setup is out of scope for this build.
 */
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
