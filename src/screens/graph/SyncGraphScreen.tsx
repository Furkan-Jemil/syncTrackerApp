// Placeholder — replaced in Phase 4
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SyncGraphScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🕸</Text>
      <Text style={styles.title}>Sync Graph</Text>
      <Text style={styles.sub}>Interactive graph view — Phase 4</Text>
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
  icon: { fontSize: 48 },
  title: { fontSize: 22, fontWeight: '700', color: '#f0f4ff' },
  sub: { fontSize: 13, color: '#4c5175' },
});
