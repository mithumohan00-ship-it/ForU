import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export default function CardPreview({ cardData, drawingOverlay }) {
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
    imageUrl = '',
    textAlign = 'text-center',
    cardDecoration = 'none'
  } = cardData;

  // Render decorative stamps
  const renderDecoration = () => {
    switch (cardDecoration) {
      case 'heart-stamp':
        return (
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full border-2 border-dashed border-pink-400/50 flex items-center justify-center rotate-12 text-pink-400 opacity-60">
            <Heart className="w-5 h-5 fill-current" />
          </div>
        );
      case 'sparkles':
        return (
          <div className="absolute top-4 right-4 text-yellow-400 opacity-60 animate-pulse-slow">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto">
      {/* Visual Mockup Container (Mimics Mobile Card viewport) */}
      <div
        id="greeting-card-preview-node"
        className={`relative w-full aspect-[3/4.5] rounded-[32px] p-8 overflow-hidden shadow-2xl transition-all duration-500 flex flex-col justify-between ${
          theme.class || 'bg-gradient-to-tr from-rose-100 to-indigo-100'
        }`}
      >
        {/* Dynamic floating circles for luxury atmosphere */}
        <div className="absolute top-[-10%] left-[-10%] w-48 h-48 rounded-full bg-white/20 blur-xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-48 h-48 rounded-full bg-white/20 blur-xl pointer-events-none" />

        {renderDecoration()}

        {/* HEADER SECTION (To / From) */}
        <div className="z-10 flex flex-col gap-1 text-left">
          {recipient && (
            <p
              className={`text-sm tracking-wider uppercase font-semibold opacity-70`}
              style={{ color: textColor }}
            >
              Dear {recipient},
            </p>
          )}
        </div>

        {/* BODY CONTENT (Message & Image) */}
        <div className={`z-10 flex flex-col justify-center flex-grow py-6 gap-6 ${textAlign}`}>
          {/* Title */}
          {title && (
            <h1
              className={`text-2xl md:text-3xl font-bold leading-tight tracking-tight ${titleFont}`}
              style={{ color: titleColor }}
            >
              {title}
            </h1>
          )}

          {/* Polaroid Image Box */}
          {imageUrl && (
            <div className="relative mx-auto w-48 rotate-[-2deg] bg-white p-3 rounded-2xl shadow-md border border-slate-100/50 flex flex-col gap-2 hover:rotate-0 hover:scale-102 transition-all duration-300">
              <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-50">
                <img
                  src={imageUrl}
                  alt="Greeting Attachment"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-4 flex items-center justify-center">
                <Heart className="w-3 h-3 fill-pink-400 text-pink-400 animate-pulse" />
              </div>
            </div>
          )}

          {/* Core message text */}
          {message && (
            <p
              className={`text-sm leading-relaxed whitespace-pre-wrap ${bodyFont}`}
              style={{ color: textColor }}
            >
              {message}
            </p>
          )}
        </div>

        {/* FOOTER SECTION (From) */}
        <div className="z-10 flex flex-col items-end justify-end mt-auto pt-2">
          {sender && (
            <div className="text-right">
              <p
                className={`text-[10px] tracking-wider uppercase font-semibold opacity-60`}
                style={{ color: textColor }}
              >
                With love,
              </p>
              <p
                className={`text-lg font-bold tracking-tight mt-0.5 ${bodyFont}`}
                style={{ color: titleColor }}
              >
                {sender}
              </p>
            </div>
          )}
        </div>

        {/* DRAWING / STICKERS OVERLAY */}
        {drawingOverlay && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <img
              src={drawingOverlay}
              alt="Doodle Overlay"
              className="w-full h-full object-fill"
            />
          </div>
        )}

        {/* Aesthetic bottom wax seal decoration */}
        <div className="absolute bottom-6 left-6 z-10 opacity-30 flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-slate-500/80">
          <Heart className="w-2.5 h-2.5 fill-current" />
          <span>forU Seal</span>
        </div>
      </div>
    </div>
  );
}
