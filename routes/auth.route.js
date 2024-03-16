const express = require("express");
const authRouter = express();
const authController = require("../controllers/auth.controller");
const jwtMiddleware = require("../middleware/jwt.middleware");

authRouter.post("/login", authController.login);

authRouter.post("/registry", authController.registry);

authRouter.post("/refresh-token", authController.refreshToken);

authRouter.get("/profile", jwtMiddleware.validateToken, authController.getProfile);

module.exports = authRouter;
