import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { TextInput } from 'react-native';
import StyledTextInput from '@/components/common/StyledTextInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import { loginSchema, LoginFormValues } from '@/utils/schemas';
import useAuthStore from '@/stores/authStore';
import { AuthStackParamList } from '@/navigation/AuthNavigator';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNavProp>();
  const login = useAuthStore((s) => s.login);
  const resendConfirmation = useAuthStore((s) => s.resendConfirmation);
  const passwordRef = useRef<TextInput>(null);
  const [isResending, setIsResending] = React.useState(false);
  const [resendSuccess, setResendSuccess] = React.useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setUnconfirmedEmail(null);
      setResendSuccess(false);
      await login(values);
    } catch (err: any) {
      const data = err?.response?.data;
      const msg = data?.msg || data?.message || data?.error_description || 'Invalid email or password';
      
      if (msg.toLowerCase().includes('confirm')) {
        setUnconfirmedEmail(values.email);
        setError('email', { message: 'Please confirm your email before signing in.' });
      } else if (msg.toLowerCase().includes('email')) {
        setError('email', { message: msg });
      } else {
        setError('password', { message: msg });
      }
    }
  };

  const handleResend = async () => {
    if (!unconfirmedEmail) return;
    setIsResending(true);
    try {
      await resendConfirmation(unconfirmedEmail);
      setResendSuccess(true);
    } catch (err) {
      console.error('Failed to resend confirmation:', err);
    } finally {
      setIsResending(false);
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
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your SyncTracker account</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.duration(600).delay(150)} style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledTextInput
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
                placeholder="••••••••"
                isPassword
                autoComplete="password"
                textContentType="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <View style={styles.spacerLg} />

          {unconfirmedEmail && (
            <Animated.View entering={FadeInDown} style={styles.resendContainer}>
              {resendSuccess ? (
                <Text style={styles.resendSuccessText}>Verification link sent! Check your inbox.</Text>
              ) : (
                <TouchableOpacity 
                  onPress={handleResend} 
                  disabled={isResending}
                  style={styles.resendBtn}
                >
                  <Text style={styles.resendText}>
                    {isResending ? 'Sending...' : 'Resend confirmation link'}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}

          <PrimaryButton
            title="Sign In"
            isLoading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>
              Don't have an account?{' '}
              <Text style={styles.linkHighlight}>Create one</Text>
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
  form: {
    width: '100%',
  },
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
  linkRow: {
    alignItems: 'center',
  },
  linkText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#A1A1AA',
  },
  linkHighlight: {
    fontFamily: 'Inter_600SemiBold',
    color: '#A3E635',
  },
  resendContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  resendBtn: {
    padding: 8,
  },
  resendText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#A3E635',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  resendSuccessText: {
    fontFamily: 'Inter_500Medium',
    color: '#22C55E',
    fontSize: 14,
    textAlign: 'center',
  },
});
