import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/features/auth/types';
import { routes } from '@/config/routes';

const USER_KEY = '@App:user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    const placeholderUser: User = {
      id: 'unknown',
      name: 'Usuário',
      email: '',
      role: 'USER'
    };

    localStorage.setItem(USER_KEY, JSON.stringify(placeholderUser));
    setUser(placeholderUser);
    navigate(routes.dashboard);
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    // Nota: O backend deve invalidar o cookie na rota de logout
    navigate(routes.login);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => useContext(AuthContext);
