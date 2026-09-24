import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Activity, getActivities, onActivitiesChange } from '@/constants/ActivityService';
import { useTranslation } from '@/context/LanguageContext';

export default function ModalScreen() {
  const theme = Colors[useColorScheme() ?? 'light'];
  const router = useRouter();
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    getActivities().then(setActivities);
    return onActivitiesChange(setActivities);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('notificationsTitle')}</Text>
          <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>
            {t('recentActivities')}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Close notifications">
          <FontAwesome name="close" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('activityHistory')}</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          {activities.length === 0 ? (
            <Text style={[styles.empty, { color: theme.tabIconDefault }]}>{t('noActivity')}</Text>
          ) : (
            activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                {index > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                <View style={styles.activity}>
                  <View style={[styles.icon, { backgroundColor: theme.secondary }]}>
                    <FontAwesome name={activity.icon} size={16} color={theme.primary} />
                  </View>
                  <View style={styles.details}>
                    <Text style={[styles.activityTitle, { color: theme.text }]}>{activity.title}</Text>
                    <Text style={[styles.time, { color: theme.tabIconDefault }]}>{activity.timeLabel}</Text>
                  </View>
                </View>
              </React.Fragment>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 24,
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 13, marginTop: 4 },
  content: { padding: 20, paddingTop: 0 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  card: { borderRadius: 16, borderWidth: 1, padding: 8 },
  activity: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '500' },
  time: { fontSize: 12, marginTop: 3 },
  divider: { height: 1, marginLeft: 60 },
  empty: { padding: 20, textAlign: 'center' },
});
