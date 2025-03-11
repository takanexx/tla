import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart, ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const data = [
  {
    name: '睡眠',
    population: 8,
    color: 'rgba(0, 0, 255, 0.6)',
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  },
  {
    name: '仕事',
    population: 8,
    color: 'rgba(0, 0, 255, 0.8)',
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  },
  {
    name: '勉強',
    population: 2,
    color: 'rgba(255, 0, 0, 0.6)',
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  },
  {
    name: 'その他',
    population: 6,
    color: 'rgba(255, 0, 0, 0.8)',
    legendFontColor: '#7F7F7F',
    legendFontSize: 15,
  },
];

const chartConfig = {
  backgroundGradientFrom: '#1E2923',
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: '#08130D',
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // optional
};

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView>
        <Text style={styles.title}>TLA</Text>
      </SafeAreaView>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>アセット</Text>
        <PieChart
          data={data}
          width={screenWidth - 40}
          height={250}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
      <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ ...styles.card, width: screenWidth / 2 - 30 }}>
          <Text style={styles.cardTitle}>可処分時間</Text>
          <ProgressChart
            data={{
              data: [0.13],
            }}
            width={screenWidth / 2 - 40}
            height={120}
            chartConfig={{
              backgroundColor: 'white',
              backgroundGradientFrom: 'white',
              backgroundGradientTo: 'white',
              color: (opacity = 1) => `rgba(26, 100, 146, ${opacity})`,
            }}
            hideLegend={true}
            hasLegend={false}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold', color: 'gray' }}>3時間20分</Text>
            <Text style={{ fontWeight: 'bold', color: 'gray' }}>13%</Text>
          </View>
        </View>
        <View style={{ ...styles.card, width: screenWidth / 2 - 30 }}>
          <Text style={styles.cardTitle}>稼働率</Text>
          <ProgressChart
            data={{
              data: [0.78],
            }}
            width={screenWidth / 2 - 40}
            height={120}
            chartConfig={{
              backgroundColor: 'white',
              backgroundGradientFrom: 'white',
              backgroundGradientTo: 'white',
              color: (opacity = 1) => `rgba(26, 50, 146, ${opacity})`,
            }}
            hideLegend={true}
            hasLegend={false}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold', color: 'gray' }}>2時間50分</Text>
            <Text style={{ fontWeight: 'bold', color: 'gray' }}>78%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    // minHeight: '110%',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginVertical: 10,
  },
  circleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  circle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'red',
    marginRight: 10,
  },
  timeText: {
    fontSize: 18,
    color: 'red',
  },
  percentText: {
    fontSize: 18,
    color: 'black',
  },
});
