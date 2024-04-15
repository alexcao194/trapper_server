const socketIO = require('socket.io');
const jwtService = require("../jwt/jwt.service");
const messageController = require("../controllers/message.controller")
const roomController = require("../controllers/room.controller")
const profileController = require("../controllers/profile.controller")
const { connectDb } = require('../config/mongo.config');
const constants = require('../utils/constants');
const eventKey = require('./event');
const { v4: uuidv4 } = require("uuid");

let connectedUsers = {};
let friendRequests = {};

const socket = {
    // Khởi tạo socket
    init: (server) => {
        var io = socketIO(server);

        io.use(async (socket, next) => {
            try {
                const token = socket.handshake.headers.access_token;
                const user = jwtService.verifyJWTToken(token);
        
                connectedUsers[socket.id] = user._id;
                connectedUsers[user._id] = socket.id;
                next();
            } catch (err) {
                next(new Error("authentication-error"));
            }
        });

        io.on(eventKey.CONNECTION, (socket) => {
            onConnect(io, socket);
        });

        return io;
    }
}

const onConnect = (io, socket) => {
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
            socket.emit(eventKey.RECEIVED_ROOMS_MESSAGES, {
                error: "room-not-found"
            });
            return;
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

    // friend request
    socket.on(eventKey.FRIEND_REQUEST, async (body) => {
        const userId = connectedUsers[socket.id];
        const friendId = body.userId;

        var friends = await profileController.getFriendsData(userId);
        if (friends.includes(friendId)) {
            return;
        }

        if (friendRequests[friendId]) {
            if (friendRequests[friendId].includes(userId)) {
                await profileController.createRelationship(userId, friendId);
                delete friendRequests[friendId];

                var userProfile = await profileController.getProfileData(userId);
                var friendProfile = await profileController.getProfileData(friendId);

                // emit to friendId and userId
                io.to(connectedUsers[friendId]).emit(eventKey.ACCEPT_FRIEND_REQUEST, {
                    profile: userProfile
                });
                socket.emit(eventKey.ACCEPT_FRIEND_REQUEST, {
                    profile: friendProfile
                });
            }
        } else {
            if (friendRequests[userId]) {
                friendRequests[userId].push(friendId);
            } else {
                friendRequests[userId] = [friendId];
            }
            var userProfile = await profileController.getProfileData(userId);
            io.to(connectedUsers[friendId]).emit(eventKey.RECEIVED_FRIEND_REQUEST, {
                profile: userProfile
            });
        }
    });
}

module.exports = socket;