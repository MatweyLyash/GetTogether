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
    const {title, description, date, location, category_id, price, capacity} = event;
    
    if (!validatePresence(title) || 
        !validatePresence(description) || 
        !validatePresence(date) || 
        !validatePresence(location) || 
        !validatePresence(category_id) || 
        !validatePresence(price) || 
        !validatePresence(capacity)) {
        return false;
    }
    
    if (!validateText(title) || 
        !validateStringLength(description, 1, 1000) || 
        !validateText(location)) {
        return false;
    }
    
    if(isNaN(Date.parse(date))) {
        return false;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || 
        priceNum < 0 || 
        priceNum > 99999999.99 || 
        (priceNum.toString().includes('.') && priceNum.toString().split('.')[1].length > 2)) {
        return false;
    }

    if (!validateNumberRange(Number(category_id), 1, Number.MAX_SAFE_INTEGER) ||
        !validateNumberRange(Number(capacity), 1, Number.MAX_SAFE_INTEGER)) {
        return false;
    }
    
    return true;
}

module.exports = {
    validateId,
    validateEvent
}