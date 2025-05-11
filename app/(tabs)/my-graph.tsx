import React from 'react';
import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const data = {
  labels: ['1月', '3月', '4月', '7月', '8月', '9月'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
      strokeWidth: 2,
    },
  ],
};

const chartConfig = {
  backgroundGradientFrom: '#1E2923',
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: '#08130D',
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(13, 111, 168, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // optional
};

export default function MyGraphScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView>
        <Text style={styles.title}>試験グラフ</Text>
      </SafeAreaView>
      <View style={styles.card}>
        <LineChart
          transparent
          data={data}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>結果</Text>
        <View style={styles.card}>
          <View style={styles.sectionListItemView}>
            <Text style={{ fontSize: 16 }}>1月</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>20点</Text>
          </View>
          <View style={styles.sectionListItemView}>
            <Text style={{ fontSize: 16 }}>3月</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>40点</Text>
          </View>
          <View style={styles.sectionListItemView}>
            <Text style={{ fontSize: 16 }}>4月</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>30点</Text>
          </View>
          <View style={{ ...styles.sectionListItemView, borderBottomWidth: 0 }}>
            <Text style={{ fontSize: 16 }}>7月</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>80点</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
  },
  sectionListItemView: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
