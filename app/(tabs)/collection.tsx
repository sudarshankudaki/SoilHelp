import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from '@/context/LanguageContext';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { Farmer, getFarmersAsync, onFarmersChange } from '@/constants/FarmerData';
import { addSample, findSampleById, getSamples, parseQrData, SampleRecord } from '@/constants/SampleService';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatCollectionDate(d = new Date()): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function CollectionScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [farmerQuery, setFarmerQuery] = useState('');
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [sampleId, setSampleId] = useState('');
  const [qrData, setQrData] = useState<string | undefined>(undefined);
  const [recentSamples, setRecentSamples] = useState<SampleRecord[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHandled, setScanHandled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [farmerList, sampleList] = await Promise.all([getFarmersAsync(), getSamples()]);
      setFarmers(farmerList);
      setRecentSamples(sampleList.slice(0, 8));
    } catch (err) {
      console.warn('[Collection] Failed to load data:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      const unsubscribe = onFarmersChange((updated) => setFarmers(updated));
      return unsubscribe;
    }, [loadData])
  );

  const filteredFarmers = useMemo(() => {
    const q = farmerQuery.trim().toLowerCase();
    if (!q) return farmers;
    return farmers.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.phone.toLowerCase().includes(q)
    );
  }, [farmers, farmerQuery]);

  const resetForm = () => {
    setSelectedFarmer(null);
    setFarmerQuery('');
    setSampleId('');
    setQrData(undefined);
  };

  const openScanner = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setErrorMsg(t('cameraPermissionDenied'));
        return;
      }
    }
    setScanHandled(false);
    setIsScanning(true);
  };

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanHandled || !result?.data) return;
    setScanHandled(true);
    const parsed = parseQrData(result.data);
    setSampleId(parsed.sampleId);
    setQrData(result.data);
    setIsScanning(false);
  };

  const handleSave = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedFarmer) {
      setErrorMsg(t('farmerRequired'));
      return;
    }

    const cleanId = sampleId.trim();
    if (!cleanId) {
      setErrorMsg(t('sampleIdRequired'));
      return;
    }

    setIsSaving(true);
    try {
      const duplicate = await findSampleById(cleanId);
      if (duplicate) {
        setErrorMsg(t('duplicateSampleId'));
        return;
      }

      const collectedDate = formatCollectionDate();
      const saved = await addSample({
        sampleId: cleanId,
        farmerId: selectedFarmer.id,
        farmerName: selectedFarmer.name,
        acres: selectedFarmer.farmSize,
        village: selectedFarmer.village,
        collectionDate: collectedDate,
        status: 'collected',
        statusLabel: 'Collected',
        timeline: { collectedDate },
        qrData,
      });

      setRecentSamples((prev) => [saved, ...prev.filter((s) => s.id !== saved.id)].slice(0, 8));
      resetForm();
      setSuccessMsg(`${t('sampleSaved')} #${saved.sampleId}`);
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : t('saveFailed');
      setErrorMsg(message);
      Alert.alert(t('saveFailed'), message);
    } finally {
      setIsSaving(false);
    }
  };

  const scanningSupported = Platform.OS !== 'web';

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: theme.secondary }]}>
            <FontAwesome name="flask" size={32} color={theme.primary} />
          </View>
          <Text style={styles.title}>{t('sampleCollection')}</Text>
          <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>
            {t('collectionSubtitle')}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={styles.cardTitle}>{t('collectionSteps')}</Text>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Text style={styles.stepText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{t('step1Title')}</Text>
              <Text style={[styles.stepDescription, { color: theme.tabIconDefault }]}>{t('step1Desc')}</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Text style={styles.stepText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{t('step2Title')}</Text>
              <Text style={[styles.stepDescription, { color: theme.tabIconDefault }]}>{t('step2Desc')}</Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
              <Text style={styles.stepText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{t('step3Title')}</Text>
              <Text style={[styles.stepDescription, { color: theme.tabIconDefault }]}>{t('step3Desc')}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={styles.cardTitle}>{t('selectFarmer')}</Text>

          {farmers.length === 0 ? (
            <View style={styles.emptyFarmers}>
              <Text style={[styles.emptyFarmersText, { color: theme.tabIconDefault }]}>
                {t('noFarmersRegistered')}
              </Text>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: theme.primary }]}
                onPress={() => router.push('/registration')}
              >
                <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
                  {t('goToRegistration')}
                </Text>
                <FontAwesome name="arrow-right" size={14} color={theme.primary} />
              </TouchableOpacity>
            </View>
          ) : selectedFarmer ? (
            <View style={[styles.selectedFarmer, { borderColor: theme.primary, backgroundColor: theme.secondary }]}>
              <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                <Text style={[styles.farmerName, { color: theme.text }]}>{selectedFarmer.name}</Text>
                <Text style={[styles.farmerMeta, { color: theme.tabIconDefault }]}>
                  {selectedFarmer.village} • {selectedFarmer.farmSize} acres
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFarmer(null)}>
                <Text style={[styles.changeFarmer, { color: theme.primary }]}>{t('changeFarmer')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder={t('searchFarmers')}
                placeholderTextColor={theme.tabIconDefault}
                value={farmerQuery}
                onChangeText={setFarmerQuery}
              />
              {filteredFarmers.length === 0 ? (
                <Text style={[styles.helperText, { color: theme.tabIconDefault }]}>
                  {t('searchFarmers')}
                </Text>
              ) : (
                filteredFarmers.slice(0, 8).map((farmer) => (
                  <TouchableOpacity
                    key={farmer.id}
                    style={[styles.farmerRow, { borderColor: theme.border }]}
                    onPress={() => {
                      setSelectedFarmer(farmer);
                      setFarmerQuery('');
                      setErrorMsg(null);
                    }}
                  >
                    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                      <Text style={[styles.farmerName, { color: theme.text }]}>{farmer.name}</Text>
                      <Text style={[styles.farmerMeta, { color: theme.tabIconDefault }]}>
                        {farmer.village} • {farmer.phone}
                      </Text>
                    </View>
                    <FontAwesome name="chevron-right" size={12} color={theme.tabIconDefault} />
                  </TouchableOpacity>
                ))
              )}
            </>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={styles.cardTitle}>{t('sampleIdLabel')}</Text>
          {!scanningSupported && (
            <Text style={[styles.helperText, { color: theme.tabIconDefault }]}>
              {t('scanUnavailableWeb')}
            </Text>
          )}
          <TextInput
            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
            placeholder={t('sampleIdPlaceholder')}
            placeholderTextColor={theme.tabIconDefault}
            value={sampleId}
            autoCapitalize="characters"
            onChangeText={(value) => {
              setSampleId(value);
              setQrData(undefined);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          />
          {scanningSupported && (
            <>
              {permission && !permission.granted && permission.canAskAgain === false && (
                <Text style={[styles.helperText, { color: theme.warning }]}>
                  {t('cameraPermissionDenied')}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary, marginBottom: 8 }]}
                activeOpacity={0.8}
                onPress={openScanner}
              >
                <FontAwesome name="qrcode" size={20} color="#FFF" style={styles.btnIcon} />
                <Text style={styles.buttonText}>
                  {permission?.granted ? t('scanQR') : t('grantCamera')}
                </Text>
              </TouchableOpacity>
            </>
          )}
          <Text style={[styles.helperText, { color: theme.tabIconDefault }]}>{t('enterManually')}</Text>
        </View>

        {errorMsg ? (
          <View style={[styles.banner, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
            <Text style={[styles.bannerText, { color: '#991B1B' }]}>{errorMsg}</Text>
          </View>
        ) : null}
        {successMsg ? (
          <View style={[styles.banner, { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' }]}>
            <Text style={[styles.bannerText, { color: '#065F46' }]}>{successMsg}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary, opacity: isSaving ? 0.7 : 1 }]}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFF" style={styles.btnIcon} />
          ) : (
            <FontAwesome name="save" size={18} color="#FFF" style={styles.btnIcon} />
          )}
          <Text style={styles.buttonText}>{isSaving ? t('savingSample') : t('saveSample')}</Text>
        </TouchableOpacity>

        <Text style={[styles.recentTitle, { color: theme.text }]}>{t('recentSamples')}</Text>
        {recentSamples.length === 0 ? (
          <Text style={[styles.helperText, { color: theme.tabIconDefault }]}>
            {t('sampleCollection')}
          </Text>
        ) : (
          recentSamples.map((sample) => (
            <View
              key={sample.id}
              style={[styles.recentCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            >
              <Text style={[styles.sampleId, { color: theme.text }]}>#{sample.sampleId}</Text>
              <Text style={[styles.farmerMeta, { color: theme.tabIconDefault }]}>
                {sample.farmerName} • {sample.village} • {sample.collectionDate}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={isScanning} animationType="fade" onRequestClose={() => setIsScanning(false)}>
        <View style={styles.scannerOverlay}>
          {permission?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr', 'code128', 'code39', 'ean13', 'upc_a'],
              }}
              onBarcodeScanned={scanHandled ? undefined : handleBarcodeScanned}
            />
          ) : (
            <View style={styles.scannerMask}>
              <Text style={styles.scannerText}>{t('cameraPermissionDenied')}</Text>
            </View>
          )}
          <View style={styles.scannerMask} pointerEvents="box-none">
            <View style={styles.viewfinder} />
            <Text style={styles.scannerText}>{t('alignQR')}</Text>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsScanning(false)}>
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    marginBottom: 8,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  selectedFarmer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  farmerMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  changeFarmer: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyFarmers: {
    backgroundColor: 'transparent',
  },
  emptyFarmersText: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 8,
  },
  button: {
    flexDirection: 'row',
    borderRadius: 8,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  banner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  recentCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  sampleId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerMask: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  viewfinder: {
    width: 250,
    height: 250,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
  },
  scannerText: {
    color: '#FFF',
    marginTop: 32,
    fontSize: 16,
    fontWeight: '500',
  },
  cancelBtn: {
    marginTop: 48,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cancelText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
