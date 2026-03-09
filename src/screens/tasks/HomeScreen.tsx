// Placeholder screen — replaced in Phase 3
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔗</Text>
      <Text style={styles.title}>SyncTracker</Text>
      <Text style={styles.subtitle}>Responsibility & Sync Intelligence</Text>
      <Text style={styles.phase}>Phase 1 Foundation ✓</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f1117',
    gap: 8,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#f0f4ff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8890b5',
    marginBottom: 24,
  },
  phase: {
    fontSize: 13,
    color: '#22c55e',
    backgroundColor: '#0f2e1c',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
    overflow: 'hidden',
  },
});
