"use client";

import React from "react";
import { motion } from "motion/react";

export function AnimatedKostLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-1">
      {/* Animated SVG Kost Building */}
      <motion.div
        animate={{ y: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        className="relative w-28 h-28 flex items-center justify-center"
      >
        {/* Ambient Glow behind the building */}
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />

        <svg
          viewBox="0 0 160 160"
          className="w-full h-full relative z-10 drop-shadow-[0_4px_12px_rgba(16,185,129,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground Line */}
          <motion.path
            d="M 15 138 L 145 138"
            stroke="#52525b"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />

          {/* Stepping Stones / Entrance Path */}
          <motion.path
            d="M 68 144 L 92 144"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          />

          {/* Main Building Frame */}
          <motion.path
            d="M 32 72 L 32 138 L 128 138 L 128 72 Z"
            stroke="#e4e4e7"
            strokeWidth="2.5"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />

          {/* Modern Gable Roof */}
          <motion.path
            d="M 22 74 L 80 28 L 138 74"
            stroke="#10b981"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />

          {/* Roof Chimney / Architectural Vents */}
          <motion.path
            d="M 44 48 L 44 36 L 54 36 L 54 56"
            stroke="#71717a"
            strokeWidth="2"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />

          {/* 2nd Floor Balcony / Divider Line */}
          <motion.path
            d="M 32 96 L 128 96"
            stroke="#3f3f46"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          />

          {/* 2nd Floor Left Window (AC Room) with warm lighting */}
          <motion.rect
            x="44"
            y="76"
            width="28"
            height="14"
            rx="2"
            stroke="#10b981"
            strokeWidth="1.5"
            initial={{ fill: "rgba(16, 185, 129, 0)", opacity: 0 }}
            animate={{
              fill: [
                "rgba(16, 185, 129, 0)",
                "rgba(251, 191, 36, 0.4)",
                "rgba(16, 185, 129, 0.35)",
              ],
              opacity: 1,
            }}
            transition={{ delay: 0.5, duration: 0.6 }}
          />
          {/* Window divider */}
          <motion.line
            x1="58"
            y1="76"
            x2="58"
            y2="90"
            stroke="#71717a"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          />

          {/* 2nd Floor Right Window with warm lighting */}
          <motion.rect
            x="88"
            y="76"
            width="28"
            height="14"
            rx="2"
            stroke="#10b981"
            strokeWidth="1.5"
            initial={{ fill: "rgba(16, 185, 129, 0)", opacity: 0 }}
            animate={{
              fill: [
                "rgba(16, 185, 129, 0)",
                "rgba(251, 191, 36, 0.5)",
                "rgba(251, 191, 36, 0.35)",
              ],
              opacity: 1,
            }}
            transition={{ delay: 0.6, duration: 0.6 }}
          />
          {/* Window divider */}
          <motion.line
            x1="102"
            y1="76"
            x2="102"
            y2="90"
            stroke="#71717a"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          />

          {/* Ground Floor Main Door */}
          <motion.path
            d="M 66 138 L 66 104 Q 66 102 69 102 L 91 102 Q 94 102 94 104 L 94 138 Z"
            stroke="#10b981"
            strokeWidth="2"
            initial={{ fill: "rgba(16, 185, 129, 0)" }}
            animate={{
              fill: [
                "rgba(16, 185, 129, 0)",
                "rgba(16, 185, 129, 0.4)",
                "rgba(16, 185, 129, 0.25)",
              ],
            }}
            transition={{ delay: 0.7, duration: 0.6 }}
          />

          {/* Door Handle */}
          <motion.circle
            cx="88"
            cy="121"
            r="1.75"
            fill="#34d399"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ delay: 0.85, duration: 0.3 }}
          />

          {/* Monogram / Modern Emblem on Roof Gable (Letter M) */}
          <motion.path
            d="M 72 55 L 76 62 L 80 57 L 84 62 L 88 55"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          />

          {/* Decorative Tropical Plant Left */}
          <motion.path
            d="M 22 138 Q 24 126 34 129 Q 28 136 22 138"
            fill="#10b981"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.75, type: "spring" }}
          />

          {/* Decorative Tropical Plant Right */}
          <motion.path
            d="M 138 138 Q 136 126 126 129 Q 132 136 138 138"
            fill="#10b981"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
          />
        </svg>
      </motion.div>

      {/* Animated Loading Bar */}
      <div className="w-36 h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-3.5 border border-zinc-700/50">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.95, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
