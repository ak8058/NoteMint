import { randomBytes } from "node:crypto";
import Notes from "../models/notes.model.js";
import UserModel from "../models/user.model.js";
import PartyQuiz from "../models/partyQuiz.model.js";
import { generateQuizQuestions } from "../utils/quizGenerator.js";

const QUIZ_CREDIT_COST = 5;

const rankPlayers = (players) =>
  [...players]
    .sort(
      (a, b) =>
        b.score - a.score || new Date(a.submittedAt) - new Date(b.submittedAt),
    )
    .map((player, index) => ({
      rank: index + 1,
      userId: String(player.user),
      name: player.name,
      score: player.score,
      total: 10,
      submittedAt: player.submittedAt,
    }));

const roomResponse = (room, userId) => {
  const completed = room.status === "completed";
  const currentPlayer = room.players.find(
    (player) => String(player.user) === String(userId),
  );
  const response = {
    code: room.code,
    topic: room.topic,
    status: room.status,
    hostId: String(room.host),
    isHost: String(room.host) === String(userId),
    players: room.players.map((player) => ({
      userId: String(player.user),
      name: player.name,
      isHost: String(player.user) === String(room.host),
      submitted: Boolean(player.submittedAt),
      score: completed ? player.score : undefined,
    })),
    mySubmitted: Boolean(currentPlayer?.submittedAt),
    createdAt: room.createdAt,
  };

  if (room.status === "in_progress") {
    response.questions = room.questions.map(({ question, options }) => ({
      question,
      options,
    }));
  }
  if (completed) {
    response.leaderboard = rankPlayers(room.players);
    response.questions = room.questions.map(
      ({ question, options, correctIndex, explanation }) => ({
        question,
        options,
        correctIndex,
        explanation,
      }),
    );
    response.myAnswers = currentPlayer?.answers || [];
  }
  return response;
};

export const createPartyQuiz = async (req, res) => {
  let room;
  try {
    const { noteId } = req.body || {};
    const note = await Notes.findOne({ _id: noteId, user: req.userId });
    if (!note)
      return res
        .status(404)
        .json({ message: "Choose one of your saved notes first" });

    const user = await UserModel.findById(req.userId).select("name credits");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.credits < QUIZ_CREDIT_COST) {
      return res.status(403).json({ message: "A room quiz costs 5 credits" });
    }

    const questions = await generateQuizQuestions(note);
    const code = randomBytes(6).toString("hex").toUpperCase();
    room = await PartyQuiz.create({
      code,
      host: req.userId,
      note: note._id,
      topic: note.topic,
      questions,
      players: [{ user: req.userId, name: user.name || "Host" }],
    });

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.userId, credits: { $gte: QUIZ_CREDIT_COST } },
      { $inc: { credits: -QUIZ_CREDIT_COST } },
      { new: true, projection: { credits: 1 } },
    );
    if (!updatedUser) {
      await PartyQuiz.deleteOne({ _id: room._id });
      return res.status(403).json({ message: "A room quiz costs 5 credits" });
    }

    return res.status(201).json({
      room: roomResponse(room, req.userId),
      creditsLeft: updatedUser.credits,
    });
  } catch (error) {
    if (room?._id) await PartyQuiz.deleteOne({ _id: room._id }).catch(() => {});
    console.error(
      "Party quiz room creation failed:",
      error?.name || "UnknownError",
    );
    return res.status(500).json({ message: "Could not create the quiz room" });
  }
};

export const joinPartyQuiz = async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    let room = await PartyQuiz.findOne({ code });
    if (!room)
      return res
        .status(404)
        .json({ message: "Invite link is invalid or expired" });

    const existingPlayer = room.players.find(
      (player) => String(player.user) === String(req.userId),
    );
    if (existingPlayer) return res.json(roomResponse(room, req.userId));
    if (room.status !== "lobby")
      return res.status(409).json({ message: "This room has already started" });

    const user = await UserModel.findById(req.userId).select("name");
    if (!user) return res.status(404).json({ message: "User not found" });
    const updatedRoom = await PartyQuiz.findOneAndUpdate(
      {
        _id: room._id,
        status: "lobby",
        players: { $not: { $elemMatch: { user: req.userId } } },
      },
      { $push: { players: { user: req.userId, name: user.name || "Player" } } },
      { new: true },
    );
    if (!updatedRoom) {
      room = await PartyQuiz.findById(room._id);
      const alreadyJoined = room?.players.some(
        (player) => String(player.user) === String(req.userId),
      );
      if (!room) return res.status(404).json({ message: "Room not found" });
      if (alreadyJoined) return res.json(roomResponse(room, req.userId));
      return res.status(409).json({ message: "This room has already started" });
    }
    room = updatedRoom;
    return res.json(roomResponse(room, req.userId));
  } catch (error) {
    console.error("Party quiz join failed:", error?.name || "UnknownError");
    return res.status(500).json({ message: "Could not join this room" });
  }
};

