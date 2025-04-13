const { 
    validateNumberRange, 
    validatePresence, 
    validateText, 
} = require('./baseValidators');

const valideteReview = (review) => {
    const { user_id, event_id, rating, comment } = review;

    if (!validatePresence(user_id) || 
        !validatePresence(event_id) || 
        !validatePresence(rating)) {
        return false;
    }

    if (!validateNumberRange(Number(user_id), 1, Number.MAX_SAFE_INTEGER) ||
        !validateNumberRange(Number(event_id), 1, Number.MAX_SAFE_INTEGER) ||
        !validateRating(Number(rating))) {
        return false;
    }

    if (comment && !validateText(comment)) {
        return false;
    }

    return true;
}