const { connectDb } = require('../config/mongo.config');
const validator = require('validator');
const constants = require('../utils/constants');
const moment = require('moment');

const validateUtils = 
{
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

        name = name.trim();

        if(!name.match(constants.NAME_REGEX)) {
            return false;
        }

        return true;
    },

    validateDateOfBirth: (date) => {
        if (!date) {
            return false;
        }

        // Kiểm tra định dạng ngày
        if (!moment(date, 'DD/MM/YYYY', true).isValid()) {
            return false;
        }

        // So sánh với thời gian hiện tại
        const birthDate = moment(date, 'DD/MM/YYYY');
        const currentDate = moment();

        if (birthDate > currentDate) {
            return false;
        }

        return true;
    },

    validateUrl: (url) => {
        if (!url) {
            return false;
        }

        return validator.isURL(url, {
            // cho phép các tên miền không có top-level domain (VD: localhost)
            require_tld: false 
        });
    },

    isEmailExists: async (email) => {

        const { db, client } = await connectDb();
        const usersCollection = db.collection(constants.USERS);

        const user = await usersCollection.findOne(
            { email: email }
        );

        if (user) {
            return true;
        }

        return false
    }
}

module.exports = validateUtils;
