import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

const STICKERS = [
  // Hearts & Romance
  { char: '💖', name: 'Sparkle Heart' },
  { char: '💝', name: 'Gift Heart' },
  { char: '💕', name: 'Two Hearts' },
  { char: '💌', name: 'Love Letter' },
  
  // Cute & Cozy
  { char: '🧸', name: 'Teddy Bear' },
  { char: '🐱', name: 'Cute Kitty' },
  { char: '🐶', name: 'Happy Puppy' },
  { char: '🐰', name: 'Cute Bunny' },
  
  // Dreamy & Magic
  { char: '⭐', name: 'Star' },
  { char: '✨', name: 'Sparkles' },
  { char: '🌈', name: 'Rainbow' },
  { char: '🌙', name: 'Crescent Moon' },
  { char: '☁️', name: 'Fluffy Cloud' },
  
  // Celebrations & Nature
  { char: '🌸', name: 'Cherry Blossom' },
  { char: '🍀', name: 'Four Clover' },
  { char: '🎈', name: 'Balloon' },
  { char: '🧁', name: 'Cupcake' },
  { char: '🎉', name: 'Popper' },
  { char: '🎁', name: 'Gift' }
];

export default function StickerPicker({ onSelectSticker }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs tracking-wider uppercase">
        <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
        <span>Cute Stickers</span>
      </div>

      <div className="grid grid-cols-5 gap-2.5 p-3 rounded-2xl bg-white/40 border border-white/50 shadow-inner max-h-48 overflow-y-auto">
        {STICKERS.map((sticker) => (
          <button
            key={sticker.name}
            onClick={() => onSelectSticker(sticker.char)}
            type="button"
            className="w-10 h-10 flex items-center justify-center text-2xl rounded-xl hover:bg-white/80 active:scale-90 hover:shadow-sm transition-all duration-200"
            title={sticker.name}
          >
            {sticker.char}
          </button>
        ))}
      </div>
    </div>
  );
}
