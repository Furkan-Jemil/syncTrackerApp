import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar, Alert, ActivityIndicator } from 'react-native';
import Header from '@/components/common/Header';
import useAuthStore from '@/stores/authStore';
import apiClient from '@/lib/axios';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function ProfileEditScreen() {
  const { user, updateUser } = useAuthStore();
  const theme = useAppTheme();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty.");
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.patch(`/users?id=eq.${user?.id}`, {
        name,
        bio
      });
      updateUser({ name, bio });
      Alert.alert("Success", "Operational profile updated.");
    } catch (error) {
      console.error("Profile update error", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="Edit Profile" showBack />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PERSONAL DETAILS</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Full Name</Text>
              <TextInput 
                style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={theme.textMuted}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Bio / Operational Focus</Text>
              <TextInput 
                style={[styles.input, styles.textArea, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Briefly describe your focus..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: theme.primary }]} 
          onPress={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={theme.background === '#09090B' ? '#052E16' : '#FFFFFF'} />
          ) : (
            <Text style={[styles.saveBtnText, { color: theme.background === '#09090B' ? '#052E16' : '#FFFFFF' }]}>Update Profile</Text>
          )}
        </TouchableOpacity>

        <View style={[styles.infoBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Your name is visible to all mission collaborators. Keep your bio professional and focused on your core tasks.
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
    backgroundColor: '#18181B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
  },
  inputGroup: {
    padding: 20,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#F8FAFC',
    marginBottom: 8,
  },
  input: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
    marginHorizontal: 20,
  },
  saveBtn: {
    backgroundColor: '#A3E635',
    padding: 16,
    borderRadius: 9999,
    alignItems: 'center',
    marginBottom: 24,
  },
  saveBtnText: {
    fontFamily: 'Inter_700Bold',
    color: '#052E16',
    fontSize: 16,
  },
  infoBox: {
    padding: 20,
    backgroundColor: '#18181B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  infoText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#71717A',
    lineHeight: 20,
    textAlign: 'center',
  },
});
