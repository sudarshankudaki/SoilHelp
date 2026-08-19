import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useTranslation } from '@/context/LanguageContext';

import { getFarmers } from '@/constants/FarmerData';

export default function FarmersListScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  
  const farmers = getFarmers();

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.village.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: 'Registered Farmers' }} />
      
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={18} color={theme.tabIconDefault} style={styles.searchIcon} />
        <TextInput 
          style={[styles.searchInput, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]} 
          placeholder="Search name or village..."
          placeholderTextColor={theme.tabIconDefault}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredFarmers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.farmerCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: theme.secondary }]}>
              <Text style={[styles.avatarText, { color: theme.primary }]}>
                {item.name.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.details, { color: theme.tabIconDefault }]}>
                {item.village} • {item.farmSize} Acres
              </Text>
              <Text style={[styles.phone, { color: theme.primary }]}>
                <FontAwesome name="phone" size={12} /> {item.phone}
              </Text>
            </View>
            <FontAwesome name="angle-right" size={20} color={theme.tabIconDefault} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="users" size={48} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>No farmers found</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/registration')}
      >
        <FontAwesome name="plus" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  searchIcon: {
    position: 'absolute',
    left: 32,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  farmerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  details: {
    fontSize: 13,
    marginBottom: 4,
  },
  phone: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    backgroundColor: 'transparent',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
