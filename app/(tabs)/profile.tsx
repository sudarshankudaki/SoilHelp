import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from '@/context/LanguageContext';
import { Language } from '@/constants/i18n';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { language, setLanguage, t } = useTranslation();

  const handleLanguagePress = () => {
    Alert.alert(
      t('language'),
      'Select your preferred language',
      [
        { text: 'English', onPress: () => setLanguage('en') },
        { text: 'हिंदी (Hindi)', onPress: () => setLanguage('hi') },
        { text: 'ಕನ್ನಡ (Kannada)', onPress: () => setLanguage('kn') },
        { text: 'தமிழ் (Tamil)', onPress: () => setLanguage('ta') },
        { text: 'తెలుగు (Telugu)', onPress: () => setLanguage('te') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getLanguageName = (code: Language) => {
    switch (code) {
      case 'en': return 'English';
      case 'hi': return 'हिंदी';
      case 'kn': return 'ಕನ್ನಡ';
      case 'ta': return 'தமிழ்';
      case 'te': return 'తెలుగు';
      default: return 'English';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.profileHeader, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>AD</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>Admin User</Text>
          <Text style={[styles.role, { color: theme.tabIconDefault }]}>Soil Extension Officer</Text>
          <Text style={[styles.location, { color: theme.tabIconDefault }]}>
            <FontAwesome name="map-marker" size={12} /> Karnataka Region
          </Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('settings')}</Text>

      <View style={[styles.menuGroup, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLanguagePress}>
          <View style={[styles.menuIcon, { backgroundColor: theme.secondary }]}>
            <FontAwesome name="language" size={16} color={theme.primary} />
          </View>
          <Text style={[styles.menuText, { color: theme.text }]}>{t('language')} ({getLanguageName(language)})</Text>
          <FontAwesome name="angle-right" size={20} color={theme.tabIconDefault} />
        </TouchableOpacity>

        <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: theme.secondary }]}>
            <FontAwesome name="bell" size={16} color={theme.primary} />
          </View>
          <Text style={[styles.menuText, { color: theme.text }]}>{t('notifications')}</Text>
          <FontAwesome name="angle-right" size={20} color={theme.tabIconDefault} />
        </TouchableOpacity>

        <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: theme.secondary }]}>
            <FontAwesome name="shield" size={16} color={theme.primary} />
          </View>
          <Text style={[styles.menuText, { color: theme.text }]}>{t('privacy')}</Text>
          <FontAwesome name="angle-right" size={20} color={theme.tabIconDefault} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('support')}</Text>

      <View style={[styles.menuGroup, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#F3F4F6' }]}>
            <FontAwesome name="question-circle" size={16} color="#4B5563" />
          </View>
          <Text style={[styles.menuText, { color: theme.text }]}>{t('help')}</Text>
          <FontAwesome name="angle-right" size={20} color={theme.tabIconDefault} />
        </TouchableOpacity>

        <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
            <FontAwesome name="sign-out" size={16} color="#DC2626" />
          </View>
          <Text style={[styles.menuText, { color: '#DC2626' }]}>{t('logout')}</Text>
        </TouchableOpacity>
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
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuGroup: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    marginLeft: 60,
  },
});
