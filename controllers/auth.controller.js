const jwtService = require("../jwt/jwt.service");
const { connectDb } = require('../config/mongo.config');
const { v4: uuidv4 } = require("uuid");
const validateUtils = require('../utils/validator');
const constants = require('../utils/constants');


const authController = {
    login: async (req, res) => {
        const loginData = req.body;

        let user;

        try {
            user = await validateLoginData(loginData);
        } catch (err) {
            return res.status(400).send(err.message);
        }

        // Get access token and refresh token
        const payload = { email: user.email };

        const access_token = jwtService.getAccessToken(payload);
        const refresh_token = await jwtService.getRefreshToken(payload);

        res.send({ access_token, refresh_token });
    },

    registry: async (req, res) => {

        const { db, client } = await connectDb();
        const usersCollection = db.collection(constants.USERS);
        const profilesCollection = db.collection(constants.PROFILES);

        const registryData = req.body;

        try {
            await validateRegistryData(registryData);

            // Add user account
            await usersCollection.insertOne(
                {
                    email: registryData.email,
                    password: registryData.password,
                }
            );

            // Add user profile
            await profilesCollection.insertOne(
                {
                    email: registryData.email,
                    full_name: registryData.full_name,
                    date_of_birth: registryData.date_of_birth,
                    gender: registryData.gender,
                }
            );
        } catch (err) {
            return res.status(400).send(err.message);
        }

        // Get access token and refresh token
        const payload = { email: registryData.email };

        const access_token = jwtService.getAccessToken(payload);
        const refresh_token = await jwtService.getRefreshToken(payload);

        res.send({ access_token, refresh_token });
    },

    refreshToken: async (req, res) => {
        const refreshToken = req.headers["refresh_token"];

        if (!refreshToken) {
            return res.status(403).send("Access is forbidden");
        }

        try {
            const access_token = await jwtService.refreshToken(refreshToken, res);
            res.send(access_token);
        } catch (err) {
            const message = (err && err.message) || err;
            res.status(403).send(message);
        }
    },

    validate: async (req, res) => {
        res.send(req.user);
    }
};

const validateLoginData = async (data) => {
    // Pre-validate data
    if (!data) {
        throw new Error("Please enter valid data!");
    }

    const validators = {
        email: validateUtils.validateEmail,
        password: validateUtils.validatePassword
    };

    for (let key in data) {
        if (validators[key]) {
            if (!data[key] || !validators[key](data[key])) {
                throw new Error(`Please enter valid ${key}!`);
            }
        }
    }

    const { db, client } = await connectDb();
    const usersCollection = db.collection(constants.USERS);

    const user = await usersCollection.findOne(
        { email: data.email }
    );

    if (!user) {
        throw new Error("Email or password is wrong!");
    }

    if (user && user.password !== data.password) {
        throw new Error("Email or password is wrong!");
    }

    return user;
}

const validateRegistryData = async (data) => {
    // Pre-validate data
    if (!data) {
        throw new Error("Please enter valid data!");
    }

    const validators = {
        email: validateUtils.validateEmail,
        password: validateUtils.validatePassword,
        full_name: validateUtils.validateFullName,
        date_of_birth: validateUtils.validateDateOfBirth,
    };

    for (let key in data) {
        if (validators[key]) {
            if (!data[key] || !validators[key](data[key])) {
                throw new Error(`Please enter valid ${key}!`);
            }
        }
    }

    if (await validateUtils.isEmailExists(data.email)) {
        throw new Error("Email already exists!");
    }
}


module.exports = authController;
