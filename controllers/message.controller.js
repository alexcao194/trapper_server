const { connectDb } = require('../config/mongo.config');
const constants = require('../utils/constants');
const eventKey = require('../socket/event');
const { v4: uuidv4 } = require('uuid');
const roomController = require('./room.controller');

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

    sendMessage: async (io, connectedUsers, socket, body) => {
        try {
            const { db, client } = await connectDb();
            const roomMessagesCollection = db.collection(constants.ROOMS_MESSAGES);
            const roomInfoCollection = db.collection(constants.ROOMS_INFO);

            // create message
            const { roomId, content, type } = body;
            const message = {
                _id: uuidv4(),
                content: content,
                type: type,
                timestamp: Date.now(),
                sender: connectedUsers[socket.id]
            };

            // update list messages
            const roomMessages = await messageController.getMessagesByRoom(roomId);
            roomMessages.list_messages.push(message);
            await roomMessagesCollection.replaceOne(
                { _id: roomId },
                roomMessages
            );

            // upload last message in RoomInfo
            await roomInfoCollection.updateOne(
                { _id: roomId },
                { $set: { last_message: message } }
            );

            // report to client in room
            const roomInfo = await roomController.findByRoomId(roomId);
            const members = roomInfo.list_members;
            for (let i = 0; i < members.length; i++) {
                const memberSocketId = connectedUsers[members[i]];
                if (memberSocketId) {
                    io.to(memberSocketId).emit(eventKey.RECEIVED_MESSAGE, message);
                }

            }

        } catch (error) {
            const message = "send-message-failed"
            socket.emit(eventKey.RECEIVED_MESSAGE, message);
            console.log(error.message);
        }
    }
}

module.exports = messageController;