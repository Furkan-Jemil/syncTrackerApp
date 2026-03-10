import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import StyledTextInput from '@/components/common/StyledTextInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import { registerSchema, RegisterFormValues } from '@/utils/schemas';
import useAuthStore from '@/stores/authStore';
import { AuthStackParamList } from '@/navigation/AuthNavigator';

type RegisterNavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNavProp>();
  const register = useAuthStore((s) => s.register);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
    } catch (err: any) {
      const data = err?.response?.data;
      const msg = data?.msg || data?.message || data?.error_description || err.message || JSON.stringify(data || err);
      setError('email', { message: msg });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Glowing background effect */}
        <View style={styles.glowOrb} />
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <Image 
            source={require('@/assets/app-logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join SyncTracker and own your work</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.duration(600).delay(150)} style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledTextInput
                label="Full Name"
                placeholder="Alex Johnson"
                autoComplete="name"
                textContentType="name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            )}
          />

          <View style={styles.spacer} />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledTextInput
                ref={emailRef}
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            )}
          />

          <View style={styles.spacer} />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledTextInput
                ref={passwordRef}
                label="Password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                isPassword
                textContentType="newPassword"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
            )}
          />

          <View style={styles.spacer} />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledTextInput
                ref={confirmRef}
                label="Confirm Password"
                placeholder="••••••••"
                isPassword
                textContentType="newPassword"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <View style={styles.spacerLg} />

          <PrimaryButton
            title="Create Account"
            isLoading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkHighlight}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#09090B' },
  glowOrb: {
    position: 'absolute',
    top: -150,
    left: '20%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#A3E635',
    opacity: 0.15,
    transform: [{ scale: 1.5 }],
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: '#F7FEE7',
    letterSpacing: -1,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 20,
  },
  form: { width: '100%' },
  spacer: { height: 16 },
  spacerLg: { height: 24 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#27272A',
  },
  dividerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#A1A1AA',
  },
  linkRow: { alignItems: 'center' },
  linkText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#A1A1AA' },
  linkHighlight: { fontFamily: 'Inter_600SemiBold', color: '#A3E635' },
});
