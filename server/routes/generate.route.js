import express from "express"
import isAuth from "../middleware/isAuth.js"
import { generateNotes } from "../controllers/generate.controller.js"
import { getDueRevisions, getMyNotes, getSingleNotes, markNoteStudied } from "../controllers/notes.controller.js"
import { generateNotesQuiz } from "../controllers/quiz.controller.js"
import multer from "multer"
import { downloadScannedPdf, generateScannedQuestionPaper, uploadScannedNotes } from "../controllers/scan.controller.js"
import { askVoiceTutor, evaluateVoiceAnswer } from "../controllers/voiceTutor.controller.js"


const notesRouter=express.Router()
const receiveImages = multer({
  storage: multer.memoryStorage(),
  limits: { files: 10, fileSize: 4 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, ["image/jpeg", "image/png"].includes(file.mimetype)),
})

notesRouter.post("/upload-images", isAuth, (req, res, next) => {
  receiveImages.array("images", 10)(req, res, (error) => {
    if (error) return res.status(400).json({ message: "Upload up to 10 JPEG or PNG photos, 4 MB each." })
    next()
  })
}, uploadScannedNotes)
notesRouter.get("/:id/source-pdf", isAuth, downloadScannedPdf)
notesRouter.post("/:id/question-paper", isAuth, generateScannedQuestionPaper)

notesRouter.post("/generate-notes",isAuth,generateNotes)
notesRouter.get("/getnotes",isAuth,getMyNotes)
notesRouter.get("/revision/due",isAuth,getDueRevisions)
notesRouter.post("/:id/revision/studied",isAuth,markNoteStudied)
notesRouter.post("/:id/quiz",isAuth,generateNotesQuiz)
notesRouter.post("/:id/voice-tutor/question",isAuth,askVoiceTutor)
notesRouter.post("/:id/voice-tutor/answer",isAuth,evaluateVoiceAnswer)
notesRouter.get("/:id",isAuth,getSingleNotes)

export default notesRouter
