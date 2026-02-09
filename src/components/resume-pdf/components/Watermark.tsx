import React from 'react'
import { View, Text, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  watermarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  watermarkItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'rotate(-45deg)',
  },
  mainText: {
    fontSize: 28,
    color: 'red',
    opacity: 0.13,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },
  subText: {
    fontSize: 14,
    color: 'red',
    opacity: 0.13,
    fontFamily: 'Helvetica',
    marginTop: 4,
  },
})

// 5 positions spread across the page for full coverage
const watermarkPositions = [
  { top: '10%', left: '5%' },    // top-left
  { top: '30%', left: '35%' },   // upper-center
  { top: '50%', left: '15%' },   // middle-left
  { top: '50%', left: '55%' },   // middle-right
  { top: '75%', left: '30%' },   // lower-center
]

export const Watermark: React.FC = () => {
  return (
    <View style={styles.watermarkContainer} fixed>
      {watermarkPositions.map((pos, i) => (
        <View
          key={i}
          style={[
            styles.watermarkItem,
            { top: pos.top, left: pos.left },
          ]}
        >
          <Text style={styles.mainText}>PREVIEW ONLY</Text>
          <Text style={styles.subText}>Upgrade to remove watermark</Text>
        </View>
      ))}
    </View>
  )
}
