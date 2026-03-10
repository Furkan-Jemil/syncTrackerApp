import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/tasks/HomeScreen';
import TaskDetailScreen from '@/screens/tasks/TaskDetailScreen';
import ResponsibilityTreeScreen from '@/screens/tasks/ResponsibilityTreeScreen';
import SyncGraphScreen from '@/screens/graph/SyncGraphScreen';
import CreateTaskSheet from '@/screens/tasks/CreateTaskSheet';
import AddParticipantSheet from '@/screens/tasks/AddParticipantSheet';
import SyncStatusSheet from '@/screens/tasks/SyncStatusSheet';
import TimeLogSheet from '@/screens/tasks/TimeLogSheet';
import UserSidePanelSheet from '@/screens/tasks/UserSidePanelSheet';
import { ParticipantRole, SyncStatus } from '@/types';

export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  ResponsibilityTree: { taskId: string };
  SyncGraph: { taskId: string };
  
  // Modals
  CreateTask: undefined;
  AddParticipant: { taskId: string };
  SyncStatus: { taskId: string };
  TimeLog: { taskId: string };
  UserSidePanel: { 
    userId: string;
    name: string;
    role: ParticipantRole;
    syncStatus: SyncStatus;
    lastUpdated: string;
    timeLogged: number;
    milestonesCompleted: number;
    notes?: string;
  };
};

const Stack = createNativeStackNavigator<TaskStackParamList>();

const baseOptions: NativeStackNavigationOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: '#0F172A' },
};

const modalOptions: NativeStackNavigationOptions = {
  ...baseOptions,
  presentation: 'modal',
  animation: 'slide_from_bottom',
};

export default function TaskNavigator() {
  return (
    <Stack.Navigator screenOptions={baseOptions}>
      <Stack.Group>
        <Stack.Screen name="TaskList" component={HomeScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
        <Stack.Screen name="ResponsibilityTree" component={ResponsibilityTreeScreen} />
        <Stack.Screen name="SyncGraph" component={SyncGraphScreen} />
      </Stack.Group>

      <Stack.Group screenOptions={modalOptions}>
        <Stack.Screen name="CreateTask" component={CreateTaskSheet} />
        <Stack.Screen name="AddParticipant" component={AddParticipantSheet} />
        <Stack.Screen name="SyncStatus" component={SyncStatusSheet} />
        <Stack.Screen name="TimeLog" component={TimeLogSheet} />
        <Stack.Screen name="UserSidePanel" component={UserSidePanelSheet} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
