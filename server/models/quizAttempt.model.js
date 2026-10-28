import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, default: "" },
  },
  { _id: false },
);

const quizAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true, index: true },
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Notes", required: true },
    topic: { type: String, required: true },
    questions: { type: [quizQuestionSchema], required: true },
    answers: { type: [Number], default: [] },
    score: { type: Number, default: null },
    status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("QuizAttempt", quizAttemptSchema);
