import fs from 'fs';
import path from 'path';

interface FontPair {
  regular: string;
  bold: string;
}

let arabicFontCache: FontPair | null = null;
let interFontCache: FontPair | null = null;

function loadFontPair(regularFile: string, boldFile: string): FontPair {
  const fontsDir = path.join(process.cwd(), 'public', 'fonts');

  let regularBuffer: Buffer;
  let boldBuffer: Buffer;

  try {
    regularBuffer = fs.readFileSync(path.join(fontsDir, regularFile));
  } catch (err) {
    throw new Error(
      `Failed to read font file: ${regularFile}. ` +
      `Expected at: ${path.join(fontsDir, regularFile)}. ` +
      `Ensure the font file exists in public/fonts/.`,
      { cause: err }
    );
  }

  try {
    boldBuffer = fs.readFileSync(path.join(fontsDir, boldFile));
  } catch (err) {
    throw new Error(
      `Failed to read font file: ${boldFile}. ` +
      `Expected at: ${path.join(fontsDir, boldFile)}. ` +
      `Ensure the font file exists in public/fonts/.`,
      { cause: err }
    );
  }

  return {
    regular: regularBuffer.toString('base64'),
    bold: boldBuffer.toString('base64'),
  };
}

/** Noto Sans Arabic fonts for RTL text (cached after first load) */
export function getBase64Fonts(): FontPair {
  if (arabicFontCache) return arabicFontCache;
  arabicFontCache = loadFontPair('noto-sans-arabic-regular.woff2', 'noto-sans-arabic-bold.woff2');
  return arabicFontCache;
}

/** Inter fonts for LTR text (cached after first load) */
export function getInterBase64Fonts(): FontPair {
  if (interFontCache) return interFontCache;
  interFontCache = loadFontPair('inter-regular.woff2', 'inter-bold.woff2');
  return interFontCache;
}
