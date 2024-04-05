const authRouter = require("./auth.route");
const profileRouter = require("./profile.route");
const accountRouter = require("./account.route");
const staticRouter = require("./static.route");

const router = {
  authRouter,
  profileRouter,
  accountRouter,
  staticRouter
};

module.exports = {
  router
};