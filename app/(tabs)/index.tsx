import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/Themed';
import Widget from '@/components/Widget';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useTranslation } from '@/context/LanguageContext';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getFarmersAsync, onFarmersChange } from '@/constants/FarmerData';
import { getSamples } from '@/constants/SampleService';
import { Activity, getActivities, onActivitiesChange } from '@/constants/ActivityService';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const router = useRouter();

  const [farmersCount, setFarmersCount] = useState<number>(5);
  const [samplesCount, setSamplesCount] = useState<number>(3);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    getFarmersAsync().then((list) => setFarmersCount(list.length));
    getSamples().then((list) => setSamplesCount(list.length));
    getActivities().then(setActivities);

    const unsubscribe = onFarmersChange((updated) => setFarmersCount(updated.length));
    const unsubscribeActivities = onActivitiesChange(setActivities);
    return () => {
      unsubscribe();
      unsubscribeActivities();
    };
  }, []);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('welcome')}</Text>
        <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>
          {t('overview')}
        </Text>
      </View>

      <View style={styles.bannerContainer}>
        <Image 
          source={require('@/assets/images/banner.png')} 
          style={styles.bannerImage}
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerText}>{t('smartFarming')}</Text>
          <Text style={styles.bannerSubtext}>{t('optimizeYield')}</Text>
        </View>
      </View>

      <View style={styles.widgetsGrid}>
        <Widget 
          title={t('farmers')}
          value={String(farmersCount)}
          iconName="users"
          route="/farmers"
          description="Registered Farmers"
        />
        <Widget 
          title={t('collections')}
          value="1"
          iconName="flask"
          route="/collection"
          description="Scan Sample QR"
        />
        <Widget 
          title={t('tracking')}
          value={String(samplesCount)}
          iconName="map-marker"
          route="/tracking"
          description="In Pipeline"
        />
        <Widget 
          title={t('results')}
          value="AI"
          iconName="file-text-o"
          route="/upload"
          description="Soil Screening"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('recentActivities')}</Text>
        <TouchableOpacity onPress={() => router.push('/farmers')}>
          <Text style={[styles.seeAll, { color: theme.primary }]}>{t('seeAll')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.activitiesCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        {activities.slice(0, 4).map((activity, index) => (
          <React.Fragment key={activity.id}>
            {index > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
            <ActivityItem
              icon={activity.icon}
              title={activity.title}
              time={activity.timeLabel}
              theme={theme}
            />
          </React.Fragment>
        ))}
      </View>
    </ScrollView>
  );
}

function ActivityItem({ icon, title, time, theme }: { icon: React.ComponentProps<typeof FontAwesome>['name'], title: string, time: string, theme: any }) {
  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: theme.secondary }]}>
        <FontAwesome name={icon} size={16} color={theme.primary} />
      </View>
      <View style={styles.activityInfo}>
        <Text style={[styles.activityTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.activityTime, { color: theme.tabIconDefault }]}>{time}</Text>
      </View>
      <FontAwesome name="angle-right" size={18} color={theme.tabIconDefault} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  bannerContainer: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bannerSubtext: {
    color: '#E5E7EB',
    fontSize: 13,
  },
  widgetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  activitiesCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'transparent',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginLeft: 60,
  },
});
