import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/hooks/useAppTheme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export default function Header({ title, showBack = false, rightElement }: HeaderProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { 
      paddingTop: insets.top + 12, 
      backgroundColor: theme.background,
      borderBottomColor: theme.border
    }]}>
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.backIcon, { color: theme.textSecondary }]}>←</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>

      <View style={styles.right}>{rightElement}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#09090B',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
    zIndex: 10,
  },
  left: {
    flex: 1,
    alignItems: 'flex-start',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    flex: 3,
    textAlign: 'center',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    color: '#A1A1AA',
    fontSize: 24,
    lineHeight: 24,
  },
});
