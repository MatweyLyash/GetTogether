export function getCookie(name: string): string | null {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        console.log(`[Cookie] Получено значение куки ${name}: ${cookieValue ? 'успешно' : 'null'}`);
        return cookieValue || null;
      }
    }
    console.log(`[Cookie] Кука ${name} не найдена в`, document.cookie);
    return null;
  } catch (error) {
    console.error(`[Cookie] Ошибка при получении куки ${name}:`, error);
    return null;
  }
}

export function getAllCookies(): Record<string, string> {
  try {
    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = value;
      }
    });
    console.log('[Cookie] Все куки:', cookies);
    return cookies;
  } catch (error) {
    console.error('[Cookie] Ошибка при получении всех кук:', error);
    return {};
  }
  }