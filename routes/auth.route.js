const express = require("express");
const authRouter = express();
const authController = require("../controllers/auth.controller");
const jwtMiddleware = require("../middleware/jwt.middleware");

authRouter.post("/", authController.auth);

authRouter.post("/refresh-token", authController.refreshToken);

module.exports = authRouter;
