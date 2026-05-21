import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function Loader({ message = "Unfolding your memories..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-pink-50/50 backdrop-blur-md">
      {/* Decorative floating pastel blurs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-pink-200/55 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-200/55 blur-3xl animate-pulse-slow" />

      <div className="relative glass-panel bg-white/70 px-10 py-12 rounded-3xl border border-white/60 shadow-xl max-w-sm flex flex-col items-center gap-6">
        <div className="relative">
          {/* Outer glow ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-dashed border-pink-400/80 border-t-pink-200"
          />
          
          {/* Inner Heart */}
          <motion.div
            animate={{ scale: [0.9, 1.15, 0.9] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center text-pink-500"
          >
            <Heart className="w-6 h-6 fill-current" />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="font-serif text-lg font-medium text-slate-700 tracking-wide text-center"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}
