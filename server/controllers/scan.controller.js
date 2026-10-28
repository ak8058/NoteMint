import PDFDocument from "pdfkit";
import Notes from "../models/notes.model.js";
import UserModel from "../models/user.model.js";
import { generateGeminiResponse, generateGeminiResponseFromImages } from "../services/gemini.services.js";

const NOTE_CREDIT_COST = 10;
const PAPER_CREDIT_COST = 5;
const safeFilename = (value, suffix) => `${String(value || "study")
  .replace(/[\r\n"\\/]/g, "")
  .replace(/[^a-z0-9-_ ]/gi, "")
  .trim()
  .slice(0, 80) || "study"}${suffix}`;

const pdfBuffer = async (writeDocument) => new Promise((resolve, reject) => {
  const document = new PDFDocument({ size: "A4", margin: 42 });
  const chunks = [];
  document.on("data", (chunk) => chunks.push(chunk));
  document.on("end", () => resolve(Buffer.concat(chunks)));
  document.on("error", reject);
  writeDocument(document);
  document.end();
});

const createScannedPdf = (images) => pdfBuffer((document) => {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 28;
  images.forEach((image, index) => {
    if (index > 0) document.addPage({ size: "A4", margin });
    document.image(image.buffer, margin, margin, {
      fit: [pageWidth - margin * 2, pageHeight - margin * 2],
      align: "center",
      valign: "center",
    });
  });
});

const validScannedNotes = (content) =>
  content && typeof content.topic === "string" && content.topic.trim() &&
  typeof content.notes === "string" && content.notes.trim() &&
  Array.isArray(content.revisionPoints) &&
  content.subTopics && typeof content.subTopics === "object" &&
  content.questions && Array.isArray(content.questions.short) &&
  Array.isArray(content.questions.long);

export const uploadScannedNotes = async (req, res) => {
  let savedNote;
  try {
    const images = req.files || [];
    if (!images.length) return res.status(400).json({ message: "Choose at least one class-note photo" });
    if (images.some((image) => !["image/jpeg", "image/png"].includes(image.mimetype))) {
      return res.status(400).json({ message: "Use JPEG or PNG images. HEIC photos should be converted to JPEG first." });
    }
    const totalBytes = images.reduce((total, image) => total + image.size, 0);
    if (totalBytes > 10 * 1024 * 1024) {
      return res.status(413).json({ message: "Selected photos are too large. Keep the total under 10 MB." });
    }

    const user = await UserModel.findById(req.userId).select("name credits");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.credits < NOTE_CREDIT_COST) {
      return res.status(403).json({ message: "Saving scanned notes costs 10 credits" });
    }

    const sourcePdf = await createScannedPdf(images);
    if (sourcePdf.length > 10 * 1024 * 1024) {
      return res.status(413).json({ message: "The PDF is too large to save. Try fewer or smaller photos." });
    }

    const prompt = `Read these class-note photos in the given page order. Transcribe the important content accurately, preserve formulas, definitions, examples, tables, and headings where possible, then organize it into clean exam-ready study notes.
Return only JSON with this exact shape:
{"topic":"short subject/topic title","importance":"one short exam relevance label","subTopics":{"⭐⭐⭐":["..."],"⭐⭐":["..."],"⭐":["..."]},"notes":"Markdown study notes","revisionPoints":["..."],"questions":{"short":["..."],"long":["..."],"diagram":"..."}}
Do not invent illegible text. If a small part cannot be read, mark it [unclear] in the notes. The user-supplied subject/title is: ${String(req.body?.title || "Not provided").slice(0, 120)}.`;
    const content = await generateGeminiResponseFromImages(prompt, images);
    if (!validScannedNotes(content)) {
      return res.status(502).json({ message: "Couldn't read these photos clearly. Try sharper, well-lit images." });
    }

    const topic = String(req.body?.title || content.topic).trim().slice(0, 120) || content.topic;
    savedNote = await Notes.create({
      user: req.userId,
      topic,
      content: { ...content, topic },
      sourceType: "scanned",
      sourcePdf,
      sourceFileName: safeFilename(topic, ".pdf"),
      includeDiagram: false,
      includeChart: false,
    });

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.userId, credits: { $gte: NOTE_CREDIT_COST } },
      {
        $inc: { credits: -NOTE_CREDIT_COST },
        $addToSet: { notes: savedNote._id },
        $set: { isCreditAvailable: true },
      },
      { new: true, projection: { credits: 1 } },
    );
    if (!updatedUser) {
      await Notes.deleteOne({ _id: savedNote._id });
      return res.status(403).json({ message: "Saving scanned notes costs 10 credits" });
    }
    if (updatedUser.credits === 0) {
      await UserModel.updateOne({ _id: req.userId }, { $set: { isCreditAvailable: false } });
    }

    return res.status(201).json({
      noteId: savedNote._id,
      topic,
      pages: images.length,
      creditsLeft: updatedUser.credits,
    });
  } catch (error) {
    if (savedNote?._id) await Notes.deleteOne({ _id: savedNote._id }).catch(() => {});
    console.error("Scanned notes processing failed:", error?.name || "UnknownError");
    return res.status(500).json({ message: "Couldn't process these photos. Please try again." });
  }
};

