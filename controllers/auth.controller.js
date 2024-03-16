const jwtService = require("../jwt/jwt.service");
const { connectDb } = require('../config/mongo.config');
const { v4: uuidv4 } = require("uuid");
const { Timestamp } = require("mongodb");
const validator = require('validator');

const authController = {
  login: async (req, res, next) => {

    const { db, client } = await connectDb();
    const usersCollection = db.collection('users');

    const loginData = req.body;

    if (!loginData || !loginData.email || !loginData.password) {
      return res.status(400).send("Please enter valid data!");
    }

    const user = await usersCollection.findOne(
      { email: loginData.email }
    );

    if (!user) {
      return res.status(400).send("Email or password is wrong!");
    }

    if (user && user.password !== loginData.password) {
      return res.status(400).send("Email or password is wrong!");
    }

    const payload = { id: user.id, email: user.email };

    const accessToken = jwtService.getAccessToken(payload);
    const refreshToken = await jwtService.getRefreshToken(payload);

    res.send({ accessToken, refreshToken });
  },

  registry: async (req, res, next) => {

    const { db, client } = await connectDb();
    const usersCollection = db.collection('users');
    const profilesCollection = db.collection('profiles');

    const registryData = req.body;

    if (!registryData) {
      return res.status(400).send("Please enter valid data!");
    }

    if (!validateEmail(registryData.email)) {
      return res.status(400).send("Please enter valid email!");
    }

    if (!validatePassword(registryData.password)) {
      return res.status(400).send("Please enter valid password!");
    }

    if (await isUserExists(registryData.email)) {
      return res.status(400).send("User already exists!");
    }

    await usersCollection.insertOne(
      {
        email: registryData.email,
        password: registryData.password,
      }
    );

    // TODO: add profile

    const payload = { email: registryData.email };

    const accessToken = jwtService.getAccessToken(payload);
    const refreshToken = await jwtService.getRefreshToken(payload);

    res.send({ accessToken, refreshToken });
  },

  refreshToken: async (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(403).send("Access is forbidden");
    }

    try {
      const newTokens = await jwtService.refreshToken(refreshToken, res);
      res.send(newTokens);
    } catch (err) {
      const message = (err && err.message) || err;
      res.status(403).send(message);
    }
  },

  getProfile: async (req, res) => {
    const { db, client } = await connectDb();
    const profilesCollection = db.collection('profiles');

    const profile = await profilesCollection.findOne(
      { email: req.user.email }
    );

    if (!profile) {
      return res.status(404).send("Profile not found!");
    }

    res.send(profile);
  },

  updateProfile: async (req, res) => {
    const { db, client } = await connectDb();
    const profilesCollection = db.collection('profiles');
    
  }
};

const validateEmail = (email) => {
  if (!email) {
    return false;
  }

  return validator.isEmail(email);
}

const validatePassword = (password) => {
  if (!password) {
    return false;
  }

  return validator.isStrongPassword(password);
}

const isUserExists = async (email) => {

  const { db, client } = await connectDb();
  const usersCollection = db.collection('users');

  const user = await usersCollection.findOne(
    { email: email }
  );

  if (user) {
    return true;
  }

  return false
}

module.exports = authController;
