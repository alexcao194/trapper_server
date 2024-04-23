const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { connectDb } = require("../config/mongo.config");
const constants = require("../utils/constants");

const jwtSecretString = "mysecret"; // TODO: move to .env
const REFRESH_TOKENS = "refreshTokens";
const START_HEADER_AUTH = "Bearer ";

const jwtService =
{
    getAccessToken: (payload) => {
        return jwt.sign({ user: payload }, jwtSecretString, { expiresIn: "150min" });
    },

    getRefreshToken: async (payload) => {
        const { db, client } = await connectDb();
        const collection = db.collection(REFRESH_TOKENS);

        const userRefreshTokens = await collection
            .find({ userId: payload._id })
            .toArray();

        // if user has more than 5 refresh tokens
        // remove all of them and create new one
        if (userRefreshTokens.length >= 5) {
            await collection.drop({ userId: payload._id });
        }

        const refreshToken = jwt.sign({ user: payload }, jwtSecretString, {
            expiresIn: "30d"
        });

        let result = await collection.insertOne(
            { userId: payload._id, refreshToken },
            (err, result) => {
                if (err) {
                    throw err;
                }
            }
        );

        return refreshToken;
    },

    verifyJWTToken: (token) => {
        if (token.startsWith(START_HEADER_AUTH)) {
            token = token.slice(7, token.length);
        }
        const decodedToken = jwt.verify(token, jwtSecretString)
        return decodedToken.user;
    },

    refreshToken: async (token) => {
        const { db, client } = await connectDb();

        const usersCollection = db.collection(constants.USERS);
        const collection = db.collection(REFRESH_TOKENS);

        if (token.startsWith(START_HEADER_AUTH)) {
            token = token.slice(7, token.length);
        }
        const decodedToken = jwt.verify(token, jwtSecretString)

        const userData = decodedToken.user;
        const user = await usersCollection.findOne({ userId: userData._id });

        if (!user) {
            throw new Error(`Access is forbidden`);
        }

        const allRefreshTokens = await collection
            .find({ userId: user._id })
            .toArray();

        if (!allRefreshTokens || !allRefreshTokens.length) {
            throw new Error(`There is no refresh token for the user with`);
        }

        const currentRefreshToken = allRefreshTokens.find(
            refreshToken => refreshToken.refreshToken === token
        );

        if (!currentRefreshToken) {
            throw new Error(`Refresh token is wrong`);
        }
        // user's data for new tokens
        const payload = { _id: user._id };
        // get new refresh and access token
        const access_token = await getUpdatedRefreshToken(token, payload);
        const refresh_token = getAccessToken(payload);

        return {access_token, refresh_token};
    }
};

const getUpdatedRefreshToken = async (oldRefreshToken, payload) => {
    const { db, client } = await connectDb();
    const usersCollection = db.collection(constants.USERS);
    const collection = db.collection(REFRESH_TOKENS);
    // create new refresh token
    const newRefreshToken = jwt.sign({ user: payload }, jwtSecretString, {
        expiresIn: "30d"
    });

    // replace current refresh token with new one
    await collection.find().map(token => {
        if (token.refreshToken === oldRefreshToken) {
            return { ...token, refreshToken: newRefreshToken };
        }

        return token;
    });

    return newRefreshToken;
};

const getAccessToken = payload => {
    return jwt.sign({ user: payload }, jwtSecretString, { expiresIn: "15min" });
};

module.exports = jwtService;
