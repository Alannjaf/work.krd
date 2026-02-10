'use client';
import React, { useRef, useEffect, useState } from 'react';

const A4_WIDTH_PX = 794; // 210mm at 96dpi

interface ResumePageScalerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResumePageScaler({ children, className = '' }: ResumePageScalerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const observer = new ResizeObserver(() => {
      const containerWidth = container.clientWidth;
      const newScale = Math.min(containerWidth / A4_WIDTH_PX, 1);
      setScale(newScale);
      setContentHeight(content.scrollHeight * newScale);
    });

    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const scaledWidth = A4_WIDTH_PX * scale;

  return (
    <div ref={containerRef} className={className}>
      <div
        style={{
          width: `${scaledWidth}px`,
          height: contentHeight > 0 ? `${contentHeight}px` : 'auto',
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        <div
          ref={contentRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${A4_WIDTH_PX}px`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
