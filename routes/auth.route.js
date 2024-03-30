const express = require("express");
const authRouter = express();
const authController = require("../controllers/auth.controller");
const jwtMiddleware = require("../middleware/jwt.middleware");

authRouter.post("/login", authController.login);

authRouter.post("/registry", authController.registry);

authRouter.get("/refresh_token", authController.refreshToken);

authRouter.put("/validate", jwtMiddleware.validateToken, authController.validate);

module.exports = authRouter;
