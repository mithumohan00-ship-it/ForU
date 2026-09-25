import { THEMES } from './themes';
import { isUsingSupabase } from '../supabase/config';

// Self-contained LZString encoder/decoder (zero external network dependency)
const f = String.fromCharCode;
const keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";

const baseReverseDic = {};
function getBaseValue(alphabet, character) {
  if (!baseReverseDic[alphabet]) {
    baseReverseDic[alphabet] = {};
    for (let i = 0; i < alphabet.length; i++) {
      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
  }
  return baseReverseDic[alphabet][character];
}

const LZString = {
  compressToEncodedURIComponent: function (input) {
    if (input == null) return "";
    return LZString._compress(input, 6, function (a) {
      return keyStrUriSafe.charAt(a);
    });
  },

  decompressFromEncodedURIComponent: function (input) {
    if (input == null) return "";
    if (input === "") return null;
    input = input.replace(/ /g, "+");
    return LZString._decompress(input.length, 32, function (index) {
      return getBaseValue(keyStrUriSafe, input.charAt(index));
    });
  },

  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    let i, value;
    const context_dictionary = {};
    const context_dictionaryToCreate = {};
    let context_c = "";
    let context_wc = "";
    let context_w = "";
    let context_enlargeIn = 2;
    let context_dictSize = 3;
    let context_numBits = 2;
    const context_data = [];
    let context_data_val = 0;
    let context_data_position = 0;
    let ii;

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
          if (context_w.charCodeAt(0) < 256) {
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position === bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i = 0; i < 8; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position === bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position === bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i = 0; i < 16; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position === bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn === 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position === bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn === 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
        if (context_w.charCodeAt(0) < 256) {
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position === bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i = 0; i < 8; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position === bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position === bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i = 0; i < 16; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position === bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn === 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | (value & 1);
          if (context_data_position === bitsPerChar - 1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }
      }
      context_enlargeIn--;
      if (context_enlargeIn === 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    value = 2;
    for (i = 0; i < context_numBits; i++) {
      context_data_val = (context_data_val << 1) | (value & 1);
      if (context_data_position === bitsPerChar - 1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }

    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position === bitsPerChar - 1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      } else context_data_position++;
    }
    return context_data.join("");
  },

  _decompress: function (length, resetValue, getNextValue) {
    const dictionary = [];
    let next;
    let enlargeIn = 4;
    let dictSize = 4;
    let numBits = 3;
    let entry = "";
    const result = [];
    let i;
    let w;
    let bits, resb, maxpower, power;
    let c;
    const data = { val: getNextValue(0), position: resetValue, index: 1 };

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }

    bits = 0;
    maxpower = Math.pow(2, 2);
    power = 1;
    while (power !== maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position === 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (next = bits) {
      case 0:
        bits = 0;
        maxpower = Math.pow(2, 8);
        power = 1;
        while (power !== maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        c = f(bits);
        break;
      case 1:
        bits = 0;
        maxpower = Math.pow(2, 16);
        power = 1;
        while (power !== maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        c = f(bits);
        break;
      case 2:
        return "";
    }
    dictionary[3] = c;
    w = c;
    result.push(c);
    while (true) {
      if (data.index > length) {
        return "";
      }

      bits = 0;
      maxpower = Math.pow(2, numBits);
      power = 1;
      while (power !== maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (c = bits) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2, 8);
          power = 1;
          while (power !== maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position === 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = f(bits);
          c = dictSize - 1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2, 16);
          power = 1;
          while (power !== maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position === 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          c = dictSize - 1;
          enlargeIn--;
          break;
        case 2:
          return result.join("");
      }

      if (enlargeIn === 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result.push(entry);

      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn === 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
    }
  }
};

/**
 * Packs card state into a compact array to minimize URL length.
 * Schema v1/v2:
 * [0: id, 1: recipient, 2: sender, 3: title, 4: message, 5: themeId,
 *  6: titleFont, 7: bodyFont, 8: textColor, 9: titleColor, 10: textAlign,
 *  11: musicUrl, 12: isPasswordProtected (0/1), 13: password,
 *  14: isOpenAfterDateEnabled (0/1), 15: openAfterDate, 16: imageUrl,
 *  17: createdAt, 18: drawingOverlay, 19: cardDecoration]
 */
export function compressCard(cardData) {
  if (!cardData) return '';
  const themeId = cardData.theme?.id || cardData.themeId || 'pastel-dreams';
  
  const packed = [
    cardData.id || '',
    cardData.recipient || '',
    cardData.sender || '',
    cardData.title || '',
    cardData.message || '',
    themeId,
    cardData.titleFont || 'font-serif',
    cardData.bodyFont || 'font-sans',
    cardData.textColor || '',
    cardData.titleColor || '',
    cardData.textAlign || 'text-center',
    cardData.musicUrl || '',
    cardData.isPasswordProtected ? 1 : 0,
    cardData.password || '',
    cardData.isOpenAfterDateEnabled ? 1 : 0,
    cardData.openAfterDate || '',
    cardData.imageUrl || '',
    cardData.createdAt || new Date().toISOString(),
    cardData.drawingOverlay || '',
    cardData.cardDecoration || 'none'
  ];

  const jsonStr = JSON.stringify(packed);
  return LZString.compressToEncodedURIComponent(jsonStr);
}

/**
 * Decompresses and hydrates full card data from a URL parameter string.
 * Supports packed arrays as well as legacy JSON objects, with resilient
 * URL decoding for mobile in-app browsers, WhatsApp, Twitter, etc.
 */
export function decompressCard(compressedStr) {
  if (!compressedStr) return null;
  try {
    let cleaned = compressedStr;
    // Handle double-encoded or percent-encoded query params
    if (cleaned.includes('%')) {
      try {
        cleaned = decodeURIComponent(cleaned);
      } catch (e) {}
    }

    const jsonStr = LZString.decompressFromEncodedURIComponent(cleaned);
    if (!jsonStr) return null;
    const parsed = JSON.parse(jsonStr);

    let card = {};
    if (Array.isArray(parsed)) {
      const themeId = parsed[5] || 'pastel-dreams';
      const matchedTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

      card = {
        id: parsed[0],
        recipient: parsed[1],
        sender: parsed[2],
        title: parsed[3],
        message: parsed[4],
        theme: matchedTheme,
        themeId: themeId,
        titleFont: parsed[6] || matchedTheme.titleFont,
        bodyFont: parsed[7] || matchedTheme.bodyFont,
        textColor: parsed[8] || matchedTheme.textColor,
        titleColor: parsed[9] || matchedTheme.titleColor,
        textAlign: parsed[10] || 'text-center',
        musicUrl: parsed[11] || '',
        isPasswordProtected: Boolean(parsed[12]),
        password: parsed[13] || '',
        isOpenAfterDateEnabled: Boolean(parsed[14]),
        openAfterDate: parsed[15] || '',
        imageUrl: parsed[16] || '',
        createdAt: parsed[17] || new Date().toISOString(),
        drawingOverlay: parsed[18] || null,
        cardDecoration: parsed[19] || 'none'
      };
    } else if (typeof parsed === 'object') {
      const themeId = parsed.theme?.id || parsed.themeId || 'pastel-dreams';
      const matchedTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];
      card = {
        ...parsed,
        theme: matchedTheme
      };
    }

    return card;
  } catch (err) {
    console.error('Failed to decompress card from URL:', err);
    return null;
  }
}

/**
 * Universal extractor that retrieves compressed card data from wherever
 * a browser, mobile webview, or social app placed it (hash, search query, or href).
 */
export function extractCompressedCardFromUrl() {
  if (typeof window === 'undefined') return null;

  // 1. From Hash query string (e.g. /#/share?c=...)
  try {
    const hash = window.location.hash || '';
    const qIdx = hash.indexOf('?');
    if (qIdx !== -1) {
      const hashParams = new URLSearchParams(hash.substring(qIdx));
      const val = hashParams.get('c');
      if (val) return val;
    }
  } catch (e) {}

  // 2. From standard location.search (e.g. /?c=...#/share)
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const val = searchParams.get('c');
    if (val) return val;
  } catch (e) {}

  // 3. Regex fallback across full href
  try {
    const match = window.location.href.match(/[?&]c=([^&#]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  } catch (e) {}

  return null;
}

/**
 * Resolves the accurate base URL for the application.
 * Preserves subpaths (e.g. https://user.github.io/ForU) while stripping hash/query.
 */
export function getBaseAppUrl(customBase) {
  if (customBase) return customBase.replace(/\/+$/, '');
  if (typeof window === 'undefined') return '';
  const hrefBeforeHash = window.location.href.split('#')[0].split('?')[0];
  return hrefBeforeHash.replace(/\/+$/, '');
}

/**
 * Detects if the current host is localhost or loopback
 */
export function isLocalHost() {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/**
 * Generates the appropriate share URL:
 * - If using Firebase: Short URL with UUID (/#/share/:id)
 * - If using LocalDB: Universal Compressed URL that works across ANY device (/#/share?c=...)
 */
export function getShareUrl(cardData, customBaseUrl) {
  const base = customBaseUrl || getBaseAppUrl();
  
  if (isUsingSupabase && cardData?.id) {
    return `${base}/#/share/${cardData.id}`;
  }

  // LocalDB Universal Link
  const compressed = compressCard(cardData);
  return `${base}/#/share?c=${compressed}`;
}

export { LZString };
