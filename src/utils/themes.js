export const THEMES = [
  {
    id: 'pastel-dreams',
    name: 'Pastel Dreams',
    class: 'bg-gradient-to-tr from-rose-100 via-pink-100 to-indigo-100',
    cardClass: 'bg-white/70 border border-white/60 text-slate-800 shadow-md shadow-rose-100',
    titleFont: 'font-serif',
    bodyFont: 'font-sans',
    textColor: '#334155', // slate-700
    titleColor: '#1e293b', // slate-800
    accentColor: '#ec4899', // pink-500
    description: 'Dreamy pink & violet watercolor shades.'
  },
  {
    id: 'midnight-stars',
    name: 'Midnight Stars',
    class: 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950',
    cardClass: 'bg-slate-900/60 border border-indigo-500/25 text-indigo-100 shadow-lg shadow-indigo-950/40 backdrop-blur-md',
    titleFont: 'font-serif',
    bodyFont: 'font-sans',
    textColor: '#cbd5e1', // slate-300
    titleColor: '#f8fafc', // slate-50
    accentColor: '#818cf8', // indigo-400
    description: 'A cozy midnight sky with faint blue stars.'
  },
  {
    id: 'vintage-floral',
    name: 'Vintage Floral',
    class: 'bg-gradient-to-tr from-amber-50 via-stone-100 to-emerald-50',
    cardClass: 'bg-[#faf6f0]/80 border border-amber-900/10 text-amber-900/80 shadow-sm',
    titleFont: 'font-vintage',
    bodyFont: 'font-vintage',
    textColor: '#451a03', // amber-950
    titleColor: '#270800',
    accentColor: '#10b981', // emerald-500
    description: 'Nostalgic botanic fields, old paper textures.'
  },
  {
    id: 'retro-cafe',
    name: 'Retro Cafe',
    class: 'bg-gradient-to-tr from-amber-100 via-orange-100 to-amber-50',
    cardClass: 'bg-orange-50/70 border border-orange-200 text-orange-950 shadow-sm',
    titleFont: 'font-vintage',
    bodyFont: 'font-vintage',
    textColor: '#431407', // orange-950
    titleColor: '#2b0c03',
    accentColor: '#f97316', // orange-500
    description: 'Lively cafe tunes, typewriter aesthetic.'
  },
  {
    id: 'cute-valentine',
    name: 'Cute Valentine',
    class: 'bg-gradient-to-tr from-red-100 via-pink-100 to-rose-200',
    cardClass: 'bg-white/80 border border-pink-200 text-rose-900 shadow-md shadow-pink-100',
    titleFont: 'font-playful',
    bodyFont: 'font-handwritten',
    textColor: '#881337', // rose-950
    titleColor: '#4c0519',
    accentColor: '#f43f5e', // rose-500
    description: 'Playful pink letters full of sweet hearts.'
  },
  {
    id: 'starry-night',
    name: 'Starry Night',
    class: 'bg-gradient-to-tr from-blue-950 via-violet-950 to-fuchsia-950',
    cardClass: 'bg-white/10 border border-white/10 text-pink-100 shadow-xl shadow-purple-950/20 backdrop-blur-md',
    titleFont: 'font-script',
    bodyFont: 'font-handwritten',
    textColor: '#fae8ff', // fuchsia-100
    titleColor: '#ffffff',
    accentColor: '#c084fc', // purple-400
    description: 'Dreamy dynamic galaxy violet vibes.'
  }
];

export const FONTS = [
  { id: 'font-sans', name: 'Outfit (Sleek Sans)', className: 'font-sans' },
  { id: 'font-serif', name: 'Playfair (Classic Serif)', className: 'font-serif' },
  { id: 'font-vintage', name: 'Garamond (Vintage Roman)', className: 'font-vintage' },
  { id: 'font-handwritten', name: 'Caveat (Cute Handwriting)', className: 'font-handwritten' },
  { id: 'font-script', name: 'Sacramento (Elegant Script)', className: 'font-script' },
  { id: 'font-playful', name: 'Gloria (Playful Hand)', className: 'font-playful' }
];

export const PLAYLIST = [
  {
    id: 'music-lofi',
    name: 'Chill Coffee Lo-Fi',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // royalty free test music
    description: 'Soft hip-hop beats to read letters by.'
  },
  {
    id: 'music-piano',
    name: 'Aesthetic Dreamy Piano',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    description: 'Gentle classical piano chords.'
  },
  {
    id: 'music-ambient',
    name: 'Starry Night Ambient',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    description: 'Floating cozy synthesizer padding.'
  }
];
