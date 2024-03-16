const validator = require('validator');

const validateUtils = {

    validateEmail: (email) => {
        if (!email) {
            return false;
        }

        return validator.isEmail(email);
    },

    validatePassword: (password) => {
        if (!password) {
            return false;
        }

        return validator.isStrongPassword(password);
    },

    // Kiểm tra họ tên theo đinh dạng: "Nguyễn Văn A"
    validateFullName: (name) => {
        if (!name) {
            return false;
        }

        if (name.trim().length === 0) {
            return false;
        }

        name = name.replace(/\s+/g, ' ');
        let nameParts = name.split(' ');

        for (let i = 0; i < nameParts.length; i++) {
            if (!validator.isAlpha(nameParts[i])) {
                return false;
            }
        }

        return true;
    },

    validateDateOfBirth: (date) => {
        if (!date) {
            return false;
        }

        if(!validator.isDate(date)) {
            return false;
        }

        // So sánh với thời gian hiện tại
        const birthDate = new Date(date);
        const currentDate = new Date();

        if (birthDate > currentDate) {
            return false;
        }

        return true;
    },

    validateUrl: (url) => {
        if (!url) {
            return false;
        }

        return validator.isURL(url);
    }
}

module.exports = validateUtils;
