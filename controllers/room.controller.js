const { connectDb } = require('../config/mongo.config');
const constants = require('../utils/constants');
const eventKey = require('../socket/event');
const { v4: uuidv4 } = require('uuid');

const roomController = {
    getRoomsInfoByUserId: async (userId) => {
        try {
            const { db, client } = await connectDb();
            const roomInfoCollection = db.collection(constants.ROOMS_INFO);

            const roomsInfo = await roomInfoCollection.find(
                { list_members : userId },
                { projection: { _id: 0 } }
            ).toArray();

            return roomsInfo;
        } catch (error) {
            // TODO: return error to client
        }
    },

    getRoomInfoById :  async (roomId) => {
        try {
            const { db, client } = await connectDb();
            const roomInfoCollection = db.collection(constants.ROOMS_INFO);

            const roomInfo = await roomInfoCollection.findOne(
                { _id: roomId },
                { projection: { _id: 0 } }
            );

            return roomInfo;
        } catch (error) {
            // TODO: return error 
        }
    },

    getRoomInfoByMembersId : async (userId, partnerId) => {
        const { db, client } = await connectDb();
        const roomInfoCollection = db.collection(constants.ROOMS_INFO);

        const roomInfo = await roomInfoCollection.findOne(
            { list_members: { $all: [userId, partnerId] } },
            { projection: { _id: 0 } }
        );

        return roomInfo;
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
            // TODO: return error
        }
    }
}

module.exports = roomController;