import { generateGeminiResponse } from "../services/gemini.services.js";

export const generateQuizQuestions = async (note) => {
  const sourceNotes = typeof note.content === "string"
    ? note.content
    : JSON.stringify(note.content);
  const prompt = `Create exactly 10 multiple-choice quiz questions based only on the study notes below.
Return only valid JSON with this shape:
{"questions":[{"question":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"..."}]}
Rules: exactly 10 questions; exactly 4 distinct options per question; correctIndex is zero-based; explanations are short and grounded in the notes; do not add facts absent from the notes; vary difficulty and test understanding.

Topic: ${note.topic}
Class/level: ${note.classLevel || "Not specified"}
Exam type: ${note.examType || "Not specified"}

Study notes:
${sourceNotes.slice(0, 18000)}`;

  const generated = await generateGeminiResponse(prompt);
  const questions = generated?.questions;
  const valid = Array.isArray(questions) && questions.length === 10 && questions.every((item) =>
    typeof item?.question === "string" && item.question.trim() &&
    Array.isArray(item.options) && item.options.length === 4 &&
    item.options.every((option) => typeof option === "string" && option.trim()) &&
    Number.isInteger(item.correctIndex) && item.correctIndex >= 0 && item.correctIndex < 4 &&
    typeof item.explanation === "string"
  );
  if (!valid) throw new Error("Invalid quiz output");
  return questions;
};
