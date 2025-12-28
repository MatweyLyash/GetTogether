const qrCodeService = require('../../../services/qrCodeService');

describe('QRCodeService', () => {
    const mockData = {
        registrationId: 'reg-123',
        eventId: 'event-456',
        userId: 'user-789',
        eventTitle: 'Test Event',
        userLogin: 'testuser',
        eventDate: '2025-12-31'
    };

    describe('generateRegistrationQRCode()', () => {
        it('should generate a base64 data URL', async () => {
            const result = await qrCodeService.generateRegistrationQRCode(mockData);
            expect(result).toMatch(/^data:image\/png;base64,/);
        });

        it('should throw error on invalid data', async () => {
            // This test might fail if QRCode library handles null quietly, 
            // but let's see how our service handles it.
            // qrCodeService.js wraps QRCode.toDataURL in try-catch.
            await expect(qrCodeService.generateRegistrationQRCode(null))
                .rejects.toThrow();
        });
    });

    describe('generateRegistrationQRCodeBuffer()', () => {
        it('should generate a Buffer', async () => {
            const result = await qrCodeService.generateRegistrationQRCodeBuffer(mockData);
            expect(Buffer.isBuffer(result)).toBe(true);
        });
    });

    describe('parseQRCodeData()', () => {
        it('should correctly parse valid QR data', () => {
            const qrData = JSON.stringify({
                type: 'event_registration',
                registrationId: 'reg-123',
                eventId: 'event-456',
                userId: 'user-789'
            });
            const result = qrCodeService.parseQRCodeData(qrData);
            expect(result.registrationId).toBe('reg-123');
            expect(result.type).toBe('event_registration');
        });

        it('should return null for invalid JSON', () => {
            const result = qrCodeService.parseQRCodeData('invalid-json');
            expect(result).toBeNull();
        });

        it('should return null for missing required fields', () => {
            const qrData = JSON.stringify({
                type: 'event_registration',
                registrationId: 'reg-123'
                // missing eventId and userId
            });
            const result = qrCodeService.parseQRCodeData(qrData);
            expect(result).toBeNull();
        });

        it('should return null for wrong type', () => {
            const qrData = JSON.stringify({
                type: 'wrong_type',
                registrationId: 'reg-123',
                eventId: 'event-456',
                userId: 'user-789'
            });
            const result = qrCodeService.parseQRCodeData(qrData);
            expect(result).toBeNull();
        });
    });
});
