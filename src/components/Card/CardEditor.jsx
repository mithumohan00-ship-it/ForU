import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Music,
  Lock,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Type
} from 'lucide-react';
import ImageUploader from './ImageUploader';
import ThemeSelector from './ThemeSelector';
import { PLAYLIST, FONTS } from '../../utils/themes';

const AI_TEMPLATES = {
  love: [
    "To the one who makes my heart beat in cozy coffee-shop melodies. Meeting you was like finding my favorite book in a quiet corner of the library. You make every day warmer.",
    "No matter where the road goes, my favorite place is walking beside you. Thank you for being my anchor, my spark of light, and the sweetest part of my sky.",
    "I love you in quiet mornings and crowded streets, in silly jokes and sleepy sighs. You are my safe harbor and my wildest adventure. Every day with you is a gift."
  ],
  birthday: [
    "May your year ahead be as bright as your smile, filled with soft lo-fi tunes, warm cups of tea, and magical moments. You deserve all the stars tonight. Happy Birthday!",
    "Another beautiful chapter of your life begins today! I hope it brings you soft sunsets, unexpected laughter, and infinite reasons to dream. Have the happiest birthday!",
    "Sending you the biggest hug and a sky full of stardust. May this year bring you closer to every dream you hold dear, and may you always know how loved you are."
  ],
  gratitude: [
    "I am so deeply grateful for the light you bring into my world. Thank you for always listening, for the small kind gestures, and for just being you. You are truly rare.",
    "Some people just make the world a gentler place to live in. Thank you for your warmth, your kindness, and for always being a soft place to land. I appreciate you so much.",
    "Just a small letter to say thank you for everything you do. Your kindness never goes unnoticed, and your friendship is a treasure I keep close to my heart."
  ],
  friendship: [
    "To my partner in endless laughter, late-night talks, and cozy memories. Thank you for understanding my silence and cheering my noise. Here's to us, always.",
    "Life is a little brighter, a little louder, and infinitely sweeter with you around. Thank you for being the most wonderful friend anyone could ever ask for.",
    "Through all the changing seasons, I am so glad our friendship remains constant. You are my favorite distraction and my most trusted keeper of secrets."
  ]
};

