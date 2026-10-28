import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import axios from "axios";
import { serverUrl } from "../config";
import Header from "../components/Navbar";

function Pricing() {
  const navigate = useNavigate();
  const [selectedPrice, setSelectedPrice] = useState(200); // Default to Popular plan
  const [paying, setPaying] = useState(false);
  const [payingAmount, setPayingAmount] = useState(null);

  const handlePaying = async (amount) => {
    try {
      setPayingAmount(amount);
      setPaying(true);

      const result = await axios.post(
        `${serverUrl}/api/credit/order`,
        { amount },
        { withCredentials: true },
      );

      if (result.data.url) {
        window.location.href = result.data.url;
      }

      setPaying(false);
    } catch (error) {
      setPaying(false);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-gray-100 px-6 py-8">
      {/* Reusable Header */}
      <Header />

      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl mx-auto my-12"
      >
        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
          💎 Flexible Credit Packages
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold mt-4 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          Power Up Your Studies
        </h1>
        <p className="text-sm sm:text-base text-gray-400 mt-2">
          Choose a credit pack that fits your exam prep and generate high-yield
          AI notes without limits.
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-12">
        <PricingCard
          title="Starter"
          price="₹100"
          amount={100}
          credits="50 Credits"
          description="Perfect for quick revisions"
          features={[
            "Generate AI notes",
            "Exam-focused answers",
            "Diagram & charts support",
            "Fast generation",
          ]}
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          onBuy={handlePaying}
          paying={paying}
          payingAmount={payingAmount}
        />

        <PricingCard
          popular
          title="Popular"
          price="₹200"
          amount={200}
          credits="120 Credits"
          description="Best value for students"
          features={[
            "All Starter features",
            "Bonus credits per rupee",
            "Revision mode access",
            "Priority AI response",
          ]}
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          onBuy={handlePaying}
          paying={paying}
          payingAmount={payingAmount}
        />

        <PricingCard
          title="Pro Learner"
          price="₹500"
          amount={500}
          credits="300 Credits"
          description="For serious exam preparation"
          features={[
            "Maximum credit value",
            "Unlimited revisions",
            "Advanced charts & diagrams",
            "Ideal for full syllabus prep",
          ]}
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          onBuy={handlePaying}
          paying={paying}
          payingAmount={payingAmount}
        />
      </div>
    </div>
  );
}

function PricingCard({
  title,
  price,
  amount,
  credits,
  description,
  features,
  popular,
  selectedPrice,
  setSelectedPrice,
  onBuy,
  paying,
  payingAmount,
}) {
  const isSelected = selectedPrice === amount;
  const isPayingThisCard = paying && payingAmount === amount;

  return (
    <motion.div
      onClick={() => setSelectedPrice(amount)}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className={`relative cursor-pointer rounded-2xl p-6 flex flex-col justify-between transition-all backdrop-blur-xl border ${
        isSelected
          ? "bg-gradient-to-b from-indigo-950/40 via-black/80 to-black/90 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.25)]"
          : popular
            ? "bg-white/[0.06] border-purple-500/50 shadow-lg"
            : "bg-white/5 border-white/10 hover:bg-white/[0.07] shadow-lg"
      }`}
    >
      {popular && !isSelected && (
        <span className="absolute -top-3 right-5 text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md">
          Most Popular
        </span>
      )}

      {isSelected && (
        <span className="absolute -top-3 right-5 text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md">
          Selected Plan
        </span>
      )}

      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-xs text-gray-400 mt-1">{description}</p>

        <div className="mt-5 pb-5 border-b border-white/10">
          <p className="text-4xl font-extrabold text-white tracking-tight">
            {price}
          </p>
          <p className="text-sm font-semibold text-indigo-400 mt-1">
            {credits}
          </p>
        </div>

        <ul className="mt-5 space-y-3 text-sm text-gray-300">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2.5">
              <span className="flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                ✓
              </span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        disabled={isPayingThisCard}
        onClick={(e) => {
          e.stopPropagation();
          onBuy(amount);
        }}
        className={`w-full mt-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
          isPayingThisCard
            ? "bg-gray-800 text-gray-400 cursor-not-allowed"
            : isSelected
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-500/25"
              : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
        }`}
      >
        {isPayingThisCard ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Redirecting...</span>
          </>
        ) : (
          <span>Get {credits.split(" ")[0]} Credits</span>
        )}
      </button>
    </motion.div>
  );
}

export default Pricing;
