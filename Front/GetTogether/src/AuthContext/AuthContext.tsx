import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import {  login, logout, getMe } from '../api/api';

interface User {
  id: string;
  login: string;
  role_id: number;
  telegram: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  loginUser: (loginData: { login: string; password: string }) => Promise<void>;
  logoutUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isCheckingAuth = useRef(false); // Защита от повторных вызовов

  console.log('AuthProvider инициализирован');

  useEffect(() => {
    const checkAuth = async () => {
      // Предотвращаем повторный вызов (StrictMode)
      if (isCheckingAuth.current) return;
      isCheckingAuth.current = true;

      console.log('AuthProvider: Начало проверки авторизации');
      const timeout = setTimeout(() => {
        console.error('AuthProvider: Тайм-аут проверки авторизации');
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
      }, 5000);
      try {
        console.log('AuthProvider: Вызов getMe');
        const userData = await getMe();
        console.log('AuthProvider: Получены данные пользователя:', userData);
        if (userData && userData.id) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.warn('AuthProvider: Данные пользователя не получены');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error: any) {
        console.error('AuthProvider: Ошибка при проверке:', error);
        if (error.response?.status === 401) {
          console.log('AuthProvider: Ошибка 401 - пользователь не авторизован');
        } else {
          console.error('AuthProvider: Другая ошибка:', error.message);
        }
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        clearTimeout(timeout);
        console.log('AuthProvider: Завершение проверки, isLoading = false');
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Функция для входа в систему
  const loginUser = async (loginData: { login: string; password: string }) => {
    console.log('Вход в систему...');
    setIsLoading(true);
    
    try {
      const response = await login(loginData);
      console.log('Ответ при входе:', response);
      
      if (response && response.user) {
        console.log('Пользователь успешно авторизован:', response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        console.error('Данные пользователя не получены при входе');
        throw new Error('Ошибка авторизации: данные пользователя не получены');
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для выхода из системы
  const logoutUser = async () => {
    console.log('Выход из системы...');
    setIsLoading(true);
    
    try {
      await logout();
      console.log('Выход успешен, сброс данных пользователя');
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error('Ошибка выхода:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        setIsAuthenticated, 
        user, 
        setUser, 
        loginUser, 
        logoutUser,
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}