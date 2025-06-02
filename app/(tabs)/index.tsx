import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { Colors } from '@/constants/Colors';
import { Record, User } from '@/lib/realmSchema';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery, useRealm } from '@realm/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

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
  const router = useRouter();
  const realm = useRealm();
  const users = useQuery(User);
  if (users.isEmpty() || !users[0]) {
    // ユーザーが存在しない場合は、エラー画面を表示する
    router.navigate('/create-user');
  }
  const user = users[0];
  const records = useQuery(Record).filtered(
    'type == 1 and startedAt >= $0 and startedAt <= $1',
    new Date(new Date().toLocaleDateString('sv-SE')), // スウェーデンの表示形式は「2025-02-01」となるのでそれを使用する
    new Date(`${new Date().toLocaleDateString('sv-SE')} 23:59:59`),
  );
  let totalHours = 0;
  let totalMinutes = 0;
  if (!records.isEmpty()) {
    // 今日の稼働の合計時間を計算
    const totalTime = records.reduce((acc, record) => {
      const startedAt = record.startedAt.getTime();
      const endedAt = record.endedAt.getTime();
      return acc + (endedAt - startedAt);
    }, 0);
    // 合計時間を時間と分に変換
    totalHours = Math.floor(totalTime / (1000 * 60 * 60));
    totalMinutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
  }

  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [startedAd, setStartedAd] = useState(new Date());
  const [endedAt, setEndedAt] = useState(new Date());

  const onPressFunction = () => {
    setVisible(true);
  };

  // 稼働追加時の処理
  const onAddRecord = () => {
    realm.write(() => {
      realm.create(
        'Record',
        Record.generate({
          userId: user._id.toString(),
          title: title,
          startedAt: startedAd,
          endedAt: endedAt,
        }),
      );
    });

    // 値をリセット
    setTitle('');
    setStartedAd(new Date());
    setEndedAt(new Date());
    setVisible(false);
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <SafeAreaView>
          <Text style={styles.title}>TLA</Text>
        </SafeAreaView>
        <View style={styles.card}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={styles.cardTitle}>
              {new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric' })} アセット
            </Text>
            <TouchableOpacity onPress={() => router.navigate('/setting-routine')}>
              <Ionicons name="settings-outline" size={26} color={'gray'} />
            </TouchableOpacity>
          </View>
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
        <View style={{ ...styles.card, marginTop: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              borderBottomWidth: 2,
              borderBottomColor: 'lightgray',
            }}
          >
            <Text style={{ ...styles.cardTitle }}>今日の稼働</Text>
            <Text style={styles.text}>
              合計 {totalHours}時間{totalMinutes}分
            </Text>
          </View>
          <FlatList
            data={records}
            keyExtractor={item => item._id.toString()}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View
                style={{
                  ...styles.sectionListItemView,
                  borderBottomWidth: index + 1 === records.length ? 0 : 1,
                }}
              >
                <Text style={{ fontSize: 16 }}>{item.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {item.startedAt.toLocaleTimeString('ja-JP', {
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', paddingHorizontal: 5 }}>〜</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                    {item.endedAt.toLocaleTimeString('ja-JP', {
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>
        <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ ...styles.card, width: screenWidth / 2 - 30 }}>
            <Text style={styles.cardTitle}>可処分時間割合</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
              }}
            >
              <AnimatedCircularProgress
                size={screenWidth / 2 - 70}
                width={20}
                rotation={0}
                fill={13}
                tintColor="#00e0ff"
                backgroundColor="#3d5875"
              >
                {fill => <Text style={styles.percentText}>{Math.trunc(fill)}%</Text>}
              </AnimatedCircularProgress>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: 'bold', color: 'gray' }}>3時間20分</Text>
              <Text style={{ fontWeight: 'bold', color: 'gray' }}>13%</Text>
            </View>
          </View>
          <View style={{ ...styles.card, width: screenWidth / 2 - 30 }}>
            <Text style={styles.cardTitle}>稼働時間割合</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
              }}
            >
              <AnimatedCircularProgress
                size={screenWidth / 2 - 70}
                width={20}
                rotation={0}
                fill={78}
                tintColor="#00e0ff"
                backgroundColor="#3d5875"
              >
                {fill => <Text style={styles.percentText}>{Math.trunc(fill)}%</Text>}
              </AnimatedCircularProgress>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: 'bold', color: 'gray' }}>2時間50分</Text>
              <Text style={{ fontWeight: 'bold', color: 'gray' }}>78%</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <FloatingActionButton onPressFunction={onPressFunction} />
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View style={{ alignItems: 'flex-end' }}>
          <Ionicons
            name="close-circle-outline"
            size={26}
            color="black"
            style={{ padding: 10 }}
            onPress={() => setVisible(false)}
          />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%' }}>
            <Text style={styles.title}>稼働追加</Text>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, paddingBottom: 5 }}>項目</Text>
              <TextInput
                defaultValue={title}
                style={{
                  width: '100%',
                  borderColor: 'lightgray',
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 8,
                  fontSize: 16,
                }}
                onChangeText={value => setTitle(value)}
              />
            </View>
            <View
              style={{
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 16, paddingBottom: 5 }}>時間</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <DateTimePicker
                  value={startedAd}
                  mode="time"
                  display="spinner"
                  style={{ flex: 1, marginRight: 10 }}
                  locale="ja-JP"
                  onChange={(event, date) => {
                    if (!date) return;
                    setStartedAd(date);
                  }}
                />
                <Text style={{ textAlign: 'center', padding: 10 }}>〜</Text>
                <DateTimePicker
                  value={endedAt}
                  mode="time"
                  display="spinner"
                  style={{ flex: 1, marginRight: 10 }}
                  locale="ja-JP"
                  onChange={(event, date) => {
                    if (!date) return;
                    setEndedAt(date);
                  }}
                />
              </View>
            </View>

            <View style={{ width: '100%' }}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 5,
                  backgroundColor: Colors.light.tint,
                  marginTop: 20,
                }}
                onPress={onAddRecord}
              >
                <Text style={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
                  追加する
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    minHeight: '110%',
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
    paddingBottom: 25,
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
