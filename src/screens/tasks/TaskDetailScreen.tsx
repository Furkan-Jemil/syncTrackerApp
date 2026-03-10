import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Platform, TextInput, Modal } from 'react-native';
import { G } from 'react-native-svg';
import { useRoute, useNavigation } from '@react-navigation/native';
import useTaskStore from '@/stores/taskStore';
import useAuthStore from '@/stores/authStore';
import useSyncStore from '@/stores/syncStore';
import { useSocket } from '@/hooks/useSocket';
import { useNotificationStore } from '@/components/common/NotificationBanner';
import StatusBadge from '@/components/common/StatusBadge';
import { ROLE_COLORS, SyncStatus, Attachment } from '@/types';
import dayjs from 'dayjs';
import * as DocumentPicker from 'expo-document-picker';
import { uploadAttachmentToStorage } from '@/api/attachments';

export default function TaskDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const taskId = route.params?.taskId;
  const user = useAuthStore(s => s.user);
  
  const { selectedTask, fetchTaskById, isLoading, clearSelectedTask, updateParticipantStatus, submitWork, reviewTask } = useTaskStore();
  const updateLiveStatus = useSyncStore(s => s.updateStatus);
  const showNotification = useNotificationStore(s => s.showNotification);

  const [isSubmitModalVisible, setIsSubmitModalVisible] = React.useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = React.useState(false);
  const [submissionNotes, setSubmissionNotes] = React.useState('');
  const [reviewNotes, setReviewNotes] = React.useState('');
  const [pendingAttachments, setPendingAttachments] = React.useState<any[]>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = React.useState(false);
  
  const myParticipant = selectedTask?.participants?.find(p => p.userId === user?.id);
  const isPending = myParticipant?.status === 'PENDING';
  
  const { socket } = useSocket(taskId);

  useEffect(() => {
    fetchTaskById(taskId);
    return () => clearSelectedTask();
  }, [taskId]);

  useEffect(() => {
    if (!socket || !socket.connected) return;

    const onSyncChanged = (data: any) => {
      updateLiveStatus(data.taskId, data.userId, data.newStatus);
    };

    const onHelpRequested = (data: any) => {
      if (data.userId !== user?.id) {
        showNotification(`${data.user.name} requested help!`, 'URGENT');
        updateLiveStatus(data.taskId, data.userId, 'HELP_REQUESTED');
      }
    };

    const onParticipantJoined = (data: any) => {
      if (data.participant.userId !== user?.id) {
        showNotification(`${data.participant.user.name} joined as ${data.participant.role}`, 'INFO');
      }
      fetchTaskById(data.taskId);
    };

    const onParticipantStatusChanged = (data: any) => {
      if (data.taskId === taskId) {
        fetchTaskById(taskId);
      }
    };

    socket.on('sync_status_changed', onSyncChanged);
    socket.on('help_requested', onHelpRequested);
    socket.on('participant_joined', onParticipantJoined);
    socket.on('participant_status_changed', onParticipantStatusChanged);

    return () => {
      socket.off('sync_status_changed', onSyncChanged);
      socket.off('help_requested', onHelpRequested);
      socket.off('participant_joined', onParticipantJoined);
      socket.off('participant_status_changed', onParticipantStatusChanged);
    };
  }, [socket, taskId, user?.id]);

  const handleAccept = async () => {
    try {
      await updateParticipantStatus(taskId, user!.id, 'ACCEPTED');
      showNotification('Task accepted!', 'SUCCESS');
    } catch (err) {
      showNotification('Failed to accept task', 'URGENT');
    }
  };

  const handleReject = async () => {
    try {
      await updateParticipantStatus(taskId, user!.id, 'REJECTED');
      showNotification('Task rejected', 'INFO');
      navigation.goBack();
    } catch (err) {
      showNotification('Failed to reject task', 'URGENT');
    }
  };

  const onSubmitWork = async () => {
    try {
      await submitWork(taskId, user!.id, submissionNotes, pendingAttachments);
      showNotification('Work submitted for review!', 'SUCCESS');
      setIsSubmitModalVisible(false);
      setSubmissionNotes('');
      setPendingAttachments([]);
    } catch (err) {
      showNotification('Submission failed', 'URGENT');
    }
  };

  const handlePickAttachment = async () => {
    try {
      setIsUploadingAttachment(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        showNotification(`Uploading ${asset.name}...`, 'INFO');
        
        const publicUrl = await uploadAttachmentToStorage(asset.uri, asset.name);
        
        setPendingAttachments(prev => [...prev, {
          name: asset.name,
          url: publicUrl,
          fileType: asset.mimeType || 'application/octet-stream',
          sizeBytes: asset.size
        }]);
        
        showNotification('File attached!', 'SUCCESS');
      }
    } catch (error) {
      console.error("Attachment error", error);
      showNotification('Failed to attach file', 'URGENT');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  const onReviewTask = async (status: 'COMPLETED' | 'ACTIVE') => {
    try {
      await reviewTask(taskId, status, reviewNotes);
      showNotification(status === 'COMPLETED' ? 'Task Approved!' : 'Changes Requested', 'SUCCESS');
      setIsReviewModalVisible(false);
      setReviewNotes('');
    } catch (err) {
      showNotification('Review failed', 'URGENT');
    }
  };

  if (isLoading || !selectedTask) {
    return (
      <View style={styles.flexCentered}>
        <ActivityIndicator color="#A3E635" />
      </View>
    );
  }

  const renderSectionHeader = (title: string, rightAction?: React.ReactNode) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {rightAction}
    </View>
  );

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Simple Top Navigation Header */}
        <View style={styles.topNavHeader}>
          <TouchableOpacity style={styles.iconNavBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.iconNavBtnText}>‹</Text>
          </TouchableOpacity>
          {selectedTask.assignedById === user?.id && (
            <TouchableOpacity 
              style={styles.textNavBtn}
              onPress={() => navigation.navigate('CreateTask', { taskId })}
            >
              <Text style={styles.textNavBtnLabel}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {isPending && (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingText}>
              You've been assigned as {myParticipant?.role.replace('_', ' ')}. Do you accept?
            </Text>
            <View style={styles.pendingActions}>
              <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
                <Text style={styles.acceptBtnText}>Accept Role</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Task Title Area */}
        <View style={styles.titleSection}>
           <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{selectedTask.title}</Text>
              <Text style={styles.taskSub}>
                Responsibility: {selectedTask.responsibleOwner?.name || 'Unassigned'}
              </Text>
           </View>
           <View style={styles.timePill}>
              <Text style={styles.timePillIcon}>⏱</Text>
              <Text style={styles.timePillText}>{selectedTask.timeEntries?.length || 0} logs</Text>
           </View>
        </View>

        <Text style={styles.description}>
          {selectedTask.description || 'Focus on completing this task efficiently. Log your time and update your sync status.'}
        </Text>

        {/* Success Trigger for Demo */}
        <TouchableOpacity 
          style={styles.successTrigger} 
          onPress={() => {
             showNotification('Milestone Achieved!', 'SUCCESS');
          }}
        >
          <Text style={styles.successTriggerText}>✨ Achieve Milestone</Text>
        </TouchableOpacity>

        {/* "See the Progress" Apple-style Notifications */}
        <View style={styles.progressSection}>
           {renderSectionHeader('See the Progress')}
           
           <View style={styles.notificationsList}>
             {(selectedTask.participants || []).filter(p => p.lastSyncAt || p.notes).slice(0, 3).map((p, idx) => (
               <View key={p.id + idx} style={styles.notificationCard}>
                 <View style={styles.notifHeader}>
                    <View style={styles.notifAppIcon}>
                      <Text style={styles.notifAppIconText}>🎯</Text>
                    </View>
                    <Text style={styles.notifAppName}>SyncTracker</Text>
                    <Text style={styles.notifTime}>
                      {p.lastSyncAt ? dayjs(p.lastSyncAt).fromNow() : 'Recently'}
                    </Text>
                 </View>
                 <Text style={styles.notifTitle}>{p.user?.name || 'Participant'} updated sync status</Text>
                 {p.notes ? (
                   <Text style={styles.notifBody}>{p.notes}</Text>
                 ) : (
                   <Text style={styles.notifBody}>Current Status: {p.syncStatus.replace('_', ' ')}</Text>
                 )}
               </View>
             ))}
             
             {(!selectedTask.participants || selectedTask.participants.filter(p => p.lastSyncAt || p.notes).length === 0) && (
               <Text style={styles.emptyText}>No recent progress updates.</Text>
             )}
           </View>
        </View>

        {/* Action Grid (Routing to the custom viz screens) */}
        <View style={styles.navigationGrid}>
          {/* Always show Tree View */}
          <TouchableOpacity style={[styles.navCard, selectedTask.status === 'COMPLETED' && { flex: 1 }]} onPress={() => navigation.navigate('ResponsibilityTree', { taskId })}>
            <View style={styles.navIconBg}><Text style={styles.navIcon}>🗂️</Text></View>
            <Text style={styles.navText}>Tree View</Text>
          </TouchableOpacity>
          
          {/* Only show Sync Graph if task is NOT completed */}
          {selectedTask.status !== 'COMPLETED' && (
            <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('SyncGraph', { taskId })}>
              <View style={styles.navIconBg}><Text style={styles.navIcon}>🕸️</Text></View>
              <Text style={styles.navText}>Sync Graph</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Attachments Section */}
        {selectedTask.attachments && selectedTask.attachments.length > 0 && (
          <View style={styles.section}>
            {renderSectionHeader('Finished Work / Docs')}
            <View style={styles.attachmentsList}>
              {selectedTask.attachments.map(att => (
                <TouchableOpacity 
                  key={att.id} 
                  style={styles.attachmentCard}
                  onPress={() => {
                    // Logic to open URL would go here, for now just show info
                    showNotification(`Opening ${att.name}...`, 'INFO');
                  }}
                >
                  <View style={styles.attachmentIcon}>
                    <Text style={{ fontSize: 20 }}>
                      {att.fileType?.includes('image') ? '🖼️' : '📄'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attachmentName} numberOfLines={1}>{att.name}</Text>
                    <Text style={styles.attachmentMeta}>
                      {att.fileType?.split('/')[1]?.toUpperCase() || 'FILE'} • {dayjs(att.createdAt).format('MMM D')}
                    </Text>
                  </View>
                  <Text style={styles.linkArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Floating Action Bar */}
      <View style={styles.actionBar}>
        {selectedTask.status === 'ACTIVE' && (myParticipant?.role === 'CONTRIBUTOR' || myParticipant?.role === 'RESPONSIBLE' || myParticipant?.role === 'HELPER') ? (
          <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => setIsSubmitModalVisible(true)}>
            <Text style={styles.actionTextPrimary}>Submit for Review</Text>
          </TouchableOpacity>
        ) : selectedTask.status === 'IN_REVIEW' && myParticipant?.role === 'REVIEWER' ? (
          <TouchableOpacity style={[styles.actionBtnPrimary, { backgroundColor: '#3B82F6' }]} onPress={() => setIsReviewModalVisible(true)}>
            <Text style={[styles.actionTextPrimary, { color: '#fff' }]}>Review Submission</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => navigation.navigate('SyncStatus', { taskId })}>
            <Text style={styles.actionTextPrimary}>Update Sync</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.actionBtnRow}>
          <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => navigation.navigate('TimeLog', { taskId })}>
            <Text style={styles.actionTextSecondary}>Log Time</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => navigation.navigate('AddParticipant', { taskId })}>
            <Text style={styles.actionTextSecondary}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Submission Modal */}
      <Modal visible={isSubmitModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit Work</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Describe what you've completed..."
              placeholderTextColor="#71717A"
              multiline
              value={submissionNotes}
              onChangeText={setSubmissionNotes}
            />
            <TouchableOpacity 
              style={styles.attachmentBtn} 
              onPress={handlePickAttachment}
              disabled={isUploadingAttachment}
            >
              {isUploadingAttachment ? (
                <ActivityIndicator color="#A3E635" size="small" />
              ) : (
                <Text style={styles.attachmentBtnText}>📎 Attach Finished Work / Link</Text>
              )}
            </TouchableOpacity>

            {pendingAttachments.length > 0 && (
              <View style={styles.pendingList}>
                {pendingAttachments.map((att, i) => (
                  <View key={i} style={styles.pendingItem}>
                    <Text style={styles.pendingItemText} numberOfLines={1}>{att.name}</Text>
                    <TouchableOpacity onPress={() => setPendingAttachments(prev => prev.filter((_, idx) => idx !== i))}>
                      <Text style={{ color: '#EF4444', marginLeft: 8 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setIsSubmitModalVisible(false)}>
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={onSubmitWork}>
                <Text style={styles.modalBtnTextConfirm}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Review Modal */}
      <Modal visible={isReviewModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Review Work</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Add your feedback or notes..."
              placeholderTextColor="#71717A"
              multiline
              value={reviewNotes}
              onChangeText={setReviewNotes}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtnConfirm, { backgroundColor: '#EF4444', flex: 1 }]} 
                onPress={() => onReviewTask('ACTIVE')}
              >
                <Text style={styles.modalBtnTextConfirm}>Request Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtnConfirm, { backgroundColor: '#A3E635', flex: 1 }]} 
                onPress={() => onReviewTask('COMPLETED')}
              >
                <Text style={[styles.modalBtnTextConfirm, { color: '#052E16' }]}>Approve</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.modalBtnCancel, { marginTop: 12 }]} onPress={() => setIsReviewModalVisible(false)}>
              <Text style={styles.modalBtnTextCancel}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#09090B' },
  flexCentered: { flex: 1, backgroundColor: '#09090B', alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingBottom: 120 },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  
  topNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#09090B',
  },
  iconNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  iconNavBtnText: {
    color: '#F8FAFC',
    fontSize: 28,
    lineHeight: 32,
  },
  textNavBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderWidth: 1,
    borderColor: '#A3E635',
  },
  textNavBtnLabel: {
    color: '#A3E635',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },


  titleSection: {
    flexDirection: 'row',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#F8FAFC',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  taskSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  timePillIcon: { fontSize: 14, marginRight: 6 },
  timePillText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F8FAFC',
    fontSize: 13,
  },
  
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 22,
    paddingHorizontal: 24,
    marginBottom: 24,
  },

  successTrigger: {
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    marginHorizontal: 24,
    padding: 12,
    borderRadius: 9999,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#A3E635',
  },
  successTriggerText: {
    fontFamily: 'Inter_700Bold',
    color: '#A3E635',
    fontSize: 14,
  },

  progressSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
    color: '#F8FAFC',
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: '#18181B', // Dark grey/black card
    borderRadius: 24,           // Apple-style heavy rounding
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.95,
    // Add subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notifAppIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#A3E635',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  notifAppIconText: {
    fontSize: 10,
  },
  notifAppName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#A1A1AA', // Subtle label color
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notifTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#71717A',
    marginLeft: 'auto',
  },
  notifTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 15,
    color: '#F8FAFC',
    marginBottom: 4,
  },
  notifBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },

  navigationGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 16,
  },
  navCard: {
    flex: 1,
    backgroundColor: '#18181B',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
  },
  navIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  navIcon: {
    fontSize: 24,
  },
  navText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#F8FAFC',
  },

  listContainer: {
    paddingHorizontal: 24,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    padding: 16,
    borderRadius: 9999,
    marginBottom: 12,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#A3E635',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#F8FAFC',
  },
  participantRole: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#A1A1AA',
  },
  pendingBadge: {
    backgroundColor: '#3F3F46',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingBadgeText: {
    fontFamily: 'Inter_700Bold',
    color: '#D1D5DB',
    fontSize: 8,
  },

  pendingBanner: {
    backgroundColor: '#18181B',
    padding: 20,
    marginHorizontal: 24,
    marginTop: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#27272A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  pendingText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 16,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: '#A3E635',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptBtnText: {
    fontFamily: 'Inter_700Bold',
    color: '#052E16',
    fontSize: 14,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#27272A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  rejectBtnText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#F8FAFC',
    fontSize: 14,
  },

  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(9,9,11,0.9)',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  actionBtnPrimary: {
    backgroundColor: '#A3E635',
    borderRadius: 9999,
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 12,
  },
  actionTextPrimary: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: '#052E16',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtnSecondary: {
    flex: 1,
    backgroundColor: '#18181B',
    borderRadius: 9999,
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  actionTextSecondary: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#F8FAFC',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#18181B',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  modalTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: '#F8FAFC',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#09090B',
    borderRadius: 16,
    padding: 16,
    color: '#F8FAFC',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
    borderColor: '#27272A',
  },
  attachmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 20,
    borderStyle: 'dashed',
  },
  attachmentBtnText: {
    color: '#A3E635',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalBtnTextCancel: {
    fontFamily: 'Inter_600SemiBold',
    color: '#71717A',
    fontSize: 14,
  },
  modalBtnConfirm: {
    flex: 2,
    backgroundColor: '#A3E635',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnTextConfirm: {
    fontFamily: 'Inter_700Bold',
    color: '#052E16',
    fontSize: 14,
  },
  // Attachment Styles
  attachmentsList: {
    gap: 12,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  attachmentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  attachmentName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#F8FAFC',
    marginBottom: 2,
  },
  attachmentMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#71717A',
  },
  pendingList: {
    marginBottom: 20,
    gap: 8,
  },
  pendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#27272A', // Using consistent dark theme
    padding: 10,
    borderRadius: 8,
  },
  pendingItemText: {
    color: '#D1D5DB',
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    flex: 1,
  },
  linkArrow: {
    fontSize: 18,
    color: '#71717A',
  },
});
