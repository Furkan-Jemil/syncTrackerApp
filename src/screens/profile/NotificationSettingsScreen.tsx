import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import Header from '@/components/common/Header';
import useSettingsStore from '@/stores/settingsStore';

export default function NotificationSettingsScreen() {
  const { notifications, updateNotifications } = useSettingsStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Notification Preferences" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MISSION ALERTS</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.label}>Push Notifications</Text>
                <Text style={styles.description}>Receive instant alerts on your device</Text>
              </View>
              <Switch 
                value={notifications.push} 
                onValueChange={(v) => updateNotifications({ push: v })}
                trackColor={{ true: '#A3E635', false: '#27272A' }}
                thumbColor={notifications.push ? '#F8FAFC' : '#71717A'}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.label}>Direct Assignments</Text>
                <Text style={styles.description}>When you are assigned as Responsible</Text>
              </View>
              <Switch 
                value={notifications.assignments} 
                onValueChange={(v) => updateNotifications({ assignments: v })}
                trackColor={{ true: '#A3E635', false: '#27272A' }}
                thumbColor={notifications.assignments ? '#F8FAFC' : '#71717A'}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DIGESTS</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.label}>Email Updates</Text>
                <Text style={styles.description}>Daily summary of team activity</Text>
              </View>
              <Switch 
                value={notifications.email} 
                onValueChange={(v) => updateNotifications({ email: v })}
                trackColor={{ true: '#A3E635', false: '#27272A' }}
                thumbColor={notifications.email ? '#F8FAFC' : '#71717A'}
              />
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  info: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#F8FAFC',
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#71717A',
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
    marginHorizontal: 20,
  },
});
