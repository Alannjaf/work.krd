/**
 * Shared RTL detection utilities.
 *
 * Unicode ranges for Arabic/Kurdish script:
 * - U+0600-U+06FF: Arabic
 * - U+0750-U+077F: Arabic Supplement
 * - U+FB50-U+FDFF: Arabic Presentation Forms-A
 * - U+FE70-U+FEFF: Arabic Presentation Forms-B
 */

const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

export function isRTLText(text: string | null | undefined): boolean {
  if (!text) return false;
  return ARABIC_REGEX.test(text);
}

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
