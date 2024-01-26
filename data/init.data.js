const { client, connectDb } = require("../config/mongo.config")
const mockDB = require("./data.mock")

async function dataLoad() {
  const { db, client } = await connectDb()
  const usersCollection = db.collection("users")
  const todosCollection = db.collection("todos")
  await usersCollection.insertMany([...mockDB.users])
  await todosCollection.insertMany([...mockDB.todos])
}

module.exports = dataLoad;
