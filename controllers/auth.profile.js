const { connectDb } = require('../config/mongo.config');
const validateUtils = require('../utils/validator');
const constants = require('../utils/constants');

const profileController = {
    getProfile: async (req, res) => {
        const { db, client } = await connectDb();
        const profilesCollection = db.collection(constants.PROFILES);

        const profile = await profilesCollection.findOne(
            { userId: req.user.userId },
            { userId: 0}
        );

        if (!profile) {
            return res.status(404).send("Profile not found!");
        }

        res.send(profile);
    },

    updateProfile: async (req, res) => {
        const { db, client } = await connectDb();
        const profilesCollection = db.collection(constants.PROFILES);

        // Tìm profile theo userId
        let profile = await profilesCollection.findOne(
            { userId: req.user.userId },
            { userId: 0}
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
        } catch (err) {
            return res.status(400).send(err.message);
        }

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

        res.send(profile);
    }
}

const validateProfileData = async (data) => {
    const validators = {
        email: validateUtils.validateEmail,
        password: validateUtils.validatePassword,
        full_name: validateUtils.validateFullName,
        date_of_birth: validateUtils.validateDateOfBirth,
        photo_url: validateUtils.validateUrl
    };

    for (let key in data) 
    {
        // Nếu trường dữ liệu ko null và có hàm validate tương ứng
        if (data[key] && validators[key]) 
        {
            if (!validators[key](data[key])) {
                throw new Error(`Please enter valid ${key}!`);
            }

            if (key === constants.EMAIL && await isEmailExists(data.email)) {
                throw new Error("Email already exists!");
            }
        }
    }
};


module.exports = profileController;