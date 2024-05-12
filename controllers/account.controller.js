const { connectDb } = require('../config/mongo.config');
const validateUtils = require('../utils/validator');
const constants = require('../utils/constants');

const accountController = {
    changePassword: async (req, res) => {
        const { db, client } = await connectDb();
        const usersCollection = db.collection(constants.USERS);

        const newPassword = req.body.newPassword;
        const oldPassword = req.body.oldPassword;
        const email = req.body.email;
        const user = await usersCollection.findOne(
            { email: email }
        );

        if (!user) {
            return res.status(400).send("incorrect-email-or-password");
        }

        if (user && user.password !== oldPassword) {
            return res.status(400).send("old-password-incorrect");
        }

        try {
            validateUtils.validatePassword(newPassword);

            // Update password
            await usersCollection.updateOne(
                { _id: req.user._id },
                { $set: { password: newPassword } }
            );

        } catch (err) {
            return res.status(400).send(err.message);
        }

        res.send("password-changed");
    },
}

module.exports = accountController;