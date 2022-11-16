import express from "express"
import cors from "cors"
import joi from "joi"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import { v4 as uuid } from "uuid"
import bcrypt from "bcrypt"

const token = uuid()

const app = express()
dotenv.config()
app.use(cors())
app.use(express.json())


const mongoClient = new MongoClient(process.env.MONGO_URI)

try {
    await mongoClient.connect();
    console.log("MongoDB connected")
} catch (err) {
    console.log(err)
}

const db = mongoClient.db("mywallet")
const usersCollection = db.collection("users")
const balanceCollection = db.collection("balance")
const sessionCollection = db.collection("session")

const userSchema = joi.object({
    email: joi.string().required().min(7).max(50),
    name: joi.string().required().min(3).max(20),
    password: joi.string().required().min(6).max(50)
})

app.post("/auth/sign-up", async (req, res) => {
    const { email, password, name } = req.body

    const { error } = userSchema.validate({ email, password, name }, { abortEarly: false })

    if (error) {
        const errors = error.details.map((detail) => detail.message)
        return res.status(422).send(errors)
    }

    try {
        const userExist = await usersCollection.findOne({ email: email })

        if (userExist) {
            return res.status(409).send("E-mail ja cadastrado!")
        }
        const passwordHash = bcrypt.hashSync(password, 12)
        await usersCollection.insertOne({ email, password: passwordHash, name, token })
        res.status(201).send("Usuario cadastrado!")
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})


app.listen(5000, () => console.log("Server running at Port: 5000"))
