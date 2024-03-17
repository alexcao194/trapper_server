const MongoClient = require("mongodb").MongoClient;

const URL = `mongodb+srv://alexcao194:admin@trapper.jqj4ffe.mongodb.net/?retryWrites=true&w=majority`;
const DB_NAME = "trapper";

let client;

async function connectDb() {
    if (!client) {
        client = await MongoClient.connect(URL);
    }

    return {
        db: client.db(DB_NAME),
        client: client
    };
}

async function close() {
    if (client) {
        client.close();
    }

    client = undefined;
}

module.exports = { connectDb, close };
