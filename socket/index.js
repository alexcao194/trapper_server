const socketIO = require('socket.io');
const jwtService = require("../jwt/jwt.service");
const { connectDb } = require('../config/mongo.config');
const constants = require('../utils/constants');
const eventKey = require('./event');

const socket = {
    init: (server) => {
        var io = socketIO(server);

        io.on(eventKey.CONNECTION, onConnection);

        return io;
    }
}

const onConnection = (socket) => {
    console.log('New client connected');

    // Handle disconnection
    socket.on(eventKey.DISCONNECT, () => {
        console.log('Client disconnected');
    });
}

fetchRoomsInfo = async (token) => {
    try {

        const { db, client } = await connectDb();
        const roomsInfoCollection = db.collection(constants.ROOMS_INFO);

        const user = jwtService.verifyJWTToken(token);

        // Truy xuất dữ liệu rooms-info từ cơ sở dữ liệu
        const roomsInfo = await roomsInfoCollection.find({ _id: user._id });

        // Gửi kết quả trả về cho client
        socket.emit('on_received_rooms_info', roomsInfo);
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Error fetching rooms info:', error.message);
        // Gửi thông báo lỗi cho client
        socket.emit('on_fetch_rooms_info_error', { message: 'Error fetching rooms info' });
    }
}

module.exports = socket;