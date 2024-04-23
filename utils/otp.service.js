const { connectDb } = require('../config/mongo.config');
const nodemailer = require('nodemailer');
const constants = require('./constants');

// Cơ chế quên mật khẩu
/*
    1. User send email 
    2. Server xác thực email nếu thành công:
        2.1 Server tạo {email: , otp: } và lưu vào otp collection
        2.2 Server gửi otp về email
        2.3 Server response 200
    3. User send otp + newpassword
    4. Server kiểm tra otp có đúng và chưa expires không, nếu đúng => Change password
*/

const otpService = {
    generateOtp: async (email) => {
        try {
            const { db, client } = await connectDb();
            const otpCollection = db.collection(constants.OTP);

            const otp = Math.floor(100000 + Math.random() * 900000);

            // create otp expire in 5 minutes
            await otpCollection.updateOne(
                { email: email },
                { $set: { otp: otp, createdAt: Date.now(), expiresAt: Date.now() + 1000 * 60 * 5 } },
                { upsert: true }
            );

            return otp;
        } catch (err) {
            throw new Error('otp-error');
        }
    },

    sendOtp: async (email, otp) => {
        try {
            // Config mail server
            const transporter = nodemailer.createTransport({
                service: 'smtp-mail.outlook.com',
                port: 587,
                secure: false,
                logger: true,
                auth: {
                    user: process.env.AUTH_EMAIL,
                    pass: process.env.AUTH_PASSWORD
                }
            });

            const mailOptions = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: 'Reset Your Password',
                html: `<p> ${otp} is your OTP to reset your password. This OTP will expire in 5 minutes.</p>
                <p style="color:tomato; font-size:25px; letter-spacing:2px;"> <b> Do not share this OTP with anyone.</p>`
            };

            await transporter.sendMail(mailOptions);
            
        } catch (error) {
            throw new Error(error.message);
        }
    },

    verifyOtp: async (email, otp) => {
        const { db, client } = await connectDb();
        const otpCollection = db.collection(constants.OTP);

        const otpData = await otpCollection.findOne({ email: email });

        if (otpData.otp === otp && otpData.expiresAt > Date.now()) {
            await otpCollection.deleteOne({ email: email });
            return true;
        }

        return false;
    }
};

module.exports = otpService;