export const getPartyQuiz = async (req, res) => {
  try {
    const room = await PartyQuiz.findOne({
      code: req.params.code.toUpperCase(),
    });
    if (!room) return res.status(404).json({ message: "Room not found" });
    return res.json(roomResponse(room, req.userId));
  } catch {
    return res.status(400).json({ message: "Invalid room code" });
  }
};

export const startPartyQuiz = async (req, res) => {
  try {
    const room = await PartyQuiz.findOne({
      code: req.params.code.toUpperCase(),
    });
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (String(room.host) !== String(req.userId))
      return res
        .status(403)
        .json({ message: "Only the host can start this quiz" });
    if (room.status !== "lobby")
      return res.status(409).json({ message: "This quiz has already started" });
    if (room.players.length < 2)
      return res
        .status(409)
        .json({ message: "Invite at least one friend before starting" });

    room.status = "in_progress";
    room.startedAt = new Date();
    await room.save();
    return res.json(roomResponse(room, req.userId));
  } catch (error) {
    console.error("Party quiz start failed:", error?.name || "UnknownError");
    return res.status(500).json({ message: "Could not start the quiz" });
  }
};

export const submitPartyQuiz = async (req, res) => {
  try {
    const { answers } = req.body || {};
    if (
      !Array.isArray(answers) ||
      answers.length !== 10 ||
      answers.some(
        (answer) => !Number.isInteger(answer) || answer < 0 || answer > 3,
      )
    ) {
      return res
        .status(400)
        .json({ message: "Submit one answer for each question" });
    }

    const room = await PartyQuiz.findOne({
      code: req.params.code.toUpperCase(),
    });
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.status !== "in_progress")
      return res
        .status(409)
        .json({ message: "This quiz is not accepting answers" });
    const player = room.players.find(
      (item) => String(item.user) === String(req.userId),
    );
    if (!player)
      return res
        .status(403)
        .json({ message: "Join this room before submitting" });
    if (player.submittedAt)
      return res
        .status(409)
        .json({ message: "Your answers are already submitted" });

    const score = room.questions.reduce(
      (total, question, index) =>
        total + (answers[index] === question.correctIndex ? 1 : 0),
      0,
    );
    const submittedAt = new Date();
    let updatedRoom = await PartyQuiz.findOneAndUpdate(
      {
        _id: room._id,
        status: "in_progress",
        players: { $elemMatch: { user: req.userId, submittedAt: null } },
      },
      {
        $set: {
          "players.$[player].answers": answers,
          "players.$[player].score": score,
          "players.$[player].submittedAt": submittedAt,
        },
      },
      {
        new: true,
        arrayFilters: [
          { "player.user": req.userId, "player.submittedAt": null },
        ],
      },
    );

    if (!updatedRoom) {
      updatedRoom = await PartyQuiz.findById(room._id);
      const alreadySubmitted = updatedRoom?.players.some(
        (item) => String(item.user) === String(req.userId) && item.submittedAt,
      );
      if (alreadySubmitted)
        return res.json(roomResponse(updatedRoom, req.userId));
      return res
        .status(409)
        .json({ message: "This quiz is no longer accepting answers" });
    }

    if (updatedRoom.players.every((item) => item.submittedAt)) {
      await PartyQuiz.updateOne(
        { _id: updatedRoom._id, status: "in_progress" },
        { $set: { status: "completed", completedAt: new Date() } },
      );
      updatedRoom = await PartyQuiz.findById(updatedRoom._id);
    }
    return res.json(roomResponse(updatedRoom, req.userId));
  } catch (error) {
    console.error(
      "Party quiz answer submission failed:",
      error?.name || "UnknownError",
    );
    return res.status(500).json({ message: "Could not submit your answers" });
  }
};
