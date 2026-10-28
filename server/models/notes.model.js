import mongoose from "mongoose";

const notesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    classLevel: String,
    examType: String,
    revisionMode: {
        type: Boolean,
        default: false
    },
    includeDiagram: Boolean,
    includeChart: Boolean,

    content: {
        type: mongoose.Schema.Types.Mixed, // AI response (string / JSON)
        required: true
    },
    sourceType: {
        type: String,
        enum: ["generated", "scanned"],
        default: "generated"
    },
    sourcePdf: {
        type: Buffer,
        select: false
    },
    sourceFileName: String,
    questionPaperPdf: {
        type: Buffer,
        select: false
    },
    revision: {
        dueAt: { type: Date, default: null },
        lastStudiedAt: { type: Date, default: null },
        intervalDays: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 }
    },
}, { timestamps: true })

const Notes = mongoose.model("Notes", notesSchema)

export default Notes
