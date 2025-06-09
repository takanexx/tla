export const getLocaleDateString = (): string => {
  const now = new Date();
  return now
    .toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-'); // 例: 2025-06-07
};
