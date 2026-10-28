import React, { useEffect, useState } from "react";
import { FiArrowUpRight, FiAward, FiBookOpen, FiClock, FiTarget } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getQuizResults } from "../services/api";

function QuizResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getQuizResults().then((data) => {
      if (cancelled) return;
      if (Array.isArray(data)) setResults(data);
      else setError(data.message || "Could not load quiz results.");
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f5fa] pb-16 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        <header className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#111827] via-[#20205a] to-[#4338a8] p-6 text-white shadow-xl shadow-indigo-950/10 sm:p-9">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200/20 bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-100"><FiAward className="text-amber-200" /> Your progress</span>
              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">Quiz results</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100/75">Every finished quiz, saved in one place. Revisit your answers and explanations whenever you need a refresher.</p>
            </div>
            <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
              <FiTarget className="text-xl text-cyan-200" />
              <div><p className="text-xl font-bold">{results.length}</p><p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-100/65">completed tests</p></div>
            </div>
          </div>
        </header>

        {loading && <div className="py-20 text-center text-sm font-semibold text-slate-500">Loading your results…</div>}
        {!loading && error && <p role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</p>}
        {!loading && !error && results.length === 0 && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-2xl text-indigo-600"><FiBookOpen /></span>
            <h2 className="mt-5 text-xl font-bold">Your first result is waiting</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Read or generate a set of notes, then take its 10-question quiz. Completed results will be saved here automatically.</p>
            <button onClick={() => navigate("/history")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">Open my notes <FiArrowUpRight /></button>
          </div>
        )}
        {!loading && results.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {results.map((result, index) => {
              const percentage = Math.round((result.score / result.total) * 100);
              return (
                <article key={result.attemptId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)] transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600">Test {String(results.length - index).padStart(2, "0")}</p>
                      <h2 className="mt-2 truncate text-lg font-bold text-slate-900">{result.topic || "Study notes"}</h2>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400"><FiClock /> {new Date(result.completedAt || result.createdAt).toLocaleString()}</p>
                    </div>
                    <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-base font-black ${percentage >= 80 ? "bg-emerald-50 text-emerald-700" : percentage >= 50 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
                      {percentage}<span className="-ml-3 mt-5 text-[9px] font-bold">%</span>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">Score</span>
                    <span className="font-bold text-slate-900">{result.score} <span className="font-medium text-slate-400">/ {result.total}</span></span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${percentage >= 80 ? "bg-emerald-500" : percentage >= 50 ? "bg-amber-400" : "bg-rose-400"}`} style={{ width: `${percentage}%` }} /></div>
                  <button onClick={() => navigate(`/quiz/${result.attemptId}`)} className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-700">Review answers & explanations <FiArrowUpRight /></button>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default QuizResults;
