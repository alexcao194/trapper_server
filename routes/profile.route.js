const express = require("express");
const profileController = require("../controllers/profile.controller");
const jwtMiddleware = require("../middleware/jwt.middleware");
const profileRouter = express();

profileRouter.use(jwtMiddleware.validateToken)

profileRouter.get(
    "/",
    profileController.getProfile
  );

module.exports = profileRouter;
