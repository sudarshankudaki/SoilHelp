/**
 * PHScale — horizontal gradient bar (acidic → neutral → alkaline)
 * with a triangular needle pointing to the current pH value.
 * Uses react-native-svg. Works on web + native.
 *
 * pH range displayed: 0 – 14
 * Colour zones:
 *   0–4   strong acid  #EF4444 (red)
 *   4–6   mild acid    #F59E0B (amber)
 *   6–7.5 neutral      #10B981 (green)
 *   7.5–9 mild alkali  #3B82F6 (blue)
 *   9–14  strong alk.  #8B5CF6 (purple)
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import Svg, {
  Defs, LinearGradient, Stop,
  Rect, Polygon, Text as SvgText, Line,
} from 'react-native-svg';

interface Props {
  ph: number;          // 0 – 14
  textColor: string;
  width?: number;      // total component width (default 280)
}

const PH_MIN = 0;
const PH_MAX = 14;

const ZONE_LABELS = [
  { label: 'Strong\nAcid',  ph: 2,    color: '#EF4444' },
  { label: 'Mild\nAcid',    ph: 5,    color: '#F59E0B' },
  { label: 'Neutral',       ph: 6.75, color: '#10B981' },
  { label: 'Mild\nAlkali',  ph: 8.25, color: '#3B82F6' },
  { label: 'Strong\nAlkali',ph: 11.5, color: '#8B5CF6' },
];

const TICK_PHS = [0, 2, 4, 6, 7, 8, 10, 12, 14];

function pct(ph: number) {
  return Math.min(1, Math.max(0, (ph - PH_MIN) / (PH_MAX - PH_MIN)));
}

/** Zone colour for the needle based on pH value */
function needleColor(ph: number): string {
  if (ph < 4)   return '#EF4444';
  if (ph < 6)   return '#F59E0B';
  if (ph < 7.5) return '#10B981';
  if (ph < 9)   return '#3B82F6';
  return '#8B5CF6';
}

export default function PHScale({ ph, textColor, width = 280 }: Props) {
  const BAR_H = 22;
  const NEEDLE_H = 14;
  const TICK_H = 6;
  const LABEL_Y_OFFSET = 52;   // y for tick labels
  const SVG_H = 80;

  const padL = 8;
  const padR = 8;
  const barW = width - padL - padR;

  const needleX = padL + pct(ph) * barW;
  const nColor = needleColor(ph);

  // Triangle needle pointing DOWN into bar top
  const needlePts = [
    `${needleX},${BAR_H - 1}`,
    `${needleX - 7},${BAR_H + NEEDLE_H}`,
    `${needleX + 7},${BAR_H + NEEDLE_H}`,
  ].join(' ');

  return (
    <View style={styles.wrapper}>
      <Svg width={width} height={SVG_H}>
        <Defs>
          {/* Full 5-stop gradient across the bar */}
          <LinearGradient id="phGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%"    stopColor="#EF4444" />
            <Stop offset="28%"   stopColor="#F59E0B" />
            <Stop offset="46%"   stopColor="#10B981" />
            <Stop offset="60%"   stopColor="#3B82F6" />
            <Stop offset="100%"  stopColor="#8B5CF6" />
          </LinearGradient>
        </Defs>

        {/* Gradient bar */}
        <Rect
          x={padL} y={0}
          width={barW} height={BAR_H}
          fill="url(#phGrad)"
          rx={BAR_H / 2}
        />

        {/* Tick marks + labels */}
        {TICK_PHS.map((t) => {
          const tx = padL + pct(t) * barW;
          return (
            <React.Fragment key={t}>
              <Line
                x1={tx} y1={BAR_H}
                x2={tx} y2={BAR_H + TICK_H}
                stroke={textColor} strokeWidth={1} opacity={0.4}
              />
              <SvgText
                x={tx} y={LABEL_Y_OFFSET}
                textAnchor="middle"
                fontSize={9}
                fill={textColor}
                opacity={0.6}
              >
                {t}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Needle (triangle) */}
        <Polygon
          points={needlePts}
          fill={nColor}
          stroke="#FFF"
          strokeWidth={1.2}
        />

        {/* Current pH label above needle */}
        <SvgText
          x={needleX}
          y={BAR_H - 5}
          textAnchor="middle"
          fontSize={11}
          fontWeight="bold"
          fill="#FFF"
        >
          {ph.toFixed(1)}
        </SvgText>
      </Svg>

      {/* Zone label row */}
      <View style={[styles.zoneRow, { width }]}>
        {ZONE_LABELS.map((z) => (
          <View key={z.label} style={styles.zoneItem}>
            <View style={[styles.zoneDot, { backgroundColor: z.color }]} />
            <Text style={[styles.zoneText, { color: textColor }]}>
              {z.label.replace('\n', ' ')}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  zoneItem: { alignItems: 'center', flex: 1 },
  zoneDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 2 },
  zoneText: { fontSize: 9, textAlign: 'center', opacity: 0.75 },
});
