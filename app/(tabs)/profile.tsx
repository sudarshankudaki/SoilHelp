import React, { useState, useEffect } from 'react';
import {
  StyleSheet, ScrollView, TouchableOpacity, Image, Alert,
  TextInput, Modal, ActivityIndicator, View as RNView
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from '@/context/LanguageContext';
import { Language } from '@/constants/i18n';
import {
  getServerBaseUrl,
  setServerBaseUrl,
  resetServerBaseUrl,
  testServerConnection,
  PRESET_SERVER_URLS,
} from '@/constants/ServerConfig';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { language, setLanguage, t } = useTranslation();

  // Server config state
  const [currentServerUrl, setCurrentServerUrl] = useState('');
  const [inputServerUrl, setInputServerUrl] = useState('');
  const [isServerModalVisible, setIsServerModalVisible] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    ok: boolean;
    latencyMs?: number;
    message?: string;
  }>({ tested: false, ok: false });
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  useEffect(() => {
    loadServerUrl();
  }, []);

  const loadServerUrl = async () => {
    const url = await getServerBaseUrl();
    setCurrentServerUrl(url);
    setInputServerUrl(url);
    pingServer(url);
  };

  const pingServer = async (url?: string) => {
    setIsTestingConnection(true);
    const result = await testServerConnection(url || currentServerUrl);
    setConnectionStatus({
      tested: true,
      ok: result.ok,
      latencyMs: result.latencyMs,
      message: result.message,
    });
    setIsTestingConnection(false);
  };

  const handleSaveServerUrl = async () => {
    if (!inputServerUrl.trim()) {
      Alert.alert(t('error'), t('validServerUrl'));
      return;
    }
    const saved = await setServerBaseUrl(inputServerUrl.trim());
    setCurrentServerUrl(saved);
    setIsServerModalVisible(false);
    pingServer(saved);
    Alert.alert(t('serverUpdated'), `${t('activeBackendUrl')}\n${saved}`);
  };

  const handleResetServerUrl = async () => {
    const defaultUrl = await resetServerBaseUrl();
    setCurrentServerUrl(defaultUrl);
    setInputServerUrl(defaultUrl);
    pingServer(defaultUrl);
    Alert.alert(t('resetComplete'), `${t('serverUrlReset')}\n${defaultUrl}`);
  };

  const handleLanguagePress = () => {
    Alert.alert(
      t('language'),
      t('selectLanguage'),
      [
        { text: t('english'), onPress: () => setLanguage('en') },
        { text: 'हिंदी (Hindi)', onPress: () => setLanguage('hi') },
        { text: 'ಕನ್ನಡ (Kannada)', onPress: () => setLanguage('kn') },
        { text: 'தமிழ் (Tamil)', onPress: () => setLanguage('ta') },
        { text: 'తెలుగు (Telugu)', onPress: () => setLanguage('te') },
        { text: t('cancelAction'), style: 'cancel' },
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
          <Text style={styles.name}>{t('adminUser')}</Text>
          <Text style={[styles.role, { color: theme.tabIconDefault }]}>{t('soilExtensionOfficer')}</Text>
          <Text style={[styles.location, { color: theme.tabIconDefault }]}>
            <FontAwesome name="map-marker" size={12} /> {t('karnatakaRegion')}
          </Text>
        </View>
      </View>

      {/* ── Server Connection Status Card ── */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('serverConnection')}</Text>
      <View style={[styles.serverCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.serverCardHeader}>
          <View style={[styles.serverIconBadge, { backgroundColor: theme.secondary }]}>
            <FontAwesome name="server" size={18} color={theme.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.serverTitle, { color: theme.text }]}>{t('fastApiBackend')}</Text>
            <Text style={[styles.serverUrlText, { color: theme.tabIconDefault }]} numberOfLines={1}>
              {currentServerUrl || t('resolving')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.pingButton, { backgroundColor: theme.secondary }]}
            onPress={() => pingServer()}
            disabled={isTestingConnection}
          >
            {isTestingConnection ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <FontAwesome name="refresh" size={14} color={theme.primary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.serverStatusRow}>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: isTestingConnection
                  ? '#FEF3C7'
                  : connectionStatus.ok
                  ? '#D1FAE5'
                  : '#FEE2E2',
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isTestingConnection
                    ? '#F59E0B'
                    : connectionStatus.ok
                    ? '#10B981'
                    : '#EF4444',
                },
              ]}
            />
            <Text
              style={[
                styles.statusPillText,
                {
                  color: isTestingConnection
                    ? '#B45309'
                    : connectionStatus.ok
                    ? '#065F46'
                    : '#991B1B',
                },
              ]}
              numberOfLines={1}
            >
              {isTestingConnection
                ? t('testingConnection')
                : connectionStatus.ok
                ? `${t('online')} (${connectionStatus.latencyMs}ms)`
                : `${t('offline')} (${connectionStatus.message || t('unreachable')})`}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.configButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              setInputServerUrl(currentServerUrl);
              setIsServerModalVisible(true);
            }}
          >
            <Text style={styles.configButtonText}>{t('changeIp')}</Text>
          </TouchableOpacity>
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

      {/* ── Server Configuration Modal ── */}
      <Modal visible={isServerModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('configureServer')}</Text>
              <TouchableOpacity onPress={() => setIsServerModalVisible(false)}>
                <FontAwesome name="times-circle" size={22} color={theme.tabIconDefault} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalHelpText, { color: theme.tabIconDefault }]}>
              {t('backendHelp')}
            </Text>

            <Text style={[styles.inputLabel, { color: theme.text }]}>{t('serverBaseUrl')}</Text>
            <TextInput
              style={[styles.serverInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
              value={inputServerUrl}
              onChangeText={setInputServerUrl}
              placeholder="http://192.168.1.10:8000"
              placeholderTextColor={theme.tabIconDefault}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={[styles.presetsTitle, { color: theme.text }]}>{t('quickPresets')}</Text>
            <View style={styles.presetsRow}>
              {PRESET_SERVER_URLS.map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.presetChip, { borderColor: theme.border, backgroundColor: theme.secondary }]}
                  onPress={() => setInputServerUrl(preset.url)}
                >
                  <Text style={[styles.presetChipText, { color: theme.primary }]}>
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.resetBtn, { borderColor: theme.border }]}
                onPress={handleResetServerUrl}
              >
                <Text style={[styles.resetBtnText, { color: theme.tabIconDefault }]}>{t('resetDefault')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                onPress={handleSaveServerUrl}
              >
                <Text style={styles.saveBtnText}>{t('saveApply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    marginBottom: 20,
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

  // Server connection card styles
  serverCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  serverCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serverIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serverTitle: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  serverUrlText: {
    fontSize: 12,
    marginTop: 2,
  },
  pingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serverStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB33',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: '70%',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  configButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  configButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalHelpText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  serverInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
  },
  presetsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  presetChip: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  resetBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
