import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

type BannerProps = {
  size?: BannerAdSize; // 任意のバナーサイズを受け取る
};

export default function Banner({ size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER }: BannerProps) {
  const unitId = TestIds.BANNER;
  // 本番ではこちらを使用
  // const unitId = 'ca-app-pub-4739003769773423/xxxxxxxxxx';

  return (
    <BannerAd
      unitId={unitId}
      size={size}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true,
      }}
    />
  );
}
