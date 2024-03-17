const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { connectDb } = require("../config/mongo.config");
const constants = require("../utils/constants");

const jwtSecretString = "mysecret"; // TODO: move to .env
const REFRESH_TOKENS = "refreshTokens";
const START_HEADER_AUTH = "Bearer ";

const jwtService =
{
    getAccessToken: payload => {
        return jwt.sign({ user: payload }, jwtSecretString, { expiresIn: "15min" });
    },

    getRefreshToken: async (payload) => {
        const { db, client } = await connectDb();
        const collection = db.collection(REFRESH_TOKENS);

        const userRefreshTokens = await collection
            .find({ userId: payload.userId })
            .toArray();

        // Nếu có >= 5 refresh token thì
        // xóa tất cả refresh token của user đó và chỉ giữ lại cái mới để bảo mật
        if (userRefreshTokens.length >= 5) {
            await collection.drop({ userId: payload.userId });
        }

        const refreshToken = jwt.sign({ user: payload }, jwtSecretString, {
            expiresIn: "30d"
        });

        let result = await collection.insertOne(
            { id: uuidv4(), userId: payload.userId, refreshToken },
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

    refreshToken: async token => {
        const { db, client } = await connectDb();

        const usersCollection = db.collection(constants.USERS);
        const collection = db.collection(REFRESH_TOKENS);

        const decodedToken = jwt.verify(token, jwtSecretString);

        const user = await usersCollection.findOne({ userId: decodedToken.user.userId });
        // var userDocument = user.hasNext() ? user.next() : null

        if (!user) {
            throw new Error(`Access is forbidden`);
        }

        // get all user's refresh tokens from DB
        const allRefreshTokens = await collection
            .find({ userId: user.userId })
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
        const payload = { userId: user.userId };
        // get new refresh and access token
        const newRefreshToken = await getUpdatedRefreshToken(token, payload);
        const newAccessToken = getAccessToken(payload);

        return { accessToken: newAccessToken, refreshToken: newRefreshToken };
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
