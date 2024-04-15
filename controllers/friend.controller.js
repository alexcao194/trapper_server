const { connectDb } = require('../config/mongo.config');

const friendController = {
    getFriends: async (userId) => {
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
    }
}

module.exports = friendController;