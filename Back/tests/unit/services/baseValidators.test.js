const baseValidators = require('../../../services/baseValidators');

describe('BaseValidators', () => {
    describe('validatePresence()', () => {
        it('should return true for present values', () => {
            expect(baseValidators.validatePresence('hello')).toBe(true);
            expect(baseValidators.validatePresence(123)).toBe(true);
            expect(baseValidators.validatePresence(0)).toBe(true);
        });

        it('should return false for missing values', () => {
            expect(baseValidators.validatePresence(null)).toBe(false);
            expect(baseValidators.validatePresence(undefined)).toBe(false);
            expect(baseValidators.validatePresence('')).toBe(false);
        });
    });

    describe('validateRating()', () => {
        it('should return true for valid ratings 1-5', () => {
            expect(baseValidators.validateRating(1)).toBe(true);
            expect(baseValidators.validateRating(3)).toBe(true);
            expect(baseValidators.validateRating(5)).toBe(true);
        });

        it('should return false for invalid ratings', () => {
            expect(baseValidators.validateRating(0)).toBe(false);
            expect(baseValidators.validateRating(6)).toBe(false);
            expect(baseValidators.validateRating('abc')).toBe(false);
            expect(baseValidators.validateRating(null)).toBe(false);
        });
    });

    describe('validateText()', () => {
        it('should return true for valid text lengths', () => {
            expect(baseValidators.validateText('A')).toBe(true);
            expect(baseValidators.validateText('A'.repeat(255))).toBe(true);
        });

        it('should return false for empty or too long text', () => {
            expect(baseValidators.validateText('')).toBe(false);
            expect(baseValidators.validateText('A'.repeat(256))).toBe(false);
            expect(baseValidators.validateText(null)).toBe(false);
        });
    });
});
