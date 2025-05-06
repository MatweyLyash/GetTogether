import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { refreshToken, login, logout, getMe } from '../api/api';
import { getCookie, getAllCookies } from '../utils/cookies';

interface User {
  id: string;
  login: string;
  role_id: number;
  telegram: string | null;
}

interface JwtPayload {
  sub: string;
  login: string;
  role_id: number;
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

  console.log('AuthProvider инициализирован');

  // Проверка авторизации при загрузке страницы
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Проверка авторизации...');
      setIsLoading(true);
      
      try {
        console.log('Получение всех кук (доступных для JS):', getAllCookies());
        console.log('Запрос информации о пользователе с сервера...');
        
        // Поскольку tokens установлены как httpOnly, мы не можем их прочитать из JavaScript
        // Вместо этого отправляем запрос на сервер, который проверит токены и вернет данные пользователя
        try {
          // Сначала пробуем обновить токен
          await refreshToken();
          
          // Затем получаем информацию о пользователе
          const userData = await getMe();
          console.log('Получены данные пользователя:', userData);
          
          if (userData && userData.id) {
            setUser(userData);
            setIsAuthenticated(true);
            console.log('Пользователь авторизован:', userData);
          } else {
            console.warn('Данные пользователя не получены после обновления токена');
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          console.warn('Не удалось получить данные пользователя:', error);
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        console.log('Завершение проверки авторизации, isAuthenticated:', isAuthenticated, 'user:', user);
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
      {isLoading ? <div>Загрузка...</div> : children}
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