const { connectDb } = require('../config/mongo.config');
const validateUtils = require('../utils/validator');
const constants = require('../utils/constants');

const staticController = {
    getHobbies: async (req, res) => {
        const hobbies = await getHobbies();

        if (!hobbies) {
            return res.status(404).send("Hobbies not found!");
        }

        res.send(hobbies);
    }
}

const getHobbies = async () => {
    const { db, client } = await connectDb();
    const hobbiesCollection = db.collection(constants.HOBBIES);

    // get all to array
    const hobbies = await hobbiesCollection.find().toArray();
    if (!hobbies) {
        return null
    }

    return hobbies;
}

module.exports = staticController;