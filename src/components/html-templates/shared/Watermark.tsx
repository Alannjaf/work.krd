import React from 'react';

const watermarkPositions = [
  { top: '10%', left: '5%' },
  { top: '30%', left: '35%' },
  { top: '50%', left: '15%' },
  { top: '50%', left: '55%' },
  { top: '75%', left: '30%' },
];

export function Watermark() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {watermarkPositions.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: pos.top,
            left: pos.left,
            transform: 'rotate(-45deg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 28,
              color: 'red',
              opacity: 0.13,
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 'bold',
              letterSpacing: 2,
            }}
          >
            PREVIEW ONLY
          </span>
          <span
            style={{
              fontSize: 14,
              color: 'red',
              opacity: 0.13,
              fontFamily: 'Helvetica, Arial, sans-serif',
              marginTop: 4,
            }}
          >
            Upgrade to remove watermark
          </span>
        </div>
      ))}
    </div>
  );
}
