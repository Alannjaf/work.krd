import { getBase64Fonts } from './fontData';
import type { ReactElement } from 'react';

// Dynamic import to avoid Next.js client bundling error with react-dom/server
async function renderMarkup(element: ReactElement): Promise<string> {
  const { renderToStaticMarkup } = await import('react-dom/server');
  return renderToStaticMarkup(element);
}

export async function renderResumeToHtml(templateElement: ReactElement, isRTL: boolean): Promise<string> {
  const markup = await renderMarkup(templateElement);
  const fonts = getBase64Fonts();

  return `<!DOCTYPE html>
<html dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <style>
    @font-face {
      font-family: 'Inter';
      font-weight: 400;
      src: url(https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2) format('woff2');
    }
    @font-face {
      font-family: 'Inter';
      font-weight: 700;
      src: url(https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hiA.woff2) format('woff2');
    }
    @font-face {
      font-family: 'Noto Sans Arabic';
      font-weight: 400;
      src: url(data:font/woff2;base64,${fonts.regular}) format('woff2');
    }
    @font-face {
      font-family: 'Noto Sans Arabic';
      font-weight: 700;
      src: url(data:font/woff2;base64,${fonts.bold}) format('woff2');
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 0; }
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>${markup}</body>
</html>`;
}
