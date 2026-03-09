// Placeholder — replaced in Phase 6
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import useAuthStore from '@/stores/authStore';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>👤</Text>
      <Text style={styles.name}>{user?.name ?? 'User'}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
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
  icon: { fontSize: 48, marginBottom: 8 },
  name: { fontSize: 22, fontWeight: '700', color: '#f0f4ff' },
  email: { fontSize: 13, color: '#6370a0', marginBottom: 32 },
  logoutBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#1a1d27',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef444450',
  },
  logoutText: { color: '#ef4444', fontWeight: '600', fontSize: 15 },
});
