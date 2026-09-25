import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Plus, Image, Brush, Send, ArrowRight, Share2, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { THEMES } from '../utils/themes';
import { getAllLocalCards, deleteCardFromLocalVault } from '../firebase/config';
import { getShareUrl, compressCard } from '../utils/codec';

const STEPS = [
  {
    icon: <Image className="w-5 h-5" />,
    title: "1. Choose Your Vibe",
    description: "Select from our handcrafted dreamy gradients, vintage card shapes, and premium elegant typography.",
    color: "bg-pink-50 text-pink-500"
  },
  {
    icon: <Brush className="w-5 h-5" />,
    title: "2. Personalize & Style",
    description: "Write long heartfelt letters, upload memory photos, and choose romantic themes and custom styling.",
    color: "bg-purple-50 text-purple-500"
  },
  {
    icon: <Send className="w-5 h-5" />,
    title: "3. Seal & Send",
    description: "Generate a unique secret link. When opened, it reveals a gorgeous unfolding envelope and confetti explosion!",
    color: "bg-indigo-50 text-indigo-500"
  }
];

export default function Landing() {
  const navigate = useNavigate();
  const [savedCards, setSavedCards] = useState([]);

  useEffect(() => {
    try {
      const cardsArray = getAllLocalCards();
      setSavedCards(cardsArray);
    } catch (e) {
      console.error("Failed to load local vault cards", e);
    }
  }, []);

  const handleSelectTemplate = (themeId) => {
    navigate(`/create?theme=${themeId}`);
  };

  const handleDeleteCard = (cardId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this sweet letter? 🥺")) {
      try {
        const success = deleteCardFromLocalVault(cardId);
        if (success) {
          setSavedCards(getAllLocalCards());
          toast.success('Letter removed from vault! 📂', {
            style: { borderRadius: '16px', fontSize: '13px' }
          });
        } else {
          toast.error('Failed to remove letter. 😢', {
            style: { borderRadius: '16px', fontSize: '13px' }
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-50/20">
      <Toaster position="bottom-center" reverseOrder={false} />
      {/* Moving Ambient Glow Balls */}
      <div className="absolute top-10 left-[-10%] w-96 h-96 rounded-full bg-pink-200/40 blur-3xl animate-float" />
      <div className="absolute bottom-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/35 blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-purple-200/30 blur-3xl animate-float-slow" />

      {/* Hero Container */}
      <main className="z-10 mx-auto max-w-7xl px-6 pt-12 pb-24 flex-grow flex flex-col gap-24">
        
        {/* HERO HEADER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8">
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            
            {/* Tagline */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 self-start px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-100 text-pink-500 text-[10px] font-bold tracking-wider uppercase"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse" />
              <span>Messages made for you</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] text-slate-800 tracking-tight"
            >
              Write. Doodle.<br />
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Sparkle. Send.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base text-slate-500 leading-relaxed max-w-lg"
            >
              Create modern, beautiful digital greeting letters that unfold like physical letters. Attach photos, paint custom sketches, drop cute stickers, and share with magical opening animations.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-4 mt-2"
            >
              <Link to="/create">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-400 via-pink-500 to-purple-500 text-white font-semibold text-sm shadow-lg shadow-pink-200/50 flex items-center gap-2 hover:shadow-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Designing</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* HERO PREVIEW IMAGES */}
          <div className="lg:col-span-5 relative h-96 flex items-center justify-center">
            {/* Layered decorative cards floating */}
            <motion.div
              initial={{ rotate: -15, scale: 0.85, opacity: 0 }}
              animate={{ rotate: -8, scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
              className="absolute w-56 aspect-[3/4.5] rounded-3xl p-5 bg-gradient-to-tr from-rose-100 via-pink-100 to-rose-200 border border-white/60 shadow-xl flex flex-col justify-between -translate-x-12 translate-y-4"
            >
              <div className="text-[10px] uppercase font-bold text-rose-500">To You</div>
              <div className="text-center font-playful text-rose-700 text-lg">Happy Birthday! ✨</div>
              <div className="text-right text-[10px] uppercase font-bold text-rose-500">Love, Me</div>
            </motion.div>

            <motion.div
              initial={{ rotate: 15, scale: 0.85, opacity: 0 }}
              animate={{ rotate: 10, scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
              className="absolute w-56 aspect-[3/4.5] rounded-3xl p-5 bg-gradient-to-b from-slate-900 to-indigo-950 border border-white/10 shadow-2xl flex flex-col justify-between translate-x-12 -translate-y-4 text-slate-100"
            >
              <div className="text-[10px] uppercase font-bold text-indigo-400">Midnight</div>
              <div className="text-center font-serif text-lg text-indigo-100">Cozy starry stars...</div>
              <div className="text-right text-[10px] uppercase font-bold text-indigo-400">forU</div>
            </motion.div>

            {/* Glowing seal circle */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute z-10 w-20 h-20 rounded-full bg-pink-500 border-4 border-white shadow-xl flex items-center justify-center text-white cursor-pointer rotate-12"
            >
              <Heart className="w-8 h-8 fill-current animate-pulse" />
            </motion.div>
          </div>
        </div>

        {/* 3 STEPS WALKTHROUGH */}
        <div className="flex flex-col gap-10">
          <div className="text-center max-w-md mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-800">Creating Cute Memories</h2>
            <p className="text-xs text-slate-400 mt-2">Making beautiful cards that surprise your loved ones is as easy as pie.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 rounded-3xl glass-panel bg-white/50 border border-white/60 shadow-xs flex flex-col gap-4 text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center shadow-xs`}>
                  {step.icon}
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-800">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* TEMPLATES PREVIEW */}
        <div id="templates" className="flex flex-col gap-10">
          <div className="text-center max-w-md mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-800">Handcrafted Cozy Themes</h2>
            <p className="text-xs text-slate-400 mt-2">Start quick with one of our beautiful gradient card templates below.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {THEMES.map((theme, idx) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => handleSelectTemplate(theme.id)}
                whileHover={{ y: -4 }}
                className="group cursor-pointer rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-slate-200/80 bg-white flex flex-col justify-between transition-all duration-300"
              >
                {/* Visual Gradient Header representation */}
                <div className={`w-full aspect-[4/3] relative flex items-center justify-center ${theme.class} border-b border-slate-100`}>
                  <div className="absolute top-3 left-3 text-[8px] uppercase tracking-wider text-slate-500/60 font-extrabold">forU Presets</div>
                  
                  {/* Miniature aesthetic card mock */}
                  <div className={`w-28 h-36 rounded-xl p-3 border border-white/60 flex flex-col justify-between text-left shadow-md transform rotate-[-3deg] group-hover:rotate-0 transition-transform ${theme.cardClass}`}>
                    <span className="text-[6px] tracking-wide opacity-50">Recipient</span>
                    <span className={`text-[10px] font-bold leading-none ${theme.titleFont}`}>Dear Sweetest</span>
                    <span className="text-[6px] text-right mt-auto tracking-wide opacity-50">Love, Dear</span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 text-left flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-sm font-bold text-slate-800 group-hover:text-pink-500 transition-colors">
                      {theme.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{theme.description}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-pink-50 group-hover:text-pink-500 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* PERSONAL SENT LETTERS VAULT */}
        {savedCards.length > 0 && (
          <div className="flex flex-col gap-10">
            <div className="text-center max-w-md mx-auto">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-500 text-[10px] font-bold tracking-wider uppercase">
                <Sparkles className="w-3 h-3 fill-current animate-pulse" />
                <span>Your Vault</span>
              </span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-slate-800 mt-3">My Sent Letters</h2>
              <p className="text-xs text-slate-400 mt-2">
                A cozy vault of all the beautiful letters you've designed and shared.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCards.map((card, idx) => {
                const themeClass = card.theme?.class || 'bg-gradient-to-tr from-rose-100 to-indigo-100';
                const cardTheme = card.theme || {};
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-md border border-slate-200/80 bg-white flex flex-col justify-between transition-all duration-300"
                  >
                    {/* Visual Card representation */}
                    <div className={`w-full aspect-[1.5] relative flex items-center justify-center ${themeClass} border-b border-slate-100 p-4`}>
                      <div className="absolute top-3 left-3 text-[8px] uppercase tracking-wider text-slate-500/60 font-extrabold">
                        {new Date(card.createdAt).toLocaleDateString()}
                      </div>

                      {/* Small letter envelope mock */}
                      <div className={`w-36 rounded-xl border border-white/60 p-2.5 shadow-md flex flex-col justify-between text-left transform rotate-[-2deg] group-hover:rotate-0 transition-transform ${cardTheme.cardClass || 'bg-white/70 text-slate-800'}`}>
                        <span className="text-[5px] uppercase tracking-wide opacity-50">To {card.recipient}</span>
                        <h4 className={`text-[9px] font-bold truncate leading-tight mt-0.5 ${cardTheme.titleFont || 'font-serif'}`}>{card.title}</h4>
                        <span className="text-[5px] text-right mt-2.5 uppercase tracking-wide opacity-50">From {card.sender}</span>
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="p-4 text-left flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-serif text-xs font-bold text-slate-800 truncate">
                          To: {card.recipient}
                        </h3>
                        <p className="text-[9px] text-slate-400 mt-0.5 truncate">
                          From: {card.sender}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Copy Link Button */}
                        <button
                          onClick={() => {
                            const url = getShareUrl(card);
                            navigator.clipboard.writeText(url);
                            toast.success('Universal link copied! 💌 (Opens on any device)', {
                              style: { borderRadius: '16px', fontSize: '13px' }
                            });
                          }}
                          className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-pink-50 hover:text-pink-500 active:scale-95 transition-all cursor-pointer"
                          title="Copy Universal Share Link"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDeleteCard(card.id, e)}
                          className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all cursor-pointer"
                          title="Delete Letter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* View Button */}
                        <Link to={`/share?c=${compressCard(card)}`}>
                          <div className="p-2 rounded-xl bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-500 active:scale-95 transition-all">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* BOTTOM VIRAL LOOP */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-[36px] bg-gradient-to-r from-pink-100/50 via-purple-100/50 to-indigo-100/50 border border-white p-12 text-center flex flex-col items-center gap-6 shadow-xs"
        >
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-pink-500 shadow-md">
            <Heart className="w-7 h-7 fill-current animate-pulse" />
          </div>
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-extrabold text-slate-800">Ready to surprise someone?</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
              Draft a gorgeous letter, paint a custom doodle, seal it with a password, and send a beautiful reminder of how much they mean to you.
            </p>
          </div>
          <Link to="/create">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2"
            >
              <span>Create Your Card Now</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>

      </main>
    </div>
  );
}
