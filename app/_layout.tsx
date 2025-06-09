import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { RealmProvider } from '@realm/react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { Exam, ExamResult, Record, Routine, User } from '@/lib/realmSchema';
import { ThemeProviderCustom, useThemeContext } from '@/Themecontext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
    <RealmProvider
      schema={[User, Record, Routine, Exam, ExamResult]}
      // Set to true only for development purposes
      // This will delete the Realm database if a migration is needed.
      // In production, you should handle migrations properly.
      deleteRealmIfMigrationNeeded={true}
    >
      <ThemeProviderCustom>
        <NavigationThemeWrapper>
          <Stack initialRouteName="create-user">
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="create-user" />
            <Stack.Screen name="setting-routine" />
            <Stack.Screen name="today-asset" />
            {/* <Stack.Screen
            name="user-edit"
            options={{ headerBackTitle: '戻る', headerTitle: 'ユーザー情報' }}
          /> */}
          </Stack>
          <StatusBar style="auto" />
        </NavigationThemeWrapper>
      </ThemeProviderCustom>
    </RealmProvider>
  );
}

function NavigationThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeContext();
  return <NavigationThemeProvider value={theme}>{children}</NavigationThemeProvider>;
}
