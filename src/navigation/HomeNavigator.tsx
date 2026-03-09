import React from 'react';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import HomeScreen from '@/screens/tasks/HomeScreen';
import TaskDetailScreen from '@/screens/tasks/TaskDetailScreen';
import CreateTaskSheet from '@/screens/tasks/CreateTaskSheet';
import AddParticipantSheet from '@/screens/tasks/AddParticipantSheet';
import SyncStatusSheet from '@/screens/tasks/SyncStatusSheet';
import TimeLogSheet from '@/screens/tasks/TimeLogSheet';

import UserSidePanelSheet from '@/screens/tasks/UserSidePanelSheet';
import { ParticipantRole, SyncStatus } from '@/types';

export type HomeStackParamList = {
  Home: undefined;
  TaskDetail: { taskId: string };
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

const Stack = createNativeStackNavigator<HomeStackParamList>();

const baseOptions: NativeStackNavigationOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: '#0f1117' },
};

const modalOptions: NativeStackNavigationOptions = {
  ...baseOptions,
  presentation: 'modal',
  animation: 'slide_from_bottom',
};

export default function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={baseOptions}>
      {/* Main flow */}
      <Stack.Group>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      </Stack.Group>

      {/* Modals & Sheets (presented over the current screen) */}
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
