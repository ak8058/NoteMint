import React from "react";
import { FiArrowUpRight, FiBookOpen, FiCalendar, FiChevronRight, FiCreditCard, FiMail, FiShield, FiUser } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function AccountSettings() {
  const userData = useSelector((state) => state.user.userData);
  const navigate = useNavigate();
  const displayName = userData?.name || "NoteMint learner";
  const initials = displayName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
  const joinedDate = userData?.createdAt
    ? new Date(userData.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "Member";
  const notesCount = Array.isArray(userData?.notes) ? userData.notes.length : 0;
  const credits = userData?.credits ?? 0;

  return (
    <div className="min-h-screen bg-[#f7f7fb] text-zinc-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Your workspace</p>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Account settings</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500 sm:text-base">
                Manage your NoteMint profile, keep an eye on your credits, and get back to studying.
              </p>
            </div>
            <button onClick={() => navigate("/")} className="inline-flex w-fit items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700">
              Back to home <FiArrowUpRight />
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_12px_40px_rgba(24,24,27,0.04)]">
              <div className="h-28 bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500" />
              <div className="px-5 pb-6 sm:px-8">
                <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-end gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-zinc-950 text-2xl font-bold text-white shadow-lg">{initials || "N"}</div>
                    <div className="pb-1">
                      <h2 className="text-xl font-bold text-zinc-900">{displayName}</h2>
                      <p className="mt-1 text-sm text-zinc-500">NoteMint account</p>
                    </div>
                  </div>
                  <span className="mb-1 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Account active
                  </span>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <InfoCard icon={<FiUser />} label="Full name" value={displayName} />
                  <InfoCard icon={<FiMail />} label="Email address" value={userData?.email || "Not available"} />
                  <InfoCard icon={<FiCalendar />} label="Member since" value={joinedDate} />
                  <InfoCard icon={<FiShield />} label="Sign-in method" value="Google sign-in" />
                </div>
                <p className="mt-4 text-xs leading-5 text-zinc-400">Profile details are managed through your Google account.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-xl text-violet-600"><FiCreditCard /></div>
                  <h2 className="text-lg font-bold">Credits & plan</h2>
                  <p className="mt-1 text-sm text-zinc-500">Credits are used when you generate AI study notes.</p>
                </div>
                <span className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">Pay as you go</span>
              </div>
              <div className="mt-6 flex flex-col justify-between gap-5 rounded-2xl bg-zinc-950 p-5 text-white sm:flex-row sm:items-center sm:p-6">
                <div>
                  <p className="text-sm text-zinc-400">Available balance</p>
                  <p className="mt-1 text-4xl font-bold tracking-tight">{credits}<span className="ml-2 text-base font-medium text-zinc-400">credits</span></p>
                </div>
                <button onClick={() => navigate("/pricing")} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500">Add credits <FiArrowUpRight /></button>
              </div>
              <p className="mt-4 text-xs leading-5 text-zinc-400">Purchases are securely processed by Stripe. Credits are added after payment confirmation.</p>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-[0_12px_40px_rgba(24,24,27,0.04)] sm:p-6">
              <p className="text-sm font-semibold text-zinc-500">Your activity</p>
              <div className="mt-4 flex items-center gap-4 rounded-2xl bg-indigo-50/70 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl text-indigo-600 shadow-sm"><FiBookOpen /></div>
                <div><p className="text-2xl font-bold text-zinc-900">{notesCount}</p><p className="text-sm text-zinc-500">Saved note sets</p></div>
              </div>
              <button onClick={() => navigate("/history")} className="mt-4 flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 hover:text-violet-700">View history <FiChevronRight /></button>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-indigo-900 p-6 text-white shadow-lg shadow-indigo-900/10">
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[24px] border-white/10" />
              <div className="relative">
                <span className="text-2xl">✨</span>
                <h2 className="mt-4 text-xl font-bold">Ready for your next study session?</h2>
                <p className="mt-2 text-sm leading-6 text-indigo-100">Turn a topic into clear, exam-focused notes in just a few steps.</p>
                <button onClick={() => navigate("/notes")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-50">Create notes <FiArrowUpRight /></button>
              </div>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><FiShield /></div>
                <div>
                  <h2 className="font-bold">Your account stays yours</h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">Your study notes and credit balance are tied to this account. Sign in with the same Google account to access them.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400"><span className="text-violet-500">{icon}</span>{label}</div>
      <p className="mt-2 truncate text-sm font-semibold text-zinc-800" title={value}>{value}</p>
    </div>
  );
}

export default AccountSettings;
