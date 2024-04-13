const socketIO = require('socket.io');
const jwtService = require("../jwt/jwt.service");
const messageController = require("../controllers/message.controller")
const roomController = require("../controllers/room.controller")
const { connectDb } = require('../config/mongo.config');
const constants = require('../utils/constants');
const eventKey = require('./event');
const { v4: uuidv4 } = require("uuid");

let connectedUsers = {};

const socket = {
    // Khởi tạo socket
    init: (server) => {
        var io = socketIO(server);

        io.on(eventKey.CONNECTION, (socket) => {
            onConnect(io, socket);
        });

        return io;
    }
}

const onConnect = (io, socket) => {
    // Xác thực token và lưu trữ socket id của user đó
    try {
        const token = socket.handshake.query.token;
        const user = jwtService.verifyJWTToken(token);

        connectedUsers[socket.id] = user._id;
        connectedUsers[user._id] = socket.id;
    } catch (error) {
        socket.disconnect();
    }

    // Đăng kí sự kiện Fetch rooms info
    socket.on(eventKey.FETCH_ROOMS_INFO, async () => {
        const userId = connectedUsers[socket.id];
        const roomsInfo = await roomController.getRoomsInfoByUserId(userId);

        socket.emit(eventKey.RECEIVED_ROOMS_INFO, roomsInfo);
    });

    // Đăng kí sự kiện Fetch rooms messages
    socket.on(eventKey.FETCH_ROOMS_MESSAGES, async (body) => {
        const userId = connectedUsers[socket.id];
        const partnerId = body.userId;

        const roomInfo = await roomController.getRoomInfoByMembersId(userId, partnerId);
        if(roomInfo === null) {
            // TODO: return error
        }

        const messages = await messageController.getMessagesByRoom(roomInfo._id);
        socket.emit(eventKey.RECEIVED_ROOMS_MESSAGES, messages);
    });

    // Đăng kí sự kiện Send message
    socket.on(eventKey.SEND_MESSAGE, (body) => {
        messageController.sendMessage(io, connectedUsers, socket, body);
    });

    // Đăng kí sự kiện Disconnection
    socket.on(eventKey.DISCONNECT, () => {
        const userId = connectedUsers[socket.id];

        delete socket.connectedUsers[socket.id];
        delete socket.connectedUsers[userId];
    });
}

module.exports = socket;