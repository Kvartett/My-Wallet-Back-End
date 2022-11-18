import { signUp, signIn } from "../controllers/signController.js"
import { Router } from "express"

const router = Router()

router.post("/auth/sign-up", signUp)

router.post("/auth/sign-in", signIn)

export default router