export default function CardEditor({
  cardData,
  onChangeField,
  activeSticker,
  onSelectSticker,
  clearStickerTrigger,
  onCanvasChange
}) {
  const [activeTab, setActiveTab] = useState('vibe'); // vibe, content, settings
  const [aiExpanded, setAiExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    title = '',
    message = '',
    recipient = '',
    sender = '',
    theme = {},
    titleFont = 'font-serif',
    bodyFont = 'font-sans',
    textColor = '#334155',
    titleColor = '#1e293b',
    musicUrl = '',
    password = '',
    isPasswordProtected = false,
    openAfterDate = '',
    isOpenAfterDateEnabled = false,
    cardDecoration = 'none',
    textAlign = 'text-center'
  } = cardData;

  // Generate template message with cute animations
  const handleGenerateAI = (category) => {
    setIsGenerating(true);
    setTimeout(() => {
      const templates = AI_TEMPLATES[category];
      const selected = templates[Math.floor(Math.random() * templates.length)];
      // Replace recipient name in templates if available
      const customized = recipient
        ? `${selected.replace('To the one', `Dear ${recipient}, the one`).replace('Chapter of your life', `Chapter of your life, ${recipient}`)}`
        : selected;

      onChangeField('message', customized);
      setIsGenerating(false);
      setAiExpanded(false);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-5 w-full bg-white/40 p-6 rounded-3xl border border-white/50 shadow-md backdrop-blur-xs">
      {/* Editor Tabs */}
      <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-2xl">
        {['vibe', 'content', 'settings'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl tracking-wide capitalize transition-all duration-200 ${
              activeTab === tab
                ? 'bg-white text-slate-800 shadow-sm border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Editor Content Area */}
      <div className="flex flex-col gap-5 min-h-[480px]">
        {/* ======================================================== */}
        {/* 0. VIBE & DESIGN TAB */}
        {/* ======================================================== */}
        {activeTab === 'vibe' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-5 text-left animate-fade-in"
          >
            {/* Theme Selector */}
            <ThemeSelector
              activeThemeId={theme.id}
              onChangeTheme={(selectedTheme) => {
                onChangeField('theme', selectedTheme);
                onChangeField('textColor', selectedTheme.textColor);
                onChangeField('titleColor', selectedTheme.titleColor);
                onChangeField('titleFont', selectedTheme.titleFont);
                onChangeField('bodyFont', selectedTheme.bodyFont);
              }}
            />

            {/* Divider */}
            <div className="h-[1px] bg-slate-200/40 w-full my-1" />

            {/* Typography Controls */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-xs tracking-wider uppercase">
                <Type className="w-4 h-4 text-pink-400" />
                <span>Letter Typography</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title Font */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Title Font</label>
                  <select
                    value={titleFont}
                    onChange={(e) => onChangeField('titleFont', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input focus:glass-input-focus outline-none cursor-pointer"
                  >
                    {FONTS.map((font) => (
                      <option key={font.id} value={font.id} className={font.className}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Body Font */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Body Font</label>
                  <select
                    value={bodyFont}
                    onChange={(e) => onChangeField('bodyFont', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input focus:glass-input-focus outline-none cursor-pointer"
                  >
                    {FONTS.map((font) => (
                      <option key={font.id} value={font.id} className={font.className}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Alignment & Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {/* Text Alignment */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Alignment</label>
                  <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl w-fit">
                    {[
                      { align: 'text-left', icon: <AlignLeft className="w-4 h-4" /> },
                      { align: 'text-center', icon: <AlignCenter className="w-4 h-4" /> },
                      { align: 'text-right', icon: <AlignRight className="w-4 h-4" /> }
                    ].map((item) => (
                      <button
                        key={item.align}
                        type="button"
                        onClick={() => onChangeField('textAlign', item.align)}
                        className={`p-2 rounded-lg transition-all duration-200 cursor-pointer ${
                          textAlign === item.align
                            ? 'bg-white text-pink-500 shadow-xs border border-slate-200/25'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {item.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Color Tweaks */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Text Colors</label>
                  <div className="flex items-center gap-5 mt-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={titleColor}
                        onChange={(e) => onChangeField('titleColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 bg-transparent"
                        title="Title Color"
                      />
                      <span className="text-[10px] font-semibold text-slate-500">Title</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => onChangeField('textColor', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 bg-transparent"
                        title="Message Color"
                      />
                      <span className="text-[10px] font-semibold text-slate-500">Body</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* 1. CONTENT TAB */}
        {/* ======================================================== */}
        {activeTab === 'content' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Sender / Recipient grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">To (Recipient)</label>
                <input
                  type="text"
                  placeholder="Recipient name"
                  value={recipient}
                  onChange={(e) => onChangeField('recipient', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs glass-input focus:glass-input-focus"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">From (Sender)</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={sender}
                  onChange={(e) => onChangeField('sender', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs glass-input focus:glass-input-focus"
                />
              </div>
            </div>

            {/* Letter Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Card Header / Title</label>
              <input
                type="text"
                placeholder="A warm cozy title..."
                value={title}
                onChange={(e) => onChangeField('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-xs glass-input focus:glass-input-focus"
              />
            </div>

            {/* Personalized Message + AI Prompt tool */}
            <div className="flex flex-col gap-1.5 relative">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Your Letter Message</label>
                
                {/* AI Prompt Drawer Button */}
                <button
                  type="button"
                  onClick={() => setAiExpanded(!aiExpanded)}
                  className="flex items-center gap-1 text-[10px] font-bold text-purple-500 hover:text-purple-600 active:scale-95 transition-all bg-purple-50 px-2 py-1 rounded-md"
                >
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  <span>AI Message Helper</span>
                  {aiExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* AI Drawer Options */}
              <AnimatePresence>
                {aiExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-purple-50/50 rounded-2xl border border-purple-100 p-3 mb-2 flex flex-col gap-2"
                  >
                    <p className="text-[10px] font-semibold text-purple-600">Select an aesthetic mood:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleGenerateAI('love')}
                        className="py-2 px-3 text-[10px] font-medium bg-white hover:bg-pink-50 border border-purple-100 rounded-xl text-pink-600 text-left transition-colors flex items-center justify-between"
                      >
                        <span>Romantic Love</span>
                        <Heart className="w-2.5 h-2.5 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateAI('birthday')}
                        className="py-2 px-3 text-[10px] font-medium bg-white hover:bg-yellow-50 border border-purple-100 rounded-xl text-yellow-700 text-left transition-colors flex items-center justify-between"
                      >
                        <span>Happy Birthday</span>
                        <span>🎂</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateAI('gratitude')}
                        className="py-2 px-3 text-[10px] font-medium bg-white hover:bg-indigo-50 border border-purple-100 rounded-xl text-indigo-600 text-left transition-colors flex items-center justify-between"
                      >
                        <span>Deep Gratitude</span>
                        <span>✨</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGenerateAI('friendship')}
                        className="py-2 px-3 text-[10px] font-medium bg-white hover:bg-teal-50 border border-purple-100 rounded-xl text-teal-700 text-left transition-colors flex items-center justify-between"
                      >
                        <span>Cozy Friendship</span>
                        <span>🧸</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <textarea
                placeholder="Write your long heartwarming thoughts here..."
                rows={6}
                value={message}
                onChange={(e) => onChangeField('message', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl text-xs glass-input focus:glass-input-focus resize-none leading-relaxed"
                disabled={isGenerating}
              />
            </div>

            {/* Photo Attachment component */}
            <ImageUploader
              onImageUploaded={(url) => onChangeField('imageUrl', url)}
              currentImageUrl={cardData.imageUrl}
            />
          </motion.div>
        )}



        {/* ======================================================== */}
        {/* 3. SETTINGS & EXTRAS TAB */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Ambient background music selection */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1">
                  <Music className="w-3 h-3 text-indigo-400" />
                  <span>Ambient Background Music</span>
                </label>
              </div>

              {/* Predefined tracks picker */}
              <div className="flex flex-col gap-1.5">
                <select
                  onChange={(e) => {
                    const selected = PLAYLIST.find((track) => track.url === e.target.value);
                    if (selected) {
                      onChangeField('musicUrl', selected.url);
                    } else if (e.target.value === 'custom') {
                      onChangeField('musicUrl', '');
                    } else {
                      onChangeField('musicUrl', '');
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl text-xs glass-input focus:glass-input-focus outline-none cursor-pointer"
                >
                  <option value="">No Background Music</option>
                  {PLAYLIST.map((track) => (
                    <option key={track.id} value={track.url} selected={musicUrl === track.url}>
                      {track.name} (Lo-Fi)
                    </option>
                  ))}
                  <option value="custom" selected={musicUrl && !PLAYLIST.some((t) => t.url === musicUrl)}>
                    -- Custom Music Link --
                  </option>
                </select>

                {/* Custom music input if selected custom */}
                {(musicUrl === '' || !PLAYLIST.some((t) => t.url === musicUrl)) && (
                  <input
                    type="url"
                    placeholder="Paste mp3 direct URL link..."
                    value={musicUrl}
                    onChange={(e) => onChangeField('musicUrl', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs glass-input focus:glass-input-focus mt-1"
                  />
                )}
              </div>
            </div>

            {/* Password protection toggle */}
            <div className="p-4 rounded-2xl bg-white/40 border border-white/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Password Lock Card</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Encrypt viewer opening access.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isPasswordProtected}
                  onChange={(e) => onChangeField('isPasswordProtected', e.target.checked)}
                  className="w-4 h-4 rounded-md accent-pink-400 cursor-pointer"
                />
              </div>

              {isPasswordProtected && (
                <input
                  type="text"
                  placeholder="Set lock password..."
                  value={password}
                  onChange={(e) => onChangeField('password', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs glass-input focus:glass-input-focus animate-fade-in"
                />
              )}
            </div>

            {/* Time lock (open after date) */}
            <div className="p-4 rounded-2xl bg-white/40 border border-white/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Open After Date</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Lock card until a specific date.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isOpenAfterDateEnabled}
                  onChange={(e) => onChangeField('isOpenAfterDateEnabled', e.target.checked)}
                  className="w-4 h-4 rounded-md accent-pink-400 cursor-pointer"
                />
              </div>

              {isOpenAfterDateEnabled && (
                <input
                  type="datetime-local"
                  value={openAfterDate}
                  onChange={(e) => onChangeField('openAfterDate', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs glass-input focus:glass-input-focus outline-none cursor-pointer animate-fade-in"
                />
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
