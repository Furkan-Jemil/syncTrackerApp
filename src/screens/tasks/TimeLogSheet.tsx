import React, { useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '@/components/common/Header';
import StyledTextInput from '@/components/common/StyledTextInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import { timeLogSchema, TimeLogFormValues } from '@/utils/schemas';
import apiClient from '@/lib/axios';

export default function TimeLogSheet() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const taskId = route.params?.taskId;
  const descRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<TimeLogFormValues>({
    resolver: zodResolver(timeLogSchema),
    defaultValues: { durationMinutes: '' as unknown as number, description: '' },
  });

  const onSubmit = async (values: TimeLogFormValues) => {
    try {
      // Direct API call utilizing axios instance (would normally be bound in api/tasks.ts)
      await apiClient.post(`/tasks/${taskId}/time-entries`, {
        durationMinutes: Number(values.durationMinutes),
        description: values.description,
      });
      // The socket logic in Phase 5 will automatically broadcast this to the activity log.
      navigation.goBack();
    } catch {
      setError('durationMinutes', { message: 'Failed to log time' });
    }
  };

  return (
    <View style={styles.flex}>
      <Header title="Log Time" showBack />
      
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          
          <Controller
            control={control}
            name="durationMinutes"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledTextInput
                label="Duration (Minutes)"
                placeholder="e.g. 45"
                keyboardType="numeric"
                value={String(value || '')}
                onChangeText={(text) => onChange(text.replace(/[^0-9]/g, ''))}
                onBlur={onBlur}
                error={errors.durationMinutes?.message}
                returnKeyType="next"
                onSubmitEditing={() => descRef.current?.focus()}
              />
            )}
          />

          <View style={styles.spacer} />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledTextInput
                ref={descRef}
                label="Description (Optional)"
                placeholder="What did you work on?"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
                numberOfLines={3}
                style={{ height: 80, textAlignVertical: 'top' }}
              />
            )}
          />

          <PrimaryButton
            title="Submit Work Log"
            isLoading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            style={{ marginTop: 32 }}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0f1117' },
  container: { padding: 20 },
  spacer: { height: 16 },
});
