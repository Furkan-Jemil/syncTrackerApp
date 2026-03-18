import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Header from '@/components/common/Header';
import { getUsers } from '@/api/users';
import { User } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function TeamConfigurationScreen() {
  const theme = useAppTheme();
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCollaborators();
  }, []);

  const loadCollaborators = async () => {
    try {
      const users = await getUsers();
      // Filter out self or just showing some recent users as "Team"
      setCollaborators(users.slice(0, 10));
    } catch (error) {
      console.error("Failed to load team data", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="Team Configuration" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.infoBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>Operational Network</Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Below are your frequent mission collaborators. You can manage visibility and team synchronization settings here.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>FREQUENT COLLABORATORS</Text>
        
        {isLoading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.teamList}>
            {collaborators.map((user) => (
              <View key={user.id} style={[styles.userCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.avatarContainer}>
                  {user.avatar_url ? (
                    <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.background }]}>
                      <Text style={[styles.avatarInitials, { color: theme.textMuted }]}>{user.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={styles.onlineDot} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
                  <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user.email}</Text>
                </View>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.background }]}>
                  <Text style={[styles.actionBtnText, { color: theme.text }]}>Configure</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={[styles.addBtn, { borderColor: theme.border }]}>
          <Text style={[styles.addBtnText, { color: theme.textSecondary }]}>+ Enroll New Collaborator</Text>
        </TouchableOpacity>

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
  infoBox: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
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
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: '#71717A',
    marginBottom: 16,
    letterSpacing: 1,
  },
  teamList: {
    gap: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A3E635',
    borderWidth: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    marginBottom: 2,
  },
  userEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  addBtn: {
    marginTop: 32,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
});
