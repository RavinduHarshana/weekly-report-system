import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(Boolean(token));

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      if (!token) {
        setUser(null);
        setBootstrapping(false);
        return;
      }

      try {
        setBootstrapping(true);
        const response = await api.me();
        if (!isMounted) return;
        setUser(response.user);
      } catch {
        if (!isMounted) return;
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
      } finally {
        if (isMounted) setBootstrapping(false);
      }
    }

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const persistSession = (authResponse) => {
    localStorage.setItem('token', authResponse.token);
    setToken(authResponse.token);
    setUser(authResponse.user || null);
  };

  const login = async (payload) => {
    const response = await api.login(payload);
    persistSession(response);
    return response;
  };

  const register = async (payload) => {
    const response = await api.register(payload);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      bootstrapping,
      isAuthenticated: Boolean(token && user),
      isManager: user?.role === 'Manager',
      login,
      register,
      logout,
      refreshSession: async () => {
        if (!token) return null;
        const response = await api.me();
        setUser(response.user);
        return response.user;
      },
    }),
    [bootstrapping, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}