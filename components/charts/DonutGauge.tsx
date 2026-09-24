/**
 * DonutGauge — circular arc that fills to show a percentage value.
 * Uses react-native-svg. Works on web + native.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import Svg, { Circle, G } from 'react-native-svg';

interface Props {
  percentage: number;   // 0‒100
  color: string;        // arc colour
  trackColor: string;   // background ring colour
  size?: number;        // diameter in dp (default 120)
  strokeWidth?: number; // (default 12)
  label?: string;       // text below the number
  textColor?: string;
}

export default function DonutGauge({
  percentage,
  color,
  trackColor,
  size = 120,
  strokeWidth = 12,
  label = 'Confidence',
  textColor = '#1C1C1E',
}: Props) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        {/* Track ring */}
        <Circle
          cx={cx} cy={cy} r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Filled arc — rotated so it starts at the top */}
        <G transform={`rotate(-90 ${cx} ${cy})`}>
          <Circle
            cx={cx} cy={cy} r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {/* Centre labels */}
      <View style={[styles.centre, { width: size, height: size }]}>
        <Text style={[styles.number, { color }]}>{Math.round(percentage)}%</Text>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', alignItems: 'center' },
  centre: {
    position: 'absolute', top: 0, left: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  number: { fontSize: 22, fontWeight: 'bold' },
  label:  { fontSize: 10, marginTop: 2, opacity: 0.7 },
});
