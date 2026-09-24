/**
 * SoilHelp — Analysis Result Screen
 * Displays AI soil analysis with visual charts:
 *  • DonutGauge           — soil type confidence arc in hero
 *  • NutrientRadarChart   — N / P / K / pH / Confidence pentagon radar
 *  • NutrientPieChart     — donut showing N/P/K/pH health share (pie)
 *  • SoilProbabilityGraph — pie chart + animated bars for soil classification
 *  • NutrientBar          — individual bar per nutrient with optimal range markers
 *  • PHScale              — gradient pH strip with triangle needle
 */
import React, { useMemo } from 'react';
import {
  StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Share, useWindowDimensions,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SoilAnalysisResult } from '@/constants/ApiService';

import DonutGauge from '@/components/charts/DonutGauge';
import NutrientRadarChart from '@/components/charts/NutrientRadarChart';
import PHScale from '@/components/charts/PHScale';
import SoilProbabilityGraph from '@/components/charts/SoilProbabilityGraph';
import NutrientPieChart from '@/components/charts/NutrientPieChart';
import { useTranslation } from '@/context/LanguageContext';

// ── Nutrient status helpers ───────────────────────────────────────────────────
function getNutrientStatus(value: number, min: number, max: number) {
  const pct = Math.min(100, Math.max(0, (value / (max * 1.5)) * 100));
  if (value < min) return { label: 'Low',     color: '#F59E0B', percentage: pct };
  if (value > max) return { label: 'High',    color: '#EF4444', percentage: pct };
  return             { label: 'Optimal', color: '#10B981', percentage: pct };
}

function getSoilEmoji(soilType: string): string {
  const map: Record<string, string> = {
    Sandy: '🏜️', Clay: '🏔️', Loam: '🌱', Black: '⚫', Red: '🔴',
  };
  return map[soilType] ?? '🌍';
}

// ── NutrientBar ───────────────────────────────────────────────────────────────
function NutrientBar({
  label, value, unit, min, max, theme,
}: {
  label: string; value: number; unit: string;
  min: number; max: number; theme: any;
}) {
  const status = getNutrientStatus(value, min, max);
  return (
    <View style={styles.nutrientItem}>
      <View style={styles.nutrientHeader}>
        <Text style={[styles.nutrientLabel, { color: theme.text }]}>{label}</Text>
        <View style={styles.nutrientRight}>
          <Text style={[styles.nutrientValue, { color: theme.text }]}>{value}{unit}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.barBackground, { backgroundColor: theme.border }]}>
        <View style={[styles.barFill, { width: `${status.percentage}%`, backgroundColor: status.color }]} />
        <View style={[styles.optimalMarker, {
          left: `${Math.min(100, (min / (max * 1.5)) * 100)}%`,
          backgroundColor: '#10B981',
        }]} />
        <View style={[styles.optimalMarker, {
          left: `${Math.min(100, (max / (max * 1.5)) * 100)}%`,
          backgroundColor: '#10B981',
        }]} />
      </View>
      <Text style={[styles.rangeText, { color: theme.tabIconDefault }]}>
        Optimal: {min}–{max} {unit}
      </Text>
    </View>
  );
}

// ── CropCard ──────────────────────────────────────────────────────────────────
function CropCard({ crop, theme }: { crop: any; theme: any }) {
  return (
    <View style={[styles.cropCard, { backgroundColor: theme.secondary }]}>
      <Text style={styles.cropEmoji}>{crop.icon}</Text>
      <Text style={[styles.cropName, { color: theme.primary }]}>{crop.name}</Text>
      <Text style={[styles.cropSeason, { color: theme.tabIconDefault }]}>{crop.season}</Text>
      <View style={[styles.waterBadge, { backgroundColor: theme.cardBackground }]}>
        <FontAwesome name="tint" size={10} color={theme.primary} />
        <Text style={[styles.waterText, { color: theme.primary }]}> {crop.water}</Text>
      </View>
    </View>
  );
}