export const downloadScannedPdf = async (req, res) => {
  try {
    const note = await Notes.findOne({ _id: req.params.id, user: req.userId }).select("+sourcePdf sourceFileName sourceType");
    if (!note || note.sourceType !== "scanned" || !note.sourcePdf) {
      return res.status(404).json({ message: "Scanned source PDF not found" });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${note.sourceFileName || "class-notes.pdf"}"`);
    return res.send(note.sourcePdf);
  } catch {
    return res.status(400).json({ message: "Could not download this PDF" });
  }
};

const validPaper = (paper) => paper && Array.isArray(paper.sections) && paper.sections.length > 0 &&
  paper.sections.every((section) => typeof section.title === "string" && Array.isArray(section.questions) && section.questions.length > 0 &&
    section.questions.every((question) => typeof question.text === "string" && question.text.trim() && Number(question.marks) > 0)) &&
  Array.isArray(paper.answerKey);

const createQuestionPaperPdf = (topic, paper) => pdfBuffer((document) => {
  document.fontSize(20).font("Helvetica-Bold").text(paper.title || `${topic} — Question Paper`, { align: "center" });
  document.moveDown(0.5).fontSize(11).font("Helvetica").text(`Topic: ${topic}`, { align: "center" });
  document.text(`Time: ${paper.durationMinutes || 60} minutes     Maximum marks: ${paper.totalMarks || "As indicated"}`, { align: "center" });
  document.moveDown().fontSize(10).text("Name: ____________________________________     Date: ________________");
  document.moveDown().fontSize(11).font("Helvetica-Bold").text("Instructions");
  document.font("Helvetica").fontSize(10).text(paper.instructions || "Answer all questions. Show your working where needed.");

  let number = 1;
  for (const section of paper.sections) {
    document.moveDown().fontSize(14).font("Helvetica-Bold").text(section.title);
    if (section.instructions) document.moveDown(0.25).fontSize(10).font("Helvetica-Oblique").text(section.instructions);
    for (const question of section.questions) {
      document.moveDown(0.65).fontSize(11).font("Helvetica-Bold").text(`${number}. ${question.text}  (${question.marks} marks)`);
      if (Array.isArray(question.options)) {
        question.options.forEach((option, index) => document.moveDown(0.2).font("Helvetica").fontSize(10).text(`${String.fromCharCode(65 + index)}. ${option}`, { indent: 18 }));
      }
      if (question.type === "long") document.moveDown(1.5);
      number += 1;
    }
  }

  document.addPage();
  document.fontSize(18).font("Helvetica-Bold").text("Answer Key & Self-Check", { align: "center" });
  document.moveDown().fontSize(10).font("Helvetica-Oblique").text("Keep this page separate if you are using the question paper as a test.");
  for (const answer of paper.answerKey) {
    document.moveDown(0.6).font("Helvetica-Bold").fontSize(10).text(`${answer.number}. ${answer.answer}`);
    if (answer.explanation) document.moveDown(0.2).font("Helvetica").fontSize(9).text(answer.explanation);
  }
});

export const generateScannedQuestionPaper = async (req, res) => {
  let chargedUser = false;
  let note;
  try {
    note = await Notes.findOne({ _id: req.params.id, user: req.userId }).select("topic content sourceType +questionPaperPdf");
    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.sourceType !== "scanned") return res.status(400).json({ message: "Question papers can be created from scanned class notes" });
    if (note.questionPaperPdf) {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${safeFilename(note.topic, "-question-paper.pdf")}"`);
      return res.send(note.questionPaperPdf);
    }

    const user = await UserModel.findById(req.userId).select("credits");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.credits < PAPER_CREDIT_COST) return res.status(403).json({ message: "Question paper generation costs 5 credits" });

    const sourceText = typeof note.content === "string" ? note.content : JSON.stringify(note.content);
    const prompt = `Create an exam-style question paper based only on the study source below. Make it suitable for self-practice and include a separate answer key with short explanations.
Return JSON with this shape:
{"title":"...","durationMinutes":60,"totalMarks":35,"instructions":"...","sections":[{"title":"Section A","instructions":"...","questions":[{"text":"...","type":"mcq","marks":1,"options":["...","...","...","..."]}]}],"answerKey":[{"number":1,"answer":"...","explanation":"..."}]}
Create a balanced paper with MCQ, short-answer, and long-answer questions. Use sequential question numbers in the answer key. Avoid duplicate questions and do not test facts absent from the source.

Topic: ${note.topic}
Study source:
${sourceText.slice(0, 18000)}`;
    const paper = await generateGeminiResponse(prompt);
    if (!validPaper(paper)) return res.status(502).json({ message: "Question paper generation returned an invalid result. Please try again." });
    const outputPdf = await createQuestionPaperPdf(note.topic, paper);

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.userId, credits: { $gte: PAPER_CREDIT_COST } },
      { $inc: { credits: -PAPER_CREDIT_COST } },
      { new: true, projection: { credits: 1 } },
    );
    if (!updatedUser) return res.status(403).json({ message: "Question paper generation costs 5 credits" });
    chargedUser = true;

    note.questionPaperPdf = outputPdf;
    await note.save();
    if (updatedUser.credits === 0) {
      await UserModel.updateOne({ _id: req.userId }, { $set: { isCreditAvailable: false } });
    }
    res.setHeader("X-Credits-Left", String(updatedUser.credits));
    res.setHeader("Access-Control-Expose-Headers", "X-Credits-Left, Content-Disposition");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeFilename(note.topic, "-question-paper.pdf")}"`);
    return res.send(outputPdf);
  } catch (error) {
    if (chargedUser) await UserModel.updateOne({ _id: req.userId }, { $inc: { credits: PAPER_CREDIT_COST }, $set: { isCreditAvailable: true } }).catch(() => {});
    console.error("Scanned note question paper failed:", error?.name || "UnknownError");
    return res.status(500).json({ message: "Could not create the question paper" });
  }
};
