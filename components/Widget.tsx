import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface WidgetProps {
  title: string;
  value: string | number;
  iconName: React.ComponentProps<typeof FontAwesome>['name'];
  route: string;
  description: string;
}

export default function Widget({ title, value, iconName, route, description }: WidgetProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      onPress={() => router.push(route)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.secondary }]}>
          <FontAwesome name={iconName} size={24} color={theme.primary} />
        </View>
        <Text style={[styles.value, { color: theme.text }]}>{value}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
        <Text style={[styles.description, { color: theme.tabIconDefault }]} numberOfLines={1}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 'auto',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
  },
});
