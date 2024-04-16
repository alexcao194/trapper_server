const socketIO = require('socket.io');
const jwtService = require("../jwt/jwt.service");
const messageController = require("../controllers/message.controller")
const roomController = require("../controllers/room.controller")
const profileController = require("../controllers/profile.controller")
const eventKey = require('./event');

let connectedUsers = {};
let friendRequests = {};
let connectQueue = [];

const socket = {
    // Khởi tạo socket
    init: (server) => {
        var io = socketIO(server);

        io.use(async (socket, next) => {
            try {
                let token = socket.handshake.auth['access_token'];
                // check what if auth is empty
                if (!token) {
                    token = socket.handshake.headers.access_token
                }
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
        const roomsInfo = await roomController.findByUserId(userId);

        const result = [];

        for (let roomInfo of roomsInfo) {
            const partnerId = roomInfo.list_members.filter((member) => member !== userId)[0];
            const partnerProfile = await profileController.getProfileData(partnerId);
            roomInfo.profile = partnerProfile;
            result.push(roomInfo);
        }

        socket.emit(eventKey.RECEIVED_ROOMS_INFO, result);
    });

    // Đăng kí sự kiện Fetch rooms messages
    socket.on(eventKey.FETCH_ROOMS_MESSAGES, async (body) => {
        
        const roomId = body.room_id;

        const roomMessages = await messageController.getMessagesByRoom(roomId);

        if (roomMessages === null) {
            socket.emit(eventKey.RECEIVED_ROOMS_MESSAGES, {
                error: "room-not-found"
            });
            return;
        }

        socket.emit(eventKey.RECEIVED_ROOMS_MESSAGES, roomMessages);
    });

    // Đăng kí sự kiện Send message
    socket.on(eventKey.SEND_MESSAGE, async (body) => {
        try {
            const room_id = body.room_id;
            const content = body.content;
            const type = body.type;
            const message = await messageController.createMessage(body.room_id, content, type, connectedUsers[socket.id]);
            const roomInfo = await roomController.findByRoomId(room_id);
            const members = roomInfo.list_members;
            for (let i = 0; i < members.length; i++) {
                const memberSocketId = connectedUsers[members[i]];
                if (memberSocketId) {
                    io.to(memberSocketId).emit(eventKey.RECEIVED_MESSAGE, {
                        room_id: room_id,
                        message: message
                    });
                    const userId = connectedUsers[memberSocketId];
                    const roomsInfo = await roomController.findByUserId(userId);
                    const result = [];
                    for (let roomInfo of roomsInfo) {
                        const partnerId = roomInfo.list_members.filter((member) => member !== userId)[0];
                        const partnerProfile = await profileController.getProfileData(partnerId);
                        roomInfo.profile = partnerProfile;
                        result.push(roomInfo);
                    }
                    io.to(memberSocketId).emit(eventKey.RECEIVED_ROOMS_INFO, result);
                }

            }

        } catch (error) {
            const message = "send-message-failed"
            socket.emit(eventKey.RECEIVED_MESSAGE, message);
            console.log(error.message);
        }
    });

    // Đăng kí sự kiện Disconnection
    socket.on(eventKey.DISCONNECT, () => {
        const userId = connectedUsers[socket.id];

        try {
            delete socket.connectedUsers[socket.id];
            delete socket.connectedUsers[userId];
        } catch(e) {

        }
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

    socket.on(eventKey.ON_FIND, async (body) => {
        const userId = connectedUsers[socket.id];
        // if user is already in queue
        for (let i = 0; i < connectQueue.length; i++) {
            if (connectQueue[i].userId == userId) {
                connectQueue.splice(i, 1);
                break;
            }
        }

        const userProfile = await profileController.getProfileData(userId);
        var data = {
            minAge: body.min_age,
            maxAge: body.max_age,
            hobbies: body.hobbies,
            gender: body.gender
        };

        profileController.updateHobbies(userId, body.hobbies);

        var userMatchAgeAndGender = connectQueue.filter((item) => {
            var userAge = new Date().getFullYear() - userProfile.date_of_birth.split("/")[2];
            var rs = item.age >= data.minAge 
            && item.age <= data.maxAge
            && item.gender == data.gender 

            && item.userId != userId

            && item.data.minAge <= userAge
            && item.data.maxAge >= userAge
            && item.data.gender == userProfile.gender
            return rs
        });

        // count hobbies match
        var hobbiesMatch = [];
        for (let user of userMatchAgeAndGender) {
            var match = 0;
            for (let hobby of user.data.hobbies) {
                if (data.hobbies.includes(hobby)) {
                    match++;
                }
            }
            if (match > 0) {
                hobbiesMatch.push({
                    userId: user.userId,
                    match: match
                });
            }
        }
        
        // if hobbies match > 0
        if (hobbiesMatch.length > 0) {
            hobbiesMatch.sort((a, b) => {
                return b.match - a.match;
            });
            var friendId = hobbiesMatch[0].userId;
            var friendProfile = await profileController.getProfileData(friendId);
            var roomInfo = await roomController.findWithMembers(userId, friendId);
            console.log(roomInfo);
            if (!roomInfo) {
                roomInfo = await roomController.createRoomInfo(userId, friendId);
                await messageController.createRoomMessages(roomInfo._id);
                console.log(roomInfo);
            }
            // remove 
            for (let i = 0; i < connectQueue.length; i++) {
                if (connectQueue[i].userId == friendId) {
                    connectQueue.splice(i, 1);
                    break;
                }
            }
            io.to(connectedUsers[friendId]).emit(eventKey.ON_FOUND, {
                profile: userProfile,
                room_info: roomInfo
            });
            socket.emit(eventKey.ON_FOUND, {
                profile: friendProfile,
                room_info: roomInfo
            });
        } else {
            connectQueue.push({
                userId: userId,
                age: new Date().getFullYear() - userProfile.date_of_birth.split("/")[2],
                gender: userProfile.gender,
                data: data
            });
        }
        console.log(connectQueue);
    });

    socket.on(eventKey.ON_FIND_CANCEL, async () => {
        const userId = connectedUsers[socket.id];
        for (let i = 0; i < connectQueue.length; i++) {
            if (connectQueue[i].userId == userId) {
                connectQueue.splice(i, 1);
                break;
            }
        }
    });
}

module.exports = socket;