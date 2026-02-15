'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';

const A4_WIDTH_PX = 794;   // 210mm at 96dpi
const A4_HEIGHT_PX = 1123; // 297mm at 96dpi
const PAGE_MARGIN_TOP = 40;
const PAGE_MARGIN_BOTTOM = 40;
const CONTENT_PER_PAGE = A4_HEIGHT_PX - PAGE_MARGIN_TOP - PAGE_MARGIN_BOTTOM;

interface ResumePageScalerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResumePageScaler({ children, className = '' }: ResumePageScalerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pageBreaks, setPageBreaks] = useState<number[]>([0]);
  const [pageBg, setPageBg] = useState('');

  const measure = useCallback(() => {
    const container = containerRef.current;
    const content = measureRef.current;
    if (!container || !content) return;

    const containerWidth = container.clientWidth;
    const newScale = Math.min(containerWidth / A4_WIDTH_PX, 1);
    setScale(newScale);

    const contentHeight = content.scrollHeight;

    // Find all elements that should not be split across pages (break-inside: avoid)
    const entries = Array.from(content.querySelectorAll('.resume-entry'));
    const contentRect = content.getBoundingClientRect();
    const contentWidth = content.scrollWidth;
    const sidebarThreshold = contentWidth * 0.4; // entries left of this are sidebar

    const entryPositions = entries.map(el => {
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top - contentRect.top,
        bottom: rect.bottom - contentRect.top,
        height: rect.height,
        isSidebar: (rect.left - contentRect.left + rect.width / 2) < sidebarThreshold,
      };
    });

    // Find section headings that should stay with their first content entry (break-after: avoid)
    const sectionHeadings = Array.from(content.querySelectorAll('.resume-section'));
    const headingPositions = sectionHeadings.map(el => {
      const rect = el.getBoundingClientRect();
      // Find first resume-entry child — heading must stay with it
      const firstEntry = el.querySelector('.resume-entry');
      const firstEntryTop = firstEntry
        ? firstEntry.getBoundingClientRect().top - contentRect.top
        : rect.top - contentRect.top + 40; // fallback: heading + min spacing
      return {
        top: rect.top - contentRect.top,
        firstEntryTop,
      };
    });

    // Calculate page breaks:
    // Phase 1: Converge ALL entries (break-inside: avoid) — stable across both columns
    // Phase 2: Fix heading orphans, re-converge only main-content entries (skip sidebar
    //          to prevent dense sidebar items from cascading the break too far back)
    const breaks: number[] = [0];
    let nextPageEnd = CONTENT_PER_PAGE;

    while (nextPageEnd < contentHeight) {
      let adjustedEnd = nextPageEnd;

      // Phase 1: Converge ALL entries (sidebar + main)
      let settled = false;
      while (!settled) {
        settled = true;
        for (const entry of entryPositions) {
          if (entry.top < adjustedEnd && entry.bottom > adjustedEnd) {
            if (entry.height <= CONTENT_PER_PAGE) {
              const newEnd = Math.floor(entry.top);
              if (newEnd < adjustedEnd) {
                adjustedEnd = newEnd;
                settled = false;
              }
            }
          }
        }
      }

      // Phase 2: Heading orphan fix + main-content-only re-convergence (loop until stable)
      for (let round = 0; round < 4; round++) {
        let headingPushed = false;

        // Check heading orphans: heading on this page but first entry starts on next page
        for (const heading of headingPositions) {
          if (heading.top < adjustedEnd && heading.firstEntryTop >= adjustedEnd) {
            const newEnd = Math.floor(heading.top);
            if (newEnd < adjustedEnd) {
              adjustedEnd = newEnd;
              headingPushed = true;
            }
          }
        }

        if (!headingPushed) break; // No orphans, stable

        // Re-converge ONLY main-content entries (skip sidebar to avoid cascade)
        settled = false;
        while (!settled) {
          settled = true;
          for (const entry of entryPositions) {
            if (entry.isSidebar) continue; // sidebar entries don't cascade heading fixes
            if (entry.top < adjustedEnd && entry.bottom > adjustedEnd) {
              if (entry.height <= CONTENT_PER_PAGE) {
                const newEnd = Math.floor(entry.top);
                if (newEnd < adjustedEnd) {
                  adjustedEnd = newEnd;
                  settled = false;
                }
              }
            }
          }
        }
      }

      // Safety: ensure we always make forward progress
      if (adjustedEnd <= breaks[breaks.length - 1]) {
        adjustedEnd = nextPageEnd;
      }

      breaks.push(adjustedEnd);
      nextPageEnd = adjustedEnd + CONTENT_PER_PAGE;
    }

    setPageBreaks(breaks);

    // Read template page background CSS variable (used by two-column templates like Modern)
    const templateRoot = content.firstElementChild as HTMLElement | null;
    const bg = templateRoot ? getComputedStyle(templateRoot).getPropertyValue('--resume-page-bg').trim() : '';
    setPageBg(bg);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const content = measureRef.current;
    if (!container || !content) return;

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, [measure]);

  const scaledWidth = A4_WIDTH_PX * scale;
  const scaledHeight = A4_HEIGHT_PX * scale;

  return (
    <div ref={containerRef} className={className}>
      {/* Hidden measurement render */}
      <div
        ref={measureRef}
        aria-hidden="true"
        style={{
          position: 'absolute',
          visibility: 'hidden',
          pointerEvents: 'none',
          width: `${A4_WIDTH_PX}px`,
        }}
      >
        {children}
      </div>

      {/* Visible stacked pages */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        {pageBreaks.map((breakPos, pageIndex) => {
          // Clip this page's content at the next page's break point to avoid duplication
          const nextBreak = pageBreaks[pageIndex + 1];
          const pageContentHeight = nextBreak !== undefined
            ? Math.min(nextBreak - breakPos, CONTENT_PER_PAGE)
            : CONTENT_PER_PAGE;

          return (
            <div
              key={pageIndex}
              style={{
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                borderRadius: '2px',
                background: pageBg || 'white',
              }}
            >
              {/* Scale wrapper — clipping at full A4 dimensions, then scaled */}
              <div
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  width: `${A4_WIDTH_PX}px`,
                  height: `${A4_HEIGHT_PX}px`,
                }}
              >
                {/* Top page margin */}
                <div style={{ height: `${PAGE_MARGIN_TOP}px` }} />
                {/* Content viewport — height matches distance to next break */}
                <div style={{ height: `${pageContentHeight}px`, overflow: 'hidden' }}>
                  <div style={{ marginTop: `${-breakPos}px` }}>
                    {children}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
