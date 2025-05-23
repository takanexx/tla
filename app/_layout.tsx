import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { RealmProvider } from '@realm/react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Exam, ExamResult, Record, User } from '@/lib/realmSchema';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <RealmProvider schema={[User, Record, Exam, ExamResult]}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          {/* <Stack.Screen
            name="user-edit"
            options={{ headerBackTitle: '戻る', headerTitle: 'ユーザー情報' }}
          /> */}
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </RealmProvider>
  );
}
