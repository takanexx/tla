import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { User } from '@/lib/realmSchema';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import CreateUser from '../create-user';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const user = useQuery(User);
  const { colors } = useTheme();

  if (user.isEmpty()) {
    // If no user exists, redirect to create user screen
    // 新規ユーザーが存在しない場合は、ユーザー作成画面を表示する
    return <CreateUser />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarInactiveBackgroundColor: colors.card,
        tabBarActiveBackgroundColor: colors.card,
        tabBarActiveTintColor: Colors.light.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons size={28} name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          // headerShown: true,
          title: 'カレンダー',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons size={28} name={focused ? 'calendar' : 'calendar-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-graph"
        options={{
          title: '試験データ',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons size={28} name={focused ? 'podium' : 'podium-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          headerShown: true,
          title: '設定',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons size={28} name={focused ? 'settings' : 'settings-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
