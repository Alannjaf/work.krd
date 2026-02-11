import puppeteer from 'puppeteer-core';

const CHROMIUM_PACK_URL = process.env.CHROMIUM_PACK_URL || '';
const LOCAL_CHROME_PATH = process.env.CHROME_PATH || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Common local Chrome paths by OS
const CHROME_PATHS = [
  LOCAL_CHROME_PATH,
  // Windows
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA ? `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe` : '',
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  // Linux
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
].filter(Boolean);

function findLocalChrome(): string | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('fs');
  for (const p of CHROME_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function getExecutablePath(): Promise<string> {
  // In local dev, prefer system Chrome to avoid version mismatches
  if (!IS_PRODUCTION) {
    const localChrome = findLocalChrome();
    if (localChrome) return localChrome;
  }

  // In production (serverless), use @sparticuz/chromium-min
  if (CHROMIUM_PACK_URL) {
    const chromium = (await import('@sparticuz/chromium-min')).default;
    return chromium.executablePath(CHROMIUM_PACK_URL);
  }

  // Fallback: try local Chrome anyway
  const localChrome = findLocalChrome();
  if (localChrome) return localChrome;

  throw new Error('No Chrome/Chromium found. Set CHROME_PATH env variable or install Chrome.');
}

async function getBrowserArgs(): Promise<string[]> {
  if (IS_PRODUCTION && CHROMIUM_PACK_URL) {
    const chromium = (await import('@sparticuz/chromium-min')).default;
    return chromium.args;
  }
  return ['--no-sandbox', '--disable-setuid-sandbox'];
}

export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: await getBrowserArgs(),
    executablePath: await getExecutablePath(),
    headless: true,
    protocol: 'cdp',
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for fonts to be loaded
    await page.evaluateHandle('document.fonts.ready');

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
