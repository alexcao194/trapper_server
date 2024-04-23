const express = require("express");
const authRouter = express();
const authController = require("../controllers/auth.controller");
const jwtMiddleware = require("../middleware/jwt.middleware");

authRouter.post("/login", authController.login);

authRouter.post("/registry", authController.registry);

authRouter.get("/refresh_token", authController.refreshToken);

authRouter.get("/validate", jwtMiddleware.validateToken, authController.validate);

authRouter.post("/identify_email", authController.identifyEmail);

authRouter.post("/forgot_password", authController.forgotPassword);

module.exports = authRouter;
