import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiArrowRight, FiLink, FiPlus, FiUsers, FiZap } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { serverUrl } from "../config";
import { updateCredits } from "../redux/userSlice";
import { createPartyQuiz } from "../services/api";

function StudyParty() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [notes, setNotes] = useState([]);
  const [noteId, setNoteId] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    axios.get(serverUrl + "/api/notes/getnotes", { withCredentials: true })
      .then((response) => {
        if (cancelled) return;
        const savedNotes = Array.isArray(response.data) ? response.data : [];
        setNotes(savedNotes);
        if (savedNotes[0]) setNoteId(savedNotes[0]._id);
      })
      .catch(() => { if (!cancelled) setError("Couldn't load your saved notes. Please refresh and try again."); })
      .finally(() => { if (!cancelled) setLoadingNotes(false); });
    return () => { cancelled = true; };
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!noteId) return;
    setCreating(true);
    setError("");
    const result = await createPartyQuiz(noteId);
    setCreating(false);
    if (!result.room) {
      setError(result.message || "Couldn't create the quiz room.");
      return;
    }
    if (typeof result.creditsLeft === "number") dispatch(updateCredits(result.creditsLeft));
    navigate(`/party/${result.room.code}`, { state: { room: result.room } });
  };

  const handleJoin = (event) => {
    event.preventDefault();
    const code = inviteCode.trim().toUpperCase();
    if (code) navigate(`/party/${code}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f5fa] pb-16 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        <header className="relative overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-[#111827] via-[#29235f] to-[#6d42c8] p-6 text-white shadow-xl shadow-indigo-950/10 sm:p-10">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-100"><FiUsers className="text-cyan-200" /> NoteMint · Study party</span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-5xl">Notes are better with friends.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100/75 sm:text-base">Create a room from your notes, invite your whole group, and see who tops the merit list. Bring as many friends as you like.</p>
          </div>
        </header>

        {error && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-600"><FiPlus /></div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-indigo-600">Host a room</p>
            <h2 className="mt-2 text-2xl font-bold">Start a friendly face-off</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Pick a saved note. We’ll build a 10-question quiz for the room and give you a link to share.</p>
            <form onSubmit={handleCreate} className="mt-6">
              <label htmlFor="party-note" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Choose your notes</label>
              <select id="party-note" value={noteId} onChange={(event) => setNoteId(event.target.value)} disabled={loadingNotes || notes.length === 0} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:opacity-60">
                {loadingNotes && <option>Loading your notes…</option>}
                {!loadingNotes && notes.length === 0 && <option value="">No saved notes yet</option>}
                {notes.map((note) => <option key={note._id} value={note._id}>{note.topic}</option>)}
              </select>
              <button type="submit" disabled={creating || loadingNotes || notes.length === 0} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">
                {creating ? <><FiZap className="animate-pulse" /> Building quiz room…</> : <>Create room · 5 credits <FiArrowRight /></>}
              </button>
              <p className="mt-3 text-center text-xs text-slate-400">Room quiz costs 5 credits. Friends join free.</p>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-xl text-cyan-700"><FiLink /></div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.15em] text-cyan-700">Join a room</p>
            <h2 className="mt-2 text-2xl font-bold">Your friends sent a link?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Open their invite link directly, or paste the room code here to join the lobby.</p>
            <form onSubmit={handleJoin} className="mt-6">
              <label htmlFor="party-code" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Room code</label>
              <input id="party-code" value={inviteCode} onChange={(event) => setInviteCode(event.target.value.toUpperCase().replace(/[^A-F0-9]/g, "").slice(0, 12))} placeholder="e.g. 8F2A19BC43D1" maxLength={12} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm font-bold tracking-[0.2em] text-slate-800 outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100" />
              <button type="submit" disabled={inviteCode.trim().length !== 12} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400">Enter room <FiArrowRight /></button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default StudyParty;
