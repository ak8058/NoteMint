import React, { useState } from "react";
import { FiArrowRight, FiRefreshCw, FiTarget, FiZap } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateCredits } from "../redux/userSlice";
import { generateNotesQuiz } from "../services/api";

function NotesQuiz({ noteId, topic }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startQuiz = async () => {
    setLoading(true);
    setError("");
    const result = await generateNotesQuiz(noteId);
    setLoading(false);
    if (!Array.isArray(result.questions) || !result.attemptId) {
      setError(result.message || "Quiz generate nahi ho saka. Dobara try karein.");
      return;
    }
    if (typeof result.creditsLeft === "number") dispatch(updateCredits(result.creditsLeft));
    navigate(`/quiz/${result.attemptId}`, {
      state: { attemptId: result.attemptId, questions: result.questions, topic: result.topic || topic },
    });
  };

  return (
    <section id="notes-quiz" className="scroll-mt-8 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white shadow-[0_18px_50px_rgba(30,41,91,0.18)]">
      <div className="relative flex flex-col justify-between gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="absolute -right-10 -top-16 h-48 w-48 rounded-full border border-indigo-300/10" />
        <div className="relative flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-400/15 text-xl text-indigo-200 ring-1 ring-indigo-300/20">
            <FiTarget />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Recall lab · 01</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Ready to test what stuck?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100/70">
              Take a 10-question knowledge check based only on <span className="font-semibold text-white">{topic}</span>.
              All questions appear together on a clean quiz page.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-indigo-100/75">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">10 questions</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">See all at once</span>
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-amber-200">5 credits</span>
            </div>
          </div>
        </div>
        <div className="relative shrink-0 sm:pl-4">
          <button
            onClick={startQuiz}
            disabled={loading || !noteId}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-300 px-5 py-3 text-sm font-bold text-indigo-950 shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-200 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
          >
            {loading ? <FiRefreshCw className="animate-spin" /> : <FiZap />}
            {loading ? "Building your quiz…" : "Start the quiz"}
            {!loading && <FiArrowRight />}
          </button>
          {error && <p role="alert" className="mt-3 max-w-56 text-sm text-rose-300">{error}</p>}
        </div>
      </div>
    </section>
  );
}

export default NotesQuiz;
