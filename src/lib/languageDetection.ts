/**
 * Language Detection Utility
 * Detects if text content is in Kurdish/Arabic or English
 */

// Arabic and Kurdish Unicode ranges
const ARABIC_KURDISH_REGEX =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Common English words for detection
const COMMON_ENGLISH_WORDS = [
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "a",
  "an",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "can",
  "may",
  "might",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  "this",
  "that",
  "these",
  "those",
];

/**
 * Checks if text contains Arabic or Kurdish characters
 */
export function hasArabicKurdishChars(text: string): boolean {
  return ARABIC_KURDISH_REGEX.test(text);
}

/**
 * Calculates the ratio of English words in the text
 */
export function getEnglishWordsRatio(text: string): number {
  if (!text || text.trim().length === 0) return 1; // Empty text is considered English

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 0);

  if (words.length === 0) return 1;

  const englishWords = words.filter(
    (word) => COMMON_ENGLISH_WORDS.includes(word) || /^[a-z]+$/.test(word) // Only contains English letters
  );

  return englishWords.length / words.length;
}

/**
 * Determines if text is likely in Kurdish or Arabic (non-English)
 */
export function isNonEnglishContent(text: string): boolean {
  if (!text || text.trim().length === 0) return false;

  // Check for Arabic/Kurdish characters
  if (hasArabicKurdishChars(text)) return true;

  // Check English words ratio (if less than 40% English words, consider non-English)
  const englishRatio = getEnglishWordsRatio(text);
  return englishRatio < 0.4;
}

/**
 * Detects the primary language of the text
 */
export function detectLanguage(text: string): "en" | "ar" | "ku" | "unknown" {
  if (!text || text.trim().length === 0) return "en";

  // Check for Arabic/Kurdish script
  if (hasArabicKurdishChars(text)) {
    // Kurdish Sorani uses characters that Arabic doesn't:
    // ڤ (ve), ڵ (heavy l), ێ (yeh with tail), ۆ (oe), پ (pe), چ (che), ژ (zhe), گ (gaf), ک (kaf)
    // The most distinctive are: ڤ ڵ ێ ۆ which don't appear in standard Arabic
    const kurdishChars = /[ڤڵێۆگچپژ]/;
    // Common Kurdish Sorani words and patterns
    const kurdishWords =
      /(?:^|\s)(من|تۆ|ئەو|ئێمە|ئێوە|ئەوان|کە|لە|بۆ|لەگەڵ|دا|وە|ەکە|ەکان|یەک|هەموو|زۆر|باش|کار|ئەندازیار|بەرنامە|پەروەردە|زانکۆ|کۆمپانیا|تەکنەلۆژیا)(?:\s|$)/i;
    if (kurdishChars.test(text) || kurdishWords.test(text)) {
      return "ku";
    }
    return "ar";
  }

  // Check English ratio
  const englishRatio = getEnglishWordsRatio(text);
  if (englishRatio > 0.6) return "en";

  return "unknown";
}

/**
 * Checks if content should show the translate & enhance button
 */
export function shouldShowTranslateButton(text: string): boolean {
  if (!text || text.trim().length < 2) return false; // Must have at least 2 characters
  return isNonEnglishContent(text);
}

// Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) to Western numerals (0123456789)
const ARABIC_INDIC_NUMERALS: Record<string, string> = {
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

// Extended Arabic-Indic numerals (used in Persian/Urdu)
const EXTENDED_ARABIC_NUMERALS: Record<string, string> = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
};

/**
 * Checks if text contains Arabic-Indic numerals
 */
export function hasArabicIndicNumerals(text: string): boolean {
  if (!text) return false;
  // Check for both Arabic-Indic (٠-٩) and Extended Arabic-Indic (۰-۹)
  return /[\u0660-\u0669\u06F0-\u06F9]/.test(text);
}

/**
 * Converts Arabic-Indic numerals to Western numerals
 * Handles both standard Arabic-Indic (٠-٩) and Extended (۰-۹) numerals
 */
export function convertArabicIndicToWestern(text: string): string {
  if (!text) return text;

  let result = text;

  // Convert standard Arabic-Indic numerals
  for (const [arabic, western] of Object.entries(ARABIC_INDIC_NUMERALS)) {
    result = result.replace(new RegExp(arabic, "g"), western);
  }

  // Convert extended Arabic-Indic numerals (Persian/Urdu)
  for (const [arabic, western] of Object.entries(EXTENDED_ARABIC_NUMERALS)) {
    result = result.replace(new RegExp(arabic, "g"), western);
  }

  return result;
}

