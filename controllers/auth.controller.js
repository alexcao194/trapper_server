const jwtService = require("../jwt/jwt.service");
const { connectDb } = require('../config/mongo.config');
const { v4: uuidv4 } = require("uuid");
const { Timestamp } = require("mongodb");
const validator = require('validator');
const validateUtils = require('../utils/validator');

const authController = {
    login: async (req, res, next) => {

        const { db, client } = await connectDb();
        const usersCollection = db.collection('users');

        const loginData = req.body;

        if (!loginData || !loginData.email || !loginData.password) {
            return res.status(400).send("Please enter valid data!");
        }

        const user = await usersCollection.findOne(
            { email: loginData.email }
        );

        if (!user) {
            return res.status(400).send("Email or password is wrong!");
        }

        if (user && user.password !== loginData.password) {
            return res.status(400).send("Email or password is wrong!");
        }

        const payload = { userId: user.userId };

        const accessToken = jwtService.getAccessToken(payload);
        const refreshToken = await jwtService.getRefreshToken(payload);

        res.send({ accessToken, refreshToken });
    },

    registry: async (req, res, next) => {

        const { db, client } = await connectDb();
        const usersCollection = db.collection('users');
        const profilesCollection = db.collection('profiles');

        const registryData = req.body;

        if (!registryData) {
            return res.status(400).send("Please enter valid data!");
        }

        if (!validateEmail(registryData.email)) {
            return res.status(400).send("Please enter valid email!");
        }

        if (!validatePassword(registryData.password)) {
            return res.status(400).send("Please enter valid password!");
        }

        if (await isEmailExists(registryData.email)) {
            return res.status(400).send("Email already exists!");
        }

        const userId = uuidv4();

        await usersCollection.insertOne(
            {
                userId: userId,
                email: registryData.email,
                password: registryData.password,
            }
        );

        // TODO: add profile

        const payload = { userId: userId };

        const accessToken = jwtService.getAccessToken(payload);
        const refreshToken = await jwtService.getRefreshToken(payload);

        res.send({ accessToken, refreshToken });
    },

    refreshToken: async (req, res) => {
        const refreshToken = req.body.refreshToken;

        if (!refreshToken) {
            return res.status(403).send("Access is forbidden");
        }

        try {
            const newTokens = await jwtService.refreshToken(refreshToken, res);
            res.send(newTokens);
        } catch (err) {
            const message = (err && err.message) || err;
            res.status(403).send(message);
        }
    },

    getProfile: async (req, res) => {
        const { db, client } = await connectDb();
        const profilesCollection = db.collection('profiles');

        let profile = await profilesCollection.findOne(
            { userId: req.user.userId }
        );

        if (!profile) {
            return res.status(404).send("Profile not found!");
        }

        delete profile.userId;

        res.send(profile);
    },

    updateProfile: async (req, res) => {
        const { db, client } = await connectDb();
        const profilesCollection = db.collection('profiles');

        let profile = await profilesCollection.findOne(
            { userId: req.user.userId }
        );

        if (!profile) {
            return res.status(404).send("Profile not found!");
        }

        const newProfileData = req.body;

        if (!newProfileData) {
            return res.status(400).send("Please enter valid data!");
        }

        if (newProfileData.email) {
            if (!validateEmail(newProfileData.email)) {
                return res.status(400).send("Please enter valid email!");
            }

            if (await isEmailExists(newProfileData.email)) {
                return res.status(400).send("Email already exists!");
            }
        }

        if (newProfileData.password) {
            if (!validatePassword(newProfileData.password)) {
                return res.status(400).send("Please enter valid password!");
            }
        }

        if (newProfileData.full_name) {
            if (!validateFullName(newProfileData.full_name)) {
                return res.status(400).send("Please enter valid name!");
            }
        }

        if (newProfileData.date_of_birth) {
            if (!validateDateOfBirth(newProfileData.date_of_birth)) {
                return res.status(400).send("Please enter valid date of birth!");
            }
        }

        if (newProfileData.photo_url) {
            if (!validatePhotoUrl(newProfileData.photo_url)) {
                return res.status(400).send("Please enter valid photo url!");
            }
        }

        Object.keys(newProfileData).forEach(key => {
            if (newProfileData[key]) {
                profile[key] = newProfileData[key];
            }
        });
    }
};

const validateData = async (data) => {
    const validators = {
        email: validateEmail,
        password: validatePassword,
        full_name: validateFullName,
        date_of_birth: validateDateOfBirth,
        photo_url: validatePhotoUrl
    };

    for (let key in data) {
        if (data[key]) {
            if (data[key] && validators[key] && !validators[key](data[key])) {
                throw new Error(`Please enter valid ${key}!`);
            }

            if (key === 'email' && await isEmailExists(data.email)) {
                throw new Error("Email already exists!");
            }
        }
    }
};

const isEmailExists = async (email) => {

    const { db, client } = await connectDb();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
        { email: email }
    );

    if (user) {
        return true;
    }

    return false
}

module.exports = authController;
