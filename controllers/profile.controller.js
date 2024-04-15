const { connectDb } = require('../config/mongo.config');
const validateUtils = require('../utils/validator');
const constants = require('../utils/constants');
const storage = require('../storage/storage');

const profileController =
{
    getProfile: async (req, res) => {
        const profile = await getProfileData(req.user._id);

        if (!profile) {
            return res.status(404).send("profile-not-found");
        }
        
        profile.photos = storage.getNewestPhotos(req.user._id);
        profile.photo_url = storage.getAvatar(req.user._id);
        res.send(profile);
    },

    updateProfile: async (req, res) => {
        const { db, client } = await connectDb();
        const profilesCollection = db.collection(constants.PROFILES);

        // Find profile by _id
        let profile = await profilesCollection.findOne(
            { _id: req.user._id },
        );

        if (!profile) {
            return res.status(404).send("profile-not-found");
        }

        profile.photos = storage.getNewestPhotos(req.user._id);
        profile.photo_url = storage.getAvatar(req.user._id);

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
                { _id: req.user._id },
                { $set: profile }
            );

        } catch (err) {
            return res.status(401).send(err.message);
        }

        delete profile._id;

        res.send(profile);
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
                throw new Error(`invalid-${key}!`);
            }
        }
    }
};

const getProfileData = async (_id) => {
    const { db, client } = await connectDb();
    const profilesCollection = db.collection(constants.PROFILES);

    const profile = await profilesCollection.findOne(
        { _id: _id },
        { projection: { _id: 0 }}
    );

    if (!profile) {
        return null;
    }

    return profile;
}


module.exports = profileController;
