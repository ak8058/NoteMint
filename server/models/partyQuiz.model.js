import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, default: "" },
  },
  { _id: false },
);

const playerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true },
    name: { type: String, required: true },
    answers: { type: [Number], default: [] },
    score: { type: Number, default: null },
    joinedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
  },
  { _id: false },
);

const partyQuizSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true, index: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true, index: true },
    note: { type: mongoose.Schema.Types.ObjectId, ref: "Notes", required: true },
    topic: { type: String, required: true },
    questions: { type: [questionSchema], required: true },
    players: { type: [playerSchema], required: true },
    status: { type: String, enum: ["lobby", "in_progress", "completed"], default: "lobby", index: true },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("PartyQuiz", partyQuizSchema);
