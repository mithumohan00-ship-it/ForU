import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, Unlock, Calendar, Volume2, VolumeX, RefreshCw, AlertCircle, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getCard } from '../firebase/config';
import { decompressCard, extractCompressedCardFromUrl, compressCard } from '../utils/codec';
import Loader from '../components/Common/Loader';
import CardPreview from '../components/Card/CardPreview';

export default function ShareEnvelope() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const compressedData = searchParams.get('c');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);
  const [error, setError] = useState(false);

  // Security & Date lock states
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isTimeUnlocked, setIsTimeUnlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Envelope opening states
  const [isEnvelopeOpened, setIsEnvelopeOpened] = useState(false);
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Fetch or decompress card data
  useEffect(() => {
    let timerInterval = null;

    const fetchCard = async () => {
      try {
        let data = null;

        // 1. Check for universal compressed link parameter (?c=...) anywhere in URL
        const rawCompressed = extractCompressedCardFromUrl() || compressedData;
        if (rawCompressed) {
          data = decompressCard(rawCompressed);
          if (data) {
            // Cache in recipient's local vault so it persists in their history
            try {
              localStorage.setItem(`dearyou_card_${data.id}`, JSON.stringify(data));
            } catch (e) {
              console.warn('Could not cache card to local storage:', e);
            }
          }
        }

        // 2. Fall back to ID lookup in Firestore or LocalStorage
        if (!data && id) {
          data = await getCard(id);
        }

        if (data) {
          setCard(data);
          
          // Check password lock initially
          if (!data.isPasswordProtected) {
            setIsPasswordUnlocked(true);
          }

          // Check time lock initially
          if (data.isOpenAfterDateEnabled) {
            const checkTime = () => {
              const now = new Date();
              const unlockTime = new Date(data.openAfterDate);
              const diff = unlockTime - now;

              if (diff <= 0) {
                setIsTimeUnlocked(true);
              } else {
                setIsTimeUnlocked(false);
                setTimeLeft({
                  days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                  hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                  minutes: Math.floor((diff / 1000 / 60) % 60),
                  seconds: Math.floor((diff / 1000) % 60)
                });
              }
            };
            
            checkTime();
            timerInterval = setInterval(checkTime, 1000);
          } else {
            setIsTimeUnlocked(true);
          }
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

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [id, compressedData]);

  // Handle password unlock
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === card.password) {
      setIsPasswordUnlocked(true);
      setPasswordError(false);
      confetti({
        particleCount: 40,
        spread: 30,
        colors: ['#a78bfa', '#fbcfe8']
      });
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  // Autoplay music handler when envelope is clicked open
  const triggerAudio = (url) => {
    if (!url) return;
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
        audioRef.current.loop = true;
      }
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.warn("Autoplay block by browser policies, waiting for user trigger:", e));
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  // Toggle ambient music
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Stop music on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Envelope trigger open
  const handleOpenEnvelope = () => {
    setIsEnvelopeOpened(true);
    
    // Autoplay music
    if (card?.musicUrl) {
      triggerAudio(card.musicUrl);
    }

    // Launch celebratory pastel confetti burst!
    const end = Date.now() + 1.2 * 1000;
    const colors = ['#fbcfe8', '#fecdd3', '#e0f2fe', '#fef3c7', '#c084fc'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  if (loading) return <Loader message="Fetching secret letter..." />;

  // 404 / Error State
  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="glass-panel bg-white/70 max-w-sm p-8 rounded-3xl border border-white/60 shadow-xl text-center flex flex-col items-center gap-5">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-400 shadow-sm">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-slate-800">Letter Not Found</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              This digital greeting card might have expired, had its key updated, or vanished in the wind.
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

  // Determine active dynamic visual backdrop class
  const theme = card.theme || {};

  // Render Gates if Locked
  const isLocked = !isPasswordUnlocked || !isTimeUnlocked;

  return (
    <div className={`relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden transition-all duration-700 ${
      isEnvelopeOpened ? theme.class || 'bg-slate-50' : 'bg-gradient-to-tr from-pink-50 via-rose-50 to-indigo-50'
    }`}>
      
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-10 left-[-10%] w-96 h-96 rounded-full bg-pink-100/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-100/30 blur-3xl pointer-events-none" />

      {/* Floating Music Visualizer Overlay */}
      {isEnvelopeOpened && card.musicUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 glass-panel bg-white/85 py-2 px-4 rounded-full border border-white/60 shadow-lg flex items-center gap-3 cursor-pointer select-none hover:shadow-xl active:scale-95 transition-all"
          onClick={togglePlay}
        >
          {/* Animated music visualizer bar lines */}
          <div className="flex items-end gap-0.5 h-3 w-4">
            {[1, 2, 3, 4].map((bar) => (
              <motion.div
                key={bar}
                animate={isPlaying ? { height: [3, 12, 3] } : { height: 3 }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8 + bar * 0.15,
                  ease: "easeInOut"
                }}
                className="w-0.5 bg-pink-500 rounded-full"
              />
            ))}
          </div>

          <span className="text-[10px] font-bold text-slate-700 max-w-28 truncate">
            {isPlaying ? 'Playing Melody' : 'Music Muted'}
          </span>

          <button
            type="button"
            className="p-1 rounded-full bg-pink-50 text-pink-500 hover:bg-pink-100 transition-colors"
          >
            {isPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </motion.div>
      )}

      {/* GATES VIEWS */}
      <AnimatePresence mode="wait">
        {isLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="z-10 w-full max-w-sm glass-panel bg-white/90 p-8 rounded-3xl border border-white/60 shadow-2xl flex flex-col gap-6 text-center"
          >
            {/* 1. PASSWORD GATE */}
            {!isPasswordUnlocked && (
              <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
                <div className="mx-auto w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shadow-xs animate-bounce">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-800">Password Locked</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    This beautiful letter from <span className="font-semibold text-slate-600">{card.sender}</span> is encrypted. Enter the password to unlock.
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <input
                    type="password"
                    placeholder="Enter passkey..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-center text-xs glass-input focus:glass-input-focus"
                  />
                  {passwordError && (
                    <span className="text-[10px] text-red-500 font-semibold animate-pulse">
                      Incorrect password. Please try again! 🥺
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Decrypt Envelope</span>
                </button>
              </form>
            )}

            {/* 2. TIME LOCK GATE (Visible if password unlocked but time locked) */}
            {isPasswordUnlocked && !isTimeUnlocked && (
              <div className="flex flex-col gap-5">
                <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-800">Time-Capsule Letter</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    This letter from <span className="font-semibold text-slate-600">{card.sender}</span> was locked inside a time capsule.
                  </p>
                </div>

                {/* Countdown Tickers */}
                <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200/50 p-3 rounded-2xl">
                  {[
                    { label: 'Days', val: timeLeft.days },
                    { label: 'Hours', val: timeLeft.hours },
                    { label: 'Mins', val: timeLeft.minutes },
                    { label: 'Secs', val: timeLeft.seconds }
                  ].map((unit) => (
                    <div key={unit.label} className="flex flex-col items-center">
                      <span className="text-base font-bold text-slate-700 leading-none">{String(unit.val).padStart(2, '0')}</span>
                      <span className="text-[8px] text-slate-400 uppercase font-semibold mt-1 tracking-wider">{unit.label}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Unsealing scheduled for: {new Date(card.openAfterDate).toLocaleDateString()}</span>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEALED ENVELOPE & UNFOLDED VIEW */}
      <AnimatePresence>
        {!isLocked && (
          <div className="z-10 w-full flex flex-col items-center justify-center gap-6">
            
            {/* STAGE A: CLOSED ENVELOPE */}
            {!isEnvelopeOpened && (
              <motion.div
                key="closed-envelope"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, y: -80 }}
                transition={{ type: "spring", damping: 20 }}
                className="w-full max-w-sm flex flex-col items-center gap-8"
              >
                {/* 3D-Paper Envelope Mock */}
                <div className="relative w-full aspect-[4/3] rounded-3xl bg-white border border-slate-200/60 shadow-2xl flex items-center justify-center overflow-hidden">
                  {/* Decorative diagonal back seams */}
                  <div className="absolute inset-0 bg-gradient-to-b from-rose-50/30 to-indigo-50/20" />
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-slate-200" />
                  {/* Diagonal side wings */}
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_49%,rgba(241,245,249,0.8)_50%),linear-gradient(225deg,transparent_49%,rgba(241,245,249,0.8)_50%)] pointer-events-none" />

                  {/* Pulsing Red wax seal button */}
                  <motion.button
                    onClick={handleOpenEnvelope}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className="absolute z-10 w-16 h-16 rounded-full bg-pink-500 border-4 border-white shadow-xl flex items-center justify-center text-white cursor-pointer rotate-12"
                  >
                    <Heart className="w-7 h-7 fill-current animate-pulse" />
                  </motion.button>

                  <div className="absolute bottom-4 text-[9px] uppercase font-bold tracking-widest text-slate-400">
                    Seal of Love
                  </div>
                </div>

                <div className="text-center max-w-xs">
                  <h2 className="font-serif text-lg font-bold text-slate-800">A Secret Letter for You</h2>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Sent by <span className="font-semibold text-slate-700">{card.sender}</span>. Click the red heart wax seal to break the seal and unfold your memory.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STAGE B: OPENED UNFOLDED CARD MOCK */}
            {isEnvelopeOpened && (
              <motion.div
                key="opened-card"
                initial={{ opacity: 0, scale: 0.85, y: 100 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="w-full flex flex-col items-center gap-6"
              >
                {/* Floating card presentation */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                >
                  <CardPreview
                    cardData={card}
                    drawingOverlay={card.drawingOverlay}
                  />
                </motion.div>

                {/* Receiver Actions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-4 py-2"
                >
                  <button
                    type="button"
                    onClick={() => {
                      const targetId = card?.id || id;
                      const cParam = compressedData || (card ? compressCard(card) : '');
                      if (cParam) {
                        navigate(`/view?c=${cParam}`);
                      } else {
                        navigate(`/view/${targetId}`);
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
                  >
                    Interactive Card Page
                  </button>
                  
                  <Link to="/create">
                    <button
                      type="button"
                      className="px-6 py-2.5 rounded-xl bg-white/80 border border-slate-200 text-slate-600 hover:text-slate-800 text-xs font-semibold shadow-xs flex items-center gap-1 hover:bg-white active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-pink-400" />
                      <span>Create Your Own</span>
                    </button>
                  </Link>
                </motion.div>
              </motion.div>
            )}

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
