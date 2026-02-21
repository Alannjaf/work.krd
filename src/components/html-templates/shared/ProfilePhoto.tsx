import React from 'react';

interface ProfilePhotoProps {
  src?: string;
  size?: number;
  borderColor?: string;
  borderWidth?: number;
  alt?: string;
}

export function ProfilePhoto({
  src,
  size = 90,
  borderColor = '#ffffff',
  borderWidth = 4,
  alt = 'Profile photo',
}: ProfilePhotoProps) {
  if (!src) return null;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: `${borderWidth}px solid ${borderColor}`,
        flexShrink: 0,
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
}
