import express from "express"
import isAuth from "../middleware/isAuth.js"
import { confirmCreditsPurchase, createCreditsOrder } from "../controllers/credits.controller.js"


const creditRouter=express.Router()

creditRouter.post("/order",isAuth,createCreditsOrder)
creditRouter.post("/confirm",isAuth,confirmCreditsPurchase)


export default creditRouter
