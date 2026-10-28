import Notes from "../models/notes.model.js"

const revisionSelect = "topic classLevel examType sourceType createdAt revision";

export const getDueRevisions = async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.userId, "revision.dueAt": { $lte: new Date() } })
            .select(revisionSelect).sort({ "revision.dueAt": 1 });
        return res.json(notes);
    } catch {
        return res.status(500).json({ message: "Could not load today's revisions" });
    }
};

export const markNoteStudied = async (req, res) => {
    try {
        const note = await Notes.findOne({ _id: req.params.id, user: req.userId });
        if (!note) return res.status(404).json({ message: "Note not found" });

        const intervalDays = note.revision?.intervalDays || 0;
        const nextInterval = intervalDays === 0 ? 1 : intervalDays === 1 ? 3 : intervalDays === 3 ? 7 : 14;
        const studiedAt = new Date();
        note.revision = {
            lastStudiedAt: studiedAt,
            intervalDays: nextInterval,
            dueAt: new Date(studiedAt.getTime() + nextInterval * 24 * 60 * 60 * 1000),
            reviewCount: (note.revision?.reviewCount || 0) + 1,
        };
        await note.save();
        return res.json({ noteId: note._id, revision: note.revision });
    } catch {
        return res.status(500).json({ message: "Could not update this revision plan" });
    }
};


export const getMyNotes = async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.userId }).select("topic classLevel examType revisionMode includeDiagram includeChart sourceType sourceFileName createdAt").sort({ createdAt: -1 })
        if (!notes) {
            return res.status(404).json({
                error: "Note not found"
            });
        }
        return res.status(200).json(notes)
    } catch (error) {
        return res.status(500).json({ message: `getCurrentUser notes error ${error}` })
    }
}

export const getSingleNotes = async (req, res) => {
    try {
        const notes = await Notes.findOne({
            _id: req.params.id,
            user: req.userId
        })
        if (!notes) {
            return res.status(404).json({
                error: "Note not found"
            });
        }
        return res.json({
            content: notes.content,
            topic: notes.topic,
            sourceType: notes.sourceType,
            createdAt: notes.createdAt
        });
    } catch (error) {
        return res.status(500).json({ message: `getSingle notes error ${error}` })
    }
}

