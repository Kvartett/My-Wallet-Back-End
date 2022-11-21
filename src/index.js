import express from "express"
import cors from "cors"
import signRouters from "./routes/signRoutes.js"
import balanceRouters from "./routes/balanceRoutes.js"

const app = express()

app.use(cors())
app.use(express.json())
app.use(signRouters)
app.use(balanceRouters)

app.listen(5000, () => console.log("Server running at Port: 5000"))