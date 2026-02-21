import puppeteer, { type Browser } from 'puppeteer-core';

const CHROMIUM_PACK_URL = process.env.CHROMIUM_PACK_URL || '';
const LOCAL_CHROME_PATH = process.env.CHROME_PATH || '';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const MAX_CONCURRENT = 3;
const BROWSER_IDLE_TIMEOUT = 30_000; // close idle browser after 30s

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

// ── Browser Pool ────────────────────────────────────────────────────────
let _browser: Browser | null = null;
let _browserPromise: Promise<Browser> | null = null;
let _idleTimer: ReturnType<typeof setTimeout> | null = null;
let _activePages = 0;
const _waitQueue: Array<() => void> = [];

function clearIdleTimer() {
  if (_idleTimer) { clearTimeout(_idleTimer); _idleTimer = null; }
}

function scheduleIdleClose() {
  clearIdleTimer();
  _idleTimer = setTimeout(async () => {
    if (_activePages === 0 && _browser) {
      try { await _browser.close(); } catch { /* already closed */ }
      _browser = null;
      _browserPromise = null;
    }
  }, BROWSER_IDLE_TIMEOUT);
}

async function acquireBrowser(): Promise<Browser> {
  clearIdleTimer();

  if (_browser) {
    try {
      // Verify the browser is still alive
      if (_browser.connected) return _browser;
    } catch { /* fall through to create new */ }
    _browser = null;
    _browserPromise = null;
  }

  if (!_browserPromise) {
    _browserPromise = (async () => {
      const browser = await puppeteer.launch({
        args: await getBrowserArgs(),
        executablePath: await getExecutablePath(),
        headless: true,
        protocol: 'cdp',
      });
      _browser = browser;
      browser.on('disconnected', () => {
        if (_browser === browser) { _browser = null; _browserPromise = null; }
      });
      return browser;
    })();
  }

  return _browserPromise;
}

function releaseSlot() {
  _activePages--;
  if (_waitQueue.length > 0) {
    const next = _waitQueue.shift()!;
    next();
  }
  if (_activePages === 0) scheduleIdleClose();
}

function waitForSlot(): Promise<void> {
  if (_activePages < MAX_CONCURRENT) {
    _activePages++;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    _waitQueue.push(() => { _activePages++; resolve(); });
  });
}

// ── Public API ──────────────────────────────────────────────────────────

export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  await waitForSlot();

  let browser: Browser;
  try {
    browser = await acquireBrowser();
  } catch (err) {
    releaseSlot();
    throw err;
  }

  let page: Awaited<ReturnType<typeof browser.newPage>> | null = null;
  try {
    page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for fonts to be loaded (with 10s timeout to avoid hanging on slow CDN)
    await Promise.race([
      page.evaluateHandle('document.fonts.ready'),
      new Promise((resolve) => setTimeout(resolve, 10000)),
    ]);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '40px', right: '0px', bottom: '40px', left: '0px' },
      timeout: 30000,
    });

    const buffer = Buffer.from(pdfBuffer);

    // Validate PDF header magic bytes
    if (buffer.length < 5 || buffer.subarray(0, 5).toString() !== '%PDF-') {
      throw new Error('Generated PDF buffer is invalid — missing %PDF- header');
    }

    return buffer;
  } finally {
    if (page) { try { await page.close(); } catch { /* page may already be closed */ } }
    releaseSlot();
  }
}
