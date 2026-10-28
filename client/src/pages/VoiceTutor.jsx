import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { serverUrl } from "../config";
import { askVoiceTutor, evaluateVoiceAnswer } from "../services/api";
import axios from "axios";

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceTutor() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [noteId, setNoteId] = useState("");
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const recognition = useRef(null);

  useEffect(() => {
    axios.get(serverUrl + "/api/notes/getnotes", { withCredentials: true })
      .then(({ data }) => setNotes(Array.isArray(data) ? data : []))
      .catch(() => setError("Could not load your saved notes."));
    return () => recognition.current?.stop();
  }, []);

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.94;
    utterance.pitch = 1.02;
    window.speechSynthesis.speak(utterance);
  };

  const createQuestion = async () => {
    if (!noteId) return;
    setBusy(true); setError(""); setFeedback(null); setAnswer("");
    try {
      const result = await askVoiceTutor(noteId);
      setQuestion(result);
      speak(result.question);
    } catch (err) { setError(err.response?.data?.message || "Could not create a question. Try again."); }
    finally { setBusy(false); }
  };

  const startListening = () => {
    if (!SpeechRecognition) return setError("Voice input is not supported in this browser. Type your answer below.");
    setError("");
    const current = new SpeechRecognition();
    recognition.current = current;
    current.lang = "en-IN";
    current.interimResults = true;
    current.continuous = false;
    current.onresult = (event) => setAnswer(Array.from(event.results).map((item) => item[0].transcript).join(" "));
    current.onerror = () => { setListening(false); setError("Could not hear that clearly. Try again or type your answer."); };
    current.onend = () => setListening(false);
    current.start();
    setListening(true);
  };

  const submitAnswer = async (event) => {
    event.preventDefault();
    if (!answer.trim() || !question?.question) return;
    setBusy(true); setError("");
    try {
      const result = await evaluateVoiceAnswer(noteId, question.question, answer.trim());
      setFeedback(result);
      speak(`${result.correct ? "Correct." : "Not quite."} ${result.feedback} ${result.explanation}`);
    } catch (err) { setError(err.response?.data?.message || "Could not check your answer."); }
    finally { setBusy(false); }
  };

  return <div className="min-h-screen bg-slate-950 pb-14 text-white"><Navbar />
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <button onClick={() => navigate(-1)} className="mb-6 text-sm text-slate-400 hover:text-white">← Back</button>
      <header className="relative overflow-hidden rounded-[2rem] border border-violet-300/10 bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 p-6 shadow-2xl sm:p-10">
        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative"><span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-cyan-200">NOTEMINT · VOICE LAB</span>
          <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">Talk it out. <span className="text-cyan-200">Learn it for real.</span></h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Choose your own notes. Your AI tutor asks one question at a time, listens to your answer, then explains the logic like a patient teacher.</p>
        </div>
      </header>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
        <label className="mb-2 block text-sm font-semibold text-slate-300" htmlFor="tutor-note">Choose the notes to study</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select id="tutor-note" value={noteId} onChange={(event) => { setNoteId(event.target.value); setQuestion(null); setFeedback(null); }} className="min-h-12 flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 text-sm text-white outline-none focus:border-cyan-300/60">
            <option value="">Select a saved note…</option>
            {notes.map((note) => <option key={note._id} value={note._id}>{note.topic}</option>)}
          </select>
          <button onClick={createQuestion} disabled={!noteId || busy} className="min-h-12 rounded-xl bg-cyan-300 px-5 text-sm font-extrabold text-slate-950 hover:bg-cyan-200 disabled:opacity-50">{busy && !feedback ? "Preparing…" : "Ask me a question ✦"}</button>
        </div>
      </section>

      {!question && <div className="mt-6 rounded-3xl border border-dashed border-white/15 p-8 text-center text-slate-400"><span className="text-4xl">🎙️</span><p className="mt-3">Pick a note and your tutor will start the conversation.</p></div>}

      {question && <section className="mt-6 space-y-4">
        <article className="rounded-3xl border border-indigo-200/15 bg-gradient-to-br from-indigo-500/15 to-violet-500/5 p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-200">Your tutor asks</p><button onClick={() => speak(question.question)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10">🔊 Hear again</button></div>
          <h2 className="mt-4 text-2xl font-bold leading-snug sm:text-3xl">{question.question}</h2>
          {question.hint && <p className="mt-3 text-sm text-slate-400">Hint: {question.hint}</p>}
        </article>

        {!feedback && <form onSubmit={submitAnswer} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
          <label htmlFor="spoken-answer" className="mb-2 block text-sm font-semibold text-slate-200">Your answer</label>
          <textarea id="spoken-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={1500} rows={3} placeholder="Tap the mic and speak, or type your answer…" className="w-full resize-y rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/50" />
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={listening ? () => recognition.current?.stop() : startListening} className={`min-h-12 rounded-xl border px-5 text-sm font-bold ${listening ? "animate-pulse border-rose-300/40 bg-rose-500/20 text-rose-100" : "border-cyan-200/20 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"}`}>{listening ? "■ Stop listening" : "🎙️ Answer with voice"}</button>
            <button disabled={!answer.trim() || busy} className="min-h-12 rounded-xl bg-violet-300 px-6 text-sm font-extrabold text-violet-950 hover:bg-violet-200 disabled:opacity-50">{busy ? "Checking…" : "Check my answer →"}</button>
          </div>
        </form>}

        {feedback && <article className={`rounded-3xl border p-5 sm:p-7 ${feedback.correct ? "border-emerald-300/20 bg-emerald-400/10" : "border-amber-300/20 bg-amber-400/10"}`}>
          <p className={`text-xs font-black uppercase tracking-widest ${feedback.correct ? "text-emerald-200" : "text-amber-200"}`}>{feedback.correct ? "✓ That’s correct" : "↻ Let’s learn from it"}</p>
          <p className="mt-3 text-lg font-bold">{feedback.feedback}</p>
          {!feedback.correct && <p className="mt-4 rounded-xl bg-black/20 p-3 text-sm"><strong>Correct answer:</strong> {feedback.correctAnswer}</p>}
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs font-bold uppercase tracking-wider text-cyan-200">Teacher’s explanation</p><p className="mt-2 text-sm leading-6 text-slate-100">{feedback.explanation}</p></div>
          <button onClick={createQuestion} disabled={busy} className="mt-5 min-h-12 rounded-xl bg-white px-5 text-sm font-extrabold text-slate-900 hover:bg-cyan-100 disabled:opacity-50">{busy ? "Preparing…" : "Next question →"}</button>
        </article>}
      </section>}
      {error && <p role="alert" className="mt-5 rounded-xl border border-rose-300/20 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p>}
      <p className="mt-6 text-center text-xs text-slate-500">Voice input availability depends on your browser. Typing and spoken tutor playback are also supported where available.</p>
    </main>
  </div>;
}
