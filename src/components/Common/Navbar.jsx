import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Plus } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isCreatePage = location.pathname === '/create';

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, cubicBezier: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 w-full px-6 py-4"
    >
      <div className="mx-auto max-w-7xl glass-panel bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="flex items-center justify-center h-20 w-auto"
          >
            <img src="/logo.png" alt="forU Logo" className="h-full object-contain scale-110" />
          </motion.div>
          
          <span className="font-serif text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">
            forU
          </span>
        </Link>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          {!isCreatePage ? (
            <Link to="/create">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden group bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-md shadow-pink-200 flex items-center gap-2 hover:shadow-lg transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Create a Card</span>
                {/* Micro-sparkle flare */}
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.button>
            </Link>
          ) : (
            <Link to="/">
              <span className="text-xs tracking-wider uppercase font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                Back to Home
              </span>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
