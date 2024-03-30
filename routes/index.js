const authRouter = require("./auth.route");
const profileRouter = require("./profile.route");

const router = {
  authRouter,
  profileRouter
};

module.exports = {
  router
};