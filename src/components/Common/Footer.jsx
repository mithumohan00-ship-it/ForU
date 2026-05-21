import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-8 mt-auto px-6 border-t border-slate-100 bg-white/30 backdrop-blur-xs">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-sm text-slate-400">
        <div>
          <p className="font-serif text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-1">
            forU
          </p>
          <p className="text-xs">Messages made for you</p>
        </div>
        
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Built and designed by</span>
          <span className="font-semibold text-slate-600">Mithu Mohan</span>
          <span>with</span>
          <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400 animate-pulse" />
          <span>for your loved ones &copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
