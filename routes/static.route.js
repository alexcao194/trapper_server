const express = require("express");
const staticRoute = express();
const staticController = require("../controllers/static.controller");

staticRoute.get("/hobbies", staticController.getHobbies);

module.exports = staticRoute;