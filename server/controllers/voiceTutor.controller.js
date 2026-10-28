import Notes from "../models/notes.model.js";
import { generateGeminiResponse } from "../services/gemini.services.js";

const getNote = (id, userId) => Notes.findOne({ _id: id, user: userId }).select("topic content");
const sourceOf = (note) => (typeof note.content === "string" ? note.content : JSON.stringify(note.content)).slice(0, 16000);

export const askVoiceTutor = async (req, res) => {
  try {
    const note = await getNote(req.params.id, req.userId);
    if (!note) return res.status(404).json({ message: "Note not found" });
    const question = await generateGeminiResponse(`Create one clear spoken tutor question from ONLY these notes. Return JSON {"question":"...","hint":"..."}. Do not include answer. Topic: ${note.topic}\nNotes: ${sourceOf(note)}`);
    if (typeof question.question !== "string" || !question.question.trim()) return res.status(502).json({ message: "Could not create a question" });
    return res.json({ ...question, topic: note.topic });
  } catch (error) {
    console.error("Voice tutor question failed:", error?.status || error?.name || "UnknownError");
    if (error?.status === 401 || error?.status === 403) return res.status(503).json({ message: "AI service access is not configured correctly. Check the server's AI access settings." });
    if (error?.status === 429) return res.status(503).json({ message: "AI service is busy or its usage limit was reached. Try again later." });
    return res.status(500).json({ message: error?.name === "SyntaxError" ? "AI returned an unreadable question. Please try again." : "Voice tutor could not create a question. Check the server log for the safe error code." });
  }
};

export const evaluateVoiceAnswer = async (req, res) => {
  try {
    const answer = String(req.body?.answer || "").trim().slice(0, 1500);
    const question = String(req.body?.question || "").trim().slice(0, 500);
    if (!answer || !question) return res.status(400).json({ message: "Question and spoken answer are required" });
    const note = await getNote(req.params.id, req.userId);
    if (!note) return res.status(404).json({ message: "Note not found" });
    const result = await generateGeminiResponse(`Act as a kind, precise teacher. Evaluate the student's answer based ONLY on the notes. Accept equivalent wording and math notation. Output valid JSON with all fields: correct (boolean), feedback (one sentence), correctAnswer (string), explanation (simple teacher-style reasoning), nextQuestion (one short follow-up question from these notes). Do not omit fields. Topic: ${note.topic}\nNotes: ${sourceOf(note)}\nQuestion: ${question}\nStudent answer: ${answer}`);
    const correct = result?.correct === true || result?.correct === "true";
    if (typeof result?.correct !== "boolean" && result?.correct !== "true" && result?.correct !== "false") {
      console.error("Voice tutor answer response invalid:", "MissingBoolean");
      return res.status(502).json({ message: "AI returned an incomplete evaluation. Please try again." });
    }
    return res.json({
      correct,
      feedback: String(result.feedback || (correct ? "You got it right." : "Not quite—let’s review the idea.")),
      correctAnswer: String(result.correctAnswer || "Review the explanation below."),
      explanation: String(result.explanation || result.feedback || "Compare your answer with the key idea in the notes."),
      nextQuestion: String(result.nextQuestion || "Would you like another question from these notes?"),
    });
  } catch (error) {
    console.error("Voice tutor evaluation failed:", error?.name || "UnknownError");
    return res.status(500).json({ message: "Voice tutor could not evaluate this answer" });
  }
};
