import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar, Image, Alert, ActivityIndicator } from 'react-native';
import useAuthStore from '@/stores/authStore';
import Header from '@/components/common/Header';
import * as ImagePicker from 'expo-image-picker';
import { getUserStats, uploadAvatar } from '@/api/users';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();
  const { user, logout, updateUser } = useAuthStore();
  const [stats, setStats] = useState({
    tasksResponsible: 0,
    tasksContributed: 0,
    milestonesHit: 0,
    timeLogged: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user?.id]);

  const loadStats = async () => {
    try {
      if (!user) return;
      const data = await getUserStats(user.id);
      setStats(data);
    } catch (err) {
      console.error("Stats fetching error", err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to update your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        const publicUrl = await uploadAvatar(user!.id, result.assets[0].uri);
        updateUser({ avatar_url: publicUrl });
      }
    } catch (error) {
      console.error("Image picking/uploading error", error);
      Alert.alert("Upload Failed", "Could not upload the new profile picture.");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="Command Profile" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={handlePickImage} 
            disabled={isUploading}
            activeOpacity={0.7}
          >
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                <Text style={[styles.avatarText, { color: theme.background }]}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
              </View>
            )}
            
            {/* Upload indicator overlay */}
            {isUploading ? (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color="#052E16" size="small" />
              </View>
            ) : null}
          </TouchableOpacity>
          
          <Text style={[styles.name, { color: theme.text }]}>{user?.name || 'Unknown Officer'}</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email || 'No email provided'}</Text>
          
          <TouchableOpacity 
            style={[styles.editBtn, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}
            onPress={() => navigation.navigate('ProfileEdit')}
          >
            <Text style={[styles.editBtnText, { color: theme.text }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section]}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>GLOBAL METRICS</Text>
          {isLoadingStats ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={theme.primary} />
          ) : (
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.statValue, { color: theme.primary }]}>{stats.tasksResponsible}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Tasks Responsible</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.statValue, { color: theme.primary }]}>{stats.tasksContributed}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Tasks Contributed</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.statValue, { color: theme.primary }]}>{stats.milestonesHit}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Milestones Hit</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.statValue, { color: theme.primary }]}>{Math.round(stats.timeLogged / 60)}h</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Time Logged</Text>
              </View>
            </View>
          )}
        </View>

        {/* Settings Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>SYSTEM SETTINGS</Text>
          <View style={[styles.linksCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TouchableOpacity 
              style={styles.linkRow}
              onPress={() => navigation.navigate('NotificationSettings')}
            >
              <Text style={[styles.linkText, { color: theme.text }]}>Notification Preferences</Text>
              <Text style={[styles.linkArrow, { color: theme.textMuted }]}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity 
              style={styles.linkRow}
              onPress={() => navigation.navigate('ThemeSettings')}
            >
              <Text style={[styles.linkText, { color: theme.text }]}>Theme Configuration</Text>
              <Text style={[styles.linkArrow, { color: theme.textMuted }]}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity 
              style={styles.linkRow}
              onPress={() => navigation.navigate('TeamConfiguration')}
            >
              <Text style={[styles.linkText, { color: theme.text }]}>Team Configuration</Text>
              <Text style={[styles.linkArrow, { color: theme.textMuted }]}>→</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity 
              style={styles.linkRow}
              onPress={() => navigation.navigate('SecuritySettings')}
            >
              <Text style={[styles.linkText, { color: theme.text }]}>Security & Access</Text>
              <Text style={[styles.linkArrow, { color: theme.textMuted }]}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Terminate Session (Logout)</Text>
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
    paddingBottom: 120, // Accommodate floating tab bar
  },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#A3E635',
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 40,
    backgroundColor: 'rgba(163, 230, 53, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
  },
  name: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    marginBottom: 4,
  },
  email: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    marginBottom: 20,
  },
  editBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999, // Pill outline button
  },
  editBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    marginBottom: 16,
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statBox: {
    width: '47%',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  statValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    color: '#A3E635',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  linksCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  linkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  linkArrow: {
    fontSize: 18,
    color: '#A1A1AA',
  },
  divider: {
    height: 1,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // #EF444420
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 16,
    borderRadius: 9999, // Pill shape
    alignItems: 'center',
    marginVertical: 16,
  },
  logoutText: {
    fontFamily: 'Inter_700Bold',
    color: '#FCA5A5',
    fontSize: 15,
  },
});
