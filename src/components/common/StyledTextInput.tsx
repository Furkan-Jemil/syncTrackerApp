import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface StyledTextInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

const StyledTextInput = forwardRef<TextInput, StyledTextInputProps>(
  ({ label, error, isPassword, style, ...rest }, ref) => {
    const [secure, setSecure] = useState(isPassword ?? false);
    const [focused, setFocused] = useState(false);

    return (
      <View style={styles.wrapper}>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.inputRow,
            focused && styles.inputRowFocused,
            !!error && styles.inputRowError,
          ]}
        >
          <TextInput
            ref={ref}
            style={[styles.input, style]}
            placeholderTextColor="#4c5175"
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
              <Text style={styles.eyeIcon}>{secure ? '👁' : '🙈'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {!!error && <Text style={styles.errorText}>{error}</Text>}
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
    fontSize: 13,
    fontWeight: '600',
    color: '#a0aabe',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1d27',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2e3148',
    paddingHorizontal: 16,
  },
  inputRowFocused: {
    borderColor: '#5a6ff4',
    backgroundColor: '#1d2035',
  },
  inputRowError: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: '#f0f4ff',
  },
  eyeButton: {
    paddingLeft: 8,
  },
  eyeIcon: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 5,
    marginLeft: 4,
  },
});
