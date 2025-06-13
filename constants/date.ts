export const getDayOfWeekStr = (dayOfWeek: number) => {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return days[dayOfWeek % 7];
};
