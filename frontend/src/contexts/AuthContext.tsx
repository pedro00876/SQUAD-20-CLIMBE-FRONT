import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/features/auth/types';
import { routes } from '@/config/routes';
import { api } from '@/services/api';

const USER_KEY = '@App:user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPending: boolean;
  login: (userData?: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const normalizeUser = (rawUser: any): User | null => {
    if (!rawUser) return null;
    return {
      ...rawUser,
      name: rawUser.name ?? rawUser.fullName ?? '',
      fullName: rawUser.fullName ?? rawUser.name ?? '',
      status: rawUser.status?.toUpperCase?.() ?? rawUser.status,
    };
  };

  useEffect(() => {
    const recoverSession = async () => {
      try {
        const userData = await api.get('/api/auth/me').then(res => res.data);
        const normalizedUser = normalizeUser(userData);
        setUser(normalizedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
      } catch (error) {
        // Se falhar (401), limpa o localStorage
        localStorage.removeItem(USER_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    const storedUser = localStorage.getItem(USER_KEY);
    
    // Evita loop se já tentamos e falhou recentemente nesta carga de página
    if (window.location.search.includes('error')) {
      setIsLoading(false);
      return;
    }

    if (storedUser) {
      setUser(normalizeUser(JSON.parse(storedUser)));
      setIsLoading(false);
      recoverSession();
    } else {
      recoverSession();
    }
  }, []);

  const login = async (userData?: any) => {
    setIsLoading(true);
    try {
      const resolvedUser = userData?.id ? normalizeUser(userData) : normalizeUser(await api.get('/api/auth/me').then(res => res.data));
      localStorage.setItem(USER_KEY, JSON.stringify(resolvedUser));
      setUser(resolvedUser);
      const currentStatus = resolvedUser?.status?.toUpperCase();
      if (currentStatus === 'PENDING' || currentStatus === 'PENDENTE') {
        navigate(routes.pendingApproval);
      } else {
        navigate(routes.dashboard);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout details', error);
    } finally {
      localStorage.removeItem(USER_KEY);
      setUser(null);
      navigate(routes.login);
    }
  };

  const currentStatus = user?.status?.toUpperCase();
  const isPending = currentStatus === 'PENDING' || currentStatus === 'PENDENTE';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isPending, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => useContext(AuthContext);
