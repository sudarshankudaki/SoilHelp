/**
 * PieChart3D — 3D isometric pie chart in pure SVG.
 *
 * Visual style:
 *  • Flat top face per wedge (vibrant fill)
 *  • Extruded side face with darkened shade for depth
 *  • Glossy highlight arc on each top face
 *  • Soft drop-shadow filter behind the whole chart
 *  • White separator lines between wedges
 *  • Material Design vibrant colour palette
 *  • Legend row below with colour swatch + label + %
 *
 * The "3D" illusion is achieved by:
 *  1. Drawing the outer side face as a filled polygon (arc bottom → arc top)
 *  2. Drawing the flat top ellipse-arc on top of it
 *  3. Offset: the chart sits slightly lower in the SVG so the extrusion
 *     hangs below the top faces
 *
 * Works on web + native (react-native-svg).
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { Text } from '@/components/Themed';
import Svg, {
  Path, Ellipse, Defs, Filter, FeDropShadow,
  RadialGradient, Stop, G, Text as SvgText, Line,
} from 'react-native-svg';

// ── Public types ──────────────────────────────────────────────────────────────
export interface PieSlice {
  label: string;
  value: number;
  color: string;
  emoji?: string;
}

interface Props {
  slices: PieSlice[];
  size?: number;       // outer SVG width (height = size * 0.75 to give room for extrusion)
  depth?: number;      // extrusion height in px (default 18)
  textColor?: string;
  showLegend?: boolean;
}

// ── Colour helpers ────────────────────────────────────────────────────────────
/** Darken a hex colour for side-face shading */
function darken(hex: string, amount = 0.35): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.round(((num >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8)  & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round(( num        & 0xff) * (1 - amount)));
  return `rgb(${r},${g},${b})`;
}

/** Lighten a hex colour for gloss highlight */
function lighten(hex: string, amount = 0.55): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.round(((num >> 16) & 0xff) + 255 * amount));
  const g = Math.min(255, Math.round(((num >> 8)  & 0xff) + 255 * amount));
  const b = Math.min(255, Math.round(( num        & 0xff) + 255 * amount));
  return `rgba(${r},${g},${b},0.45)`;
}

// ── Geometry ──────────────────────────────────────────────────────────────────
/** Isometric ellipse point: x-radius rx, y-radius ry (compressed for perspective) */
function ellipsePoint(cx: number, cy: number, rx: number, ry: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + rx * Math.cos(rad),
    y: cy + ry * Math.sin(rad),
  };
}

/**
 * Build the SVG path for one 3D wedge.
 * Returns { topPath, sidePath, glossPath }
 */
