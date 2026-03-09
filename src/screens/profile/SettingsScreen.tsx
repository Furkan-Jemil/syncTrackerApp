import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import Header from '@/components/common/Header';
import useAuthStore from '@/stores/authStore';
import * as SecureStore from 'expo-secure-store';
import { disconnectSocket } from '@/lib/socket';

export default function SettingsScreen() {
  const logout = useAuthStore(s => s.logout);

  const handleLogout = async () => {
    // Explicit socket termination
    disconnectSocket();
    await logout();
  };

  return (
    <View style={styles.flex}>
      <Header title="Settings" showBack />
      
      <View style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Push Notifications</Text>
            <Switch value={true} onValueChange={() => {}} trackColor={{ true: '#5a6ff4', false: '#2e3148' }} />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Email Digests</Text>
            <Switch value={false} onValueChange={() => {}} trackColor={{ true: '#5a6ff4', false: '#2e3148' }} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.versionText}>SyncTracker v1.0.0 (Phase 6)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f1117' },
  container: { padding: 20 },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#6370a0',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2240',
  },
  settingText: {
    fontSize: 16,
    color: '#f0f4ff',
    fontWeight: '500',
  },
  logoutBtn: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#2e1c24',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef444450',
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    color: '#6370a0',
    fontSize: 12,
    marginTop: 40,
  },
});
