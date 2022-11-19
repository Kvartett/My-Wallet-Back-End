import express from "express"
import cors from "cors"
import joi from "joi"
import signRouters from "./routes/signRoutes.js"
import balanceRouters from "./routes/balanceRoutes.js"

const app = express()

app.use(cors())
app.use(express.json())
app.use(signRouters)
app.use(balanceRouters)

export const userSchema = joi.object({
    email: joi.string().required().min(7).max(50),
    name: joi.string().required().min(3).max(20),
    password: joi.string().required().min(6).max(50)
})

export const balanceSchema = joi.object({
    email: joi.string().required().min(7).max(50),
    description: joi.string().required(),
    value: joi.number().required(),
    type: joi.string().required().valid("positive", "negative"),
    date: joi.string().required()
})

app.listen(5000, () => console.log("Server running at Port: 5000"))