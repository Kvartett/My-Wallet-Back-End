import { postBalance, getBalance } from "../controllers/balanceController.js"
import { Router } from "express"
import { validateToken } from "../middlewares/validate.token.middleware.js"

const router = Router()

router.post("/balance", validateToken, postBalance)

router.get("/balance", validateToken, getBalance)

export default router