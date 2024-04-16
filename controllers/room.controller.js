const { connectDb } = require('../config/mongo.config');
const constants = require('../utils/constants');
const { v4: uuidv4 } = require('uuid');

const roomController = {
    findByUserId: async (userId) => {
        try {
            const { db, client } = await connectDb();
            const roomInfoCollection = db.collection(constants.ROOMS_INFO);

            const roomsInfo = await roomInfoCollection.find(
                { list_members: userId }
            ).toArray();

            return roomsInfo;
        } catch (error) {
            console.log(error.message);
        }
    },

    findByRoomId: async (roomId) => {
        try {
            const { db, client } = await connectDb();
            const roomInfoCollection = db.collection(constants.ROOMS_INFO);

            const roomInfo = await roomInfoCollection.findOne(
                { _id: roomId },
            );

            return roomInfo;
        } catch (error) {
            console.log(error.message);
        }
    },

    createRoomInfo: async (userId1, userId2) => {
        try {
            const { db, client } = await connectDb();
            const roomInfoCollection = db.collection(constants.ROOMS_INFO);

            const roomInfo = {
                _id: uuidv4(),
                list_members: [userId1, userId2],
                last_message: null
            };

            await roomInfoCollection.insertOne(roomInfo);


            return roomInfo;
        } catch (error) {
            console.log(error.message);
        }
    },

    findWithMembers: async (userId1, userId2) => {
        try {
            const { db, client } = await connectDb();
            const roomInfoCollection = db.collection(constants.ROOMS_INFO);

            const roomsInfo = await roomInfoCollection.findOne(
                { list_members: { $all: [userId1, userId2] } }
            );

            return roomsInfo;
        } catch (error) {
            console.log(error.message);
        }
    }
}

module.exports = roomController;