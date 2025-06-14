/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const ChartColors = ['#004971', '#4274a0', '#ffdc96', '#ffa467', '#ff7938', '#d94448'];

/**
 * チャートの割合を元に色を返す
 * @param {number} rate
 * @returns {string}
 */
export const getRateColor = (rate: number): string => {
  let color = Colors.light.tint;
  if (rate < 20) {
    // 20%以下（赤）
    color = '#DC2525';
  } else if (20 <= rate && rate < 40) {
    // 20〜40%（オレンジ）
    color = '#FF7601';
  } else if (40 <= rate && rate < 60) {
    // 40〜60%（黄）
    color = '#FCF259';
  } else if (60 <= rate && rate < 80) {
    // 60〜80%（黄緑）
    color = '#B6F500';
  } else if (80 <= rate) {
    // 80%以上（緑）
    color = '#06D001';
  }

  return color;
};
