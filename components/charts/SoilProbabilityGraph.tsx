/**
 * SoilProbabilityGraph — 3D isometric pie chart + animated bars for soil classification.
 * Top: 3D pie with extruded wedges per soil type probability.
 * Bottom: ranked animated bar list.
 * Works on web + native.
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import PieChart, { PieSlice } from './PieChart';

interface Props {
  probabilities: Record<string, number>;  // { Sandy: 0.12, Clay: 0.73, ... }
  predictedType: string;
  theme: any;
}

export const SOIL_META: Record<string, { color: string; emoji: string }> = {
  Sandy: { color: '#EAB308', emoji: '🏜️' },
  Clay:  { color: '#8A5D3B', emoji: '🏔️' },
  Loam:  { color: '#10B981', emoji: '🌱' },
  Black: { color: '#334155', emoji: '⚫' },
  Red:   { color: '#EF4444', emoji: '🔴' },
};

// ── Animated bar row ──────────────────────────────────────────────────────────
function AnimatedBar({
  percentage, color, isPredicted, theme,
}: {
  percentage: number; color: string; isPredicted: boolean; theme: any;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: percentage,
      duration: 800,
      delay: 200,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const widthInterpolated = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
      <Animated.View
        style={[styles.barFill, {
          width: widthInterpolated,
          backgroundColor: color,
          opacity: isPredicted ? 1 : 0.5,
        }]}
      />
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SoilProbabilityGraph({
  probabilities,
  predictedType,
  theme,
}: Props) {
  const sorted = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

  // Build pie slices — use Material Design soil colours
  const pieSlices: PieSlice[] = sorted.map(([soilClass, val]) => {
    const meta = SOIL_META[soilClass] ?? { color: '#94A3B8', emoji: '🌍' };
    return { label: soilClass, value: val, color: meta.color, emoji: meta.emoji };
  });

  const topSoil = sorted[0]?.[0] ?? predictedType;
  const topMeta = SOIL_META[topSoil] ?? { color: '#94A3B8', emoji: '🌍' };

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <FontAwesome name="pie-chart" size={16} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>  AI Soil Classification</Text>
      </View>

      {/* ── 3D Pie chart ────────────────────────────────────────────────────── */}
      <PieChart
        slices={pieSlices}
        depth={18}
        textColor={theme.text}
        showLegend={false}
      />

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      {/* ── Bar rows ────────────────────────────────────────────────────────── */}
      {sorted.map(([soilClass, val]) => {
        const pct = Math.round(val * 100);
        const meta = SOIL_META[soilClass] ?? { color: '#94A3B8', emoji: '🌍' };
        const isPredicted = soilClass === predictedType;

        return (
          <View
            key={soilClass}
            style={[
              styles.row,
              isPredicted && {
                backgroundColor: meta.color + '15',
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 6,
                marginHorizontal: -8,
              },
            ]}
          >
            {/* Colour swatch */}
            <View style={[styles.swatch, { backgroundColor: meta.color }]} />

            {/* Name */}
            <Text style={[
              styles.soilName,
              { color: theme.text, fontWeight: isPredicted ? '700' : '400', width: 68 },
            ]}>
              {meta.emoji} {soilClass}{isPredicted ? ' 🎯' : ''}
            </Text>

            {/* Bar */}
            <View style={styles.barCol}>
              <AnimatedBar
                percentage={pct}
                color={meta.color}
                isPredicted={isPredicted}
                theme={theme}
              />
            </View>

            {/* Percentage */}
            <Text style={[
              styles.pctText,
              { color: isPredicted ? meta.color : theme.tabIconDefault,
                fontWeight: isPredicted ? '700' : '400' },
            ]}>
              {pct}%
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: 'bold' },

  divider: { height: 1, marginVertical: 16 },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  swatch: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  soilName: { fontSize: 13 },
  barCol: { flex: 1, marginHorizontal: 8 },
  barTrack: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: 5 },
  pctText:  { width: 36, fontSize: 12, textAlign: 'right' },
});
