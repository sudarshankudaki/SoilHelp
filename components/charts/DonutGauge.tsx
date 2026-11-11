/**
 * DonutGauge — circular arc that fills to show a percentage value.
 * Uses react-native-svg. Works on web + native.
 */
import { Text } from '@/components/Themed';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface Props {
  percentage: number;   // 0‒100
  color: string;        // arc colour
  trackColor: string;   // background ring colour
  size?: number;        // diameter in dp (default 120)
  strokeWidth?: number; // (default 12)
  label?: string;       // text below the number
  textColor?: string;
}

export default function DonutGauge({
  percentage,
  color,
  trackColor,
  size = 120,
  strokeWidth = 12,
  label = 'Confidence',
  textColor = '#1C1C1E',
}: Props) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <View style={styles.wrapper}>
      <View style={styles.gaugeBackground}>
        <Svg width={size} height={size}>
          {/* Track ring */}
          <Circle
            cx={cx} cy={cy} r={r}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Filled arc — rotated so it starts at the top */}
          <G transform={`rotate(-90 ${cx} ${cy})`}>
            <Circle
              cx={cx} cy={cy} r={r}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${dash} ${circumference}`}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        {/* Centre labels */}
        <View style={[styles.centre, { width: size, height: size }]}>
          <Text style={[styles.number, { color: textColor }]}>{Math.round(percentage)}%</Text>
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', alignItems: 'center' },
  gaugeBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  centre: {
    position: 'absolute', top: 8, left: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  number: { fontSize: 24, fontWeight: 'bold' },
  label:  { fontSize: 11, marginTop: 2, fontWeight: '600', opacity: 0.8 },
});
