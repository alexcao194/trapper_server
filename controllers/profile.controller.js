const { connectDb } = require('../config/mongo.config');
const validateUtils = require('../utils/validator');
const constants = require('../utils/constants');

const profileController =
{
    getProfile: async (req, res) => {
        const profile = await getProfileData(req.user.userId);

        if (!profile) {
            return res.status(404).send("Profile not found!");
        }

        res.send(profile);
    },

    updateProfile: async (req, res) => {
        const { db, client } = await connectDb();
        const usersCollection = db.collection(constants.USERS);
        const profilesCollection = db.collection(constants.PROFILES);

        // Find profile by userId
        let profile = await profilesCollection.findOne(
            { userId: req.user.userId },
        );

        if (!profile) {
            return res.status(404).send("Profile not found!");
        }

        // Validate new profile data
        const newProfileData = req.body;

        // If data null, return old profile
        if (!newProfileData) {
            return res.send(profile);
        }

        try {
            await validateProfileData(newProfileData);

            // Cập nhật profile
            Object.keys(newProfileData).forEach(key => {
                if (newProfileData[key]) {
                    profile[key] = newProfileData[key];
                }
            });

            await profilesCollection.updateOne(
                { userId: req.user.userId },
                { $set: profile }
            );

        } catch (err) {
            return res.status(400).send(err.message);
        }

        delete profile._id;
        delete profile.userId;

        res.send(profile);
    },

    getHobbies: async (req, res) => {
        const profile = await getProfileData(req.user.userId);

        if (!profile) {
            return res.status(404).send("Profile not found!");
        }

        res.send(profile.hobbies);
    },
}

const validateProfileData = async (data) => {
    const validators = {
        full_name: validateUtils.validateFullName,
        date_of_birth: validateUtils.validateDateOfBirth,
        photo_url: validateUtils.validateUrl
    };

    for (let key in data) {
        // if data[key] is not null and validators[key] exists
        if (data[key] && validators[key]) {
            if (!validators[key](data[key])) {
                throw new Error(`Please enter valid ${key}!`);
            }
        }
    }
};

const getProfileData = async (userId) => {
    const { db, client } = await connectDb();
    const profilesCollection = db.collection(constants.PROFILES);

    const profile = await profilesCollection.findOne(
        { userId: userId },
        { projection: { _id: 0, userId: 0 }}
    );

    if (!profile) {
        return null;
    }

    return profile;
}


module.exports = profileController;