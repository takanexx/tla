import { getDayOfWeekStr } from '@/constants/date';

export const convertCycleStr = (cycle: string, cycleValue: string) => {
  if (cycle === 'everyday') {
    return '毎日';
  } else if (cycle === 'dayofweek') {
    // 「火、金」のように曜日を若い順に並び変え、日本語に変換して返す
    const cycleValAry = cycleValue
      .split(',')
      .map(Number)
      .sort((a, b) => a - b)
      .map(getDayOfWeekStr);
    return `${cycleValAry.join('、')}`;
  }
};
