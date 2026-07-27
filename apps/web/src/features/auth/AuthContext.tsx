import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser } from '@techhub/shared-types';
import { tokenStorage } from '@/lib/tokenStorage';
import { meRequest, logoutRequest } from './api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: AuthUser, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    meRequest()
      .then(setUser)
      .catch(() => tokenStorage.clear())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback((nextUser: AuthUser, tokens: { accessToken: string; refreshToken: string }) => {
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    tokenStorage.clear();
    setUser(null);
    if (refreshToken) {
      await logoutRequest(refreshToken).catch(() => undefined);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: Boolean(user), login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
