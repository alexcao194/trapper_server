const express = require("express");
const accountRouter = express();
const accountController = require("../controllers/account.controller");
const jwtMiddleware = require("../middleware/jwt.middleware");

accountRouter.post("/password/change", jwtMiddleware.validateToken, accountController.changePassword);

module.exports = accountRouter;
