const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { router } = require("./routes/index");
const cors = require("cors");
const { connectDb } = require("./config/mongo.config");
const app = express();

// Kết nối tới CSDL ngay khi server khởi động
connectDb().then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("Failed to connect to MongoDB", err);
});

app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", router.authRouter);
app.use("/profile", router.profileRouter);
app.use("/account", router.accountRouter);
app.use("/", router.staticRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

module.exports = app;
