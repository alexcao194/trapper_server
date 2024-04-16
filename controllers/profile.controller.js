const { connectDb } = require('../config/mongo.config');
const validateUtils = require('../utils/validator');
const constants = require('../utils/constants');
const storage = require('../storage/storage');

const profileController = {
    getProfile: async (req, res) => {
        const profile = await profileController.getProfileData(req.user._id);

        if (!profile) {
            return res.status(404).send("profile-not-found");
        }
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
            await profileController.validateProfileData(newProfileData);

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

    validateProfileData: async (data) => {
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
    },

    getProfileData: async (_id) => {
        const { db, client } = await connectDb();
        const profilesCollection = db.collection(constants.PROFILES);
    
        const profile = await profilesCollection.findOne(
            { _id: _id },
        );
    
        if (!profile) {
            return null;
        }

        profile.photos = storage.getNewestPhotos(_id);
        profile.photo_url = storage.getAvatar(_id);
    
        return profile;
    },

    getFriends: async (req, res) => {
        const userId = req.user._id;

        if (!userId) {
            return res.status(401).send("user-not-found");
        }

        // map to profile data
        const friends = await profileController.getFriendsData(userId);
        const profiles = [];
        for (let friendId of friends) {
            const profile = await profileController.getProfileData(friendId);
            profiles.push(profile);
        }
        res.send(profiles);
    },

    getFriendsData: async (userId) => {
        const { db, client } = await connectDb();
        const friendsCollection = db.collection("relationship");

        // get all records that contain userId
        const friends = await friendsCollection.find({ members: userId }).toArray();
        
        // return list of members that are not userId
        return friends.map(friend => {
            return friend.members.find(member => member !== userId);
        });
    },

    createRelationship: async (userId, friendId) => {
        const { db, client } = await connectDb();
        const friendsCollection = db.collection("relationship");

        // create relationship
        await friendsCollection.insertOne({
            members: [userId, friendId]
        });
    },

    updateHobbies: async (userId, hobbies) => {
        const { db, client } = await connectDb();
        const profilesCollection = db.collection(constants.PROFILES);

        // Find profile by _id
        let profile = await profilesCollection.findOne(
            { _id: userId },
        );

        if (!profile) {
            return null;
        }

        profile.hobbies = hobbies;

        await profilesCollection.updateOne(
            { _id: userId },
            { $set: profile }
        );

        return profile;
    }
}






module.exports = profileController;
