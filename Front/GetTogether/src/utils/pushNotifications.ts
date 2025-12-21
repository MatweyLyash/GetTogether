import axios from 'axios';

// Базовый URL API задаётся через VITE_API_URL, по умолчанию — текущий хост:5000/api
const API_BASE = (
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000/api`
).replace(/\/$/, '');

const API_URL = `${API_BASE}/user`;

// Конвертация VAPID ключа из base64 в Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
        console.log('Service Workers не поддерживаются');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker зарегистрирован:', registration);
        return registration;
    } catch (error: any) {
        // Подавляем ошибки SSL сертификата в разработке
        if (error?.message?.includes('SSL certificate') || error?.message?.includes('certificate')) {
            console.warn('Service Worker не может быть зарегистрирован из-за проблемы с SSL сертификатом (это нормально для разработки с самоподписанным сертификатом). Push уведомления будут недоступны.');
        } else {
            console.warn('Не удалось зарегистрировать Service Worker:', error?.message || error);
        }
        return null;
    }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.log('Push уведомления не поддерживаются');
        return 'denied';
    }

    return await Notification.requestPermission();
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator)) {
        console.warn('Service Workers не поддерживаются');
        return null;
    }

    try {
        // Проверяем, зарегистрирован ли Service Worker, если нет - регистрируем
        let registration = await navigator.serviceWorker.getRegistration().catch(() => null);
        if (!registration) {
            registration = await registerServiceWorker();
            if (!registration) {
                // Если это ошибка SSL, выбрасываем специальную ошибку
                throw new Error('SSL_CERTIFICATE_ERROR: Service Worker не может быть зарегистрирован из-за SSL сертификата');
            }
        }

        // Берём готовую регистрацию
        registration = await navigator.serviceWorker.ready;

        // Получаем публичный VAPID ключ с сервера (используем withCredentials для отправки cookies)
        const response = await axios.get(`${API_URL}/push/vapid-public-key`, {
            withCredentials: true
        }).catch((error) => {
            if (error.response?.status === 401) {
                throw new Error('AUTHORIZATION_ERROR: Требуется авторизация');
            }
            throw error;
        });
        
        const vapidPublicKey = response.data.publicKey;

        if (!vapidPublicKey) {
            console.warn('VAPID ключ не получен с сервера');
            return null;
        }

        // Подписываемся на push
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource
        });

        // Отправляем subscription на сервер (используем withCredentials для отправки cookies)
        await axios.post(`${API_URL}/push/subscribe`, subscription, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        }).catch((error) => {
            if (error.response?.status === 401) {
                throw new Error('AUTHORIZATION_ERROR: Требуется авторизация');
            }
            throw error;
        });

        console.log('Push subscription успешно создана');
        return subscription;
    } catch (error: any) {
        // Если это ошибка SSL или авторизации, пробрасываем дальше с пометкой
        if (error?.message?.includes('SSL_CERTIFICATE_ERROR') || error?.message?.includes('SSL certificate')) {
            throw error; // Пробрасываем SSL ошибки
        }
        if (error?.message?.includes('AUTHORIZATION_ERROR')) {
            throw error; // Пробрасываем ошибки авторизации
        }
        console.warn('Ошибка подписки на push:', error?.message || error);
        return null;
    }
}

export async function unsubscribeFromPush(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
        return false;
    }

    try {
        let registration = await navigator.serviceWorker.getRegistration().catch(() => null);
        if (!registration) {
            return false;
        }

        // Берём готовую регистрацию
        registration = await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();

            // Удаляем subscription с сервера (используем withCredentials для отправки cookies)
            await axios.post(`${API_URL}/push/unsubscribe`,
                { endpoint: subscription.endpoint },
                { 
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            ).catch(() => {
                // Игнорируем ошибки при удалении на сервере
            });
        }

        console.log('Push subscription удалена');
        return true;
    } catch (error: any) {
        console.warn('Ошибка отписки от push:', error?.message || error);
        return false;
    }
}

export async function isPushSubscribed(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
        return false;
    }

    try {
        let registration = await navigator.serviceWorker.getRegistration().catch(() => null);
        if (!registration) {
            return false;
        }

        // Берём готовую регистрацию
        registration = await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.getSubscription();
        return subscription !== null;
    } catch (error) {
        return false;
    }
}
