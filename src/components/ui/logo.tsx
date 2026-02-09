import React from 'react'
import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  // The new logo has a viewBox of 0 0 2663.56 802.01 (aspect ratio ~3.3:1)
  // Calculate width and height maintaining the aspect ratio
  const logoWidths = {
    sm: 120,
    md: 160,
    lg: 200
  }
  
  // Height is approximately width / 3.3 to maintain aspect ratio
  const logoHeights = {
    sm: Math.round(120 / 3.32),
    md: Math.round(160 / 3.32),
    lg: Math.round(200 / 3.32)
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.svg"
        alt="Work.krd Logo"
        width={logoWidths[size]}
        height={logoHeights[size]}
        className="object-contain"
        sizes="(max-width: 768px) 120px, 160px"
      />
    </div>
  )
}