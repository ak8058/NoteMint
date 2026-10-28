import React, { useEffect, useState } from "react";
import { FiArrowLeft, FiCheck, FiTarget, FiX } from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getQuizAttempt, submitQuizAttempt } from "../services/api";

function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const [quiz, setQuiz] = useState(() => location.state?.questions ? {
    questions: location.state.questions,
    topic: location.state.topic || "your notes",
    status: "in_progress",
  } : null);
  const [answers, setAnswers] = useState(() => Array(10).fill(null));
  const [submittedResult, setSubmittedResult] = useState(null);
  const [loading, setLoading] = useState(!location.state?.questions);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.questions) return undefined;
    let cancelled = false;
    getQuizAttempt(attemptId).then((result) => {
      if (cancelled) return;
      if (!Array.isArray(result.questions)) {
        setError(result.message || "Quiz session not found.");
      } else {
        setQuiz(result);
        if (result.status === "completed") {
          setSubmittedResult(result);
          setAnswers(result.answers || []);
        }
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [attemptId, location.state]);

  const questions = submittedResult?.questions || quiz?.questions || [];
  const answeredCount = answers.filter((answer) => answer !== null).length;
  const score = submittedResult?.score ?? 0;

  const submitAnswers = async (event) => {
    event.preventDefault();
    if (!attemptId || attemptId === "undefined") {
      setError("Quiz session is missing. Return to your notes and start the quiz again.");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await submitQuizAttempt(attemptId, answers);
    setSubmitting(false);
    if (!Array.isArray(result.questions) || typeof result.score !== "number") {
      setError(result.message || "Could not save your result. Please try again.");
      return;
    }
    setSubmittedResult(result);
    setAnswers(result.answers);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f5fa]"><Navbar />
        <div className="mx-auto mt-24 flex max-w-lg flex-col items-center text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 font-semibold text-slate-700">Loading your quiz…</p>
        </div>
      </div>
    );
  }

  if (!quiz || questions.length !== 10) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
        <Navbar />
        <main className="mx-auto max-w-xl px-4 py-20 text-center">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            <FiTarget className="mx-auto text-4xl text-indigo-600" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Quiz session not found</h1>
            <p className="mt-2 text-sm leading-6 text-gray-500">{error || "Open a saved note and start a fresh quiz to load its questions."}</p>
            <button onClick={() => navigate("/history")} className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">Go to notes history</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f5fa] pb-16 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pb-12 pt-6 sm:px-6 sm:pt-10">
        <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-700">
          <FiArrowLeft /> Back to notes
        </button>

        <header className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#111827] via-[#20205a] to-[#4338a8] p-6 text-white shadow-xl shadow-indigo-950/15 sm:p-9">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute right-8 top-8 h-32 w-32 rounded-full border border-dashed border-white/10" />
          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/20 bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-100"><FiTarget className="text-cyan-200" /> NoteMint · Recall lab</span>
              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Knowledge check</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100/75">A 10-question test built from <span className="font-semibold text-white">{quiz.topic || "your notes"}</span>. Choose one answer for each question, then submit once.</p>
            </div>
            <div className="relative flex shrink-0 gap-3"><StatChip value="10" label="questions" /><StatChip value={`${answeredCount}/10`} label="answered" /></div>
          </div>
          <div className="relative mt-7 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-cyan-200 transition-all duration-300" style={{ width: `${(answeredCount / 10) * 100}%` }} /></div>
        </header>

        {submittedResult && (
          <section className="mt-5 flex flex-col justify-between gap-4 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">Saved result</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">{score >= 8 ? "Excellent recall!" : score >= 5 ? "Nice progress!" : "Keep building on it!"}</h2>
              <p className="mt-1 text-sm text-slate-500">You scored <strong className="text-slate-900">{score} / 10</strong> ({score * 10}%). Your result is saved in Quiz Results.</p>
            </div>
            <div className="grid h-16 w-16 shrink-0 place-items-center self-start rounded-full bg-indigo-50 text-xl font-black text-indigo-700 ring-4 ring-indigo-100 sm:self-auto">{score}<span className="-ml-3 mt-8 text-[10px] font-bold text-indigo-400">/10</span></div>
          </section>
        )}

        <form onSubmit={submitAnswers} className="mt-5 space-y-4">
          {questions.map((question, questionIndex) => (
            <QuestionCard
              key={`${question.question}-${questionIndex}`}
              question={question}
              index={questionIndex}
              selected={answers[questionIndex]}
              submitted={Boolean(submittedResult)}
              onSelect={(optionIndex) => setAnswers((previous) => previous.map((answer, index) => index === questionIndex ? optionIndex : answer))}
            />
          ))}

          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}
          <div className="sticky bottom-3 z-20 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-[0_12px_40px_rgba(15,23,42,0.14)] backdrop-blur sm:flex-row sm:items-center sm:px-5">
            <p className="px-2 text-sm text-slate-500">{submittedResult ? `${score} correct out of 10` : answeredCount === 10 ? "All set — ready to submit?" : `Answer ${10 - answeredCount} more question${10 - answeredCount === 1 ? "" : "s"} to finish`}</p>
            {!submittedResult ? (
              <button type="submit" disabled={answeredCount !== 10 || submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
                {submitting ? "Saving result…" : "Submit answers"} {!submitting && <FiCheck />}
              </button>
            ) : (
              <button type="button" onClick={() => navigate("/quiz-results")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700">View all results <FiArrowLeft /></button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

function StatChip({ value, label }) {
  return <div className="min-w-20 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2 text-center"><p className="text-lg font-bold">{value}</p><p className="text-[10px] font-medium uppercase tracking-wider text-indigo-100/65">{label}</p></div>;
}

function QuestionCard({ question, index, selected, submitted, onSelect }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_5px_20px_rgba(15,23,42,0.035)] sm:p-6">
      <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700">{String(index + 1).padStart(2, "0")}</span><h2 className="pt-1.5 text-base font-bold leading-6 text-slate-900 sm:text-lg">{question.question}</h2></div>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {question.options.map((option, optionIndex) => {
          const correct = submitted && optionIndex === question.correctIndex;
          const wrong = submitted && selected === optionIndex && !correct;
          const chosen = selected === optionIndex;
          return (
            <button type="button" key={`${option}-${optionIndex}`} onClick={() => !submitted && onSelect(optionIndex)} disabled={submitted} aria-pressed={chosen}
              className={`flex min-h-12 items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition ${correct ? "border-emerald-300 bg-emerald-50 text-emerald-900" : wrong ? "border-rose-300 bg-rose-50 text-rose-900" : chosen ? "border-indigo-400 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-100" : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50"} ${submitted ? "cursor-default" : "cursor-pointer"}`}>
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold ${correct ? "bg-emerald-600 text-white" : wrong ? "bg-rose-600 text-white" : chosen ? "bg-indigo-600 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}>{correct ? <FiCheck /> : wrong ? <FiX /> : String.fromCharCode(65 + optionIndex)}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
      {submitted && <div className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-6 ${selected === question.correctIndex ? "border-emerald-100 bg-emerald-50/70 text-emerald-950" : "border-amber-100 bg-amber-50/70 text-amber-950"}`}><span className="font-bold">{selected === question.correctIndex ? "Correct. " : `Correct answer: ${String.fromCharCode(65 + question.correctIndex)}. `}</span>{question.explanation}</div>}
    </section>
  );
}

export default Quiz;
