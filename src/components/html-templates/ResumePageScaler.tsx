'use client';
import React, { useRef, useEffect, useState } from 'react';

const A4_WIDTH_PX = 794; // 210mm at 96dpi

interface ResumePageScalerProps {
  children: React.ReactNode;
  className?: string;
}

export function ResumePageScaler({ children, className = '' }: ResumePageScalerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setScale(Math.min(width / A4_WIDTH_PX, 1));
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className} style={{ overflow: 'auto' }}>
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          width: `${A4_WIDTH_PX}px`,
          margin: '0 auto',
        }}
      >
        {children}
      </div>
    </div>
  );
}
