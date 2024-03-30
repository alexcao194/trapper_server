const express = require("express");
const profileRoute = express();
const profileController = require("../controllers/profile.controller");
const jwtMiddleware = require("../middleware/jwt.middleware");

profileRoute.get("/", jwtMiddleware.validateToken, profileController.getProfile);

profileRoute.post("/", jwtMiddleware.validateToken, profileController.updateProfile);

module.exports = profileRoute;
