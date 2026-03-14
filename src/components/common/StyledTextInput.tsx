import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';

interface StyledTextInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

const StyledTextInput = forwardRef<TextInput, StyledTextInputProps>(
  ({ label, error, isPassword, style, ...rest }, ref) => {
    const [secure, setSecure] = useState(isPassword ?? false);
    const [focused, setFocused] = useState(false);
    const theme = useAppTheme();

    return (
      <View style={styles.wrapper}>
        <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text>
        <View
          style={[
            styles.inputRow,
            { backgroundColor: theme.surface, borderColor: theme.border },
            focused && [styles.inputRowFocused, { borderColor: theme.primary, backgroundColor: theme.surface }],
            !!error && [styles.inputRowError, { borderColor: theme.error }],
          ]}
        >
          <TextInput
            ref={ref}
            style={[styles.input, { color: theme.text }, style]}
            placeholderTextColor={theme.textMuted}
            secureTextEntry={secure}
            autoCapitalize="none"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...rest}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setSecure((v) => !v)}
              style={styles.eyeButton}
              hitSlop={8}
            >
              <Text style={[styles.eyeIcon, { color: theme.textSecondary }]}>{secure ? '👁' : '🙈'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {!!error && <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>}
      </View>
    );
  },
);

StyledTextInput.displayName = 'StyledTextInput';

export default StyledTextInput;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B', // Darker card background
    borderRadius: 9999, // Pill shape
    borderWidth: 1.5,
    borderColor: '#27272A',
    paddingHorizontal: 20,
  },
  inputRowFocused: {
    borderColor: '#A3E635', // Lime glow
    backgroundColor: '#18181B',
  },
  inputRowError: {
    borderColor: '#EF4444',
  },
  input: {
    flex: 1,
    height: 56,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#F8FAFC',
  },
  eyeButton: {
    paddingLeft: 8,
  },
  eyeIcon: {
    fontSize: 16,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#EF4444',
    marginTop: 5,
    marginLeft: 4,
  },
});
