import React, { useState, useEffect } from 'react';
import {
  StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList,
  Alert, Linking, RefreshControl
} from 'react-native';
import { Text, View } from '@/components/Themed';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useTranslation } from '@/context/LanguageContext';
import {
  getFarmersAsync,
  deleteFarmerAsync,
  onFarmersChange,
  Farmer,
} from '@/constants/FarmerData';

export default function FarmersListScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { t } = useTranslation();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadFarmers = async () => {
    const list = await getFarmersAsync();
    setFarmers(list);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadFarmers();
    const unsubscribe = onFarmersChange((updated) => setFarmers(updated));
    return unsubscribe;
  }, []);

  const handleCall = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    if (!cleanPhone) {
      Alert.alert(t('invalidNumber'), t('noValidPhone'));
      return;
    }
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert(t('callFailed'), `${t('couldNotCall')} ${name} (${phone})`);
    });
  };

  const handleDelete = (farmer: Farmer) => {
    Alert.alert(
      t('deleteFarmer'),
      `${t('confirmDeleteFarmer')} ${farmer.name} ${farmer.village}?`,
      [
        { text: t('cancelAction'), style: 'cancel' },
        {
          text: t('deleteFarmer'),
          style: 'destructive',
          onPress: async () => {
            await deleteFarmerAsync(farmer.id);
          },
        },
      ]
    );
  };

  const filteredFarmers = farmers.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.village.toLowerCase().includes(search.toLowerCase()) ||
      f.phone.includes(search)
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ title: `${t('registeredFarmers')} (${farmers.length})` }} />

      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={18} color={theme.tabIconDefault} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          placeholder={t('searchFarmersPlaceholder')}
          placeholderTextColor={theme.tabIconDefault}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity style={styles.clearSearchBtn} onPress={() => setSearch('')}>
            <FontAwesome name="times-circle" size={16} color={theme.tabIconDefault} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredFarmers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              loadFarmers();
            }}
          />
        }
        renderItem={({ item }) => (
          <View style={[styles.farmerCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={[styles.avatar, { backgroundColor: theme.secondary }]}>
              <Text style={[styles.avatarText, { color: theme.primary }]}>
                {item.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                <View style={[styles.farmBadge, { backgroundColor: theme.secondary }]}>
                  <Text style={[styles.farmBadgeText, { color: theme.primary }]}>{item.farmSize} Acres</Text>
                </View>
              </View>

              <Text style={[styles.details, { color: theme.tabIconDefault }]}>
                <FontAwesome name="map-marker" size={12} /> {item.village}
                {item.date ? ` • Registered ${item.date}` : ''}
              </Text>

              <TouchableOpacity
                style={styles.phoneTouchable}
                onPress={() => handleCall(item.phone, item.name)}
                activeOpacity={0.7}
              >
                <FontAwesome name="phone" size={12} color={theme.primary} />
                <Text style={[styles.phone, { color: theme.primary }]}> {item.phone}</Text>
              </TouchableOpacity>
            </View>

            {/* Actions Column */}
            <View style={styles.actionsColumn}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.secondary }]}
                onPress={() => handleCall(item.phone, item.name)}
              >
                <FontAwesome name="phone" size={14} color={theme.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#FEE2E2', marginTop: 8 }]}
                onPress={() => handleDelete(item)}
              >
                <FontAwesome name="trash" size={14} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="users" size={48} color={theme.border} />
            <Text style={[styles.emptyText, { color: theme.tabIconDefault }]}>
              {search ? `${t('noFarmersMatching')} "${search}"` : t('noRegisteredFarmers')}
            </Text>
            <TouchableOpacity
              style={[styles.emptyActionBtn, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/registration')}
            >
              <Text style={styles.emptyActionBtnText}>{t('registerFirstFarmer')}</Text>
            </TouchableOpacity>
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
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 32,
    zIndex: 1,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 28,
    zIndex: 1,
    padding: 4,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 24,
    paddingLeft: 44,
    paddingRight: 36,
    fontSize: 15,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
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
    marginRight: 14,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    backgroundColor: 'transparent',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  farmBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  farmBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 13,
    marginBottom: 4,
  },
  phoneTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  phone: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionsColumn: {
    marginLeft: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyActionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyActionBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
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
