const authRouter = require("./auth.route");
const profileRouter = require("./profile.route");
const accountRouter = require("./account.route");

const router = {
  authRouter,
  profileRouter,
  accountRouter
};

module.exports = {
  router
};