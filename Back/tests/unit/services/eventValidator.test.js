const { validateEvent, validateId } = require('../../../services/eventValidator');

describe('EventValidator', () => {
    describe('validateId()', () => {
        it('should validate positive integer IDs', () => {
            expect(validateId(1)).toBe(true);
            expect(validateId('123')).toBe(true);
        });

        it('should return false for invalid IDs', () => {
            expect(validateId(0)).toBe(false);
            expect(validateId(-1)).toBe(false);
            expect(validateId('abc')).toBe(false);
        });
    });

    describe('validateEvent()', () => {
        const validEvent = {
            title: 'Test Event',
            description: 'This is a test event description.',
            date: '2025-12-31',
            location: 'Test Location',
            category_id: 1,
            price: 100,
            capacity: 50
        };

        it('should return valid true for correct event data', () => {
            const result = validateEvent(validEvent);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should return errors for missing required fields', () => {
            const result = validateEvent({ title: 'Missing others' });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Описание обязательно');
            expect(result.errors).toContain('Дата обязательна');
        });

        it('should validate price format', () => {
            const result = validateEvent({ ...validEvent, price: 100.123 });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Цена не может иметь более двух знаков после запятой');
        });

        it('should validate capacity is positive', () => {
            const result = validateEvent({ ...validEvent, capacity: 0 });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Вместимость должна быть положительным числом');
        });

        it('should validate date format', () => {
            const result = validateEvent({ ...validEvent, date: 'invalid-date' });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Неверный формат даты');
        });
    });
});
