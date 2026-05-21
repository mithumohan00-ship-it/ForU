import React from 'react';
import { motion } from 'framer-motion';
import { THEMES } from '../../utils/themes';
import { Palette, Sparkle } from 'lucide-react';

export default function ThemeSelector({ activeThemeId, onChangeTheme }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs tracking-wider uppercase">
        <Palette className="w-3.5 h-3.5 text-purple-400" />
        <span>Card Visual Theme</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((theme) => {
          const isSelected = theme.id === activeThemeId;
          return (
            <motion.button
              key={theme.id}
              onClick={() => onChangeTheme(theme)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className={`relative overflow-hidden p-3 rounded-2xl border text-left flex flex-col gap-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-pink-400 ring-2 ring-pink-100 bg-white/70 shadow-sm'
                  : 'border-slate-200 bg-white/40 hover:bg-white/60 hover:shadow-xs'
              }`}
            >
              {/* Theme Color Preview Sphere */}
              <div className="flex items-center justify-between gap-2">
                <div className={`w-12 h-6 rounded-lg ${theme.class} border border-white/40`} />
                {isSelected && (
                  <motion.div
                    layoutId="themeSelectedDot"
                    className="w-4 h-4 rounded-full bg-pink-400 flex items-center justify-center text-white"
                  >
                    <Sparkle className="w-2.5 h-2.5 fill-current" />
                  </motion.div>
                )}
              </div>
              
              <div>
                <h4 className="font-serif text-xs font-bold text-slate-800">{theme.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{theme.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
