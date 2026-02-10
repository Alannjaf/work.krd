import fs from 'fs';
import path from 'path';

let fontCache: { regular: string; bold: string } | null = null;

export function getBase64Fonts(): { regular: string; bold: string } {
  if (fontCache) return fontCache;

  const fontsDir = path.join(process.cwd(), 'public', 'fonts');

  const regularBuffer = fs.readFileSync(path.join(fontsDir, 'noto-sans-arabic-regular.woff2'));
  const boldBuffer = fs.readFileSync(path.join(fontsDir, 'noto-sans-arabic-bold.woff2'));

  fontCache = {
    regular: regularBuffer.toString('base64'),
    bold: boldBuffer.toString('base64'),
  };

  return fontCache;
}
