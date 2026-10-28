import express from "express";
import isAuth from "../middleware/isAuth.js";
import { getQuizAttempt, getQuizResults, submitQuizAttempt } from "../controllers/quiz.controller.js";

const quizRouter = express.Router();

quizRouter.get("/results", isAuth, getQuizResults);
quizRouter.get("/attempts/:attemptId", isAuth, getQuizAttempt);
quizRouter.post("/attempts/:attemptId/submit", isAuth, submitQuizAttempt);

export default quizRouter;
