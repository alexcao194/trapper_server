const { verify } = require('jsonwebtoken');
const { connectDb } = require('../config/mongo.config');
const constants = require('./constants');

// Cơ chế quên mật khẩu
/*
    1. User nhập email
    2. Server xác thực email nếu thành công:
        2.1 Server tạo {email: , otp: } và lưu vào otp collection
        2.2 Server response 200
    3. User send otp + newpassword
    4. Server kiểm tra otp có đúng không, nếu đúng:
        4.1 Change password
        4.2 Xóa otp trong otp collection
*/

const otpService = {
    generateOtp: async (email) => {
        const { db, client } = await connectDb();
        const otpCollection = db.collection(constants.OTP);

        const otp = Math.floor(100000 + Math.random() * 900000);

        await otpCollection.updateOne(
            { email: email },
            { $set: { otp: otp } },
            { upsert: true }
        );

        return otp;
    },

    verifyOtp: async (email, otp) => {
        const { db, client } = await connectDb();
        const otpCollection = db.collection(constants.OTP);

        const otpData = await otpCollection.findOne({ email: email });

        if (otpData.otp === otp) {
            await otpCollection.deleteOne({ email: email });
            
            return true;
        }

        return false;
    }
};

module.exports = otpService;