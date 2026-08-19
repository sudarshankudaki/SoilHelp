/**
 * NutrientRadarChart — pentagon radar showing N, P, K, pH and overall score.
 * Each axis is normalised 0‒1 against its optimal max.
 * Uses react-native-svg. Works on web + native.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import Svg, { Polygon, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

interface Axis {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
}

interface Props {
  axes: Axis[];          // exactly 5 items: N, P, K, pH, Confidence
  color: string;         // fill / stroke colour for data polygon
  trackColor: string;    // grid ring colour
  textColor: string;
  size?: number;         // svg width = height (default 220)
}

/** Convert polar coords to cartesian, angle 0 = top */
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Clamp a value between 0‒1 representing how full the axis is */
function normalise(value: number, min: number, max: number): number {
  // Use 1.5× the optimal max as the full-scale ceiling
  const ceiling = max * 1.5;
  return Math.min(1, Math.max(0, value / ceiling));
}

export default function NutrientRadarChart({
  axes,
  color,
  trackColor,
  textColor,
  size = 220,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 28;   // leave room for labels
  const levels = 4;              // concentric grid rings
  const n = axes.length;         // 5

  const angleStep = 360 / n;

  // ── Grid rings ──────────────────────────────────────────────────────────────
  const gridRings = Array.from({ length: levels }, (_, i) => {
    const r = (maxR * (i + 1)) / levels;
    const pts = Array.from({ length: n }, (__, j) => {
      const { x, y } = polar(cx, cy, r, j * angleStep);
      return `${x},${y}`;
    }).join(' ');
    return pts;
  });

  // ── Axis endpoint coords ────────────────────────────────────────────────────
  const axisPoints = axes.map((_, i) => polar(cx, cy, maxR, i * angleStep));

  // ── Data polygon points ─────────────────────────────────────────────────────
  const dataPoints = axes.map((axis, i) => {
    const r = normalise(axis.value, axis.min, axis.max) * maxR;
    return polar(cx, cy, r, i * angleStep);
  });
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  // ── Label positions (slightly outside maxR) ─────────────────────────────────
  const labelR = maxR + 18;

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.15" />
          </LinearGradient>
        </Defs>

        {/* Grid rings */}
        {gridRings.map((pts, i) => (
          <Polygon
            key={`ring-${i}`}
            points={pts}
            fill="none"
            stroke={trackColor}
            strokeWidth={1}
            opacity={0.6}
          />
        ))}

        {/* Axis spokes */}
        {axisPoints.map((pt, i) => (
          <Line
            key={`spoke-${i}`}
            x1={cx} y1={cy}
            x2={pt.x} y2={pt.y}
            stroke={trackColor}
            strokeWidth={1}
            opacity={0.8}
          />
        ))}

        {/* Data polygon fill */}
        <Polygon
          points={dataPolygon}
          fill="url(#radarFill)"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data vertex dots */}
        {dataPoints.map((pt, i) => (
          <Circle
            key={`dot-${i}`}
            cx={pt.x} cy={pt.y} r={4}
            fill={color}
            stroke="#FFF"
            strokeWidth={1.5}
          />
        ))}

        {/* Axis labels */}
        {axes.map((axis, i) => {
          const { x, y } = polar(cx, cy, labelR, i * angleStep);
          // Anchor: left-ish for right side, right-ish for left side
          const textAnchor = x > cx + 4 ? 'start' : x < cx - 4 ? 'end' : 'middle';
          const dyOffset = y < cy - 4 ? -4 : y > cy + 4 ? 10 : 4;
          return (
            <SvgText
              key={`label-${i}`}
              x={x} y={y + dyOffset}
              textAnchor={textAnchor}
              fontSize={10}
              fontWeight="600"
              fill={textColor}
            >
              {axis.label}
            </SvgText>
          );
        })}

        {/* Value callouts on dots */}
        {dataPoints.map((pt, i) => {
          const axis = axes[i];
          const val = axis.value % 1 === 0 ? axis.value : axis.value.toFixed(1);
          // Offset callout away from centre
          const offset = 10;
          const { x: ox, y: oy } = polar(cx, cy,
            normalise(axis.value, axis.min, axis.max) * maxR + offset,
            i * angleStep
          );
          const textAnchor = ox > cx + 4 ? 'start' : ox < cx - 4 ? 'end' : 'middle';
          return (
            <SvgText
              key={`val-${i}`}
              x={ox} y={oy + 3}
              textAnchor={textAnchor}
              fontSize={9}
              fill={color}
              fontWeight="bold"
            >
              {val}{axis.unit}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend row */}
      <View style={styles.legend}>
        {axes.map((axis, i) => {
          const norm = normalise(axis.value, axis.min, axis.max);
          const statusColor = norm < 0.4 ? '#F59E0B' : norm > 0.9 ? '#EF4444' : '#10B981';
          return (
            <View key={i} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.legendText, { color: textColor }]}>{axis.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  legend: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 10, marginTop: 4,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11 },
});
