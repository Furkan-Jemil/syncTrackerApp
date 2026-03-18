import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, TouchableOpacity, Alert } from 'react-native';
import Header from '@/components/common/Header';
import useAuthStore from '@/stores/authStore';
import dayjs from 'dayjs';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function SecuritySettingsScreen() {
  const theme = useAppTheme();
  const { user, logout } = useAuthStore();

  const handleTerminateSession = () => {
    Alert.alert(
      "Terminate Session",
      "Are you sure you want to log out and terminate the current session?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Terminate", style: "destructive", onPress: logout }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="Security & Access" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>ACCOUNT AUTHENTICATION</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={[styles.label, { color: theme.textMuted }]}>Email Address</Text>
                <Text style={[styles.value, { color: theme.text }]}>{user?.email}</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={[styles.label, { color: theme.textMuted }]}>Account ID</Text>
                <Text style={[styles.value, { color: theme.text }]}>{user?.id?.substring(0, 18)}...</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={[styles.label, { color: theme.textMuted }]}>Enlistment Date</Text>
                <Text style={[styles.value, { color: theme.text }]}>{dayjs(user?.createdAt).format('MMMM D, YYYY')}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>SESSION MANAGEMENT</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={[styles.label, { color: theme.textMuted }]}>Current Device</Text>
                <Text style={[styles.description, { color: theme.textMuted }]}>{Platform.OS === 'ios' ? 'iPhone' : 'Android Device'} — Active Now</Text>
              </View>
              <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
            </View>
          </View>
          
          <TouchableOpacity style={styles.dangerBtn} onPress={handleTerminateSession}>
            <Text style={styles.dangerBtnText}>Terminate All Sessions</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoBox, { backgroundColor: theme.primaryMuted, borderColor: theme.primary + '20' }]}>
          <Text style={[styles.infoTitle, { color: theme.primary }]}>End-to-End Encryption</Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Your mission data is synchronized using secure tunnels. We recommend periodic session termination for maximum operational security.
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#71717A',
    marginBottom: 12,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#71717A',
    marginBottom: 4,
  },
  value: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#71717A',
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dangerBtn: {
    marginTop: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
  },
  dangerBtnText: {
    fontFamily: 'Inter_700Bold',
    color: '#FCA5A5',
    fontSize: 14,
  },
  infoBox: {
    marginTop: 20,
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
