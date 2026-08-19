import React, { useState } from 'react';
import {
  StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { analyzeSoilImage, checkBackendHealth, SoilAnalysisResult } from '@/constants/ApiService';

type UploadStage = 'idle' | 'picked' | 'uploading' | 'done';

export default function UploadScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [stage, setStage] = useState<UploadStage>('idle');
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Pick from gallery ──────────────────────────────────────────────────────
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to upload soil images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPickedImageUri(result.assets[0].uri);
      setStage('picked');
      setErrorMsg(null);
    }
  };

  // ── Capture with camera ────────────────────────────────────────────────────
  const captureWithCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to photograph soil samples.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setPickedImageUri(result.assets[0].uri);
      setStage('picked');
      setErrorMsg(null);
    }
  };

  // ── Send to backend for analysis ───────────────────────────────────────────
  const runAnalysis = async () => {
    if (!pickedImageUri) return;

    setStage('uploading');
    setErrorMsg(null);

    // Check server reachability first
    const isAlive = await checkBackendHealth();
    if (!isAlive) {
      setStage('picked');
      setErrorMsg('Cannot reach the SoilHelp server. Make sure the backend is running.');
      return;
    }

    try {
      const result: SoilAnalysisResult = await analyzeSoilImage(pickedImageUri);
      setStage('done');
      // Navigate to analysis screen, passing results as JSON param
      router.push({
        pathname: '/analysis',
        params: { result: JSON.stringify(result) },
      });
    } catch (err: any) {
      setStage('picked');
      const msg = typeof err === 'string'
        ? err
        : (err?.message ? (typeof err.message === 'string' ? err.message : JSON.stringify(err.message)) : 'Analysis failed. Please try again.');
      setErrorMsg(msg);
    }
  };

  const resetState = () => {
    setPickedImageUri(null);
    setStage('idle');
    setErrorMsg(null);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: theme.secondary }]}>
          <FontAwesome name="cloud-upload" size={32} color={theme.primary} />
        </View>
        <Text style={styles.title}>Upload Soil Image</Text>
        <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>
          Photograph or upload a soil sample to get instant AI-powered nutrient analysis.
        </Text>
      </View>

      {/* ── Image Preview ────────────────────────────────────────────────────── */}
      {pickedImageUri ? (
        <View style={[styles.previewCard, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
          <Image source={{ uri: pickedImageUri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.changePhoto} onPress={resetState}>
            <FontAwesome name="times-circle" size={22} color="#DC2626" />
            <Text style={styles.changePhotoText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── Upload Box ──────────────────────────────────────────────────────── */
        <TouchableOpacity
          style={[styles.uploadBox, { backgroundColor: theme.cardBackground, borderColor: theme.primary }]}
          onPress={pickFromGallery}
          activeOpacity={0.8}
        >
          <FontAwesome name="image" size={44} color={theme.tabIconDefault} style={styles.uploadIcon} />
          <Text style={[styles.uploadText, { color: theme.text }]}>Tap to browse photos</Text>
          <Text style={[styles.uploadSubtext, { color: theme.tabIconDefault }]}>
            JPG or PNG, max 20 MB
          </Text>
          <View style={[styles.browseButton, { backgroundColor: theme.secondary }]}>
            <Text style={[styles.browseButtonText, { color: theme.primary }]}>Select from Gallery</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* ── Divider ─────────────────────────────────────────────────────────── */}
      {!pickedImageUri && (
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          <Text style={[styles.orText, { color: theme.tabIconDefault, backgroundColor: theme.background }]}>
            OR
          </Text>
        </View>
      )}

      {/* ── Camera Button ───────────────────────────────────────────────────── */}
      {!pickedImageUri && (
        <TouchableOpacity
          style={[styles.cameraButton, { backgroundColor: theme.primary }]}
          activeOpacity={0.85}
          onPress={captureWithCamera}
        >
          <FontAwesome name="camera" size={20} color="#FFF" style={styles.btnIcon} />
          <Text style={styles.cameraButtonText}>Capture Soil Photo</Text>
        </TouchableOpacity>
      )}

      {/* ── Error Message ───────────────────────────────────────────────────── */}
      {errorMsg && (
        <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
          <FontAwesome name="exclamation-triangle" size={16} color="#DC2626" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* ── Analyse Button ──────────────────────────────────────────────────── */}
      {pickedImageUri && (
        <TouchableOpacity
          style={[
            styles.analyzeButton,
            { backgroundColor: stage === 'uploading' ? theme.tabIconDefault : theme.primary },
          ]}
          activeOpacity={0.85}
          onPress={runAnalysis}
          disabled={stage === 'uploading'}
        >
          {stage === 'uploading' ? (
            <>
              <ActivityIndicator color="#FFF" size="small" style={styles.btnIcon} />
              <Text style={styles.analyzeButtonText}>Analysing with AI...</Text>
            </>
          ) : (
            <>
              <FontAwesome name="search" size={18} color="#FFF" style={styles.btnIcon} />
              <Text style={styles.analyzeButtonText}>Analyse Soil Sample</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* ── Tips ────────────────────────────────────────────────────────────── */}
      <View style={[styles.tipsCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.tipsTitle, { color: theme.text }]}>📷 Photo Tips</Text>
        {[
          'Take photo in natural daylight',
          'Fill the frame with the soil sample',
          'Avoid shadows or blurry images',
          'Spread soil evenly on a flat surface',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <FontAwesome name="check" size={12} color={theme.success} style={styles.tipIcon} />
            <Text style={[styles.tipText, { color: theme.tabIconDefault }]}>{tip}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 8 },
  iconBadge: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 20, lineHeight: 20 },

  previewCard: {
    borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 20,
  },
  previewImage: { width: '100%', height: 220 },
  changePhoto: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10,
  },
  changePhotoText: { color: '#DC2626', fontWeight: 'bold', marginLeft: 6, fontSize: 14 },

  uploadBox: {
    borderRadius: 16, borderWidth: 2, borderStyle: 'dashed',
    padding: 32, alignItems: 'center', marginBottom: 24,
  },
  uploadIcon: { marginBottom: 16 },
  uploadText: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  uploadSubtext: { fontSize: 12, marginBottom: 20 },
  browseButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  browseButtonText: { fontWeight: 'bold', fontSize: 14 },

  divider: {
    position: 'relative', alignItems: 'center',
    justifyContent: 'center', marginBottom: 24,
  },
  dividerLine: { position: 'absolute', width: '100%', height: 1 },
  orText: { paddingHorizontal: 16, fontWeight: 'bold' },

  cameraButton: {
    flexDirection: 'row', borderRadius: 12, paddingVertical: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
  },
  cameraButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  btnIcon: { marginRight: 8 },

  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 16,
  },
  errorText: { flex: 1, color: '#DC2626', fontSize: 13, marginLeft: 8, lineHeight: 18 },

  analyzeButton: {
    flexDirection: 'row', borderRadius: 12, paddingVertical: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  analyzeButtonText: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },

  tipsCard: {
    borderRadius: 12, borderWidth: 1, padding: 16, marginTop: 8,
  },
  tipsTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  tipIcon: { marginRight: 8 },
  tipText: { fontSize: 13, flex: 1 },
});
