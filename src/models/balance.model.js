import joi from "joi"

export const balanceSchema = joi.object({
    email: joi.string().required().min(7).max(50),
    description: joi.string().required(),
    value: joi.number().required(),
    type: joi.string().required().valid("positive", "negative"),
    date: joi.string().required()
})