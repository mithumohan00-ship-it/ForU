import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// These can be populated in a .env file:
// VITE_FIREBASE_API_KEY=...
// VITE_FIREBASE_AUTH_DOMAIN=...
// VITE_FIREBASE_PROJECT_ID=...
// VITE_FIREBASE_STORAGE_BUCKET=...
// VITE_FIREBASE_MESSAGING_SENDER_ID=...
// VITE_FIREBASE_APP_ID=...

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
let db;
let storage;
let isUsingFirebase = false;

// Check if valid credentials exist (non-empty and not placeholders)
const hasValidConfig =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'YOUR_PROJECT_ID';

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    storage = getStorage(app);
    isUsingFirebase = true;
    console.log('✨ [DearYou] Firebase initialized successfully.');
  } catch (error) {
    console.warn('⚠️ [DearYou] Firebase configuration found but failed to initialize. Falling back to LocalDB.', error);
  }
} else {
  console.log('📝 [DearYou] No Firebase credentials found. Running in LocalDB mode (using localStorage for persistence).');
}

// ==========================================
// RESILIENT DATA SERVICE API
// ==========================================

/**
 * Saves a customized card to either Firebase Firestore or LocalStorage.
 * @param {string} id - Unique UUID of the card
 * @param {Object} cardData - Complete card state
 */
export async function saveCard(id, cardData) {
  const timestamp = new Date().toISOString();
  const payload = {
    ...cardData,
    id,
    createdAt: timestamp,
  };

  if (isUsingFirebase) {
    try {
      const cardRef = doc(db, 'cards', id);
      await setDoc(cardRef, payload);
      return { success: true, mode: 'firebase', id, payload };
    } catch (error) {
      console.error('Firestore save failed, falling back to LocalDB', error);
      // Fallback inside failure
    }
  }

  // LocalDB Fallback: Save to individual key to avoid massive monolithic storage quota exhaustion
  try {
    localStorage.setItem(`dearyou_card_${id}`, JSON.stringify(payload));
    return { success: true, mode: 'local', id, payload };
  } catch (error) {
    console.error('LocalStorage save failed', error);
    throw new Error('Failed to save card data.');
  }
}

/**
 * Fetches a customized card by ID from Firestore or LocalStorage.
 * @param {string} id - Unique UUID of the card
 */
export async function getCard(id) {
  if (isUsingFirebase) {
    try {
      const cardRef = doc(db, 'cards', id);
      const snapshot = await getDoc(cardRef);
      if (snapshot.exists()) {
        return snapshot.data();
      }
    } catch (error) {
      console.warn('Firestore fetch failed, checking LocalDB...', error);
    }
  }

  // LocalDB Fallback
  // 1. Try individual key first (modern system)
  const individualCard = localStorage.getItem(`dearyou_card_${id}`);
  if (individualCard) {
    try {
      return JSON.parse(individualCard);
    } catch (e) {
      console.error(`Failed to parse individual card ${id}`, e);
    }
  }

  // 2. Try the legacy giant dictionary key
  try {
    const oldCardsStr = localStorage.getItem('dearyou_cards');
    if (oldCardsStr) {
      const oldCards = JSON.parse(oldCardsStr);
      if (oldCards[id]) {
        return oldCards[id];
      }
    }
  } catch (e) {
    console.warn('Error reading from old dearyou_cards dictionary', e);
  }

  return null;
}

/**
 * Deletes a card from the local localStorage vault (both individual and legacy dictionary).
 * @param {string} id - Unique UUID of the card
 */
export function deleteCardFromLocalVault(id) {
  try {
    // 1. Remove individual key
    localStorage.removeItem(`dearyou_card_${id}`);

    // 2. Also remove from old dictionary if it exists
    const oldCardsStr = localStorage.getItem('dearyou_cards');
    if (oldCardsStr) {
      const oldCards = JSON.parse(oldCardsStr);
      if (oldCards[id]) {
        delete oldCards[id];
        localStorage.setItem('dearyou_cards', JSON.stringify(oldCards));
      }
    }
    return true;
  } catch (error) {
    console.error('Failed to delete card locally', error);
    return false;
  }
}

