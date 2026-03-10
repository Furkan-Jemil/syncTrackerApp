import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Header from '@/components/common/Header';
import { SYNC_STATUS_LABELS, SYNC_STATUS_COLORS, ROLE_LABELS, ROLE_COLORS, SyncStatus, ParticipantRole } from '@/types';
import dayjs from 'dayjs';
import { updateParticipantRole } from '@/api/participants';
import useTaskStore from '@/stores/taskStore';
import useAuthStore from '@/stores/authStore';
import { useNotificationStore } from '@/components/common/NotificationBanner';

// In a real app we'd fetch these from an API based on userId.
// For Phase 4 visualization, we pass them via navigation params.
type UserSidePanelParams = {
  userId: string;
  name: string;
  role: ParticipantRole;
  syncStatus: SyncStatus;
  status: string;
  lastUpdated: string;
  timeLogged: number;
  milestonesCompleted: number;
  notes?: string;
  taskId: string;
};

export default function UserSidePanelSheet() {
  const route = useRoute<any>();
  const params = route.params as UserSidePanelParams;

  if (!params) return null;
  const navigation = useNavigation<any>();

  const { name, role, syncStatus, status, lastUpdated, timeLogged, milestonesCompleted, notes, taskId, userId } = params;
  const currentUser = useAuthStore(s => s.user);
  const syncColor = SYNC_STATUS_COLORS[syncStatus];
  const isPending = status === 'PENDING';

  const isContributor = role === 'CONTRIBUTOR';
  const isMe = userId === currentUser?.id;
  const showHelperBtn = isContributor;

  // Real app: only show this if the currentUser is the task Assignee/Creator.
  // We'll show to anyone here for demonstration purposes, except they can't change their own role seamlessly without checks.
  const canEditRole = !isMe;
  const showNotification = useNotificationStore(s => s.showNotification);
  const [isUpdatingRole, setIsUpdatingRole] = React.useState(false);
  const availableRoles: ParticipantRole[] = ['CONTRIBUTOR', 'HELPER', 'REVIEWER', 'OBSERVER'];

  const handleChangeRole = async (newRole: ParticipantRole) => {
    if (newRole === role) return;
    setIsUpdatingRole(true);
    try {
      await updateParticipantRole(taskId, userId, newRole);
      await useTaskStore.getState().fetchTaskById(taskId);
      showNotification(`Role updated to ${ROLE_LABELS[newRole]}`, 'SUCCESS');
      navigation.goBack();
    } catch (err) {
      showNotification('Failed to update role', 'URGENT');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  return (
    <View style={styles.flex}>
      <Header title="Participant Details" showBack />
      
      <ScrollView contentContainerStyle={styles.container}>
        {/* User Info Header */}
        <View style={styles.userHeader}>
          <View style={[styles.avatarPlaceholder, { borderColor: ROLE_COLORS[role] }]}>
            <Text style={[styles.avatarText, { color: ROLE_COLORS[role] }]}>{name.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={[styles.role, { color: ROLE_COLORS[role] }]}>{ROLE_LABELS[role]}</Text>
          </View>
        </View>

        {/* Sync Status section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Status</Text>
          <View style={[styles.statusBadge, { borderColor: syncColor + '40', backgroundColor: syncColor + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: syncColor }]} />
            <Text style={[styles.statusText, { color: syncColor }]}>
              {SYNC_STATUS_LABELS[syncStatus]}
            </Text>
          </View>
          <Text style={styles.timeLabel}>Updated {dayjs(lastUpdated).format('MMM D, h:mm A')}</Text>
          
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

        {/* Change Role Section */}
        {canEditRole && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Change Role</Text>
            <View style={styles.roleGrid}>
              {availableRoles.map(r => (
                <TouchableOpacity
                  key={r}
                  disabled={isUpdatingRole}
                  style={[
                    styles.roleCard,
                    role === r && { borderColor: ROLE_COLORS[r], backgroundColor: `${ROLE_COLORS[r]}1A` }
                  ]}
                  onPress={() => handleChangeRole(r)}
                >
                  <Text style={[
                    styles.roleCardText,
                    role === r && { color: ROLE_COLORS[r] }
                  ]}>
                    {ROLE_LABELS[r]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsBox}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => {}}>
            <Text style={styles.actionBtnText}>Message</Text>
          </TouchableOpacity>
          
          {(showHelperBtn) && (
            <TouchableOpacity 
              style={styles.actionBtnHelp} 
              onPress={() => navigation.navigate('AddParticipant', { taskId, role: 'HELPER' })}
            >
              <Text style={styles.actionBtnTextHelp}>
                {isMe ? 'Request Helper' : 'Assign Helper'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#09090B' },
  container: { padding: 24 },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#18181B',
    borderWidth: 2,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    shadowColor: '#A3E635',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#F8FAFC',
  },
  name: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: '#A3E635',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#18181B',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  halfCard: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#71717A',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
  },
  timeLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#52525B',
  },
  notesBox: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  notesText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#D1D5DB',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: '#F8FAFC',
  },
  actionsBox: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#27272A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  actionBtnText: {
    color: '#F8FAFC',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  actionBtnHelp: {
    flex: 1,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  actionBtnTextHelp: {
    color: '#3B82F6',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleCard: {
    width: '47%',
    paddingVertical: 14,
    backgroundColor: '#09090B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
  },
  roleCardText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#71717A',
  },
});
