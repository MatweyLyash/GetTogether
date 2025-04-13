
/**
 * @param {string} value
 * @param {number} minLength 
 * @param {number} maxLength 
 * @returns {boolean} 
 */
function validateStringLength(value, minLength, maxLength) {
    if (typeof value !== 'string') return false;
    return value.length >= minLength && value.length <= maxLength;
}

/**
 * @param {number} value 
 * @param {number} min 
 * @param {number} max 
 * @returns {boolean} 
 */
function validateNumberRange(value, min, max) {
    if (typeof value !== 'number') return false;
    return value >= min && value <= max;
}

/**
 * @param {*} value 
 * @returns {boolean} 
 */
function validatePresence(value) {
    return value !== null && value !== undefined && value !== '';
}

/**
 * @param {string} value
 * @returns {boolean} 
 */
function validateLogin(value) {
    return validateStringLength(value, 1, 50);
}

/**
 * @param {string} value
 * @returns {boolean} 
 */
function validateText(value) {
    return validateStringLength(value, 1, 255);
}

/**
 * @param {number} value 
 * @returns {boolean} 
 */
function validateRating(value) {
    return validateNumberRange(value, 1, 5);
}

module.exports = {
    validateNumberRange,
    validatePresence,
    validateLogin,
    validateText,
    validateRating,
};