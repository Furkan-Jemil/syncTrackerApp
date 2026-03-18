import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import Header from '@/components/common/Header';
import useSettingsStore from '@/stores/settingsStore';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  icon: IoniconName;
  gradient: [string, string];
}

export default function ThemeSettingsScreen() {
  const { theme: selectedTheme, setTheme } = useSettingsStore();
  const theme = useAppTheme();

  const isDark = theme.background === '#09090B';

  const themes: ThemeOption[] = [
    { 
      id: 'dark', 
      name: 'Midnight', 
      description: 'OLED optimized dark mode', 
      icon: 'moon',
      gradient: ['#1E293B', '#09090B'],
    },
    { 
      id: 'light', 
      name: 'Dawn', 
      description: 'Clean and bright interface', 
      icon: 'sunny',
      gradient: ['#FCD34D', '#F59E0B'],
    },
    { 
      id: 'system', 
      name: 'Adaptive', 
      description: 'Follows device preferences', 
      icon: 'contrast',
      gradient: isDark ? ['#3F3F46', '#27272A'] : ['#E2E8F0', '#CBD5E1'],
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="Theme Configuration" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>VISUAL IDENTITY</Text>
        <View style={styles.grid}>
          {themes.map((t) => (
            <TouchableOpacity 
              key={t.id}
              style={[
                styles.themeCard, 
                { backgroundColor: theme.surface, borderColor: theme.border },
                selectedTheme === t.id && [styles.activeCard, { borderColor: theme.primary }]
              ]}
              onPress={() => setTheme(t.id as any)}
            >
              <LinearGradient
                colors={t.gradient}
                style={styles.colorPreview}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons 
                  name={t.icon} 
                  size={24} 
                  color={t.id === 'dark' ? '#F8FAFC' : '#FFF'} 
                />
              </LinearGradient>
              <View style={styles.info}>
                <Text style={[styles.themeName, { color: theme.text }]}>{t.name}</Text>
                <Text style={[styles.themeDesc, { color: theme.textSecondary }]}>{t.description}</Text>
              </View>
              {selectedTheme === t.id && (
                <View style={[styles.check, { backgroundColor: theme.primary }]}>
                  <Ionicons 
                    name="checkmark" 
                    size={16} 
                    color={isDark ? '#052E16' : '#FFFFFF'} 
                  />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.infoBox, { backgroundColor: theme.primaryMuted, borderColor: theme.primary + '20' }]}>
          <Text style={[styles.infoTitle, { color: theme.primary }]}>Note on Light Mode</Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            While Dawn mode is available, Midnight is recommended for maximum power efficiency and tactical focus during missions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    marginBottom: 20,
    letterSpacing: 1,
  },
  grid: {
    gap: 16,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeCard: {
    borderWidth: 2,
  },
  colorPreview: {
    width: 52,
    height: 52,
    borderRadius: 16,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  info: {
    flex: 1,
  },
  themeName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    marginBottom: 2,
  },
  themeDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBox: {
    marginTop: 40,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  infoTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
});
