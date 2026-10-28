import React from "react";
import { motion } from "framer-motion"; // 'motion/react' ya 'framer-motion'
import logo from "../assets/logo.jpeg";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config";
import { setUserData } from "../redux/userSlice";

const MotionFooter = motion.footer;

function Footer() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignOut = async () => {
    try {
      await axios.get(serverUrl + "/api/auth/logout", {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      navigate("/auth");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <MotionFooter
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative z-10 mx-3 sm:mx-6 mb-4 mt-14 sm:mt-20 overflow-hidden
        rounded-[1.75rem] bg-gradient-to-br from-zinc-950 via-black to-zinc-900
        border border-zinc-800/90 px-5 sm:px-8 lg:px-10 py-8 sm:py-10
        shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
    >
      <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-purple-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-9 lg:gap-12 items-start">
        {/* Brand Section */}
        <motion.div
          whileHover={{ rotateX: 6, rotateY: -6 }}
          className="md:col-span-6 flex flex-col items-center md:items-start text-center md:text-left gap-4 transform-gpu"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer select-none group"
            style={{ transform: "translateZ(20px)" }}
          >
            <img
              src={logo}
              alt="ExamNotes AI logo"
              className="h-10 w-10 rounded-xl object-contain ring-1 ring-white/15 shadow-lg shadow-purple-950/40"
            />
            <span
              className="text-lg font-semibold bg-gradient-to-br from-white via-gray-300 to-white bg-clip-text text-transparent"
              style={{ textShadow: "0 6px 18px rgba(0,0,0,0.4)" }}
            >
              NoteMint. <span className="text-gray-400">AI</span>
            </span>
          </div>

          <p className="text-sm leading-6 text-zinc-400 max-w-md">
            Your learning workspace for turning class notes into clear study guides, quick quizzes, and practice papers.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 text-[11px] font-medium text-zinc-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">✦ AI study notes</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">▤ Scan to PDF</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">◎ Quiz & results</span>
          </div>
        </motion.div>

        {/* Quick Links */}
        <div className="md:col-span-3 text-center md:text-left">
          <h2 className="text-xs font-bold text-zinc-200 mb-4 tracking-[0.18em] uppercase">
            Explore
          </h2>
          <ul className="space-y-2.5 text-sm">
            <li
              onClick={() => navigate("/notes")}
              className="text-zinc-400 hover:text-cyan-200 transition-colors cursor-pointer w-fit mx-auto md:mx-0"
            >
              Notes
            </li>
            <li
              onClick={() => navigate("/history")}
              className="text-zinc-400 hover:text-cyan-200 transition-colors cursor-pointer w-fit mx-auto md:mx-0"
            >
              History
            </li>
            <li
              onClick={() => navigate("/pricing")}
              className="text-zinc-400 hover:text-cyan-200 transition-colors cursor-pointer w-fit mx-auto md:mx-0"
            >
              Add Credits
            </li>
          </ul>
        </div>

        {/* Support & Account */}
        <div className="md:col-span-3 text-center md:text-left">
          <h2 className="text-xs font-bold text-zinc-200 mb-4 tracking-[0.18em] uppercase">
            Account
          </h2>
          <ul className="space-y-2.5 text-sm">
            <li
              onClick={() => navigate("/auth")}
              className="text-zinc-400 hover:text-cyan-200 transition-colors cursor-pointer w-fit mx-auto md:mx-0"
            >
              Sign In
            </li>
            <li
              onClick={handleSignOut}
              className="text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer w-fit mx-auto md:mx-0"
            >
              Sign Out
            </li>
            <li>
              <a
                href="mailto:support@examnotes.com"
                className="text-zinc-400 hover:text-cyan-200 transition-colors block w-fit mx-auto md:mx-0"
              >
                support@notemint.in
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative my-7 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="text-xs text-zinc-500">© {new Date().getFullYear()} <span className="text-zinc-300">NoteMint AI</span>. Made for curious minds.</p>
        <p className="text-[11px] tracking-wide text-zinc-600">LEARN SMARTER · ONE PAGE AT A TIME</p>
      </div>
    </MotionFooter>
  );
}

export default Footer;
