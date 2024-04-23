const jwtService = require("../jwt/jwt.service");
const { connectDb } = require('../config/mongo.config');
const validateUtils = require('../utils/validator');
const constants = require('../utils/constants');
const { v4: uuidv4 } = require("uuid");
const otpService = require("../utils/otp.service")


const authController = {
    login: async (req, res) => {
        const loginData = req.body;

        let user;

        try {
            user = await validateLoginData(loginData);
        } catch (err) {
            return res.status(401).send(err.message);
        }

        // Get access token and refresh token
        const payload = { _id: user._id };

        const access_token = jwtService.getAccessToken(payload);
        const refresh_token = await jwtService.getRefreshToken(payload);

        res.send({ access_token, refresh_token });
    },

    registry: async (req, res) => {

        const { db, client } = await connectDb();
        const usersCollection = db.collection(constants.USERS);
        const profilesCollection = db.collection(constants.PROFILES);

        const registryData = req.body;

        const _id = uuidv4();

        try {
            await validateRegistryData(registryData);

            // Add user account
            await usersCollection.insertOne(
                {
                    _id: _id,
                    email: registryData.email,
                    password: registryData.password,
                }
            );

            // Add user profile
            await profilesCollection.insertOne(
                {
                    _id: _id,
                    email: registryData.email,
                    full_name: registryData.full_name,
                    date_of_birth: registryData.date_of_birth,
                    gender: registryData.gender,
                    bio: "",
                    hobbies: [],
                }
            );
        } catch (err) {
            return res.status(401).send(err.message);
        }

        // Get access token and refresh token
        const payload = { _id: _id };

        const access_token = jwtService.getAccessToken(payload);
        const refresh_token = await jwtService.getRefreshToken(payload);

        res.send({ access_token, refresh_token });
    },

    refreshToken: async (req, res) => {
        const refreshToken = req.headers["refresh_token"];
        if (!refreshToken) {
            return res.status(403).send("access-denied");
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
    },

    identifyEmail: async (req, res) => {
        const email = req.body.email;

        if (validateUtils.validateEmail(email) === false) {
            return res.status(401).send("invalid-data");
        }

        if (validateUtils.isEmailExists(email) === false) {
            console.log("fdsf");
            return res.status(401).send("email-not-exists");
        }
        
        return res.status(200).send("email-found");
    },

    forgotPassword: async(req, res) => {
        try {
            const forgotData = req.body;

            await validateForgotData(forgotData);

            if (await otpService.verifyOtp(forgotData.email, forgotData.otp)) {
                const { db, client } = await connectDb();
                const usersCollection = db.collection(constants.USERS);

                await usersCollection.updateOne(
                    { email: forgotData.email },
                    { $set: { password: forgotData.newPassword } }
                );

                return res.status(200).send("password-changed");
            }

            return res.status(200).send("otp-incorrect");
        } catch (err) {
            return res.status(401).send(err.message)
        }
    }
};

const validateLoginData = async (data) => {
    // Pre-validate data
    if (!data) {
        throw new Error("invalid-data");
    }

    const validators = {
        email: validateUtils.validateEmail,
        password: validateUtils.validatePassword
    };

    for (let key in data) {
        if (validators[key]) {
            if (!data[key] || !validators[key](data[key])) {
                throw new Error(`invalid-${key}!`);
            }
        }
    }

    const { db, client } = await connectDb();
    const usersCollection = db.collection(constants.USERS);

    const user = await usersCollection.findOne(
        { email: data.email }
    );

    if (!user) {
        throw new Error("incorrect-email-or-password");
    }

    if (user && user.password !== data.password) {
        throw new Error("incorrect-email-or-password");
    }

    return user;
}

const validateRegistryData = async (data) => {
    // Pre-validate data
    if (!data) {
        throw new Error("invalid-data");
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
                throw new Error(`invalid-${key}!`);
            }
        }
    }

    if (await validateUtils.isEmailExists(data.email)) {
        throw new Error("email-exists");
    }
}

const validateForgotData = async (data) => {
    if (!data) {
        throw new Error("invalid-data");
    }

    const validators = {
        email: validateUtils.validateEmail,
        otp: validateUtils.validateOtp,
        newPassword: validateUtils.validatePassword
    };

    for (let key in data) {
        if (validators[key]) {
            if (!data[key] || !validators[key](data[key])) {
                throw new Error(`invalid-${key}!`);
            }
        }
    }
}


module.exports = authController;
