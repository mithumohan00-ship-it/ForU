import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
let isUsingSupabase = false;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    isUsingSupabase = true;
    console.log('✨ [forU] Supabase connected successfully.');
  } catch (error) {
    console.warn('⚠️ [forU] Supabase failed to initialize. Running in LocalDB mode.', error);
  }
}

/**
 * Saves a card to Supabase Cloud Storage (and Database table if available)
 * with automatic caching in the local device vault.
 * @param {string} id - Unique UUID/ID of the card
 * @param {Object} cardData - Complete card state
 */
export async function saveCard(id, cardData) {
  const timestamp = new Date().toISOString();
  const payload = {
    ...cardData,
    id,
    createdAt: cardData.createdAt || timestamp,
  };

  // 1. Always cache in local vault first for instant responsiveness
  try {
    localStorage.setItem(`dearyou_card_${id}`, JSON.stringify(payload));
  } catch (e) {
    console.warn('LocalStorage save warning:', e);
  }

  // 2. Upload to Supabase Cloud
  if (isUsingSupabase && supabase) {
    let cloudSaved = false;

    // A. Upload JSON document to Supabase Storage bucket 'cards'
    try {
      const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      const { error: storageErr } = await supabase.storage
        .from('cards')
        .upload(`${id}.json`, jsonBlob, {
          contentType: 'application/json',
          upsert: true
        });

      if (!storageErr) {
        cloudSaved = true;
        console.log(`✨ [forU] Card ${id} saved to Supabase Storage CDN.`);
      } else {
        console.warn('Supabase storage upload error:', storageErr);
      }
    } catch (err) {
      console.warn('Supabase storage upload failed:', err);
    }

    // B. Also attempt to upsert into Postgres database table 'public.cards' if created
    try {
      const { error: dbErr } = await supabase
        .from('cards')
        .upsert({ id, data: payload, created_at: payload.createdAt });

      if (!dbErr) {
        cloudSaved = true;
      }
    } catch (e) {
      // Table might not exist yet, which is fine since Storage CDN is primary
    }

    if (cloudSaved) {
      return { success: true, mode: 'supabase', id, payload };
    }
  }

  return { success: true, mode: 'local', id, payload };
}

/**
 * Fetches a card by ID from Supabase CDN or Database, with LocalDB fallback.
 * @param {string} id - Unique UUID/ID of the card
 */
export async function getCard(id) {
  if (!id) return null;

  // 1. Try fetching from Supabase Cloud CDN Storage (fastest, public, no-auth)
  if (isUsingSupabase) {
    try {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/cards/${id}.json`;
      const res = await fetch(publicUrl, { cache: 'no-cache' });
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData && cloudData.id) {
          // Cache in recipient device vault
          try {
            localStorage.setItem(`dearyou_card_${id}`, JSON.stringify(cloudData));
          } catch (e) {}
          return cloudData;
        }
      }
    } catch (err) {
      console.warn('Supabase CDN fetch failed, trying database...', err);
    }

    // 2. Try fetching from Supabase Database table
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('cards')
          .select('data')
          .eq('id', id)
          .maybeSingle();

        if (!error && data?.data) {
          try {
            localStorage.setItem(`dearyou_card_${id}`, JSON.stringify(data.data));
          } catch (e) {}
          return data.data;
        }
      } catch (err) {
        console.warn('Supabase DB fetch failed:', err);
      }
    }
  }

  // 3. Fallback: LocalStorage individual key
  const individualCard = localStorage.getItem(`dearyou_card_${id}`);
  if (individualCard) {
    try {
      return JSON.parse(individualCard);
    } catch (e) {
      console.error(`Failed to parse local card ${id}`, e);
    }
  }

  // 4. Fallback: Legacy dictionary key
  try {
    const oldCardsStr = localStorage.getItem('dearyou_cards');
    if (oldCardsStr) {
      const oldCards = JSON.parse(oldCardsStr);
      if (oldCards[id]) return oldCards[id];
    }
  } catch (e) {}

  return null;
}

/**
 * Client-side image compression
 */
function compressImage(file, maxWidth = 900, maxHeight = 900, quality = 0.75) {
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
 * Uploads an image/media attachment to Supabase Storage and returns its public CDN URL.
 * Falls back to base64 data URL if offline or upload fails.
 * @param {File} file - File object from uploader
 * @param {string} path - Directory path
 */
export async function uploadMedia(file, path = 'images') {
  if (!file) return null;

  let processedFile = file;
  if (file.type.startsWith('image/')) {
    try {
      processedFile = await compressImage(file, 900, 900, 0.75);
    } catch (e) {
      console.warn('Image compression warning, using original', e);
    }
  }

  // 1. Upload to Supabase Storage
  if (isUsingSupabase && supabase) {
    try {
      const cleanName = (processedFile.name || 'photo.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${path}/${Date.now()}_${cleanName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('cards')
        .upload(filePath, processedFile, {
          contentType: processedFile.type || 'image/jpeg',
          upsert: true
        });

      if (!uploadError) {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/cards/${filePath}`;
        console.log('✨ [forU] Media uploaded to Supabase CDN:', publicUrl);
        return publicUrl;
      } else {
        console.error('Supabase storage upload error:', uploadError);
      }
    } catch (err) {
      console.error('Supabase upload exception:', err);
    }
  }

  // 2. Fallback: Base64 data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(processedFile);
  });
}

/**
 * Lists all cards stored in the local device vault.
 */
export function getAllLocalCards() {
  const cardsMap = {};

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dearyou_card_')) {
        const id = key.substring('dearyou_card_'.length);
        const cardDataStr = localStorage.getItem(key);
        if (cardDataStr) {
          try {
            cardsMap[id] = JSON.parse(cardDataStr);
          } catch (e) {}
        }
      }
    }
  } catch (e) {
    console.error('Error scanning local cards', e);
  }

  return Object.values(cardsMap).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/**
 * Deletes a card from the local localStorage vault.
 * @param {string} id - Unique UUID of the card
 */
export function deleteCardFromLocalVault(id) {
  try {
    localStorage.removeItem(`dearyou_card_${id}`);
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

export { supabase, isUsingSupabase, SUPABASE_URL };
