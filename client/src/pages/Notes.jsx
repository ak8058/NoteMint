import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import TopicForm from "../components/TopicForm";
import Sidebar from "../components/Sidebar";
import FinalResult from "../components/FinalResult";

function Notes() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const credits = userData?.credits ?? 0;
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 pb-16 overflow-x-hidden">
      {/* Reusable Navbar Component */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Sub-header actions bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 rounded-2xl
            bg-zinc-900/90 backdrop-blur-xl
            border border-zinc-800
            px-6 py-4
            shadow-lg flex items-center justify-between gap-4 flex-col sm:flex-row text-white"
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Exam Notes Generator
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              AI-powered exam-oriented notes & revision materials
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => navigate("/voice-tutor")} className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-cyan-300 text-slate-950 hover:bg-cyan-200 transition-all">🎙️ Voice AI Tutor</button>
            <button onClick={() => navigate("/upload-notes")} className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all">📷 Scan class notes</button>
            <button
              onClick={() => navigate("/study-party")}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-violet-600 hover:bg-violet-500 border border-violet-500 text-white transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              🎉 Study Party
            </button>
            <button
              onClick={() => navigate("/history")}
              className="px-4 py-2 rounded-xl
                text-xs sm:text-sm font-medium
                bg-zinc-800/80 hover:bg-zinc-800
                border border-zinc-700/80
                text-zinc-200 hover:text-white
                transition-all duration-200
                flex items-center gap-2 cursor-pointer shadow-sm"
            >
              📚 Your Notes History
            </button>
          </div>
        </motion.div>

        {/* Topic Form Section */}
        <motion.div className="mb-10">
          <TopicForm
            loading={loading}
            setResult={setResult}
            setError={setError}
            setLoading={setLoading}
          />
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="text-center text-zinc-700 font-medium mb-6 text-sm sm:text-base"
          >
            ✨ Generating high-yield exam-focused notes... Please wait.
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 text-center text-red-600 font-medium text-sm bg-red-100/80 border border-red-200 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Empty State Placeholder */}
        {!result && !loading && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="h-56 sm:h-64 rounded-2xl
              flex flex-col items-center justify-center
              bg-white/60 backdrop-blur-lg
              border border-dashed border-gray-300
              text-gray-500 shadow-inner px-4 text-center"
          >
            <span className="text-3xl sm:text-4xl mb-3">📘</span>
            <p className="text-xs sm:text-sm font-medium">
              Generated notes, structured outlines, and mindmaps will appear here
            </p>
          </motion.div>
        )}

        {/* Result Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col lg:grid lg:grid-cols-4 gap-6"
          >
            <div className="hidden lg:col-span-1 lg:block">
              <Sidebar result={result} />
            </div>

            <details className="group rounded-2xl border border-indigo-100 bg-white shadow-sm lg:hidden">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-indigo-900 marker:hidden">
                <span>📌 Quick Exam View · Topics & questions</span>
                <span className="transition-transform group-open:rotate-180">⌄</span>
              </summary>
              <div className="border-t border-indigo-100 p-3">
                <Sidebar result={result} />
              </div>
            </details>

            <div className="lg:col-span-3 rounded-2xl bg-white shadow-[0_15px_40px_rgba(0,0,0,0.15)] p-4 sm:p-6 border border-gray-100">
              <FinalResult result={result} noteId={result.noteId} />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Notes;
