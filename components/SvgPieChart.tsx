import { Fragment } from 'react';
import { Dimensions } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;
const size = screenWidth * 0.8;
const center = size / 2;
const radius = center - 10;
const toRadians = (angle: number) => (angle - 90) * (Math.PI / 180);

// 円弧パスを生成する関数
const describeArc = (startHour: number, endHour: number) => {
  const startAngle = (startHour / 24) * 360;
  const endAngle = (endHour / 24) * 360;
  const start = polarToCartesian(center, center, radius, endAngle);
  const end = polarToCartesian(center, center, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${center} ${center}`, // 中心から開始
    `L ${start.x} ${start.y}`, // 扇形の外周始点へ
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
};

function polarToCartesian(cx: number, cy: number, r: number, angleInDegrees: number) {
  const angleInRadians = toRadians(angleInDegrees);
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  };
}

type Props = {
  chartData: Array<ChartDataType>;
};

export type ChartDataType = {
  label: string;
  start: number;
  end: number;
  color?: string;
};

// chartDataのサンプル
const sampleChartData = [
  { label: '睡眠', start: 0, end: 7, color: '#6A5ACD' }, // 0時〜7時
  { label: '仕事', start: 9, end: 12, color: '#FF8C00' },
  { label: '仕事', start: 13, end: 18, color: '#FF8C00' },
  { label: '帰宅・夕食', start: 18, end: 20, color: '#32CD32' },
  { label: '自由時間', start: 20, end: 23, color: '#20B2AA' },
  { label: '昼休み', start: 12, end: 13, color: '#00CED1' },
  { label: '就寝準備', start: 23, end: 24, color: '#778899' },
  { label: '朝食・通勤', start: 7, end: 9, color: '#FFD700' },
];

export default function SvgPieChart({ chartData }: Props) {
  return (
    <Svg width={size} height={size}>
      <G>
        {chartData.map((item, index) => {
          const startAngle = (item.start / 24) * 360;
          const endAngle = (item.end / 24) * 360;
          const midAngle = (startAngle + endAngle) / 2;
          const labelRadius = radius * 0.65; // 中心寄り

          const labelPos = polarToCartesian(center, center, labelRadius, midAngle);

          return (
            <Fragment key={index}>
              <Path
                d={describeArc(item.start, item.end)}
                fill={item.color}
                stroke="#fff"
                strokeWidth={1}
              />
              {/* ラベル */}
              <SvgText
                x={labelPos.x}
                y={labelPos.y}
                fill="#000"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {item.label}
              </SvgText>
            </Fragment>
          );
        })}
      </G>
    </Svg>
  );
}
