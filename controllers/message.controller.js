const { connectDb } = require('../config/mongo.config');
const constants = require('../utils/constants');
const eventKey = require('../socket/event');
const { v4: uuidv4 } = require('uuid');
const roomController = require('./room.controller');

const messageController = {

    createRoomMessage: async (roomId) => {
        try {
            const { db, client } = await connectDb();
            const roomMessagesCollection = db.collection(constants.ROOM_MESSAGES);

            const roomMessage = {
                _id: roomId,
                list_messages: []
            };

            await roomMessagesCollection.insertOne(roomMessage);
        } catch (error) {
            // TODO: return error to client
        }
    },

    getMessagesByRoom: async (roomId) => {
        try {
            const { db, client } = await connectDb();
            const roomMessagesCollection = db.collection(constants.ROOM_MESSAGES);

            const roomMessage = await roomMessagesCollection.findOne(
                { _id: roomId },
                { projection: { _id: 0 } }
            );

            return roomMessage.list_messages;
        } catch (error) {
            // TODO: return error to client
        }
    },

    sendMessage: async (io, connectedUsers, socket, body) => {
        try {
            const { db, client } = await connectDb();
            const roomMessagesCollection = db.collection(constants.ROOM_MESSAGES);
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
            const listMessages = await messageController.getMessagesByRoom(roomId);
            listMessages.push(message);
            await roomMessagesCollection.updateOne(
                { _id: roomId },
                { $set: { list_messages: listMessages } }
            );

            // upload last message in RoomInfo
            await roomInfoCollection.updateOne(
                {_id: roomId},
                { $set: { last_message: message } }
            );

            // report to client in room
            const roomInfo = await roomController.getRoomInfoById(roomId);
            const members = roomInfo.list_members;
            for (let i = 0; i < members.length; i++) {
                const memberSocketId = connectedUsers[members[i]];
                if(memberSocketId) {
                    io.to(memberSocketId).emit(eventKey.RECEIVED_MESSAGE, message);
                }
                
            }

        } catch (error) {
            const message = "send-message-failed"
            socket.emit(eventKey.RECEIVED_MESSAGE, message);
        }
    }
}

module.exports = messageController;