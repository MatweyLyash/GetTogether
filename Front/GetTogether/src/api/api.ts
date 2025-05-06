import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Event as EventCardEvent, EventResponse } from '../types/event';

// Настройка Axios
const authApi = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
  withCredentials: true,
});

const userApi = axios.create({
  baseURL: 'http://localhost:5000/api/user',
  withCredentials: true,
});

const organizerApi = axios.create({
  baseURL: 'http://localhost:5000/api/organizer',
  withCredentials: true,
});

// Интерфейсы
interface AuthData {
  login: string;
  password: string;
}

interface User {
  id: string;
  login: string;
  role_id: number;
  telegram: string | null;
}

interface AuthResponse {
  message: string;
  user: User;
}

interface RefreshTokenResponse {
    message: string;
  }

interface Category {
  id: number;
  category_name: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category_id: number;
  price: number;
  capacity: number;
  telegram_chat_link: string | null;
  creator_id?: string;
}

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status_id: number;
  event: Event;
}

interface Review {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface OrganizerRequest {
  id: string;
  user_id: string;
  status_id: number;
  created_at: string;
}

interface EventRequest {
  id: string;
  user_id: string;
  event_id: string;
  status_id: number;
}

// Интерцептор для обработки 401 и обновления токена
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

const setupInterceptors = (instance: typeof authApi) => {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => instance(originalRequest))
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await authApi.post<RefreshTokenResponse>('/refresh-token');
          processQueue(null);
          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

setupInterceptors(authApi);
setupInterceptors(userApi);
setupInterceptors(organizerApi);

// Auth
export async function login(data: AuthData): Promise<AuthResponse> {
  try {
    const response = await authApi.post<AuthResponse>('/login', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Ошибка при авторизации');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function getMe(): Promise<User> {
  try {
    const response = await organizerApi.get<User>('/me');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Ошибка при получении данных пользователя');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function register(data: AuthData): Promise<AuthResponse> {
  try {
    const response = await authApi.post<AuthResponse>('/register', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Ошибка при регистрации');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function logout(): Promise<void> {
  try {
    await authApi.post('/logout');
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Ошибка при выходе');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  try {
    const response = await authApi.post<RefreshTokenResponse>('/refresh-token');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Ошибка при обновлении токена');
    }
    throw new Error('Неизвестная ошибка');
  }
}

// User Routes
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await userApi.get<Category[]>('/categories');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении категорий');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function getEvents(): Promise<Event[]> {
  try {
    const response = await userApi.get<Event[]>('/events');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении мероприятий');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function getEvent(event_id: string): Promise<Event> {
  try {
    const response = await userApi.get<Event>(`/event/${event_id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении мероприятия');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function createEventRegistration(event_id: string): Promise<EventRegistration> {
  try {
    const response = await userApi.post<EventRegistration>('/events/registration', { event_id });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при регистрации на мероприятие');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function createReview(event_id: string, rating: number, comment: string): Promise<Review> {
  try {
    const response = await userApi.post<Review>('/reviews', { event_id, rating, comment });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при создании отзыва');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function getOwnEventsRegistration(): Promise<EventRegistration[]> {
  try {
    const response = await userApi.get<EventRegistration[]>('/events/registration');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении регистраций');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function createOrganizerRequest(): Promise<OrganizerRequest> {
  try {
    const response = await userApi.post<OrganizerRequest>('/organizer/request');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при создании запроса организатора');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function getOwnOrganizerRequests(): Promise<OrganizerRequest[]> {
  try {
    const response = await userApi.get<OrganizerRequest[]>('/organizer/request');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении запросов организатора');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function linkTelegram(telegram: string): Promise<{ message: string; telegram: string }> {
  try {
    const response = await userApi.post<{ message: string; telegram: string }>('/link-telegram', { telegram });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при привязке Telegram');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function getEventById(event_id: string): Promise<EventResponse> {
  try {
    const response = await userApi.get<EventResponse>(`/event/${event_id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении мероприятия');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function registerForEvent(event_id: string): Promise<{ status: number; telegram_invite_link: string | null }> {
  try {
    const response = await userApi.post<{ status: number; telegram_invite_link: string | null }>('/events/registration', { event_id });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при регистрации на мероприятие');
    }
    throw new Error('Неизвестная ошибка');
  }
}

// Organizer Routes
export async function createEvent(event: Omit<Event, 'id'>): Promise<Event> {
  try {
    const response = await organizerApi.post<Event>('/event', event);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при создании мероприятия');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function getOwnEvents(): Promise<Event[]> {
  try {
    const response = await organizerApi.get<Event[]>('/events');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении собственных мероприятий');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function getOwnEvent(event_id: string): Promise<Event> {
  try {
    const response = await organizerApi.get<Event>(`/event/${event_id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении мероприятия');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function updateEvent(event_id: string, event: Omit<Event, 'id'>): Promise<{ message: string }> {
  try {
    const response = await organizerApi.put<{ message: string }>(`/event/${event_id}`, { event_id, ...event });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при обновлении мероприятия');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function deleteEvent(event_id: string): Promise<void> {
  try {
    await organizerApi.delete(`/event/${event_id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при удалении мероприятия');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function responseToEventRequest(event_id: string, user_id: string, status_id: number): Promise<EventRequest> {
  try {
    const response = await organizerApi.put<EventRequest>(`/event/request/${event_id}`, { user_id, status_id });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при обработке заявки');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function getEventRequests(event_id: string): Promise<EventRequest[]> {
  try {
    const response = await organizerApi.get<EventRequest[]>(`/event/requests/${event_id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении заявок');
    }
    throw new Error('Неизвестная ошибка');
  }
}