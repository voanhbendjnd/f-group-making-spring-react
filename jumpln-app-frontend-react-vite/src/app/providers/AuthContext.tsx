import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '@/features/auth/api/authApi';
import type { LoginRequest } from '@/features/auth/types';
import { storage, type StoredUser } from '@/utils/storage';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StoredUser | null>(() => storage.getUser());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { info, error } = useToast();

  const handleUnauthorized = useCallback(
    (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      setUser(null);
      storage.clearAll();
      info(customEvent.detail?.message || 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
    },
    [info]
  );

  useEffect(() => {
    window.addEventListener('app:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('app:unauthorized', handleUnauthorized);
    };
  }, [handleUnauthorized]);

  const login = async (request: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(request);
      storage.setToken(response.accessToken);
      const storedUser: StoredUser = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        authorities: Array.from(response.user.authorities || []),
      };
      storage.setUser(storedUser);
      setUser(storedUser);
    } catch (err: any) {
      error(err.message || 'Đăng nhập không thành công.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    storage.clearAll();
    setUser(null);
    info('Bạn đã đăng xuất an toàn khỏi hệ thống.');
  }, [info]);

  const authorities = user?.authorities || [];
  const isAdmin = authorities.includes('ROLE_ADMIN');
  const isStudent = authorities.includes('ROLE_STUDENT');
  const isAuthenticated = !!user && !!storage.getToken();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isStudent,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
