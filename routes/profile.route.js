const express = require("express");
const profileRoute = express();
const profileController = require("../controllers/profile.controller");
const storageController = require("../controllers/storage.controller");
const jwtMiddleware = require("../middleware/jwt.middleware");
const storage = require("../storage/storage");

profileRoute.get("/", jwtMiddleware.validateToken, profileController.getProfile);

profileRoute.post("/", jwtMiddleware.validateToken, profileController.updateProfile);

profileRoute.post("/avatar", storage.upload.single('avatar'), storageController.uploadAvatar);

module.exports = profileRoute;
