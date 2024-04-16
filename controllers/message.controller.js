const { connectDb } = require('../config/mongo.config');
const constants = require('../utils/constants');
const { v4: uuidv4 } = require('uuid');

const messageController = {
    createRoomMessages: async (roomId) => {
        try {
            const { db, client } = await connectDb();
            const roomMessagesCollection = db.collection(constants.ROOMS_MESSAGES);

            const roomMessage = {
                _id: roomId,
                list_messages: []
            };

            await roomMessagesCollection.insertOne(roomMessage);

            return roomMessage;
        } catch (error) {
            console.log(error.message);
        }
    },

    getMessagesByRoom: async (roomId) => {
        try {
            const { db, client } = await connectDb();
            const roomMessagesCollection = db.collection(constants.ROOMS_MESSAGES);

            const roomMessage = await roomMessagesCollection.findOne(
                { _id: roomId },
            );

            return roomMessage;
        } catch (error) {
            console.log(error.message);
        }
    },

    createMessage: async (room_id, content, type, userID) => {
        try {
            const { db, client } = await connectDb();
            const roomMessagesCollection = db.collection(constants.ROOMS_MESSAGES);
            const roomInfoCollection = db.collection(constants.ROOMS_INFO);

            const message = {
                _id: uuidv4(),
                content: content,
                type: type,
                timestamp: Date.now(),
                sender: userID
            };

            // update list messages
            const roomMessages = await messageController.getMessagesByRoom(room_id);
            roomMessages.list_messages.push(message);
            await roomMessagesCollection.replaceOne(
                { _id: room_id },
                roomMessages
            );

            // upload last message in RoomInfo
            await roomInfoCollection.updateOne(
                { _id: room_id },
                { $set: { last_message: message } }
            );

            return message;
        } catch (error) {
            console.log(error.message);
        }
    }
}

module.exports = messageController;