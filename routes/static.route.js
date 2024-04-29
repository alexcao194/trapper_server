const express = require("express");
const staticRoute = express();
const staticController = require("../controllers/static.controller");

staticRoute.get("/hobbies", staticController.getHobbies);

staticRoute.get("/", (req, res) => {
    res.send("Hello World");
});

module.exports = staticRoute;