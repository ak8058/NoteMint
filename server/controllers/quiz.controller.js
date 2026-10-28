import Notes from "../models/notes.model.js";
import UserModel from "../models/user.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";
import { generateQuizQuestions } from "../utils/quizGenerator.js";

const QUIZ_CREDIT_COST = 5;

export const generateNotesQuiz = async (req, res) => {
  try {
    const note = await Notes.findOne({ _id: req.params.id, user: req.userId });
    if (!note) return res.status(404).json({ message: "Note not found" });

    const user = await UserModel.findById(req.userId).select("credits");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.credits < QUIZ_CREDIT_COST) {
      return res
        .status(403)
        .json({ message: "You need at least 5 credits to create this quiz" });
    }

    const questions = await generateQuizQuestions(note);

    const attempt = await QuizAttempt.create({
      user: req.userId,
      note: note._id,
      topic: note.topic,
      questions,
    });

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.userId, credits: { $gte: QUIZ_CREDIT_COST } },
      { $inc: { credits: -QUIZ_CREDIT_COST } },
      { new: true, projection: { credits: 1 } },
    );
    if (!updatedUser) {
      await QuizAttempt.deleteOne({ _id: attempt._id });
      return res
        .status(403)
        .json({ message: "You need at least 5 credits to create this quiz" });
    }

    return res.status(200).json({
      attemptId: attempt._id,
      questions: questions.map(({ question, options }) => ({ question, options })),
      topic: note.topic,
      creditsLeft: updatedUser.credits,
      creditCost: QUIZ_CREDIT_COST,
    });
  } catch {
    return res
      .status(500)
      .json({ message: "Quiz generation failed. Please try again." });
  }
};

const serializeAttempt = (attempt) => ({
  attemptId: attempt._id,
  topic: attempt.topic,
  status: attempt.status,
  score: attempt.score,
  total: attempt.questions.length,
  answers: attempt.answers,
  questions: attempt.questions.map((question) => ({
    question: question.question,
    options: question.options,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
  })),
  createdAt: attempt.createdAt,
  completedAt: attempt.completedAt,
});

export const submitQuizAttempt = async (req, res) => {
  try {
    const { answers } = req.body || {};
    if (!Array.isArray(answers) || answers.length !== 10 || answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3)) {
      return res.status(400).json({ message: "Please submit one answer for each question" });
    }

    const attempt = await QuizAttempt.findOne({ _id: req.params.attemptId, user: req.userId });
    if (!attempt) return res.status(404).json({ message: "Quiz attempt not found" });
    if (attempt.status === "completed") return res.json(serializeAttempt(attempt));
    if (attempt.questions.length !== 10) {
      return res.status(409).json({ message: "This quiz attempt is incomplete. Please start a new quiz." });
    }

    const score = attempt.questions.reduce((total, question, index) =>
      total + (answers[index] === question.correctIndex ? 1 : 0), 0);
    attempt.answers = answers;
    attempt.score = score;
    attempt.status = "completed";
    attempt.completedAt = new Date();
    await attempt.save();

    return res.json(serializeAttempt(attempt));
  } catch (error) {
    console.error("Quiz result save failed:", error?.name || "UnknownError");
    return res.status(500).json({ message: "Could not save quiz result" });
  }
};

export const getQuizAttempt = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({ _id: req.params.attemptId, user: req.userId });
    if (!attempt) return res.status(404).json({ message: "Quiz attempt not found" });
    const result = serializeAttempt(attempt);
    if (attempt.status !== "completed") {
      result.questions = attempt.questions.map(({ question, options }) => ({ question, options }));
      result.answers = [];
    }
    return res.json(result);
  } catch {
    return res.status(400).json({ message: "Invalid quiz attempt" });
  }
};

export const getQuizResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.userId, status: "completed" })
      .select("topic score questions createdAt completedAt")
      .sort({ completedAt: -1 })
      .lean();
    return res.json(attempts.map((attempt) => ({
      attemptId: attempt._id,
      topic: attempt.topic,
      score: attempt.score,
      total: attempt.questions?.length || 10,
      createdAt: attempt.createdAt,
      completedAt: attempt.completedAt,
    })));
  } catch {
    return res.status(500).json({ message: "Could not load quiz results" });
  }
};
