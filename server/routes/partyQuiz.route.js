import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
  createPartyQuiz,
  getPartyQuiz,
  joinPartyQuiz,
  startPartyQuiz,
  submitPartyQuiz,
} from "../controllers/partyQuiz.controller.js";

const partyQuizRouter = express.Router();

partyQuizRouter.post("/", isAuth, createPartyQuiz);
partyQuizRouter.get("/:code", isAuth, getPartyQuiz);
partyQuizRouter.post("/:code/join", isAuth, joinPartyQuiz);
partyQuizRouter.post("/:code/start", isAuth, startPartyQuiz);
partyQuizRouter.post("/:code/submit", isAuth, submitPartyQuiz);

export default partyQuizRouter;
