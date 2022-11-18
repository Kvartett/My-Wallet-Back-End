import { MongoClient } from "mongodb";
import dotenv from "dotenv"
dotenv.config()

const mongoClient = new MongoClient(process.env.MONGO_URI)

try {
    await mongoClient.connect();
    console.log("MongoDB connected")
} catch (err) {
    console.log(err)
}

const db = mongoClient.db("mywallet")
export const usersCollection = db.collection("users")
export const balanceCollection = db.collection("balance")
export const sessionsCollection = db.collection("session")