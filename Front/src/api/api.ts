import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { EventResponse } from '../types/event';

// Базовый URL API задаётся через VITE_API_URL, по умолчанию — текущий хост:5000/api
// const API_BASE = import.meta.env.VITE_API_URL || '/api';
const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Настройка Axios
const authApi = axios.create({
  baseURL: `${API_BASE}/auth`,
  withCredentials: true,
});

const userApi = axios.create({
  baseURL: `${API_BASE}/user`,
  withCredentials: true,
});

const organizerApi = axios.create({
  baseURL: `${API_BASE}/organizer`,
  withCredentials: true,
});

const guestApi = axios.create({
  baseURL: `${API_BASE}/guest`,
  withCredentials: true,
});

const adminApi = axios.create({
  baseURL: `${API_BASE}/admin`,
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
  price: string;
  capacity: number;
  telegram_chat_link: string | null;
  creator_id?: string;
  created_at?: string;
  updated_at?: string;
  deletedAt?: string | null;
  organizer_verification_key?: string | null;
  telegram_chat_id?: string | null;
  image?: any;
  reviews?: Review[];
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
}

interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status_id: number;
  telegram_invite_link?: string;
  createdAt?: string;
  updatedAt?: string;
  Event: Event;
}

interface Review {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewUser: {
    id: string;
    login: string;
  };
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
  user: {
    login: string;
    telegram: string | null;
  };
}

