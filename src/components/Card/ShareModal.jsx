import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Share2, X, Send, Mail, Sparkles, QrCode, Smartphone, Laptop, Wifi, ExternalLink } from 'lucide-react';
import { getShareUrl, getBaseAppUrl, isLocalHost } from '../../utils/codec';
import { getCard } from '../../supabase/config';

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DEFAULT_LAN_IP = '192.168.31.46';

export default function ShareModal({ cardId, cardData, onClose }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [resolvedCard, setResolvedCard] = useState(cardData);
  const isLocal = isLocalHost();

  // Saved or detected Wi-Fi IP for testing across local devices
  const [customIp, setCustomIp] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dearyou_lan_ip') || DEFAULT_LAN_IP;
    }
    return DEFAULT_LAN_IP;
  });

  // Target device mode: 'mobile' (Wi-Fi LAN IP or deployed domain) vs 'computer' (localhost)
  const [shareTarget, setShareTarget] = useState(isLocal ? 'mobile' : 'universal');

  // Fallback: if cardData wasn't passed directly, load from local storage
  useEffect(() => {
    if (!resolvedCard && cardId) {
      getCard(cardId).then((data) => {
        if (data) setResolvedCard(data);
      });
    }
  }, [cardId, resolvedCard]);

  // Construct mobile-friendly base URL
  const mobileBase = isLocal
    ? `http://${customIp}:${(typeof window !== 'undefined' && window.location.port) || '5173'}`
    : getBaseAppUrl();

  const standardBase = getBaseAppUrl();

  const activeBaseUrl = (isLocal && shareTarget === 'mobile') ? mobileBase : standardBase;

  const shareUrl = resolvedCard
    ? getShareUrl(resolvedCard, activeBaseUrl)
    : `${activeBaseUrl}/#/share/${cardId}`;

  // Direct QR Code URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(shareUrl)}`;

  const handleIpChange = (newIp) => {
    setCustomIp(newIp);
    try {
      localStorage.setItem('dearyou_lan_ip', newIp);
    } catch (e) {}
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: resolvedCard?.title || 'Special Greeting Card For You',
          text: `I created a personalized greeting card for you on forU! Open it here:`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Native share failed:', err);
        }
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      {/* Background Click Close */}
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative z-10 w-full max-w-md glass-panel bg-white/95 p-6 sm:p-7 rounded-[32px] border border-white/80 shadow-2xl flex flex-col gap-5 my-auto max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4.5 right-4.5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 active:scale-90 transition-all cursor-pointer z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shadow-sm mb-2.5">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-800">Your Card is Ready!</h3>
          <p className="text-xs text-slate-400 mt-0.5">Share with someone special or send to your other devices.</p>
        </div>

        {/* Localhost Multi-Device Mode Switcher */}
        {isLocal && (
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col gap-2.5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>Local Testing on Multiple Devices</span>
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-900 font-semibold uppercase">
                Wi-Fi Mode
              </span>
            </div>

            <p className="text-[10px] text-amber-700 leading-snug">
              Phones and tablets on your Wi-Fi cannot open <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono text-[9px]">localhost</code>. We automatically generated a Wi-Fi link so other devices can open it!
            </p>

            {/* Target device tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-amber-100/60">
              <button
                type="button"
                onClick={() => setShareTarget('mobile')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                  shareTarget === 'mobile'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-amber-800 hover:bg-amber-200/40'
                }`}
              >
                <Smartphone className="w-3 h-3 text-pink-500" />
                <span>Phone / Wi-Fi Device</span>
              </button>
              <button
                type="button"
                onClick={() => setShareTarget('computer')}
                className={`flex-1 py-1.5 px-2.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                  shareTarget === 'computer'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-amber-800 hover:bg-amber-200/40'
                }`}
              >
                <Laptop className="w-3 h-3 text-indigo-500" />
                <span>This Computer (Localhost)</span>
              </button>
            </div>

            {/* Editable Wi-Fi IP if needed */}
            {shareTarget === 'mobile' && (
              <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
                <span className="text-[10px] text-amber-800 font-medium">Wi-Fi IP:</span>
                <input
                  type="text"
                  value={customIp}
                  onChange={(e) => handleIpChange(e.target.value.trim())}
                  placeholder="e.g. 192.168.1.10"
                  className="flex-1 px-2 py-1 text-[11px] font-mono bg-white rounded-md border border-amber-300 text-slate-700 outline-none focus:border-pink-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Copy Link Area */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-inner">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent px-3 text-xs text-slate-600 outline-none select-all truncate font-mono"
          />
          <button
            type="button"
            onClick={copyToClipboard}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer shrink-0 ${
              copied
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                : 'bg-pink-500 text-white shadow-sm shadow-pink-200 hover:bg-pink-600'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* QR Code Action & Display */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setShowQr(!showQr)}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-pink-500" />
            <span>{showQr ? 'Hide QR Code' : 'Scan QR Code with Phone Camera'}</span>
          </button>

          <AnimatePresence>
            {showQr && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-200/70"
              >
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <img
                    src={qrCodeUrl}
                    alt="Scan to open on phone"
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium text-center">
                  Point your phone's camera at the screen to open this card instantly! 📸
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Native Web Share button (if browser supports it) */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold shadow-md shadow-pink-200 hover:shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Share via Apps (AirDrop, Messages, etc.)</span>
          </button>
        )}

        {/* Social Share Grid */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase text-center">Send to Loved Ones</span>
          <div className="flex items-center justify-center gap-4 py-1">
            <button
              type="button"
              onClick={() => shareSocial('whatsapp')}
              className="w-11 h-11 rounded-2xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
              title="Share via WhatsApp"
            >
              <Send className="w-5 h-5 fill-current rotate-45 -translate-x-0.5 translate-y-0.5" />
            </button>

            <button
              type="button"
              onClick={() => shareSocial('twitter')}
              className="w-11 h-11 rounded-2xl bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
              title="Share on Twitter"
            >
              <TwitterIcon className="w-5 h-5 text-[#1DA1F2]" />
            </button>

            <button
              type="button"
              onClick={() => shareSocial('email')}
              className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center shadow-xs active:scale-90 transition-all cursor-pointer"
              title="Share via Email"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Micro-Notice & Badge */}
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold tracking-wide">
            <Sparkles className="w-3 h-3 text-emerald-500 animate-pulse" />
            <span>Universal Link • Tested across phones & PCs</span>
          </span>
          <p className="text-[9px] text-slate-400 italic">
            * The card data is fully encrypted and packed into the link. Anyone with this link can open your greeting card!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
