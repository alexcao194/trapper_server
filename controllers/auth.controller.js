const jwtService = require("../jwt/jwt.service");
const { connectDb } = require('../config/mongo.config');
const { v4: uuidv4 } = require("uuid");
const validateUtils = require('../utils/validator');
const constants = require('../utils/constants');
const profileController = require('./auth.profile');


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
        const payload = { userId: user.userId };

        const accessToken = jwtService.getAccessToken(payload);
        const refreshToken = await jwtService.getRefreshToken(payload);

        res.send({ accessToken, refreshToken });
    },

    registry: async (req, res) => {

        const { db, client } = await connectDb();
        const usersCollection = db.collection(constants.USERS);
        const profilesCollection = db.collection(constants.PROFILES);

        const registryData = req.body;

        try {
            await validateRegistryData(registryData);
        } catch (err) {
            return res.status(400).send(err.message);
        }
        
        const userId = uuidv4();

        // Add user account
        await usersCollection.insertOne(
            {
                userId: userId,
                email: registryData.email,
                password: registryData.password,
            }
        );

        // Add user profile
        await profilesCollection.insertOne(
            {
                userId: userId,
                email: registryData.email,
                full_name: registryData.full_name,
                date_of_birth: registryData.date_of_birth,
                gender: registryData.gender,
            }
        );

        // Get access token and refresh token
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

    getProfile: async (req, res) => profileController.getProfile(req, res),

    updateProfile: async (req, res) => profileController.updateProfile(req, res)
};

const validateLoginData = async (data) => {
    // Pre-validate data
    if (!data || validateUtils.validateEmail(data.email) || validateUtils.validatePassword(data.password)) {
        throw new Error("Please enter valid data!");
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
    if (!data || 
        !validateUtils.validateEmail(data.email) || 
        !validateUtils.validatePassword(data.password) || 
        !validateUtils.validatePassword(data.confirm_password) ||
        !validateUtils.validateFullName(data.full_name) || 
        !validateUtils.validateDateOfBirth(data.date_of_birth)) {
        throw new Error("Please enter valid data!");
    }

    if(data.password !== data.confirm_password) {
        throw new Error("Password and confirm password are not matched!");
    }

    if (await validateUtils.isEmailExists(data.email)) {
        throw new Error("Email already exists!");
    }
}


module.exports = authController;