interface OrganizerRequest {
  id: string;
  user_id: string;
  status_id: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    login: string;
    telegram: string | null;
  };
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
          console.log('Interceptor: Попытка обновления токена');
          await authApi.post<RefreshTokenResponse>('/refresh-token');
          console.log('Interceptor: Токен обновлен');
          processQueue(null);
          return instance(originalRequest);
        } catch (refreshError) {
          console.error('Interceptor: Ошибка обновления токена', refreshError);
          processQueue(refreshError);
          return Promise.reject(error);
        } finally {
          console.log('Interceptor: Завершение обработки');
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
setupInterceptors(guestApi);
setupInterceptors(adminApi);

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
    const response = await userApi.get<User>('/me');
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
    const response = await guestApi.get<Category[]>('/categories');
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
    const response = await guestApi.get<Event[]>('/events');
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
    const response = await guestApi.get<Event>(`/event/${event_id}`);
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

export async function cancelEventRegistration(event_id: string): Promise<EventRegistration> {
  try {
    const response = await userApi.put<EventRegistration>(`/events/registration/${event_id}/cancel`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при отзыве заявки на мероприятие');
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
    throw new Error('Неизвестная ошибка');
  }
}

export interface RegistrationResponse {
  id: string;
  status: number;
  telegram_invite_link: string | null;
}

export async function registerForEvent(event_id: string): Promise<RegistrationResponse> {
  try {
    const response = await userApi.post<RegistrationResponse>('/events/registration', { event_id });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при регистрации на мероприятие');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export interface VerificationResponse {
  valid: boolean;
  user: string;
  event: string;
  date: string;
  status: string;
}

export async function verifyRegistration(qrData: string): Promise<VerificationResponse> {
  try {
    const response = await organizerApi.post<VerificationResponse>('/verify-registration', { qrData });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при проверке QR-кода');
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
    const response = await guestApi.get<EventResponse>(`/event/${event_id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении мероприятия');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function getEventByIdWithReg(event_id: string): Promise<EventResponse> {
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

export interface QRCodeResponse {
  message: string;
  qrCode: string;
  registration: {
    id: string;
    eventTitle: string;
    eventDate: string;
    eventLocation: string;
    status: string;
  };
}

export async function getRegistrationQRCode(registration_id: string): Promise<QRCodeResponse> {
  try {
    const response = await userApi.get<QRCodeResponse>(`/events/registration/${registration_id}/qrcode`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении QR-кода');
    }
    throw new Error('Неизвестная ошибка');
  }
}

// Organizer Routes
export async function createEvent(formData: FormData): Promise<{ event: Event; message: string }> {
  try {
    const response = await organizerApi.post<{ event: Event; message: string }>('/event', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

export async function updateEvent(event_id: string, formData: FormData): Promise<{ event: Event; message: string }> {
  try {
    const response = await organizerApi.put<{ event: Event; message: string }>(`/event/${event_id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

// Admin Routes
export async function addCategory(data: { category_name: string }): Promise<Category> {
  try {
    const response = await adminApi.post<Category>('/categories', data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при добавлении категории');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function renameCategory(categoryId: number, data: { category_name: string }): Promise<Category> {
  try {
    const response = await adminApi.put<Category>(`/categories/${categoryId}`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при переименовании категории');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function deleteCategory(categoryId: number): Promise<void> {
  try {
    await adminApi.delete(`/categories/${categoryId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при удалении категории');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const response = await adminApi.get<User[]>('/users');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении пользователей');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function banUser(userId: string, isBanned: boolean): Promise<User> {
  try {
    const response = await adminApi.put<User>(`/users/${userId}/ban`, { isBan: isBanned });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при обновлении статуса бана');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function getOrganizerRequests(): Promise<OrganizerRequest[]> {
  try {
    const response = await adminApi.get<OrganizerRequest[]>('/organizers/request');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении запросов организаторов');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function organizerResponse(requestId: string, statusId: number): Promise<OrganizerRequest> {
  try {
    const response = await adminApi.put<OrganizerRequest>(`/organizer/request/${requestId}`, { status_id: statusId });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при обработке запроса организатора');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function unassignOrganizer(userId: string): Promise<User> {
  try {
    const response = await adminApi.put<User>(`/organizer/unassign/${userId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при снятии роли организатора');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function updateEventByAdmin(eventId: string, data: FormData): Promise<Event> {
  try {
    const response = await adminApi.put<Event>(`/event/${eventId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при обновлении мероприятия');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function deleteEventByAdmin(eventId: string): Promise<void> {
  try {
    await adminApi.delete(`/event/${eventId}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при удалении мероприятия');
    }
    throw new Error('Неизвестная ошибка');
  }
}

// Achievements Admin
export interface Achievement {
  id: number;
  name: string;
  description: string | null;
  score: number;
  trigger: 'apply' | 'attend' | 'category';
  condition_event_id?: number | null;
  condition_category_id?: number | null;
  condition_payload?: any;
  image?: any;
}

export interface AchievementPayload {
  name: string;
  description?: string;
  score: number;
  trigger: 'apply' | 'attend' | 'category';
  condition_event_id?: number | null;
  condition_category_id?: number | null;
  condition_payload?: any;
  image?: string | null; // base64
}

export async function adminListAchievements(): Promise<Achievement[]> {
  try {
    const response = await adminApi.get<Achievement[]>('/achievements');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении ачивок');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function adminCreateAchievement(payload: AchievementPayload): Promise<Achievement> {
  try {
    const response = await adminApi.post<Achievement>('/achievements', payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при создании ачивки');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function adminUpdateAchievement(id: number, payload: AchievementPayload): Promise<Achievement> {
  try {
    const response = await adminApi.put<Achievement>(`/achievements/${id}`, payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при обновлении ачивки');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function adminDeleteAchievement(id: number): Promise<void> {
  try {
    await adminApi.delete(`/achievements/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при удалении ачивки');
    }
    throw new Error('Неизвестная ошибка');
  }
}

// Achievements for user
export interface AchievementProgress extends Achievement {
  progress: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
}

export async function getMyAchievements(): Promise<AchievementProgress[]> {
  try {
    const response = await userApi.get<AchievementProgress[]>('/achievements');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении ачивок');
    }
    throw new Error('Неизвестная ошибка');
  }
}

// Subscription API
export interface EventSubscription {
  id: number;
  user_id: number;
  subscription_type: 'organizer' | 'category';
  target_id: number;
  notification_method: 'telegram' | 'browser';
  createdAt: string;
  updatedAt: string;
}

export async function createSubscription(
  subscription_type: 'organizer' | 'category',
  target_id: number,
  notification_method: 'telegram' | 'browser'
): Promise<EventSubscription> {
  try {
    const response = await userApi.post<EventSubscription>('/subscriptions', {
      subscription_type,
      target_id,
      notification_method,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Ошибка авторизации. Пожалуйста, перезайдите в систему.');
      }


      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Ошибка при создании подписки');
    }
    throw new Error('Неизвестная ошибка');
  }
}

// Tags
export interface Tag {

  id: number;
  name: string;
}

export async function getTags(): Promise<Tag[]> {
  try { // Change to guestApi if public, or userApi
    const response = await userApi.get<Tag[]>('/tags');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Fallback for admin if needed, but userApi should work for all logged in
      throw new Error(error.response?.data?.error || 'Ошибка при получении тегов');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function createTag(name: string): Promise<Tag> {
  try {
    const response = await adminApi.post<Tag>('/tags', { name });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при создании тега');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function updateTag(id: number, name: string): Promise<Tag> {
  try {
    const response = await adminApi.put<Tag>(`/tags/${id}`, { name });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при обновлении тега');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function deleteTag(id: number): Promise<void> {
  try {
    await adminApi.delete(`/tags/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при удалении тега');
    }
    throw new Error('Неизвестная ошибка');
  }
}


export async function getSubscriptions(): Promise<EventSubscription[]> {
  try {
    const response = await userApi.get<EventSubscription[]>('/subscriptions');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении подписок');
    }
    throw new Error('Неизвестная ошибка');
  }
}

export async function deleteSubscription(subscription_id: number): Promise<void> {
  try {
    await userApi.delete(`/subscriptions/${subscription_id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при удалении подписки');
    }
    throw new Error('Неизвестная ошибка');
  }
}

// Web Push API
export async function getVapidPublicKey(): Promise<string> {
  try {
    const response = await userApi.get<{ publicKey: string }>('/push/vapid-public-key');
    return response.data.publicKey;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || 'Ошибка при получении VAPID ключа');
    }
    throw new Error('Неизвестная ошибка');
  }
}