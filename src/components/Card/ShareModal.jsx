import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Share2, X, Send, Mail } from 'lucide-react';

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function ShareModal({ cardId, onClose }) {
  const [copied, setCopied] = useState(false);
  
  // Construct absolute dynamic card opening links
  const shareUrl = `${window.location.origin}/#/share/${cardId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const shareSocial = (platform) => {
    let url = '';
    const text = encodeURIComponent("I created a beautiful, personalized digital greeting card for you on forU! Open it here:");
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${text}%20${encodeURIComponent(shareUrl)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent("A sweet greeting card for you! 💌")}&body=${text}%20${encodeURIComponent(shareUrl)}`;
        break;
      default:
        break;
    }

    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      {/* Background Click Close */}
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative z-10 w-full max-w-sm glass-panel bg-white/90 p-7 rounded-[28px] border border-white/60 shadow-2xl flex flex-col gap-6"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4.5 right-4.5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 active:scale-90 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shadow-sm mb-3">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-800">Your Card is Ready!</h3>
          <p className="text-xs text-slate-400 mt-1">Share this cute unique link with someone special.</p>
        </div>

        {/* Copy Link Area */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-inner">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent px-3 text-xs text-slate-600 outline-none select-all truncate"
          />
          <button
            type="button"
            onClick={copyToClipboard}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 active:scale-95 ${
              copied
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                : 'bg-pink-500 text-white shadow-sm shadow-pink-200 hover:bg-pink-600'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Social Share Grid */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase text-center">Share Directly</span>
          <div className="flex items-center justify-center gap-4 py-2">
            <button
              type="button"
              onClick={() => shareSocial('whatsapp')}
              className="w-11 h-11 rounded-2xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 flex items-center justify-center shadow-xs active:scale-90 transition-all"
              title="Share via WhatsApp"
            >
              <Send className="w-5 h-5 fill-current rotate-45 -translate-x-0.5 translate-y-0.5" />
            </button>

            <button
              type="button"
              onClick={() => shareSocial('twitter')}
              className="w-11 h-11 rounded-2xl bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 flex items-center justify-center shadow-xs active:scale-90 transition-all"
              title="Share on Twitter"
            >
              <TwitterIcon className="w-5 h-5 text-[#1DA1F2]" />
            </button>

            <button
              type="button"
              onClick={() => shareSocial('email')}
              className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center shadow-xs active:scale-90 transition-all"
              title="Share via Email"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Micro-Notice */}
        <p className="text-[9px] text-slate-400 text-center italic">
          * Anyone with this link will be able to view your card. Keep it safe!
        </p>
      </motion.div>
    </div>
  );
}
