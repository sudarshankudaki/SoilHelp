import { StyleSheet, ScrollView, View, TouchableOpacity, Image } from 'react-native';
import { Text } from '@/components/Themed';
import Widget from '@/components/Widget';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useTranslation } from '@/context/LanguageContext';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const router = useRouter();

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
          <Text style={styles.bannerText}>Smart Farming</Text>
          <Text style={styles.bannerSubtext}>Optimize your yield with AI analysis</Text>
        </View>
      </View>

      <View style={styles.widgetsGrid}>
        <Widget 
          title={t('farmers')}
          value="12"
          iconName="users"
          route="/farmers"
          description="New Registrations"
        />
        <Widget 
          title={t('collections')}
          value="5"
          iconName="flask"
          route="/collection"
          description="Pending Samples"
        />
        <Widget 
          title={t('tracking')}
          value="3"
          iconName="map-marker"
          route="/tracking"
          description="In Transit"
        />
        <Widget 
          title={t('results')}
          value="8"
          iconName="file-text-o"
          route="/upload"
          description="Ready to Upload"
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activities</Text>
        <TouchableOpacity onPress={() => router.push('/farmers')}>
          <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.activitiesCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <ActivityItem 
          icon="user-plus" 
          title="Farmer Ramesh Kumar registered" 
          time="2 mins ago" 
          theme={theme} 
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <ActivityItem 
          icon="flask" 
          title="Sample #SH-2026-892 collected" 
          time="45 mins ago" 
          theme={theme} 
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <ActivityItem 
          icon="truck" 
          title="3 samples dispatched to lab" 
          time="3 hours ago" 
          theme={theme} 
        />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <ActivityItem 
          icon="file-text-o" 
          title="Report ready for Suresh Reddy" 
          time="Yesterday" 
          theme={theme} 
        />
      </View>
    </ScrollView>
  );
}

function ActivityItem({ icon, title, time, theme }: { icon: any, title: string, time: string, theme: any }) {
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
