import React from 'react';
import { StyleSheet, ScrollView, View, TextInput } from 'react-native';
import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from '@/context/LanguageContext';

export default function TrackingScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={20} color={theme.tabIconDefault} style={styles.searchIcon} />
        <TextInput 
          style={[styles.searchInput, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]} 
          placeholder={t('searchPlaceholder')}
          placeholderTextColor={theme.tabIconDefault}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('recentSamples')}</Text>

      {/* Tracking Card 1 */}
      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.sampleId}>#SH-2026-892</Text>
          <View style={[styles.badge, { backgroundColor: theme.warning + '20' }]}>
            <Text style={[styles.badgeText, { color: theme.warning }]}>{t('inTransit')}</Text>
          </View>
        </View>
        <Text style={[styles.farmerName, { color: theme.tabIconDefault }]}>Ramesh Kumar • 2.5 Acres</Text>

        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <FontAwesome name="check-circle" size={16} color={theme.success} />
            <Text style={[styles.timelineText, { color: theme.text }]}>{t('collectedOn')} 25 Apr</Text>
          </View>
          <View style={styles.timelineLine} />
          <View style={styles.timelineItem}>
            <FontAwesome name="truck" size={16} color={theme.primary} />
            <Text style={[styles.timelineText, { color: theme.text }]}>{t('dispatchedToLab')}</Text>
          </View>
          <View style={[styles.timelineLine, { borderStyle: 'dashed', borderColor: theme.border }]} />
          <View style={styles.timelineItem}>
            <FontAwesome name="circle-o" size={16} color={theme.tabIconDefault} />
            <Text style={[styles.timelineText, { color: theme.tabIconDefault }]}>{t('labAnalysis')}</Text>
          </View>
        </View>
      </View>

      {/* Tracking Card 2 */}
      <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.sampleId}>#SH-2026-885</Text>
          <View style={[styles.badge, { backgroundColor: theme.success + '20' }]}>
            <Text style={[styles.badgeText, { color: theme.success }]}>{t('completed')}</Text>
          </View>
        </View>
        <Text style={[styles.farmerName, { color: theme.tabIconDefault }]}>Suresh Reddy • 4 Acres</Text>

        <View style={styles.timeline}>
          <View style={styles.timelineItem}>
            <FontAwesome name="check-circle" size={16} color={theme.success} />
            <Text style={[styles.timelineText, { color: theme.text }]}>{t('reportGenerated')} 24 Apr</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
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
    marginBottom: 4,
  },
  sampleId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  farmerName: {
    fontSize: 14,
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
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 7,
    marginVertical: 4,
  },
});
