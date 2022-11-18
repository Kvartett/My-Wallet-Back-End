import { postBalance, getBalance } from "../controllers/balanceController.js"
import { Router } from "express"

const router = Router()

router.post("/balance", postBalance)

router.get("/balance", getBalance)

export default router