/**
 * Lists all cards locally stored by scanning individual dearyou_card_ keys
 * and performing a one-time migration of any legacy monolithic dearyou_cards dictionary.
 */
export function getAllLocalCards() {
  const cardsMap = {};

  // 1. Retrieve cards from individual keys
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dearyou_card_')) {
        const id = key.substring('dearyou_card_'.length);
        const cardDataStr = localStorage.getItem(key);
        if (cardDataStr) {
          try {
            cardsMap[id] = JSON.parse(cardDataStr);
          } catch (e) {
            console.error(`Failed to parse local card for key ${key}`, e);
          }
        }
      }
    }
  } catch (e) {
    console.error('Error scanning individual local cards', e);
  }

  // 2. Migrate from legacy monolithic dearyou_cards dictionary and clear it to free up quota space
  try {
    const oldCardsStr = localStorage.getItem('dearyou_cards');
    if (oldCardsStr) {
      const oldCards = JSON.parse(oldCardsStr);
      let migratedCount = 0;
      Object.keys(oldCards).forEach((id) => {
        if (!cardsMap[id]) {
          cardsMap[id] = oldCards[id];
          try {
            localStorage.setItem(`dearyou_card_${id}`, JSON.stringify(oldCards[id]));
            migratedCount++;
          } catch (err) {
            console.error(`Failed to migrate legacy card ${id} (likely too large)`, err);
          }
        }
      });
      // Delete old dictionary to instantly clear up to 5MB of space!
      localStorage.removeItem('dearyou_cards');
      console.log(`✨ [forU] Successfully migrated ${migratedCount} legacy cards to individual keys and cleaned up dearyou_cards.`);
    }
  } catch (e) {
    console.warn('Error during legacy dearyou_cards migration', e);
  }

  // Return cards array sorted by createdAt date descending
  return Object.values(cardsMap).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Compresses an image file on the client side using a canvas.
 * @param {File} file - Original image file
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} quality - JPEG compression quality (0 to 1)
 */
function compressImage(file, maxWidth = 1000, maxHeight = 1000, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
            } else {
              const fileName = (file && file.name) ? file.name : 'photo.jpg';
              const compressedFile = new File([blob], fileName.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a file (image/audio) to Storage or converts it to base64.
 * @param {File} file - File object from uploader
 * @param {string} path - Upload subdirectory path
 */
export async function uploadMedia(file, path = 'images') {
  if (!file) return null;

  let processedFile = file;
  if (file.type.startsWith('image/')) {
    try {
      // If Firestore is offline (LocalDB mode), compress to 400px at 0.52 quality so it easily fits in shareable URLs and storage without truncation.
      // If Firestore is active, allow higher 1000px maximum with 0.8 quality.
      const targetSize = isUsingFirebase ? 1000 : 400;
      const targetQuality = isUsingFirebase ? 0.8 : 0.52;
      processedFile = await compressImage(file, targetSize, targetSize, targetQuality);
    } catch (e) {
      console.warn('Image compression failed, using original', e);
    }
  }

  if (isUsingFirebase) {
    try {
      const storageRef = ref(storage, `${path}/${Date.now()}_${processedFile.name}`);
      const snapshot = await uploadBytes(storageRef, processedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Firebase storage upload failed, using local conversion', error);
    }
  }

  // LocalDB Fallback: Convert to Base64 dataURL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result); // Base64 data URL
    };
    reader.onerror = (error) => {
      console.error('FileReader error during Base64 conversion:', error);
      reject(error);
    };
    reader.readAsDataURL(processedFile);
  });
}

export { db, storage, isUsingFirebase };
