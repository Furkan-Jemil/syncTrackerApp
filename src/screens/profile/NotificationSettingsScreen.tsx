import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import Header from '@/components/common/Header';
import useSettingsStore from '@/stores/settingsStore';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function NotificationSettingsScreen() {
  const theme = useAppTheme();
  const { notifications, updateNotifications } = useSettingsStore();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="Notification Preferences" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>MISSION ALERTS</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={[styles.label, { color: theme.text }]}>Push Notifications</Text>
                <Text style={[styles.description, { color: theme.textSecondary }]}>Receive instant alerts on your device</Text>
              </View>
              <Switch 
                value={notifications.push} 
                onValueChange={(v) => updateNotifications({ push: v })}
                trackColor={{ true: theme.primary, false: theme.border }}
                thumbColor={notifications.push ? '#F8FAFC' : theme.textMuted}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={[styles.label, { color: theme.text }]}>Direct Assignments</Text>
                <Text style={[styles.description, { color: theme.textSecondary }]}>When you are assigned as Responsible</Text>
              </View>
              <Switch 
                value={notifications.assignments} 
                onValueChange={(v) => updateNotifications({ assignments: v })}
                trackColor={{ true: theme.primary, false: theme.border }}
                thumbColor={notifications.assignments ? '#F8FAFC' : theme.textMuted}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DIGESTS</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={[styles.label, { color: theme.text }]}>Email Updates</Text>
                <Text style={[styles.description, { color: theme.textSecondary }]}>Daily summary of team activity</Text>
              </View>
              <Switch 
                value={notifications.email} 
                onValueChange={(v) => updateNotifications({ email: v })}
                trackColor={{ true: theme.primary, false: theme.border }}
                thumbColor={notifications.email ? '#F8FAFC' : theme.textMuted}
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
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
  },
});
