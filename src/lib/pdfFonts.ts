/**
 * PDF Font Registration and Utilities
 *
 * Registers Noto Sans Arabic for Kurdish/Arabic text rendering in PDFs.
 * Fonts are embedded as base64 data to avoid fontkit file-path crashes
 * in serverless environments.
 *
 * Helvetica (built-in) is used for Latin text.
 */

import { Font } from "@react-pdf/renderer";
import {
  NOTO_SANS_ARABIC_REGULAR_BASE64,
  NOTO_SANS_ARABIC_BOLD_BASE64,
} from "./fonts/arabicFontData";

let fontsRegistered = false;

/**
 * Unicode ranges for Arabic/Kurdish script detection:
 * - U+0600-U+06FF: Arabic
 * - U+0750-U+077F: Arabic Supplement
 * - U+FB50-U+FDFF: Arabic Presentation Forms-A
 * - U+FE70-U+FEFF: Arabic Presentation Forms-B
 */
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Check if text contains Arabic/Kurdish script characters
 */
export function isRTLText(text: string | null | undefined): boolean {
  if (!text) return false;
  return ARABIC_REGEX.test(text);
}

/**
 * Get the appropriate font family based on text content.
 * Returns "NotoSansArabic" for Arabic/Kurdish text, "Helvetica" for Latin.
 */
export function getFontFamily(text: string | null | undefined): string {
  if (isRTLText(text)) {
    return "NotoSansArabic";
  }
  return "Helvetica";
}

/**
 * Initialize PDF fonts by registering NotoSansArabic from embedded base64 data.
 * Safe to call multiple times — registration only happens once.
 */
export function initializePDFFonts(): void {
  if (fontsRegistered) return;

  try {
    Font.register({
      family: "NotoSansArabic",
      fonts: [
        {
          src: `data:font/truetype;base64,${NOTO_SANS_ARABIC_REGULAR_BASE64}`,
          fontWeight: "normal" as const,
        },
        {
          src: `data:font/truetype;base64,${NOTO_SANS_ARABIC_BOLD_BASE64}`,
          fontWeight: "bold" as const,
        },
      ],
    });

    fontsRegistered = true;
  } catch (error) {
    console.error("Failed to register Arabic fonts:", error);
  }
}

/**
 * Register fonts (alias for initializePDFFonts)
 */
export async function registerPDFFonts(): Promise<void> {
  initializePDFFonts();
}

/**
 * Check if fonts are successfully registered
 */
export function areFontsRegistered(): boolean {
  return fontsRegistered;
}

/**
 * Get page-level font style override for a resume.
 * Detects Arabic/Kurdish content from the user's name and returns
 * the appropriate fontFamily override for the Page component.
 *
 * Usage in templates:
 *   <Page style={[styles.page, getPageFontStyle(data.personal?.fullName)]}>
 */
export function getPageFontStyle(
  text: string | null | undefined
): { fontFamily: string } | Record<string, never> {
  if (isRTLText(text)) {
    return { fontFamily: "NotoSansArabic" };
  }
  return {};
}

/**
 * Detect whether resume data is predominantly RTL (Arabic/Kurdish).
 *
 * Samples the fullName, title, summary and first job title.
 * Returns true if the majority of sampled fields contain Arabic script.
 */
export function isResumeRTL(data: {
  personal?: { fullName?: string; title?: string } | null;
  summary?: string | null;
  experience?: { jobTitle?: string }[] | null;
}): boolean {
  const samples = [
    data.personal?.fullName,
    data.personal?.title,
    data.summary,
    data.experience?.[0]?.jobTitle,
  ].filter(Boolean) as string[];

  if (samples.length === 0) return false;

  const rtlCount = samples.filter((s) => ARABIC_REGEX.test(s)).length;
  return rtlCount > samples.length / 2;
}
