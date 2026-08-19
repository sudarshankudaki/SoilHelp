import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { FontAwesome } from '@expo/vector-icons';
import { useTranslation } from '@/context/LanguageContext';
import { useRouter } from 'expo-router';
import { addFarmer } from '@/constants/FarmerData';

export default function RegistrationScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t } = useTranslation();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    farmSize: '',
    village: '',
  });

  const handleRegister = () => {
    const { name, phone, farmSize, village } = formData;

    // Simple Validation
    if (!name || !phone || !farmSize || !village) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }

    // Success
    addFarmer({ name, phone, farmSize, village });

    Alert.alert(
      'Success',
      `Farmer ${name} has been registered successfully!`,
      [
        { text: 'View List', onPress: () => router.push('/farmers') },
        { text: 'OK', onPress: () => setFormData({ name: '', phone: '', farmSize: '', village: '' }) }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <FontAwesome name="user-plus" size={48} color={theme.primary} style={styles.icon} />
        <Text style={styles.title}>{t('farmerRegistration')}</Text>
        <Text style={[styles.subtitle, { color: theme.tabIconDefault }]}>{t('farmerSubtitle')}</Text>
      </View>

      <View style={[styles.formCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.text }]}>{t('fullName')}</Text>
        <TextInput 
          style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
          placeholder="e.g. Ramesh Kumar"
          placeholderTextColor={theme.tabIconDefault}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />

        <Text style={[styles.label, { color: theme.text }]}>{t('mobileNumber')}</Text>
        <TextInput 
          style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
          placeholderTextColor={theme.tabIconDefault}
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
        />

        <Text style={[styles.label, { color: theme.text }]}>{t('farmSize')}</Text>
        <TextInput 
          style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
          placeholder="e.g. 2.5"
          keyboardType="numeric"
          placeholderTextColor={theme.tabIconDefault}
          value={formData.farmSize}
          onChangeText={(text) => setFormData({ ...formData, farmSize: text })}
        />

        <Text style={[styles.label, { color: theme.text }]}>{t('village')}</Text>
        <TextInput 
          style={[styles.input, { borderColor: theme.border, color: theme.text }]} 
          placeholder="Enter village name"
          placeholderTextColor={theme.tabIconDefault}
          value={formData.village}
          onChangeText={(text) => setFormData({ ...formData, village: text })}
        />

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]} 
          activeOpacity={0.8}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>{t('registerBtn')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.listLink} 
        onPress={() => router.push('/farmers')}
      >
        <Text style={[styles.listLinkText, { color: theme.primary }]}>View All Registered Farmers</Text>
        <FontAwesome name="arrow-right" size={14} color={theme.primary} />
      </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  icon: {
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
  formCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 4,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  listLinkText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 8,
  },
});
