import express from "express"
import cors from "cors"
import joi from "joi"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import { v4 as uuid } from "uuid"
import bcrypt from "bcrypt"
import dayjs from "dayjs"


const app = express()
dotenv.config()
app.use(cors())
app.use(express.json())
dayjs.locale("pt-br")


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
const sessionsCollection = db.collection("session")

const userSchema = joi.object({
    email: joi.string().required().min(7).max(50),
    name: joi.string().required().min(3).max(20),
    password: joi.string().required().min(6).max(50)
})

const balanceSchema = joi.object({
    email: joi.string().required().min(7).max(50),
    value: joi.number().required(),
    type: joi.string().required().valid("positive", "negative"),
    date: joi.string().required()
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
        await usersCollection.insertOne({ email, password: passwordHash, name })
        res.status(201).send("Usuario cadastrado!")
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.post("/auth/sign-in", async (req, res) => {
    const { email, password } = req.body

    try {
        const userExist = await usersCollection.findOne({ email: email })

        if (userExist && bcrypt.compareSync(password, userExist.password)) {
            const token = uuid()

            await sessionsCollection.insertOne({ token, userId: userExist.ObjectID, email })
            res.status(200).send({ name: userExist.name, token })
        } else {
            res.status(500).send("Usuario não encontrado! E-mail ou senha incorretos.")
        }
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.post("/balance", async (req, res) => {
    const { value, type, email } = req.body
    const { authorization } = req.headers
    const token = authorization?.replace("Bearer ", "")

    if (!token) return res.sendStatus(401)

    const session = await sessionsCollection.findOne({ token })

    if (!session) res.sendStatus(401)

    const balance = {
        email,
        value,
        type,
        date: dayjs().format("DD/MM")
    }

    try {
        const { error } = balanceSchema.validate(balance, { abortEarly: false })

        if (error) {
            const errors = error.details.map((detail) => detail.message)
            return res.status(422).send(errors)
        }
        await balanceCollection.insertOne(balance)
        res.status(201).send("Balance saved")
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.get("/balance", async (req, res) => {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')

    if (!token) return res.sendStatus(401)

    const session = await sessionsCollection.findOne({ token })

    if (!session) res.sendStatus(401)

    try {
        const userBalance = await balanceCollection.find({ email: session.email }).toArray()
        if (userBalance.length === 0) {
            return res.status(404).send("Não foi encontrado nenhum lançamento!")
        }

        res.send(userBalance)
    } catch (err) {
        console.log(err)
        res.sendStatus(500)
    }
})

app.listen(5000, () => console.log("Server running at Port: 5000"))
