/**
 * NutrientPieChart — 3D isometric pie chart showing each nutrient's
 * health contribution (N, P, K, pH) as vibrant wedges with
 * extruded side faces and glossy tops.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import PieChart, { PieSlice } from './PieChart';
import { NutrientInfo } from '@/constants/ApiService';

interface Props {
  nitrogen:   NutrientInfo;
  phosphorus: NutrientInfo;
  potassium:  NutrientInfo;
  ph:         NutrientInfo;
  theme: any;
}

function nutrientScore(value: number, optMin: number, optMax: number): number {
  const ceiling = optMax * 1.5;
  return Math.round(Math.min(1, Math.max(0, value / ceiling)) * 100);
}

export default function NutrientPieChart({ nitrogen, phosphorus, potassium, ph, theme }: Props) {
  const nScore  = nutrientScore(nitrogen.value,   nitrogen.optimal_min,   nitrogen.optimal_max);
  const pScore  = nutrientScore(phosphorus.value, phosphorus.optimal_min, phosphorus.optimal_max);
  const kScore  = nutrientScore(potassium.value,  potassium.optimal_min,  potassium.optimal_max);
  const phScore = nutrientScore(ph.value, 6.0, 7.5);

  const slices: PieSlice[] = [
    { label: 'Nitrogen (N)',    value: nScore,  color: '#4CAF50', emoji: '🟢' },
    { label: 'Phosphorus (P)',  value: pScore,  color: '#2196F3', emoji: '🔵' },
    { label: 'Potassium (K)',   value: kScore,  color: '#FF5722', emoji: '🔴' },
    { label: 'pH Balance',      value: phScore, color: '#FF9800', emoji: '🟠' },
  ];

  const health = Math.round((nScore + pScore + kScore + phScore) / 4);
  const healthLabel = health >= 75 ? '🌿 Good' : health >= 50 ? '⚠️ Fair' : '❗ Low';

  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={styles.headerRow}>
        <FontAwesome name="pie-chart" size={16} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>  Nutrient Health Breakdown</Text>
      </View>

      {/* Overall health badge */}
      <View style={[styles.healthBadge, { backgroundColor: theme.secondary }]}>
        <Text style={[styles.healthScore, { color: theme.primary }]}>{health}%</Text>
        <Text style={[styles.healthLabel, { color: theme.primary }]}>{healthLabel} Overall Soil Health</Text>
      </View>

      <PieChart
        slices={slices}
        depth={22}
        textColor={theme.text}
        showLegend
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: 'bold' },

  healthBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
    marginBottom: 16, gap: 10,
  },
  healthScore: { fontSize: 22, fontWeight: 'bold' },
  healthLabel: { fontSize: 13, fontWeight: '600' },
});
