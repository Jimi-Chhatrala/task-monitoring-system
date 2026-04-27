import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';
import { AuthResponse, User } from '../types';

const AUTH_STORAGE_KEY = 'task-monitoring-auth';

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession() {
  if (typeof window === 'undefined') {
    return { accessToken: null, user: null };
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return { accessToken: null, user: null };
  }

  try {
    const parsed = JSON.parse(raw) as { accessToken: string; user: User };
    return {
      accessToken: parsed.accessToken || null,
      user: parsed.user || null,
    };
  } catch {
    return { accessToken: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      const stored = readStoredSession();

      if (!stored.accessToken) {
        setIsLoading(false);
        return;
      }

      setAccessToken(stored.accessToken);
      setUser(stored.user);

      try {
        const currentUser = await api.auth.me();
        persistSession(stored.accessToken, currentUser);
        setUser(currentUser);
      } catch {
        clearSession();
        setUser(null);
        setAccessToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    hydrate();
  }, []);

  const login = (payload: AuthResponse) => {
    persistSession(payload.accessToken, payload.user);
    setAccessToken(payload.accessToken);
    setUser(payload.user);
    setIsLoading(false);
  };

  const logout = () => {
    clearSession();
    setAccessToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.hash = '/auth';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: Boolean(accessToken && user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return value;
}

function persistSession(accessToken: string, user: User) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ accessToken, user }));
}

function clearSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
