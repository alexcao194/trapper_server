const express = require("express");
const messageRoute = express();
const storageController = require("../controllers/storage.controller");
const jwtMiddleware = require("../middleware/jwt.middleware");
const storage = require("../storage/storage");

messageRoute.post("/image", jwtMiddleware.validateToken, storage.imageMessageUpload.single('photo_url'), storageController.sendImageMessage);

module.exports = messageRoute;
