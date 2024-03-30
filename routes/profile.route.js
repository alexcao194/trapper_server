const express = require("express");
const profileRoute = express();
const profileController = require("../controllers/profile.controller");
const jwtMiddleware = require("../middleware/jwt.middleware");

profileRoute.get("/profile", jwtMiddleware.validateToken, profileController.getProfile);

profileRoute.post("/profile", jwtMiddleware.validateToken, profileController.updateProfile);

module.exports = profileRoute;
