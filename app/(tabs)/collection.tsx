import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/context/LanguageContext';

const { width, height } = Dimensions.get('window');

export default function CollectionScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isScanning) {
      const timer = setTimeout(() => {
        setIsScanning(false);
        Alert.alert(
          'Success',
          'Sample Bag #QR-89240 scanned and linked to farmer Ramesh Kumar.',
          [{ text: 'View Details', onPress: () => router.push('/tracking') }]
        );
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isScanning]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
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

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]} 
          activeOpacity={0.8}
          onPress={() => setIsScanning(true)}
        >
          <FontAwesome name="qrcode" size={20} color="#FFF" style={styles.btnIcon} />
          <Text style={styles.buttonText}>{t('scanQR')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Scanner Overlay */}
      <Modal visible={isScanning} transparent animationType="fade">
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerMask}>
            <View style={styles.viewfinder}>
              <View style={styles.scanningIndicator}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            </View>
            <Text style={styles.scannerText}>Align QR Code within frame</Text>
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={() => setIsScanning(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
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
    marginBottom: 24,
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
  // Scanner Styles
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
    borderWidth: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 12,
  },
  scanningIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
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
