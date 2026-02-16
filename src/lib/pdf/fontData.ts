import fs from 'fs';
import path from 'path';

let fontCache: { regular: string; bold: string } | null = null;

export function getBase64Fonts(): { regular: string; bold: string } {
  if (fontCache) return fontCache;

  const fontsDir = path.join(process.cwd(), 'public', 'fonts');

  let regularBuffer: Buffer;
  let boldBuffer: Buffer;

  try {
    const regularPath = path.join(fontsDir, 'noto-sans-arabic-regular.woff2');
    regularBuffer = fs.readFileSync(regularPath);
  } catch (err) {
    throw new Error(
      `Failed to read font file: noto-sans-arabic-regular.woff2. ` +
      `Expected at: ${path.join(fontsDir, 'noto-sans-arabic-regular.woff2')}. ` +
      `Ensure the font file exists in public/fonts/.`,
      { cause: err }
    );
  }

  try {
    const boldPath = path.join(fontsDir, 'noto-sans-arabic-bold.woff2');
    boldBuffer = fs.readFileSync(boldPath);
  } catch (err) {
    throw new Error(
      `Failed to read font file: noto-sans-arabic-bold.woff2. ` +
      `Expected at: ${path.join(fontsDir, 'noto-sans-arabic-bold.woff2')}. ` +
      `Ensure the font file exists in public/fonts/.`,
      { cause: err }
    );
  }

  fontCache = {
    regular: regularBuffer.toString('base64'),
    bold: boldBuffer.toString('base64'),
  };

  return fontCache;
}
