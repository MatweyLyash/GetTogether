const QRCode = require('qrcode');

class QRCodeService {
    /**
     * Генерирует QR-код с данными о регистрации на мероприятие
     * @param {Object} registrationData - Данные о регистрации
     * @param {string} registrationData.registrationId - ID регистрации
     * @param {string} registrationData.eventId - ID мероприятия
     * @param {string} registrationData.userId - ID пользователя
     * @param {string} registrationData.eventTitle - Название мероприятия
     * @param {string} registrationData.userLogin - Логин пользователя
     * @param {string} registrationData.eventDate - Дата мероприятия
     * @returns {Promise<string>} - QR-код в формате base64 Data URL
     */
    async generateRegistrationQRCode(registrationData) {
        const { registrationId, eventId, userId, eventTitle, userLogin, eventDate } = registrationData;
        
        // Формируем данные для QR-кода
        const qrData = JSON.stringify({
            type: 'event_registration',
            registrationId,
            eventId,
            userId,
            eventTitle,
            userLogin,
            eventDate,
            generatedAt: new Date().toISOString(),
        });

        try {
            // Генерируем QR-код как Data URL (base64)
            const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
                errorCorrectionLevel: 'M',
                type: 'image/png',
                width: 300,
                margin: 2,
                color: {
                    dark: '#2E4FD7', // Цвет QR-кода (синий как в дизайне)
                    light: '#FFFFFF' // Фон
                }
            });
            
            return qrCodeDataUrl;
        } catch (error) {
            throw new Error(`Ошибка генерации QR-кода: ${error.message}`);
        }
    }

    /**
     * Генерирует QR-код как буфер PNG
     * @param {Object} registrationData - Данные о регистрации
     * @returns {Promise<Buffer>} - QR-код как PNG буфер
     */
    async generateRegistrationQRCodeBuffer(registrationData) {
        const { registrationId, eventId, userId, eventTitle, userLogin, eventDate } = registrationData;
        
        const qrData = JSON.stringify({
            type: 'event_registration',
            registrationId,
            eventId,
            userId,
            eventTitle,
            userLogin,
            eventDate,
            generatedAt: new Date().toISOString(),
        });

        try {
            const qrCodeBuffer = await QRCode.toBuffer(qrData, {
                errorCorrectionLevel: 'M',
                type: 'png',
                width: 300,
                margin: 2,
                color: {
                    dark: '#2E4FD7',
                    light: '#FFFFFF'
                }
            });
            
            return qrCodeBuffer;
        } catch (error) {
            throw new Error(`Ошибка генерации QR-кода: ${error.message}`);
        }
    }

    /**
     * Верифицирует данные QR-кода (проверяет структуру)
     * @param {string} qrData - JSON строка из QR-кода
     * @returns {Object|null} - Распарсенные данные или null если невалидны
     */
    parseQRCodeData(qrData) {
        try {
            const data = JSON.parse(qrData);
            
            if (data.type !== 'event_registration') {
                return null;
            }
            
            if (!data.registrationId || !data.eventId || !data.userId) {
                return null;
            }
            
            return data;
        } catch (error) {
            return null;
        }
    }
}

module.exports = new QRCodeService();
