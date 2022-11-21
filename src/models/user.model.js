import joi from "joi"

export const userSchema = joi.object({
    email: joi.string().required().min(7).max(50),
    name: joi.string().required().min(3).max(20),
    password: joi.string().required().min(6).max(50)
})