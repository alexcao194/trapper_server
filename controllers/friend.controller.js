const { connectDb } = require('../config/mongo.config');

const friendController = {
    fetchFriends: async (userId) => {
        const { db, client } = await connectDb();
        const friendsCollection = db.collection('relationship');
        // {
        //     "members": [
        //         "60b4b1f0e3e3b6c1f4f0c7f5",
        //         "60b4b1f0e3e3b6c1f4f0c7f6"
        //     ]
        // }
        const friends = await friendsCollection.find({ members: req.user._id }).toArray();
        return friends.map(friend => {
            return friend.members.find(member => member !== userId);
        });
    },
}

module.exports = friendController;