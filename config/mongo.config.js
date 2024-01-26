const MongoClient = require("mongodb").MongoClient;

const URL = `mongodb+srv://alexcao194:admin@trapper.jqj4ffe.mongodb.net/?retryWrites=true&w=majority`;

let client;

async function connectDb() {
  if (!client)
    client = await MongoClient.connect(URL);
  return {
    db: client.db("trapper"),
    client: client
  };
}

async function close() {
  if (client) client.close();
  client = undefined;
}

module.exports = { connectDb, close };
