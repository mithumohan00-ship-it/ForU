import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Send, ArrowLeft, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import CardEditor from '../components/Card/CardEditor';
import CardPreview from '../components/Card/CardPreview';
import ShareModal from '../components/Card/ShareModal';
import { THEMES } from '../utils/themes';
import { saveCard } from '../firebase/config';

// Robust unique ID generation
const generateUniqueId = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export default function CreateCard() {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('theme');

  // Initialize with Pastel Dreams or matching template from query params
  const defaultTheme = THEMES.find((t) => t.id === templateId) || THEMES[0];

  // Core greeting card state
  const [cardData, setCardData] = useState({
    title: 'Happy Memories! ✨',
    message: 'Write a long heartwarming message here...',
    recipient: 'Dear one',
    sender: 'Your friend',
    theme: defaultTheme,
    titleFont: defaultTheme.titleFont,
    bodyFont: defaultTheme.bodyFont,
    textColor: defaultTheme.textColor,
    titleColor: defaultTheme.titleColor,
    imageUrl: '',
    textAlign: 'text-center',
    cardDecoration: 'none',
    musicUrl: '',
    password: '',
    isPasswordProtected: false,
    openAfterDate: '',
    isOpenAfterDateEnabled: false
  });

  const [activeSticker, setActiveSticker] = useState(null);
  const [drawingOverlay, setDrawingOverlay] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCardId, setSavedCardId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Sync theme changes if a query param is parsed later
  useEffect(() => {
    if (templateId) {
      const selectedTheme = THEMES.find((t) => t.id === templateId);
      if (selectedTheme) {
        setCardData((prev) => ({
          ...prev,
          theme: selectedTheme,
          textColor: selectedTheme.textColor,
          titleColor: selectedTheme.titleColor,
          titleFont: selectedTheme.titleFont,
          bodyFont: selectedTheme.bodyFont
        }));
      }
    }
  }, [templateId]);

  // Update card data helper
  const handleUpdateField = (field, value) => {
    setCardData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Sync doodle overlay from canvas
  const handleCanvasChange = (dataUrl) => {
    setDrawingOverlay(dataUrl);
  };

  const handleSelectSticker = (stickerChar) => {
    setActiveSticker(stickerChar);
  };

  const handleClearStickerTrigger = () => {
    setActiveSticker(null);
  };

  // Save card and open modal
  const handleSaveCard = async () => {
    if (!cardData.recipient || !cardData.sender) {
      toast.error('Please enter "To" and "From" names! 💌', {
        icon: '✍️',
        style: { borderRadius: '16px', fontSize: '13px' }
      });
      return;
    }

    setIsSaving(true);
    const id = generateUniqueId();
    
    // Package card payload
    const payload = {
      ...cardData,
      drawingOverlay // Embed canvas drawings overlay transparent PNG
    };

    try {
      const res = await saveCard(id, payload);
      if (res.success) {
        setSavedCardId(id);
        setShowShareModal(true);
        toast.success(
          res.mode === 'local'
            ? 'Card saved to LocalDB! Fallback active ✨'
            : 'Card saved to Cloud Firestore! 💌',
          {
            duration: 4000,
            style: { borderRadius: '16px', fontSize: '13px' }
          }
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save card. Try again.', {
        style: { borderRadius: '16px', fontSize: '13px' }
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50/20 py-8 px-4 md:px-6">
      <Toaster position="bottom-center" reverseOrder={false} />
      
      {/* Visual background blurs */}
      <div className="absolute top-10 left-[-10%] w-96 h-96 rounded-full bg-pink-100/35 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-100/35 blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl flex flex-col gap-6 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-4 p-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white/40 border border-slate-200/50 py-2 px-4 rounded-xl shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">Design Studio</span>
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:inline" />
            <motion.button
              onClick={handleSaveCard}
              disabled={isSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-purple-500 text-white text-xs font-bold shadow-md shadow-pink-200 hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Save & Share Card</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* EDITOR WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Customizer controls */}
          <div className="lg:col-span-7 w-full">
            <CardEditor
              cardData={cardData}
              onChangeField={handleUpdateField}
              activeSticker={activeSticker}
              onSelectSticker={handleSelectSticker}
              clearStickerTrigger={handleClearStickerTrigger}
              onCanvasChange={handleCanvasChange}
            />
          </div>

          {/* Right panel: Real-time Live Preview card */}
          <div className="lg:col-span-5 w-full lg:sticky lg:top-28 flex flex-col gap-4">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                Live Card Mockup
              </span>
            </div>
            <CardPreview
              cardData={cardData}
              drawingOverlay={drawingOverlay}
            />
          </div>

        </div>

      </div>

      {/* Shareable Modal popup upon successful save */}
      <AnimatePresence>
        {showShareModal && savedCardId && (
          <ShareModal
            cardId={savedCardId}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
