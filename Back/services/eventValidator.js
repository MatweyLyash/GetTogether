const {
    validateNumberRange,
    validatePresence,
    validateText,
    validateStringLength
} = require('./baseValidators');

const validateId = (id) => {
    return validateNumberRange(parseInt(id), 1, Number.MAX_SAFE_INTEGER);
}

const validateEvent = (event) => {
    const { title, description, date, location, category_id, price, capacity } = event;
    const errors = [];

    if (!validatePresence(title)) errors.push('Название обязательно');
    if (!validatePresence(description)) errors.push('Описание обязательно');
    if (!validatePresence(date)) errors.push('Дата обязательна');
    if (!validatePresence(location)) errors.push('Место проведения обязательно');
    if (!validatePresence(category_id)) errors.push('Категория обязательна');
    if (!validatePresence(price)) errors.push('Цена обязательна');
    if (!validatePresence(capacity)) errors.push('Вместимость обязательна');

    if (errors.length > 0) return { valid: false, errors };

    if (!validateText(title)) errors.push('Название должно быть от 1 до 255 символов');
    if (!validateStringLength(description, 1, 1000)) errors.push('Описание должно быть от 1 до 1000 символов');
    if (!validateText(location)) errors.push('Место проведения должно быть от 1 до 255 символов');

    if (isNaN(Date.parse(date))) {
        errors.push('Неверный формат даты');
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
        errors.push('Цена должна быть положительным числом');
    } else if (priceNum > 99999999.99) {
        errors.push('Цена слишком велика');
    } else if (priceNum.toString().includes('.') && priceNum.toString().split('.')[1].length > 2) {
        errors.push('Цена не может иметь более двух знаков после запятой');
    }

    if (!validateNumberRange(Number(category_id), 1, Number.MAX_SAFE_INTEGER)) {
        errors.push('Некорректный ID категории');
    }
    if (!validateNumberRange(Number(capacity), 1, Number.MAX_SAFE_INTEGER)) {
        errors.push('Вместимость должна быть положительным числом');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

module.exports = {
    validateId,
    validateEvent
}