// ── Section header helper ─────────────────────────────────────────────────────
function SectionHeader({ icon, title, theme }: { icon: any; title: string; theme: any }) {
  return (
    <View style={styles.cardTitleRow}>
      <FontAwesome name={icon} size={16} color={theme.primary} />
      <Text style={[styles.cardTitle, { color: theme.text }]}>  {title}</Text>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Screen
// ══════════════════════════════════════════════════════════════════════════════
export default function AnalysisScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { width: screenWidth } = useWindowDimensions();

  const result: SoilAnalysisResult | null = useMemo(() => {
    if (!params.result) return null;
    try { return JSON.parse(params.result as string); }
    catch { return null; }
  }, [params.result]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!result) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: t('aiAnalysis'), headerBackTitle: t('back') }} />
        <View style={styles.loadingContainer}>
          <View style={[styles.scanBox, { borderColor: theme.primary, backgroundColor: theme.cardBackground }]}>
            {[60, 80, 45, 70, 55, 90].map((w, i) => (
              <View key={i} style={[styles.mockLine, { width: `${w}%`, backgroundColor: theme.border }]} />
            ))}
            <View style={styles.scanOverlay}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          </View>
          <Text style={[styles.loadingTitle, { color: theme.text }]}>{t('analysingSample')}</Text>
          <Text style={[styles.loadingSubtitle, { color: theme.tabIconDefault }]}>
            Running AI model · Predicting NPK · Matching crops
          </Text>
        </View>
      </View>
    );
  }

  const { nutrients } = result;
  const soilEmoji = getSoilEmoji(result.soil_type);

  // pH scale width
  const phScaleWidth = Math.min(screenWidth - 64, 320);

  // Radar axes
  const radarAxes = [
    { label: 'N',    value: nutrients.nitrogen.value,   min: nutrients.nitrogen.optimal_min,   max: nutrients.nitrogen.optimal_max,   unit: '%'   },
    { label: 'P',    value: nutrients.phosphorus.value, min: nutrients.phosphorus.optimal_min, max: nutrients.phosphorus.optimal_max, unit: 'ppm' },
    { label: 'K',    value: nutrients.potassium.value,  min: nutrients.potassium.optimal_min,  max: nutrients.potassium.optimal_max,  unit: 'ppm' },
    { label: 'pH',   value: nutrients.ph.value,         min: 6.0,  max: 7.5, unit: ''   },
    { label: 'Conf', value: result.soil_confidence,     min: 60,   max: 90,  unit: '%'  },
  ];

  const handleShare = async () => {
    const msg =
      `🌱 SoilHelp Analysis Report\n\n` +
      `Soil Type: ${result.soil_type} (${result.soil_confidence}% confidence)\n\n` +
      `Nutrients:\n` +
      `• Nitrogen: ${nutrients.nitrogen.value}%\n` +
      `• Phosphorus: ${nutrients.phosphorus.value} ppm\n` +
      `• Potassium: ${nutrients.potassium.value} ppm\n` +
      `• pH: ${nutrients.ph.value}\n\n` +
      `Top Crops: ${result.recommended_crops.slice(0, 3).map((c: any) => c.name).join(', ')}\n\n` +
      `${result.summary}`;
    await Share.share({ message: msg, title: t('aiAnalysis') });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: t('analysisResult'), headerBackTitle: t('back') }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Hero Card — soil type + donut gauge ──────────────────────────── */}
        <View style={[styles.heroCard, { backgroundColor: theme.primary }]}>
          <View style={styles.heroRow}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroEmoji}>{soilEmoji}</Text>
              <Text style={styles.heroSoilType}>{result.soil_type} Soil</Text>
              <Text style={styles.heroSummaryText} numberOfLines={2}>
                {result.summary}
              </Text>
              <View style={styles.heroBadges}>
                <View style={styles.heroBadge}>
                  <FontAwesome name="check-circle" size={12} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.heroBadgeText}> {t('done')}</Text>
                </View>
                <View style={styles.heroBadge}>
                  <FontAwesome name="clock-o" size={12} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.heroBadgeText}> {result.analysis_time_seconds}s</Text>
                </View>
              </View>
            </View>

            {/* Donut gauge replaces the old plain number */}
            <DonutGauge
              percentage={result.soil_confidence}
              color="#FFFFFF"
              trackColor="rgba(255,255,255,0.25)"
              textColor="rgba(255,255,255,0.85)"
              size={110}
              strokeWidth={10}
              label="Confidence"
            />
          </View>
        </View>

        {/* ── Radar Chart — N / P / K / pH / Confidence ────────────────────── */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <SectionHeader icon="bullseye" title="Nutrient Overview (Radar)" theme={theme} />
          <NutrientRadarChart
            axes={radarAxes}
            color={theme.primary}
            trackColor={theme.border}
            textColor={theme.text}
            size={Math.min(screenWidth - 64, 240)}
          />
        </View>

        {/* ── Nutrient Pie Chart ────────────────────────────────────────────── */}
        <NutrientPieChart
          nitrogen={nutrients.nitrogen}
          phosphorus={nutrients.phosphorus}
          potassium={nutrients.potassium}
          ph={nutrients.ph}
          theme={theme}
        />

        {/* ── Individual Nutrient Bars ──────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <SectionHeader icon="flask" title="Nutrient Detail" theme={theme} />
          <NutrientBar
            label="Nitrogen (N)"
            value={nutrients.nitrogen.value}
            unit="%"
            min={nutrients.nitrogen.optimal_min}
            max={nutrients.nitrogen.optimal_max}
            theme={theme}
          />
          <NutrientBar
            label="Phosphorus (P)"
            value={nutrients.phosphorus.value}
            unit=" ppm"
            min={nutrients.phosphorus.optimal_min}
            max={nutrients.phosphorus.optimal_max}
            theme={theme}
          />
          <NutrientBar
            label="Potassium (K)"
            value={nutrients.potassium.value}
            unit=" ppm"
            min={nutrients.potassium.optimal_min}
            max={nutrients.potassium.optimal_max}
            theme={theme}
          />
        </View>

        {/* ── pH Scale ─────────────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <SectionHeader icon="tint" title="Soil pH Scale" theme={theme} />
          <View style={styles.phContainer}>
            <PHScale
              ph={nutrients.ph.value}
              textColor={theme.text}
              width={phScaleWidth}
            />
          </View>
          <Text style={[styles.phAdvice, { color: theme.tabIconDefault }]}>{result.ph_advice}</Text>
        </View>

        {/* ── Soil Probability Graph ────────────────────────────────────────── */}
        <SoilProbabilityGraph
          probabilities={result.all_probabilities}
          predictedType={result.soil_type}
          theme={theme}
        />

        {/* ── Fertilizer Advice ────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <SectionHeader icon="leaf" title="Fertilizer Advice" theme={theme} />
          {result.fertilizer_advice.map((advice: string, i: number) => (
            <View key={i} style={styles.adviceRow}>
              <Text style={[styles.adviceText, { color: theme.text }]}>{advice}</Text>
            </View>
          ))}
        </View>

        {/* ── Crop Recommendations ─────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <SectionHeader icon="pagelines" title="Recommended Crops" theme={theme} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropsScroll}>
            {result.recommended_crops.map((crop: any, i: number) => (
              <CropCard key={i} crop={crop} theme={theme} />
            ))}
          </ScrollView>
        </View>

        {/* ── Image Validation ─────────────────────────────────────────────── */}
        <View style={[styles.validationCard, {
          backgroundColor: result.image_validation.is_valid ? theme.secondary : '#FEF3C7',
          borderColor: result.image_validation.is_valid ? theme.primary : '#F59E0B',
        }]}>
          <FontAwesome
            name={result.image_validation.is_valid ? 'check-circle' : 'exclamation-triangle'}
            size={16}
            color={result.image_validation.is_valid ? theme.primary : '#F59E0B'}
          />
          <Text style={[styles.validationText, {
            color: result.image_validation.is_valid ? theme.primary : '#92400E',
          }]}>
            {result.image_validation.is_valid
              ? `Image verified as soil sample (${Math.round(result.image_validation.confidence * 100)}%)`
              : 'Image may not be a soil sample — results may vary'}
          </Text>
        </View>

        {/* ── Action Buttons ────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          activeOpacity={0.85}
          onPress={handleShare}
        >
          <FontAwesome name="share-alt" size={18} color="#FFF" style={styles.btnIcon} />
          <Text style={styles.primaryButtonText}>{t('shareReport')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: theme.primary }]}
          activeOpacity={0.85}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={16} color={theme.primary} style={styles.btnIcon} />
          <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>{t('analyseAnother')}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 48 },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  scanBox: {
    width: 200, height: 240, borderWidth: 2, borderRadius: 12,
    padding: 16, marginBottom: 32, overflow: 'hidden', position: 'relative',
  },
  mockLine: { height: 8, borderRadius: 4, marginBottom: 14 },
  scanOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  loadingTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  loadingSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Hero
  heroCard: {
    borderTopWidth: 4,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLeft: { flex: 1, marginRight: 12 },
  heroEmoji: { fontSize: 36, marginBottom: 8 },
  heroSoilType: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  heroSummaryText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18, marginBottom: 12 },
  heroBadges: { flexDirection: 'row', gap: 10 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  heroBadgeText: { color: 'rgba(255,255,255,0.95)', fontSize: 12, fontWeight: '600' },

  // Card
  card: {
    borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },

  // Nutrient bars
  nutrientItem: { marginBottom: 18 },
  nutrientHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  nutrientRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nutrientLabel: { fontSize: 14, fontWeight: '600' },
  nutrientValue: { fontSize: 14, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  barBackground: { height: 10, borderRadius: 5, overflow: 'visible', position: 'relative' },
  barFill: { height: '100%', borderRadius: 5 },
  optimalMarker: {
    position: 'absolute', top: -2, width: 2, height: 14, borderRadius: 1,
  },
  rangeText: { fontSize: 11, marginTop: 4 },

  // pH
  phContainer: { alignItems: 'center', marginBottom: 10 },
  phAdvice: { fontSize: 13, textAlign: 'center', lineHeight: 18 },

  // Fertilizer
  adviceRow: { paddingVertical: 6 },
  adviceText: { fontSize: 14, lineHeight: 20 },

  // Crops
  cropsScroll: { marginTop: 4 },
  cropCard: {
    alignItems: 'center', borderRadius: 14, padding: 14,
    marginRight: 12, minWidth: 100,
  },
  cropEmoji: { fontSize: 28, marginBottom: 6 },
  cropName: { fontSize: 13, fontWeight: 'bold', marginBottom: 2, textAlign: 'center' },
  cropSeason: { fontSize: 11, marginBottom: 6, textAlign: 'center' },
  waterBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  waterText: { fontSize: 11, fontWeight: '600' },

  // Validation
  validationCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 20, gap: 10,
  },
  validationText: { fontSize: 13, flex: 1, lineHeight: 18 },

  // Buttons
  primaryButton: {
    flexDirection: 'row', borderRadius: 12, paddingVertical: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: {
    flexDirection: 'row', borderRadius: 12, paddingVertical: 14,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, marginBottom: 8,
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '600' },
  btnIcon: { marginRight: 8 },
});
