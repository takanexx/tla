import { DarkTheme as DefaultDarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

export const LightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#000',
  },
};

export const DarkTheme: Theme = {
  ...DefaultDarkTheme,
  colors: {
    ...DefaultDarkTheme.colors,
    primary: '#fff',
  },
};
