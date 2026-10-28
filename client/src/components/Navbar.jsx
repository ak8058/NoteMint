import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../assets/logo.jpeg";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { serverUrl } from "../config";
import { setUserData } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { userData } = useSelector((state) => state.user);
  const credits = userData?.credits ?? 0;

  const [showCredits, setShowCredits] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const creditsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (creditsRef.current && !creditsRef.current.contains(event.target)) {
        setShowCredits(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await axios.get(serverUrl + "/api/auth/logout", {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      navigate("/auth");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative z-50 mx-2 sm:mx-4 md:mx-8 mt-3 sm:mt-4 md:mt-6
        rounded-2xl sm:rounded-3xl
        bg-zinc-900/90 md:bg-zinc-950/80 backdrop-blur-2xl
        border border-zinc-800/80
        shadow-[0_12px_40px_rgba(0,0,0,0.15)]
        flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5 text-white"
    >
      {/* Brand & Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
      >
        <motion.div
          whileHover={{ rotate: 10, scale: 1.05 }}
          className="p-1 sm:p-1.5 rounded-xl bg-zinc-800/50 border border-zinc-700/50 group-hover:border-purple-500/50 transition-colors"
        >
          <img
            src={logo}
            alt="ExamNotes AI"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
          />
        </motion.div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-base sm:text-lg font-bold tracking-tight text-white">
            NoteMint.
          </span>
          <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-600 text-white shadow-sm">
            AI
          </span>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Credits Pill */}
        <div className="relative" ref={creditsRef}>
          <motion.button
            onClick={() => {
              setShowCredits(!showCredits);
              setShowProfile(false);
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-full
              bg-zinc-800/60 hover:bg-zinc-800
              border border-zinc-700/60 hover:border-purple-500/40
              text-xs sm:text-sm font-medium
              transition-all duration-300"
          >
            <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-purple-500/20 text-purple-400 text-[10px] sm:text-xs">
              ⚡
            </span>
            <span>{credits}</span>
            <span className="hidden sm:inline text-xs text-zinc-400 font-normal">
              Credits
            </span>
            <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-zinc-700 text-white text-[10px] sm:text-xs">
              +
            </span>
          </motion.button>

          {/* Credits Popover */}
          <AnimatePresence>
            {showCredits && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 12, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute right-[-40px] sm:right-0 mt-2 w-64 sm:w-72 rounded-2xl
                  bg-zinc-900 border border-zinc-700
                  shadow-2xl
                  p-4 sm:p-5 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-xs sm:text-sm">Buy Credits</h4>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    {credits} Left
                  </span>
                </div>

                <p className="text-[11px] sm:text-xs text-zinc-400 mb-4 leading-relaxed">
                  Use credits to generate instant study notes, mindmaps, &
                  exportable PDFs.
                </p>

                <button
                  onClick={() => {
                    setShowCredits(false);
                    navigate("/pricing");
                  }}
                  className="w-full py-2 sm:py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all shadow-md"
                >
                  Get More Credits
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <motion.button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowCredits(false);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full
              bg-gradient-to-tr from-purple-600 to-indigo-600
              border border-zinc-600 text-white font-bold text-xs sm:text-sm
              shadow-md cursor-pointer"
          >
            {userData?.name ? userData.name[0].toUpperCase() : "U"}
            <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-900" />
          </motion.button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 12, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 sm:w-56 rounded-2xl
                  bg-zinc-900 border border-zinc-700
                  shadow-2xl
                  p-2 z-50"
              >
                <div className="px-3 py-2 sm:py-2.5 mb-1 rounded-xl bg-zinc-800/50">
                  <p className="text-xs font-semibold text-white truncate">
                    {userData?.name || "User"}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
                    {userData?.email || "user@examnotes.ai"}
                  </p>
                </div>

                <div className="h-px bg-zinc-800 my-1" />

                <MenuItem
                  icon="📜"
                  text="History & Notes"
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/history");
                  }}
                />

                <MenuItem
                  icon="🎙️"
                  text="Voice AI Tutor"
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/voice-tutor");
                  }}
                />

                <MenuItem
                  icon="🏆"
                  text="Quiz Results"
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/quiz-results");
                  }}
                />

                <MenuItem
                  icon="🎉"
                  text="Study Party"
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/study-party");
                  }}
                />

                <MenuItem
                  icon="⚙️"
                  text="Account Settings"
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/settings");
                  }}
                />

                <div className="h-px bg-zinc-800 my-1" />

                <MenuItem
                  icon="🚪"
                  text="Sign Out"
                  red
                  onClick={handleSignOut}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function MenuItem({ onClick, text, icon, red }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium rounded-xl
        transition-all duration-200 text-left
        ${
          red
            ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
            : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
        }
      `}
    >
      <span className="text-xs sm:text-sm">{icon}</span>
      <span>{text}</span>
    </button>
  );
}

export default Navbar;