/**
 * Normalizes a phone number by converting Arabic-Indic numerals to Western
 * and removing any non-phone characters except + and spaces
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return phone;

  // First convert Arabic-Indic numerals to Western
  let normalized = convertArabicIndicToWestern(phone);

  // Keep only digits, +, spaces, and common phone separators
  normalized = normalized.replace(/[^\d+\s\-().]/g, "");

  // Clean up multiple spaces
  normalized = normalized.replace(/\s+/g, " ").trim();

  return normalized;
}

/**
 * Checks if email contains non-ASCII characters that need normalization
 */
export function hasNonAsciiChars(text: string): boolean {
  if (!text) return false;
  // Check for any character outside basic ASCII printable range
  // eslint-disable-next-line no-control-regex
  return /[^\x00-\x7F]/.test(text);
}

/**
 * Normalizes an email address by:
 * - Converting Arabic-Indic numerals to Western
 * - Removing non-ASCII characters
 * - Converting to lowercase
 * - Validating basic email format
 */
export function normalizeEmail(email: string): string {
  if (!email) return email;

  // Convert Arabic-Indic numerals to Western
  let normalized = convertArabicIndicToWestern(email);

  // Remove any non-ASCII characters (emails must be ASCII)
  // eslint-disable-next-line no-control-regex
  normalized = normalized.replace(/[^\x00-\x7F]/g, "");

  // Convert to lowercase and trim
  normalized = normalized.toLowerCase().trim();

  // Remove any spaces
  normalized = normalized.replace(/\s+/g, "");

  return normalized;
}

/**
 * Validates if an email address has a valid format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Normalizes a website URL by:
 * - Converting Arabic-Indic numerals to Western
 * - Removing non-ASCII characters
 * - Adding https:// if no protocol specified
 * - Converting to lowercase
 */
export function normalizeWebsite(website: string): string {
  if (!website) return website;

  // Convert Arabic-Indic numerals to Western
  let normalized = convertArabicIndicToWestern(website);

  // Remove any non-ASCII characters (URLs should be ASCII or percent-encoded)
  // eslint-disable-next-line no-control-regex
  normalized = normalized.replace(/[^\x00-\x7F]/g, "");

  // Trim whitespace
  normalized = normalized.trim();

  // Remove any spaces
  normalized = normalized.replace(/\s+/g, "");

  // Add https:// if no protocol specified
  if (normalized && !normalized.match(/^https?:\/\//i)) {
    // Check if it looks like a URL (has a dot)
    if (normalized.includes(".")) {
      normalized = "https://" + normalized;
    }
  }

  return normalized;
}

/**
 * Validates if a website URL has a valid format
 */
export function isValidWebsite(website: string): boolean {
  if (!website) return false;
  try {
    const url = new URL(website);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    console.error('[LanguageDetection] Failed to validate website URL:', error);
    return false;
  }
}

/**
 * Normalizes a LinkedIn URL by:
 * - Converting Arabic-Indic numerals to Western
 * - Removing non-ASCII characters
 * - Ensuring proper LinkedIn URL format
 */
export function normalizeLinkedIn(linkedin: string): string {
  if (!linkedin) return linkedin;

  // Convert Arabic-Indic numerals to Western
  let normalized = convertArabicIndicToWestern(linkedin);

  // Remove any non-ASCII characters
  // eslint-disable-next-line no-control-regex
  normalized = normalized.replace(/[^\x00-\x7F]/g, "");

  // Trim whitespace and remove spaces
  normalized = normalized.trim().replace(/\s+/g, "");

  // If it's just a username, convert to full URL
  if (normalized && !normalized.includes("linkedin.com")) {
    // Remove @ if present
    normalized = normalized.replace(/^@/, "");
    // If it looks like a username (no protocol, no domain)
    if (!normalized.includes("://") && !normalized.includes(".")) {
      normalized = "https://linkedin.com/in/" + normalized;
    }
  } else if (normalized && !normalized.match(/^https?:\/\//i)) {
    normalized = "https://" + normalized;
  }

  return normalized;
}
