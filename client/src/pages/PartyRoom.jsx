import React, { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiAward,
  FiCopy,
  FiLink,
  FiLoader,
  FiTarget,
  FiUsers,
} from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import {
  getPartyQuiz,
  joinPartyQuiz,
  startPartyQuiz,
  submitPartyQuiz,
} from "../services/api";

function PartyRoom() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.userData);
  const [room, setRoom] = useState(location.state?.room || null);
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!location.state?.room);

  useEffect(() => {
    let cancelled = false;
    let timer;
    const refreshRoom = async () => {
      const result = await getPartyQuiz(code);
      if (cancelled) return;
      if (result.code) {
        setRoom(result);
        setError("");
        if (result.status !== "completed")
          timer = setTimeout(refreshRoom, 2200);
      } else {
        setError(result.message || "This room could not be found.");
        if (result.message !== "Room not found")
          timer = setTimeout(refreshRoom, 3000);
      }
      setLoading(false);
    };
    refreshRoom();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code]);

  const myId = currentUser?._id;
  const isMember = room?.players?.some((player) => player.userId === myId);
  const answeredCount = answers.filter((answer) => answer !== null).length;

  const handleJoin = async () => {
    setBusy(true);
    setError("");
    const result = await joinPartyQuiz(code);
    setBusy(false);
    if (result.code) setRoom(result);
    else setError(result.message || "Couldn't join the room.");
  };

  const handleStart = async () => {
    setBusy(true);
    setError("");
    const result = await startPartyQuiz(code);
    setBusy(false);
    if (result.code) setRoom(result);
    else setError(result.message || "Couldn't start the quiz.");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await submitPartyQuiz(code, answers);
    setBusy(false);
    if (result.code) setRoom(result);
    else setError(result.message || "Couldn't submit your answers.");
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/party/${room.code}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy wasn't available here. Share the room code: " + room.code);
    }
  };

  if (loading && !room) {
    return (
      <div className="min-h-screen bg-[#f4f5fa]">
        <Navbar />
        <div className="mx-auto mt-24 flex max-w-md flex-col items-center">
          <FiLoader className="animate-spin text-3xl text-indigo-600" />
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Finding your study party…
          </p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#f4f5fa]">
        <Navbar />
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="rounded-3xl bg-white p-8 shadow">
            <FiUsers className="mx-auto text-4xl text-indigo-600" />
            <h1 className="mt-4 text-2xl font-bold">Room unavailable</h1>
            <p className="mt-2 text-sm text-slate-500">
              {error || "Check the invite link and try again."}
            </p>
            <button
              onClick={() => navigate("/study-party")}
              className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Go to Study Party
            </button>
          </div>
        </main>
      </div>
    );
  }

  const completed = room.status === "completed";
  const inProgress = room.status === "in_progress";

  return (
    <div className="min-h-screen bg-[#f4f5fa] pb-16 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pt-7 sm:px-6 sm:pt-10">
        <button
          onClick={() => navigate("/study-party")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-700"
        >
          <FiArrowLeft /> Study Party
        </button>

        <header className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#111827] via-[#29235f] to-[#6941c6] p-6 text-white shadow-xl shadow-indigo-950/10 sm:p-9">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-100">
                <FiUsers className="text-cyan-200" /> Study party · {room.code}
              </span>
              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                {completed
                  ? "The results are in."
                  : inProgress
                    ? "Game on."
                    : "Your room is ready."}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100/75">
                {room.topic} · {room.players.length} joined
              </p>
            </div>
            <span className="relative rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
              {completed
                ? "Completed"
                : inProgress
                  ? "In progress"
                  : "Waiting room"}
            </span>
          </div>
        </header>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        {!completed && !inProgress && (
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold">Invite your friends</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Share this link or the room code. Friends can join until the
                  host starts the quiz.
                </p>
              </div>
              <button
                onClick={copyInvite}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
              >
                <FiCopy /> {copied ? "Invite copied!" : "Copy invite link"}
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <FiLink className="shrink-0 text-indigo-600" />
              <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-500">
                {window.location.origin}/party/{room.code}
              </span>
              <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs font-bold tracking-widest text-slate-800">
                {room.code}
              </span>
            </div>
          </section>
        )}

        {!completed && (
          <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Players</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {room.players.length} joined ·{" "}
                  {room.players.filter((player) => player.submitted).length}{" "}
                  submitted
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <FiUsers /> {room.players.length} joined
              </span>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {room.players.map((player, index) => (
                <div
                  key={player.userId}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                >
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-bold ${player.isHost ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}
                  >
                    {player.isHost ? (
                      <FiAward />
                    ) : (
                      player.name?.[0]?.toUpperCase()
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {player.name}
                      {player.userId === myId ? " (you)" : ""}
                    </p>
                    <p className="text-xs text-slate-400">
                      {player.isHost ? "Host" : `Player ${index + 1}`}
                    </p>
                  </div>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${player.submitted ? "bg-emerald-500" : inProgress ? "bg-amber-400" : "bg-slate-300"}`}
                  />
                </div>
              ))}
            </div>

            {!isMember && room.status === "lobby" && (
              <button
                onClick={handleJoin}
                disabled={busy}
                className="mt-5 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
              >
                {busy ? "Joining…" : "Join this room"}
              </button>
            )}
            {room.isHost && room.status === "lobby" && (
              <button
                onClick={handleStart}
                disabled={busy || room.players.length < 2}
                className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 sm:ml-3 sm:w-auto"
              >
                {busy
                  ? "Starting…"
                  : room.players.length < 2
                    ? "Waiting for a friend"
                    : "Start the 10-question quiz"}
              </button>
            )}
            {inProgress && room.mySubmitted && (
              <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                Your answers are locked in. We’ll show the merit list when
                everyone finishes.
              </p>
            )}
            {inProgress && !isMember && (
              <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                This quiz has started. You can watch the room, but new players
                can’t join mid-game.
              </p>
            )}
          </section>
        )}

        {inProgress && isMember && !room.mySubmitted && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold">Your challenge</h2>
              <p className="mt-1 text-sm text-slate-500">
                Answer all 10 questions, then lock in your score. You can’t
                change answers after submitting.
              </p>
            </div>
            {room.questions.map((question, questionIndex) => (
              <section
                key={`${question.question}-${questionIndex}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700">
                    {String(questionIndex + 1).padStart(2, "0")}
                  </span>
                  <h3 className="pt-1.5 font-bold leading-6">
                    {question.question}
                  </h3>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => (
                    <button
                      type="button"
                      key={`${option}-${optionIndex}`}
                      onClick={() =>
                        setAnswers((previous) =>
                          previous.map((answer, index) =>
                            index === questionIndex ? optionIndex : answer,
                          ),
                        )
                      }
                      aria-pressed={answers[questionIndex] === optionIndex}
                      className={`flex min-h-12 items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition ${answers[questionIndex] === optionIndex ? "border-indigo-400 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-100" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-200"}`}
                    >
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold ${answers[questionIndex] === optionIndex ? "bg-indigo-600 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
              </section>
            ))}
            <div className="sticky bottom-3 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:px-5">
              <p className="px-2 text-sm text-slate-500">
                {answers.filter((answer) => answer !== null).length}/10 answered
              </p>
              <button
                type="submit"
                disabled={busy || answeredCount !== 10}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {busy ? "Submitting…" : "Lock in my answers"}
              </button>
            </div>
          </form>
        )}

        {completed && (
          <Leaderboard
            room={room}
            myId={myId}
            onBack={() => navigate("/study-party")}
          />
        )}
      </main>
    </div>
  );
}

function Leaderboard({ room, myId, onBack }) {
  const myRank = room.leaderboard?.find(
    (player) => player.userId === myId,
  )?.rank;
  return (
    <section className="mt-5 space-y-5">
      <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-2xl text-amber-500">
          <FiAward />
        </div>
        <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
          Final standings
        </p>
        <h2 className="mt-1 text-center text-2xl font-bold">
          {myRank ? `You finished #${myRank}` : "Merit list"}
        </h2>
        <div className="mx-auto mt-6 max-w-2xl space-y-2">
          {room.leaderboard?.map((player) => (
            <div
              key={player.userId}
              className={`flex items-center gap-3 rounded-xl border p-3.5 ${player.userId === myId ? "border-indigo-200 bg-indigo-50" : "border-slate-100 bg-slate-50/80"}`}
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-black ${player.rank === 1 ? "bg-amber-100 text-amber-700" : player.rank === 2 ? "bg-slate-200 text-slate-700" : player.rank === 3 ? "bg-orange-100 text-orange-700" : "bg-white text-slate-500"}`}
              >
                {player.rank === 1 ? <FiAward /> : `#${player.rank}`}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">
                  {player.name}
                  {player.userId === myId ? " (you)" : ""}
                </p>
                <p className="text-xs text-slate-400">
                  {player.rank === 1 ? "Top scorer" : "Study party player"}
                </p>
              </div>
              <p className="text-lg font-black text-slate-900">
                {player.score}
                <span className="text-xs font-semibold text-slate-400">
                  /10
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-bold">Answer review</h3>
        <div className="mt-4 space-y-3">
          {room.questions?.map((question, index) => (
            <div
              key={`${question.question}-${index}`}
              className="rounded-xl bg-slate-50 p-4"
            >
              <p className="text-sm font-semibold">
                {index + 1}. {question.question}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Correct answer:{" "}
                <span className="font-semibold text-emerald-700">
                  {question.options[question.correctIndex]}
                </span>{" "}
                · {question.explanation}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={onBack}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <FiArrowLeft /> Back to Study Party
        </button>
      </div>
    </section>
  );
}

export default PartyRoom;
