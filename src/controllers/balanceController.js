import { balanceSchema } from "../models/balance.model.js"
import { sessionsCollection, balanceCollection } from "../database/db.js"
import dayjs from "dayjs"
dayjs.locale("pt-br")

export async function postBalance(req, res) {
    const { value, type, email, description } = req.body
    const token = res.locals.token
    const session = await sessionsCollection.findOne({ token })

    if (!session) res.sendStatus(401)

    const balance = {
        email,
        description,
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
}

export async function getBalance(req, res) {
    const token = res.locals.token
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
}