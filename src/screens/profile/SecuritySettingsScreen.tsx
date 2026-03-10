import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, TouchableOpacity, Alert } from 'react-native';
import Header from '@/components/common/Header';
import useAuthStore from '@/stores/authStore';
import dayjs from 'dayjs';

export default function SecuritySettingsScreen() {
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
    <SafeAreaView style={styles.safeArea}>
      <Header title="Security & Access" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT AUTHENTICATION</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.label}>Email Address</Text>
                <Text style={styles.value}>{user?.email}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.label}>Account ID</Text>
                <Text style={styles.value}>{user?.id?.substring(0, 18)}...</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.label}>Enlistment Date</Text>
                <Text style={styles.value}>{dayjs(user?.createdAt).format('MMMM D, YYYY')}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SESSION MANAGEMENT</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.label}>Current Device</Text>
                <Text style={styles.description}>{Platform.OS === 'ios' ? 'iPhone' : 'Android Device'} — Active Now</Text>
              </View>
              <View style={styles.activeIndicator} />
            </View>
          </View>
          
          <TouchableOpacity style={styles.dangerBtn} onPress={handleTerminateSession}>
            <Text style={styles.dangerBtnText}>Terminate All Sessions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>End-to-End Encryption</Text>
          <Text style={styles.infoText}>
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
    backgroundColor: '#09090B',
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
    backgroundColor: '#18181B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272A',
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
    color: '#F8FAFC',
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#71717A',
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
    marginHorizontal: 20,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A3E635',
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
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  infoTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 20,
  },
});
