import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet, ScrollView, View, TextInput, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from '@/context/LanguageContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSamples, SampleRecord } from '@/constants/SampleService';

export default function TrackingScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ sampleId?: string }>();

  const [samples, setSamples] = useState<SampleRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState(params.sampleId || '');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSamples = async () => {
    try {
      const data = await getSamples();
      setSamples(data);
    } catch (err) {
      console.warn('Error fetching samples:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, [params.sampleId]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchSamples();
  };

  const filteredSamples = useMemo(() => {
    if (!searchQuery.trim()) return samples;
    const query = searchQuery.trim().toLowerCase();
    return samples.filter(
      (s) =>
        s.sampleId.toLowerCase().includes(query) ||
        s.farmerName.toLowerCase().includes(query) ||
        s.village.toLowerCase().includes(query)
    );
  }, [samples, searchQuery]);

  const getStatusBadge = (status: SampleRecord['status']) => {
    switch (status) {
      case 'completed':
        return { label: t('completed'), bg: theme.success + '20', color: theme.success };
      case 'lab_analysis':
        return { label: t('labAnalysis'), bg: '#818CF822', color: '#6366F1' };
      case 'in_transit':
        return { label: t('inTransit'), bg: theme.warning + '20', color: theme.warning };
      case 'collected':
      default:
        return { label: t('collected'), bg: theme.primary + '20', color: theme.primary };
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={18} color={theme.tabIconDefault} style={styles.searchIcon} />
        <TextInput
          style={[
            styles.searchInput,
            { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border },
          ]}
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={theme.tabIconDefault}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearchBtn}
            onPress={() => setSearchQuery('')}
          >
            <FontAwesome name="times-circle" size={16} color={theme.tabIconDefault} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.sectionHeaderRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t('recentSamples')} ({filteredSamples.length})
        </Text>
        <TouchableOpacity onPress={fetchSamples}>
          <FontAwesome name="refresh" size={14} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.tabIconDefault }]}>{t('loadingSamples')}</Text>
        </View>
      ) : filteredSamples.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <FontAwesome name="inbox" size={40} color={theme.tabIconDefault} style={{ marginBottom: 12 }} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>{t('noSamplesFound')}</Text>
          <Text style={[styles.emptySubtitle, { color: theme.tabIconDefault }]}>
            {searchQuery
              ? `${t('samplesMatching')} "${searchQuery}"`
              : t('scanSampleHint')}
          </Text>
          <TouchableOpacity
            style={[styles.emptyActionBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/collection')}
          >
            <Text style={styles.emptyActionText}>{t('goToSampleCollection')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        filteredSamples.map((sample) => {
          const isTargeted = params.sampleId && sample.sampleId.toUpperCase() === params.sampleId.toUpperCase();
          const badge = getStatusBadge(sample.status);

          return (
            <View
              key={sample.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: isTargeted ? theme.primary : theme.border,
                  borderWidth: isTargeted ? 2 : 1,
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.sampleId, { color: theme.text }]}>#{sample.sampleId}</Text>
                  {isTargeted && (
                    <View style={[styles.justScannedBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.justScannedText}>{t('justScanned')}</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                </View>
              </View>

              <Text style={[styles.farmerName, { color: theme.tabIconDefault }]}>
                {sample.farmerName} • {sample.acres} Acres • {sample.village}
              </Text>

              <View style={styles.timeline}>
                {/* Step 1: Collected */}
                <View style={styles.timelineItem}>
                  <FontAwesome name="check-circle" size={16} color={theme.success} />
                  <Text style={[styles.timelineText, { color: theme.text }]}>
                    {t('collectedOn')} {sample.timeline.collectedDate || sample.collectionDate}
                  </Text>
                </View>

                <View style={styles.timelineLine} />

                {/* Step 2: Dispatched */}
                <View style={styles.timelineItem}>
                  <FontAwesome
                    name={sample.timeline.dispatchedDate ? 'truck' : 'circle-o'}
                    size={16}
                    color={sample.timeline.dispatchedDate ? theme.primary : theme.tabIconDefault}
                  />
                  <Text
                    style={[
                      styles.timelineText,
                      { color: sample.timeline.dispatchedDate ? theme.text : theme.tabIconDefault },
                    ]}
                  >
                    {sample.timeline.dispatchedDate ? t('dispatchedToLab') : t('pendingDispatch')}
                  </Text>
                </View>

                <View
                  style={[
                    styles.timelineLine,
                    {
                      borderStyle: sample.timeline.labAnalysisDate ? 'solid' : 'dashed',
                      borderColor: sample.timeline.labAnalysisDate ? theme.primary : theme.border,
                    },
                  ]}
                />

                {/* Step 3: Lab Analysis */}
                <View style={styles.timelineItem}>
                  <FontAwesome
                    name={sample.timeline.completedDate ? 'check-circle' : sample.timeline.labAnalysisDate ? 'flask' : 'circle-o'}
                    size={16}
                    color={sample.timeline.completedDate ? theme.success : sample.timeline.labAnalysisDate ? '#6366F1' : theme.tabIconDefault}
                  />
                  <Text
                    style={[
                      styles.timelineText,
                      {
                        color:
                          sample.timeline.completedDate
                            ? theme.success
                            : sample.timeline.labAnalysisDate
                            ? theme.text
                            : theme.tabIconDefault,
                      },
                    ]}
                  >
                    {sample.timeline.completedDate
                      ? `${t('reportGenerated')} ${sample.timeline.completedDate}`
                      : sample.timeline.labAnalysisDate
                      ? `${t('labAnalysis')} ${t('inProgress')}`
                      : t('labAnalysis')}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 14,
    zIndex: 1,
    padding: 4,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    paddingLeft: 46,
    paddingRight: 40,
    fontSize: 15,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sampleId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  justScannedBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  justScannedText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  farmerName: {
    fontSize: 13,
    marginBottom: 16,
  },
  timeline: {
    marginLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  timelineLine: {
    width: 2,
    height: 18,
    backgroundColor: '#E5E7EB',
    marginLeft: 7,
    marginVertical: 3,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  emptyActionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyActionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
