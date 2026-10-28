import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { uploadScannedNotes } from "../services/api";
import { updateCredits } from "../redux/userSlice";

const preparePhoto = async (file) => {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);
  if (file.type === "image/heic" || file.type === "image/heif") throw new Error("HEIC photos are not supported yet. Export them as JPEG first.");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob) throw new Error(`Could not prepare ${file.name}. Try a JPEG or PNG photo.`);
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
};

export default function UploadNotes() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const choosePhotos = (files, append = false) => {
    setError("");
    const chosen = Array.from(files || []);
    const next = append ? [...photos, ...chosen] : chosen;
    if (next.length > 10) return setError("Choose up to 10 pages at a time.");
    setPhotos(next);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!photos.length) return setError("Add at least one class-note photo.");
    setBusy(true); setError("");
    try {
      const prepared = await Promise.all(photos.map(preparePhoto));
      const form = new FormData();
      form.append("title", title.trim());
      prepared.forEach((photo) => form.append("images", photo));
      const result = await uploadScannedNotes(form);
      dispatch(updateCredits(result.creditsLeft));
      navigate("/history", { state: { openNoteId: result.noteId } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not process these photos.");
    } finally { setBusy(false); }
  };

  return <div className="min-h-screen bg-slate-950 text-white">
    <Navbar />
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <button onClick={() => navigate(-1)} className="mb-6 text-sm text-slate-400 hover:text-white">← Back</button>
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 shadow-2xl">
        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_.9fr]">
          <section>
            <div className="mb-5 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-200">NOTEMINT SCAN STUDIO</div>
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl">Turn missed lectures into a study kit.</h1>
            <p className="mt-4 max-w-xl text-slate-300">Photograph notebook pages or upload them from your gallery. NoteMint reads them, saves clean study notes and keeps the original pages together as a PDF.</p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm">
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">📄 Original pages → PDF</span>
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">✨ Organized notes</span>
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">📝 Practice paper</span>
            </div>
          </section>
          <form onSubmit={submit} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div><h2 className="text-xl font-bold">Build your scan</h2><p className="mt-1 text-sm text-slate-400">Up to 10 pages · JPEG or PNG</p></div>
              <span className="whitespace-nowrap rounded-full bg-amber-300/10 px-3 py-1.5 text-sm font-bold text-amber-200">{userData?.credits ?? 0} credits</span>
            </div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Topic title <span className="text-slate-500">(optional)</span></label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="e.g. Biology — Cell Division" className="mb-5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/60" />
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => cameraRef.current?.click()} className="rounded-2xl border border-cyan-200/20 bg-cyan-300/10 p-4 text-left hover:bg-cyan-300/15"><span className="text-2xl">📷</span><span className="mt-2 block font-semibold">Take photos</span><span className="text-xs text-slate-400">Use your camera</span></button>
              <button type="button" onClick={() => galleryRef.current?.click()} className="rounded-2xl border border-violet-200/20 bg-violet-300/10 p-4 text-left hover:bg-violet-300/15"><span className="text-2xl">🖼️</span><span className="mt-2 block font-semibold">Choose files</span><span className="text-xs text-slate-400">Pick from gallery</span></button>
            </div>
            <input ref={cameraRef} hidden type="file" accept="image/jpeg,image/png" capture="environment" onChange={(e) => { choosePhotos(e.target.files, true); e.target.value = ""; }} />
            <input ref={galleryRef} hidden type="file" accept="image/jpeg,image/png" multiple onChange={(e) => { choosePhotos(e.target.files, true); e.target.value = ""; }} />
            {photos.length > 0 && <div className="mt-4 max-h-36 space-y-2 overflow-auto rounded-xl border border-white/10 bg-white/5 p-3">{photos.map((photo, i) => <div key={`${photo.name}-${i}`} className="flex justify-between gap-3 text-sm"><span className="truncate text-slate-200">{String(i + 1).padStart(2, "0")} · {photo.name}</span><span className="shrink-0 text-slate-500">{(photo.size / 1024 / 1024).toFixed(1)} MB</span></div>)}</div>}
            <p className="mt-4 text-xs leading-relaxed text-slate-400">Importing and organizing pages costs 10 credits. Creating your first question paper costs 5 credits. Your original scan stays available in My Notes.</p>
            {error && <p role="alert" className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
            <button disabled={busy || !photos.length} className="mt-5 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-violet-400 px-4 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Reading your pages…" : `Create my study kit · ${photos.length || 0} pages`}</button>
          </form>
        </div>
      </div>
    </main>
  </div>;
}
