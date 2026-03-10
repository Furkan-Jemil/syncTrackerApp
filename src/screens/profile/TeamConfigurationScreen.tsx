import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform, StatusBar, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import Header from '@/components/common/Header';
import { getUsers } from '@/api/users';
import { User } from '@/types';

export default function TeamConfigurationScreen() {
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
    <SafeAreaView style={styles.safeArea}>
      <Header title="Team Configuration" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Operational Network</Text>
          <Text style={styles.infoText}>
            Below are your frequent mission collaborators. You can manage visibility and team synchronization settings here.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>FREQUENT COLLABORATORS</Text>
        
        {isLoading ? (
          <ActivityIndicator color="#A3E635" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.teamList}>
            {collaborators.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.avatarContainer}>
                  {user.avatar_url ? (
                    <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitials}>{user.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={styles.onlineDot} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Configure</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Enroll New Collaborator</Text>
        </TouchableOpacity>

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
  infoBox: {
    padding: 20,
    backgroundColor: '#18181B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#27272A',
    marginBottom: 32,
  },
  infoTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: '#F8FAFC',
    marginBottom: 8,
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#71717A',
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
    backgroundColor: '#18181B',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272A',
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
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#F8FAFC',
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
    borderColor: '#18181B',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#F8FAFC',
    marginBottom: 2,
  },
  userEmail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#71717A',
  },
  actionBtn: {
    backgroundColor: '#27272A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#F8FAFC',
  },
  addBtn: {
    marginTop: 32,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#3F3F46',
    alignItems: 'center',
  },
  addBtnText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#A1A1AA',
    fontSize: 14,
  },
});
