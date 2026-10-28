import React from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import img from "../assets/img1.png";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-white text-black">
      <Navbar />
      
      {/* TOP HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 lg:pt-32 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="transform-gpu"
          >
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight
                bg-gradient-to-br from-black/90 via-black/70 to-black/90
                bg-clip-text text-transparent"
              whileHover={{ y: -2 }}
            >
              Create Smart <br /> AI Notes in Seconds
            </motion.h1>

            <motion.p
              className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg
                bg-gradient-to-br from-gray-700 via-gray-500/90 to-gray-700
                bg-clip-text text-transparent leading-relaxed"
            >
              Generate exam-focused notes, project documentation, flow diagrams
              and revision-ready content using AI - faster, cleaner and smarter.
            </motion.p>
          </motion.div>

          <motion.button
            onClick={() => navigate("/notes")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 sm:mt-10 px-8 sm:px-10 py-3 sm:py-3.5 rounded-xl
              flex items-center justify-center gap-3
              bg-gradient-to-br from-black/90 via-black/80 to-black/90 border border-white/10
              text-white font-semibold text-base sm:text-lg
              shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            Get Started 🚀
          </motion.button>
        </div>

        {/* HERO IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="w-full flex justify-center"
        >
          <div className="relative w-full max-w-md lg:max-w-none overflow-hidden rounded-2xl shadow-2xl border border-gray-100">
            <img
              src={img}
              alt="AI Notes Preview"
              className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </motion.div>
      </section>

      {/* FEATURES BOTTOM SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        <Feature
          icon="📘"
          title="Exam Notes"
          des="High-yield exam-oriented notes with crisp revision points."
        />
        <Feature
          icon="📁"
          title="Project Notes"
          des="Well-structured technical content tailored for assignments."
        />
        <Feature
          icon="📊"
          title="Smart Diagrams"
          des="Auto-generated visual diagrams for enhanced topic clarity."
        />
        <Feature
          icon="⬇️"
          title="PDF Download"
          des="Download clean, printable document-ready PDFs instantly."
        />
      </section>

      <Footer />
    </div>
  );
}

function Feature({ icon, title, des }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="relative rounded-2xl p-6
        bg-gradient-to-br from-black/90 via-black/85 to-black/90
        backdrop-blur-xl border border-white/10
        shadow-[0_20px_50px_rgba(0,0,0,0.5)]
        text-white flex flex-col justify-between"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative z-10">
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{des}</p>
      </div>
    </motion.div>
  );
}

export default Home;