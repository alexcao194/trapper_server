const { connectDb } = require('../config/mongo.config');
const validateUtils = require('../utils/validator');
const constants = require('../utils/constants');

const profileController =
{
    getProfile: async (req, res) => {
        const profile = await getProfileData(req.user.email);

        if (!profile) {
            return res.status(404).send("Profile not found!");
        }

        res.send(profile);
    },

    updateProfile: async (req, res) => {
        const { db, client } = await connectDb();
        const usersCollection = db.collection(constants.USERS);
        const profilesCollection = db.collection(constants.PROFILES);

        // Tìm profile theo email
        let profile = await profilesCollection.findOne(
            { email: req.user.email },
        );

        if (!profile) {
            return res.status(404).send("Profile not found!");
        }

        // Validate new profile data
        const newProfileData = req.body;

        // Nếu null hết thì trả về data cũ
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
                { email: req.user.email },
                { $set: profile }
            );

        } catch (err) {
            return res.status(401).send(err.message);
        }

        res.send(profile);
    },

    getHobbies: async (req, res) => {
        const profile = await getProfileData(req.user.email);

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
        // Nếu trường dữ liệu ko null và có hàm validate tương ứng
        if (data[key] && validators[key]) {
            if (!validators[key](data[key])) {
                throw new Error(`Please enter valid ${key}!`);
            }
        }
    }
};

const getProfileData = async (email) => {
    const { db, client } = await connectDb();
    const profilesCollection = db.collection(constants.PROFILES);

    const profile = await profilesCollection.findOne(
        { email: email },
    );

    if (!profile) {
        return null;
    }

    return profile;
}


module.exports = profileController;