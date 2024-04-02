const jwtService = require("../jwt/jwt.service");
const { connectDb } = require('../config/mongo.config');
const validateUtils = require('../utils/validator');
const constants = require('../utils/constants');

const accountController = {
    changePassword: async (req, res) => {
        const { db, client } = await connectDb();
        const usersCollection = db.collection(constants.USERS);

        const newPassword = req.body.password;

        try {
            await validateUtils.validatePassword(newPassword);

            // Update password
            await usersCollection.updateOne(
                { email: req.user.email },
                { $set: { password: newPassword } }
            );

        } catch (err) {
            return res.status(400).send(err.message);
        }

        res.send("Password changed successfully!");
    }
}

module.exports = accountController;