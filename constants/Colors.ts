const tintColorLight = '#2E7D32'; // Modern earthy green
const tintColorDark = '#81C784'; // Lighter green for dark mode

export default {
  light: {
    text: '#1C1C1E',
    background: '#F9FAFB', // Off-white modern background
    tint: tintColorLight,
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    cardBackground: '#FFFFFF',
    border: '#E5E7EB',
    primary: '#2E7D32',
    secondary: '#D1FAE5',
    warning: '#F59E0B',
    success: '#10B981',
  },
  dark: {
    text: '#F9FAFB',
    background: '#111827',
    tint: tintColorDark,
    tabIconDefault: '#4B5563',
    tabIconSelected: tintColorDark,
    cardBackground: '#1F2937',
    border: '#374151',
    primary: '#81C784',
    secondary: '#064E3B',
    warning: '#FBBF24',
    success: '#34D399',
  },
};
