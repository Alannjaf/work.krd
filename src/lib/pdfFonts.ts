/**
 * PDF Font Registration and Utilities
 *
 * IMPORTANT: Custom font registration is DISABLED due to fontkit compatibility issues
 * in serverless environments. All PDFs use system fonts (Helvetica) which work reliably.
 *
 * Kurdish/Arabic text will not render with proper glyphs but PDFs will generate successfully.
 * This is a trade-off to ensure PDF generation doesn't crash.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Font } from "@react-pdf/renderer";

// Font registration is disabled - always use system fonts
const fontsRegistered = false;

/**
 * Get the appropriate font family based on text content
 * Always returns Helvetica (system font) since custom fonts are disabled
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getFontFamily(_text: string | null | undefined): string {
  // Custom fonts are disabled due to fontkit issues in serverless
  // Always use system fonts which work reliably
  return "Helvetica";
}

/**
 * Initialize fonts - NO-OP since custom fonts are disabled
 * Custom font registration causes "Unknown font format" errors in serverless
 * due to fontkit's inability to parse fonts from file paths in that environment
 */
export function initializePDFFonts(): void {
  // Custom font registration is disabled
  // fontkit cannot reliably parse font files in serverless environments
  // This causes "Unknown font format" errors even with valid TTF files
}

/**
 * Register fonts - NO-OP since custom fonts are disabled
 */
export async function registerPDFFonts(): Promise<void> {
  // Custom font registration is disabled
}

/**
 * Check if fonts are successfully registered
 * Always returns false since custom fonts are disabled
 */
export function areFontsRegistered(): boolean {
  return fontsRegistered;
}
