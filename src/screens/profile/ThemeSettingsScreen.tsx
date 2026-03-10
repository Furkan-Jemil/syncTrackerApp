import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import Header from '@/components/common/Header';
import useSettingsStore from '@/stores/settingsStore';

export default function ThemeSettingsScreen() {
  const { theme, setTheme } = useSettingsStore();

  const themes = [
    { id: 'dark', name: 'Midnight', description: 'OLED optimized dark mode', color: '#09090B' },
    { id: 'light', name: 'Dawn', description: 'Clean and bright interface', color: '#F8FAFC' },
    { id: 'system', name: 'Adaptive', description: 'Follows device preferences', color: '#27272A' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Theme Configuration" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>VISUAL IDENTITY</Text>
        <View style={styles.grid}>
          {themes.map((t) => (
            <TouchableOpacity 
              key={t.id}
              style={[
                styles.themeCard, 
                theme === t.id && styles.activeCard,
                { backgroundColor: t.id === 'light' ? '#E2E8F0' : '#18181B' }
              ]}
              onPress={() => setTheme(t.id as any)}
            >
              <View style={[styles.colorPreview, { backgroundColor: t.color }]} />
              <View style={styles.info}>
                <Text style={[styles.themeName, t.id === 'light' && styles.lightText]}>{t.name}</Text>
                <Text style={[styles.themeDesc, t.id === 'light' && styles.lightDesc]}>{t.description}</Text>
              </View>
              {theme === t.id && (
                <View style={styles.check}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Note on Light Mode</Text>
          <Text style={styles.infoText}>
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
    backgroundColor: '#09090B',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#71717A',
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
    borderColor: '#27272A',
  },
  activeCard: {
    borderColor: '#A3E635',
    borderWidth: 2,
  },
  colorPreview: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  info: {
    flex: 1,
  },
  themeName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#F8FAFC',
    marginBottom: 2,
  },
  themeDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#71717A',
  },
  lightText: { color: '#0F172A' },
  lightDesc: { color: '#64748B' },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#A3E635',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#052E16',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoBox: {
    marginTop: 40,
    padding: 20,
    backgroundColor: 'rgba(163, 230, 53, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(163, 230, 53, 0.1)',
  },
  infoTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#A3E635',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 20,
  },
});
