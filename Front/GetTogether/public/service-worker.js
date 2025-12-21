// Service Worker для обработки Push уведомлений

self.addEventListener('push', function (event) {
    console.log('Push received:', event);

    const data = event.data ? event.data.json() : {};
    const title = data.title || 'GetTogether';
    const options = {
        body: data.body || 'У вас новое уведомление',
        icon: data.icon || '/logo.png',
        badge: data.badge || '/badge.png',
        data: data.data || {}
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    console.log('Notification clicked:', event);
    event.notification.close();

    // Открываем URL из data
    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.openWindow(urlToOpen)
    );
});
