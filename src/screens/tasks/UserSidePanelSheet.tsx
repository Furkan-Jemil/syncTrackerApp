import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Header from '@/components/common/Header';
import { SYNC_STATUS_LABELS, SYNC_STATUS_COLORS, ROLE_LABELS, SyncStatus, ParticipantRole } from '@/types';
import dayjs from 'dayjs';

// In a real app we'd fetch these from an API based on userId.
// For Phase 4 visualization, we pass them via navigation params.
type UserSidePanelParams = {
  userId: string;
  name: string;
  role: ParticipantRole;
  syncStatus: SyncStatus;
  lastUpdated: string;
  timeLogged: number;
  milestonesCompleted: number;
  notes?: string;
};

export default function UserSidePanelSheet() {
  const route = useRoute<any>();
  const params = route.params as UserSidePanelParams;

  if (!params) return null;

  const { name, role, syncStatus, lastUpdated, timeLogged, milestonesCompleted, notes } = params;
  const syncColor = SYNC_STATUS_COLORS[syncStatus];

  return (
    <View style={styles.flex}>
      <Header title="Participant Details" showBack />
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* User Info Header */}
        <View style={styles.userHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.role}>{ROLE_LABELS[role]}</Text>
          </View>
        </View>

        {/* Sync Status section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Status</Text>
          <View style={[styles.statusBadge, { borderColor: syncColor, backgroundColor: `${syncColor}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: syncColor }]} />
            <Text style={[styles.statusText, { color: syncColor }]}>
              {SYNC_STATUS_LABELS[syncStatus]}
            </Text>
          </View>
          <Text style={styles.timeLabel}>Updated {dayjs(lastUpdated).fromNow()}</Text>
          
          {notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{notes}</Text>
            </View>
          )}
        </View>

        {/* Stats section */}
        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardTitle}>Time Logged</Text>
            <Text style={styles.statValue}>{timeLogged}m</Text>
          </View>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.cardTitle}>Milestones</Text>
            <Text style={styles.statValue}>{milestonesCompleted}</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f1117' },
  container: { padding: 20 },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a1d27',
    borderWidth: 1,
    borderColor: '#2e3148',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f0f4ff',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f0f4ff',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#a4bcfd',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1a1d27',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2e3148',
  },
  halfCard: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  cardTitle: {
    fontSize: 13,
    color: '#6370a0',
    fontWeight: '600',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  timeLabel: {
    fontSize: 12,
    color: '#6370a0',
  },
  notesBox: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2e3148',
  },
  notesText: {
    fontSize: 14,
    color: '#f0f4ff',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f0f4ff',
  },
});
