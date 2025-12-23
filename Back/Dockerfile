# Бэкенд
FROM node:18-alpine

WORKDIR /app

# Устанавливаем зависимости
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    postgresql-client

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm ci

# Копируем исходный код
COPY . .

# Устанавливаем sequelize-cli глобально (для миграций)
RUN npm install -g sequelize-cli

# Создаем не-root пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Меняем владельца файлов
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

# Запускаем миграции и сервер
CMD ["sh", "-c", "npm run migrate && node server.js"]