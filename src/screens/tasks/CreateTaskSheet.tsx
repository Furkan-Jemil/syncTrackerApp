import React, { useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, TextInput } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { createTaskSchema, CreateTaskFormValues } from '@/utils/schemas';
import StyledTextInput from '@/components/common/StyledTextInput';
import PrimaryButton from '@/components/common/PrimaryButton';
import Header from '@/components/common/Header';
import { createTask } from '@/api/tasks';
import useTaskStore from '@/stores/taskStore';

export default function CreateTaskSheet() {
  const navigation = useNavigation();
  const updateTaskInList = useTaskStore(s => s.updateTaskInList);
  const descRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { title: '', description: '', responsibleOwnerId: '' },
  });

  const onSubmit = async (values: CreateTaskFormValues) => {
    try {
      const task = await createTask(values);
      // Optimistic update of the list (full refresh happens on pull-to-refresh)
      updateTaskInList(task);
      navigation.goBack();
    } catch (err: any) {
      setError('title', { message: 'Failed to create task' });
    }
  };

  return (
    <View style={styles.flex}>
      <Header title="New Task" showBack />
      
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledTextInput
                label="Task Title"
                placeholder="e.g. Design SyncTracker API"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
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
                placeholder="Details about what needs to be done..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
                numberOfLines={4}
                style={{ height: 100, textAlignVertical: 'top' }}
              />
            )}
          />

          <View style={styles.spacer} />

          {/* Hardcoded for Phase 3 prototype - in reality this would be a user picker component */}
          <Controller
            control={control}
            name="responsibleOwnerId"
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledTextInput
                label="Responsible Owner ID"
                placeholder="User UUID (Phase 3 simplified)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.responsibleOwnerId?.message}
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <View style={styles.spacerLg} />

          <PrimaryButton
            title="Create Task"
            isLoading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
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
  spacerLg: { height: 32 },
});
