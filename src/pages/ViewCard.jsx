import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, RotateCcw, Share2, Plus, ArrowLeft, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import toast, { Toaster } from 'react-hot-toast';
import { getCard } from '../supabase/config';
import { decompressCard, extractCompressedCardFromUrl, compressCard } from '../utils/codec';
import Loader from '../components/Common/Loader';
import CardPreview from '../components/Card/CardPreview';
import ShareModal from '../components/Card/ShareModal';

export default function ViewCard() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const compressedData = searchParams.get('c');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);
  const [error, setError] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Fetch or decompress card details
  useEffect(() => {
    const fetchCard = async () => {
      try {
        let data = null;

        // 1. Try decompressing from URL anywhere (?c=...)
        const rawCompressed = extractCompressedCardFromUrl() || compressedData;
        if (rawCompressed) {
          data = decompressCard(rawCompressed);
          if (data) {
            try {
              localStorage.setItem(`dearyou_card_${data.id}`, JSON.stringify(data));
            } catch (e) {
              console.warn('Could not cache card to local storage:', e);
            }
          }
        }

        // 2. Fall back to ID lookup
        if (!data && id) {
          data = await getCard(id);
        }

        if (data) {
          setCard(data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [id, compressedData]);

  // Capture DOM preview and trigger PNG download
  const handleDownloadImage = () => {
    const node = document.getElementById('greeting-card-preview-node');
    if (!node) return;

    toast.loading('Processing card pixels... 📸', {
      id: 'capture',
      style: { borderRadius: '16px', fontSize: '13px' }
    });

    // Capture options for premium render output
    html2canvas(node, {
      scale: 2.5, // 2.5x density multiplier for vector crispness
      useCORS: true,
      backgroundColor: null, // Keep transparent corners
      logging: false,
    })
      .then((canvas) => {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `foru-card-${id.substring(0, 6)}.png`;
        link.href = url;
        link.click();
        
        toast.success('Aesthetic card downloaded! 💖', {
          id: 'capture',
          style: { borderRadius: '16px', fontSize: '13px' }
        });
      })
      .catch((err) => {
        console.error('html2canvas capture error:', err);
        toast.error('Pixel capture failed. Try again.', {
          id: 'capture',
          style: { borderRadius: '16px', fontSize: '13px' }
        });
      });
  };

  if (loading) return <Loader message="Unfolding card details..." />;

  // 404 State
  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="glass-panel bg-white/70 max-w-sm p-8 rounded-3xl border border-white/60 shadow-xl text-center flex flex-col items-center gap-5">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 shadow-sm">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-800">Card Not Found</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              We couldn't locate this digital greeting card. It may have expired or is locked inside a folder.
            </p>
          </div>
          <Link to="/" className="w-full">
            <button type="button" className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs">
              Go to Homepage
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const theme = card.theme || {};

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center py-12 px-4 overflow-hidden transition-all duration-700 ${
      theme.class || 'bg-slate-50'
    }`}>
      <Toaster position="bottom-center" reverseOrder={false} />

      {/* Ambient background glows */}
      <div className="absolute top-10 left-[-10%] w-96 h-96 rounded-full bg-white/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-white/20 blur-3xl pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-6 left-6 z-30">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white/65 border border-white/60 py-2.5 px-4 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Main card viewport grid */}
      <div className="mx-auto max-w-4xl w-full flex flex-col md:flex-row items-center justify-center gap-8 z-10">
        
        {/* Card Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <CardPreview
            cardData={card}
            drawingOverlay={card.drawingOverlay}
          />
        </motion.div>

        {/* Sidebar Toolbar Controls */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full max-w-xs flex flex-col gap-4"
        >
          <div className="p-6 rounded-3xl glass-panel bg-white/65 border border-white/60 shadow-xl flex flex-col gap-5 text-left">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-pink-500 bg-pink-50 px-2.5 py-1 rounded-md">
                Viewer Panel
              </span>
              <h3 className="font-serif text-base font-extrabold text-slate-800 mt-2">Special Memories</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                Save a visual copy or replay the envelope ceremony with lofi beats.
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Capture PNG Button */}
              <button
                type="button"
                onClick={handleDownloadImage}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 text-white text-xs font-bold shadow-md shadow-pink-200 hover:shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download as Image</span>
              </button>

              {/* Replay Ceremony Button */}
              <button
                type="button"
                onClick={() => {
                  const targetId = card?.id || id;
                  const cParam = compressedData || (card ? compressCard(card) : '');
                  if (cParam) {
                    navigate(`/share?c=${cParam}`);
                  } else {
                    navigate(`/share/${targetId}`);
                  }
                }}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay Envelope</span>
              </button>

              {/* Share Card Modal Trigger */}
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Card Link</span>
              </button>
            </div>

            <div className="h-[1px] bg-slate-200/50 w-full" />

            {/* Create Card Loop Trigger */}
            <Link to="/create" className="w-full">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Plus className="w-4 h-4 text-pink-400 animate-pulse" />
                <span>Create Your Own Card</span>
              </button>
            </Link>
          </div>
        </motion.div>

      </div>

      {/* Share Modal Pop */}
      <AnimatePresence>
        {showShareModal && (
          <ShareModal
            cardId={card?.id || id}
            cardData={card}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
