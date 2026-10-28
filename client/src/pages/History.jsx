import axios from "axios";
import React, { useEffect, useState } from "react";
import { serverUrl } from "../config";
import { AnimatePresence, motion } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import FinalResult from "../components/FinalResult";
import Header from "../components/Navbar";

const MotionDiv = motion.div;

function History() {
  const [topics, setTopics] = useState([]);
  const [dueNotes, setDueNotes] = useState([]);
  const [revisionMessage, setRevisionMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [activeNoteId, setActiveNoteId] = useState(null);

  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const initialOpenNoteId = location.state?.openNoteId;

  async function openNotes(noteId) {
    setLoading(true);
    setActiveNoteId(noteId);
    try {
      const res = await axios.get(serverUrl + `/api/notes/${noteId}`, {
        withCredentials: true,
      });
      setSelectedNote({ ...res.data.content, topic: res.data.topic, sourceType: res.data.sourceType });
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    const myNotes = async () => {
      try {
        const [res, dueRes] = await Promise.all([
          axios.get(serverUrl + "/api/notes/getnotes", { withCredentials: true }),
          axios.get(serverUrl + "/api/notes/revision/due", { withCredentials: true }),
        ]);
        const notes = Array.isArray(res.data) ? res.data : [];
        setTopics(notes);
        setDueNotes(Array.isArray(dueRes.data) ? dueRes.data : []);
        if (initialOpenNoteId && notes.some((note) => note._id === initialOpenNoteId)) openNotes(initialOpenNoteId);
      } catch (error) {
        console.log(error);
      }
    };
    myNotes();
  }, [initialOpenNoteId]);

  const markStudied = async () => {
    if (!activeNoteId) return;
    setRevisionMessage("");
    try {
      const { data } = await axios.post(serverUrl + `/api/notes/${activeNoteId}/revision/studied`, {}, { withCredentials: true });
      setTopics((current) => current.map((note) => note._id === activeNoteId ? { ...note, revision: data.revision } : note));
      setSelectedNote((current) => current ? { ...current, revision: data.revision } : current);
      setDueNotes((current) => current.filter((note) => note._id !== activeNoteId));
      const days = data.revision.intervalDays;
      setRevisionMessage(`Saved! Next review in ${days} day${days === 1 ? "" : "s"}.`);
    } catch (error) {
      setRevisionMessage(error.response?.data?.message || "Could not save your revision plan.");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black text-gray-100 px-3 py-4 sm:px-6 sm:py-8">
      {/* Reusable Header with Sidebar Toggle Support */}
      <Header
        leftElement={
          !isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-white text-2xl p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Open Sidebar"
            >
              <GiHamburgerMenu />
            </button>
          )
        }
      />

      <div className="mx-auto mt-3 flex max-w-7xl items-center justify-between lg:hidden">
        <button onClick={() => setIsSidebarOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-semibold text-white shadow-lg" aria-label="Open notes sidebar">
          <GiHamburgerMenu /> Browse notes <span className="rounded-full bg-indigo-500/30 px-2 py-0.5 text-xs">{topics.length}</span>
        </button>
        {activeNoteId && <span className="max-w-[55%] truncate text-xs text-slate-400">{topics.find((note) => note._id === activeNoteId)?.topic}</span>}
      </div>

      <div className="mx-auto mt-4 grid max-w-7xl grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-4">
        {isSidebarOpen && <button aria-label="Close notes sidebar" onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden" />}
        <AnimatePresence>
          {isSidebarOpen && (
            <MotionDiv
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed left-0 top-0 z-[70] h-[100dvh] w-[min(88vw,22rem)]
lg:static lg:z-auto lg:h-[75vh] lg:w-auto
lg:rounded-3xl
lg:col-span-1
bg-black/95 lg:bg-black/80
backdrop-blur-xl
border border-white/10
shadow-[0_20px_45px_rgba(0,0,0,0.6)]
p-5
overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <span className="text-sm font-semibold text-gray-400">
                  Navigation
                </span>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-white text-sm px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3">
                <section className="rounded-2xl border border-amber-300/20 bg-gradient-to-br from-amber-400/10 to-orange-400/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-amber-100">☀️ Today’s Revision</h2>
                    <span className="rounded-full bg-amber-200/10 px-2 py-0.5 text-xs text-amber-200">{dueNotes.length} due</span>
                  </div>
                  {dueNotes.length ? <ul className="mt-2 space-y-2">{dueNotes.map((note) => <li key={note._id}>
                    <button onClick={() => { openNotes(note._id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} className="w-full rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-left hover:bg-white/10">
                      <span className="block truncate text-xs font-semibold text-white">{note.topic}</span>
                      <span className="mt-1 block text-[10px] text-amber-200/70">Review #{note.revision?.reviewCount || 1}</span>
                    </button>
                  </li>)}</ul> : <p className="mt-2 text-xs leading-5 text-slate-400">No notes due. Mark a note studied to start your review journey.</p>}
                </section>
                <button
                  onClick={() => navigate("/notes")}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 transition-all text-start flex items-center gap-2"
                >
                  <span>➕</span> New Notes
                </button>
                <button onClick={() => navigate("/upload-notes")} className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-cyan-100 bg-cyan-500/10 border border-cyan-300/20 hover:bg-cyan-500/20 text-start flex items-center gap-2">
                  <span>📷</span> Scan class pages
                </button>

                <hr className="border-white/10 my-3" />

                <h2 className="text-lg font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
                  📚 Your Notes
                </h2>

                {topics.length === 0 && (
                  <p className="text-sm text-gray-400 py-4 text-center">
                    No notes created yet
                  </p>
                )}

                <ul className="space-y-3">
                  {topics.map((t, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        openNotes(t._id);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      className={`cursor-pointer rounded-xl p-3 border transition-all ${
                        activeNoteId === t._id
                          ? "bg-indigo-500/30 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <p className="text-sm font-semibold text-white truncate">
                        {t.topic}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        {t.classLevel && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                            Class: {t.classLevel}
                          </span>
                        )}
                        {t.examType && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                            {t.examType}
                          </span>
                        )}
                        {t.sourceType === "scanned" && <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">📄 Scanned PDF</span>}
                      </div>
                      <div className="flex gap-3 mt-2 text-xs text-gray-400">
                        {t.revisionMode && <span>⚡ Revision</span>}
                        {t.includeDiagram && <span>📊 Diagram</span>}
                        {t.includeChart && <span>📈 Chart</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>

        <MotionDiv
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="min-w-0 lg:col-span-3
rounded-3xl
bg-white/95 backdrop-blur-xl
border border-white/20
shadow-[0_20px_45px_rgba(0,0,0,0.3)]
p-4 sm:p-6
min-h-[75vh]"
        >
          {loading && (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-500">
                Loading your notes...
              </p>
            </div>
          )}

          {!loading && !selectedNote && (
            <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-2">
              <span className="text-4xl">📂</span>
              <p className="text-base font-medium">
                Select a topic from the sidebar to view notes
              </p>
            </div>
          )}

          {!loading && selectedNote && <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <div><p className="text-sm font-bold text-indigo-950">🧠 Revision Journey</p><p className="mt-1 text-xs text-indigo-700">{selectedNote.revision?.dueAt ? `Next review: ${new Date(selectedNote.revision.dueAt).toLocaleDateString()}` : "Start a spaced review plan for this note."}</p></div>
              <button onClick={markStudied} className="rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-800">✓ Mark as studied</button>
              {revisionMessage && <p role="status" className="w-full text-xs text-indigo-700">{revisionMessage}</p>}
            </div>
            <FinalResult result={selectedNote} noteId={activeNoteId} />
          </>}
        </MotionDiv>
      </div>
    </div>
  );
}

export default History;