function buildWedge(
  cx: number, cy: number,
  rx: number, ry: number,
  depth: number,
  startDeg: number, endDeg: number,
  color: string,
) {
  const sweep = Math.min(endDeg - startDeg, 359.9999);
  const large = sweep > 180 ? 1 : 0;

  const s = ellipsePoint(cx, cy, rx, ry, startDeg);
  const e = ellipsePoint(cx, cy, rx, ry, endDeg);

  // ── Top face (ellipse arc) ────────────────────────────────────────────────
  const topPath =
    `M ${cx} ${cy} ` +
    `L ${s.x} ${s.y} ` +
    `A ${rx} ${ry} 0 ${large} 1 ${e.x} ${e.y} ` +
    `Z`;

  // ── Side face — only for wedges in the "lower" half (180°–360°) ──────────
  // Visible side = start edge, outer arc bottom, end edge
  // We draw both side walls + outer arc bottom face
  const sBot = { x: s.x, y: s.y + depth };
  const eBot = { x: e.x, y: e.y + depth };

  // Outer arc bottom
  const sidePath =
    `M ${s.x} ${s.y} ` +
    `L ${sBot.x} ${sBot.y} ` +
    `A ${rx} ${ry} 0 ${large} 1 ${eBot.x} ${eBot.y} ` +
    `L ${e.x} ${e.y} ` +
    `A ${rx} ${ry} 0 ${large} 0 ${s.x} ${s.y} ` +
    `Z`;

  // ── Gloss highlight — small arc near the start of the top face ───────────
  const g1 = ellipsePoint(cx, cy, rx * 0.55, ry * 0.55, startDeg);
  const g2 = ellipsePoint(cx, cy, rx * 0.85, ry * 0.85, startDeg + Math.min(sweep * 0.35, 40));
  const g3 = ellipsePoint(cx, cy, rx * 0.55, ry * 0.55, startDeg + Math.min(sweep * 0.2, 22));
  const glossPath =
    `M ${g1.x} ${g1.y} ` +
    `Q ${g2.x} ${g2.y} ${g3.x} ${g3.y} ` +
    `Z`;

  return { topPath, sidePath, glossPath };
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PieChart({
  slices,
  size: sizeProp,
  depth = 20,
  textColor = '#1C1C1E',
  showLegend = true,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const size = sizeProp ?? Math.min(screenWidth - 48, 280);

  // SVG canvas — extra height for the extrusion + drop shadow
  const svgW = size;
  const svgH = Math.round(size * 0.68) + depth + 20;

  // Ellipse centre sits in the upper portion of the SVG
  const cx = svgW / 2;
  const cy = Math.round(svgH * 0.38);
  const rx = size * 0.42;
  const ry = rx * 0.40;   // vertical compression → isometric look

  // Animate entrance — fade + tiny scale
  const mountAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(mountAnim, {
      toValue: 1, duration: 650, useNativeDriver: true,
    }).start();
  }, []);

  const validSlices = slices.filter(s => s.value > 0);
  const total = validSlices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  // Build angle layout — start at -90° (top) so biggest slice starts at 12 o'clock
  type Layout = {
    slice: PieSlice; startDeg: number; sweep: number; midDeg: number; pct: number;
  };
  let cursor = -90;
  const layout: Layout[] = validSlices.map(slice => {
    const pct = slice.value / total;
    const sweep = pct * 360;
    const mid = cursor + sweep / 2;
    const entry: Layout = { slice, startDeg: cursor, sweep, midDeg: mid, pct };
    cursor += sweep;
    return entry;
  });

  // Determine which wedges have a visible lower side face
  // (those whose arc passes through the 0°–180° bottom half of the ellipse)
  function hasSideFace(startDeg: number, sweep: number): boolean {
    const end = startDeg + sweep;
    // Normalise to 0–360
    const s = ((startDeg % 360) + 360) % 360;
    const e = s + sweep;
    // Side face visible if any part of the arc is in 0°–180° (bottom half)
    return s < 180 || e > 180 || (s < 360 && e > 360);
  }

  // Sort: draw back wedges first, front wedges last (painter's algorithm)
  // "back" = mid angle near -90° (top), "front" = near 90° (bottom)
  const sortedLayout = [...layout].sort((a, b) => {
    const normA = ((a.midDeg % 360) + 360) % 360;
    const normB = ((b.midDeg % 360) + 360) % 360;
    // Wedges with mid near 270° (top of ellipse) drawn first
    const distA = Math.abs(normA - 270);
    const distB = Math.abs(normB - 270);
    return distB - distA;
  });

  return (
    <Animated.View style={[styles.wrapper, { opacity: mountAnim }]}>
      <Svg width={svgW} height={svgH}>
        <Defs>
          {/* Drop shadow filter */}
          <Filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
            <FeDropShadow
              dx="0" dy={depth * 0.6}
              stdDeviation="8"
              floodColor="rgba(0,0,0,0.22)"
            />
          </Filter>
          {/* Gloss white radial gradient overlay */}
          <RadialGradient id="gloss" cx="35%" cy="30%" r="60%">
            <Stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.00" />
          </RadialGradient>
        </Defs>

        {/* ── All side faces (drawn before top faces) ────────────────────── */}
        <G filter="url(#shadow)">
          {sortedLayout.map(({ slice, startDeg, sweep, pct }) => {
            if (!hasSideFace(startDeg, sweep)) return null;
            const { sidePath } = buildWedge(cx, cy, rx, ry, depth, startDeg, startDeg + sweep, slice.color);
            return (
              <Path
                key={`side-${slice.label}`}
                d={sidePath}
                fill={darken(slice.color, 0.30)}
                stroke="#FFF"
                strokeWidth={0.8}
                strokeOpacity={0.6}
              />
            );
          })}
        </G>

        {/* ── Top faces ──────────────────────────────────────────────────── */}
        {sortedLayout.map(({ slice, startDeg, sweep }) => {
          const { topPath, glossPath } = buildWedge(cx, cy, rx, ry, depth, startDeg, startDeg + sweep, slice.color);
          return (
            <G key={`top-${slice.label}`}>
              {/* Base fill */}
              <Path
                d={topPath}
                fill={slice.color}
                stroke="#FFF"
                strokeWidth={1.2}
                strokeOpacity={0.9}
              />
              {/* Gloss highlight */}
              <Path
                d={glossPath}
                fill={lighten(slice.color)}
                opacity={0.7}
              />
            </G>
          );
        })}

        {/* ── Overall gloss overlay on whole ellipse ────────────────────── */}
        <Ellipse
          cx={cx} cy={cy}
          rx={rx} ry={ry}
          fill="url(#gloss)"
          opacity={0.5}
        />

        {/* ── % labels on top faces ────────────────────────────────────── */}
        {layout.map(({ slice, midDeg, pct }) => {
          if (pct < 0.07) return null;
          const labelR = rx * 0.62;
          const labelRy = ry * 0.62;
          const lx = cx + labelR  * Math.cos((midDeg * Math.PI) / 180);
          const ly = cy + labelRy * Math.sin((midDeg * Math.PI) / 180);
          return (
            <SvgText
              key={`pct-${slice.label}`}
              x={lx} y={ly + 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight="bold"
              fill="#FFF"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth={0.5}
            >
              {Math.round(pct * 100)}%
            </SvgText>
          );
        })}
      </Svg>

      {/* ── Legend ─────────────────────────────────────────────────────────── */}
      {showLegend && (
        <View style={styles.legendWrap}>
          {layout.map(({ slice, pct }) => (
            <View key={slice.label} style={styles.legendRow}>
              {/* 3D cube swatch */}
              <View style={styles.swatchWrap}>
                <View style={[styles.swatchTop,  { backgroundColor: slice.color }]} />
                <View style={[styles.swatchSide, { backgroundColor: darken(slice.color, 0.3) }]} />
              </View>
              <Text style={[styles.legendLabel, { color: textColor }]}>
                {slice.emoji ? `${slice.emoji} ` : ''}{slice.label}
              </Text>
              <Text style={[styles.legendPct, { color: slice.color }]}>
                {Math.round(pct * 100)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}

const SWATCH = 12;
const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },

  legendWrap: { marginTop: 10, width: '100%', paddingHorizontal: 8 },
  legendRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 5, gap: 8,
  },

  // Tiny 3D cube as legend swatch
  swatchWrap: { width: SWATCH + 4, height: SWATCH, position: 'relative' },
  swatchTop: {
    position: 'absolute', top: 0, left: 0,
    width: SWATCH, height: SWATCH * 0.75,
    borderRadius: 2,
  },
  swatchSide: {
    position: 'absolute', bottom: 0, right: 0,
    width: SWATCH * 0.4, height: SWATCH * 0.55,
    borderRadius: 1,
  },

  legendLabel: { flex: 1, fontSize: 13 },
  legendPct:   { fontSize: 13, fontWeight: 'bold', minWidth: 36, textAlign: 'right' },
});
