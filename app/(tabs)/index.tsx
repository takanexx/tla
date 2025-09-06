import Banner from '@/components/Banner';
import SvgPieChart, { ChartDataType } from '@/components/SvgPieChart';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import TextInputAccessory from '@/components/ui/TextIputAccesory';
import { ChartColors, Colors, DefaultChartColor, getRateColor } from '@/constants/Colors';
import { Record, Routine, User } from '@/lib/realmSchema';
import { useThemeContext } from '@/Themecontext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@react-navigation/native';
import { useQuery, useRealm } from '@realm/react';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
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
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { BannerAdSize } from 'react-native-google-mobile-ads';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const [today, setToday] = useState(new Date());
  const lastCheckRef = useRef<Date>(new Date());
  const router = useRouter();
  const realm = useRealm();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      console.log('AppState changed to', nextAppState);
      // アプリが起動された場合のイベント
      if (nextAppState !== 'active') return;

      // 今日の日付をセットし直す
      const now = new Date();
      setToday(now);
      // 日付が変わっているかどうかをチェックする
      const lastCheck = lastCheckRef.current;
      const crossedMidnight = now.getDate() !== lastCheck.getDate() && now.getHours() >= 0;
      if (!crossedMidnight) return;

      // 日付が変わった場合の処理
      // 固定ルーティンが存在している場合は当日のレコードとして保存しておく
      const routines = realm.objects(Routine);
      if (!routines.isEmpty()) {
        routines.forEach((r, index) => {
          const record = realm
            .objects(Record)
            .filtered(
              'routineId == $0 and date >= $1',
              r._id.toString(),
              new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            );
          // すでに対象のルーティンレコードが存在する場合は処理を行わなずにスキップ
          if (!record.isEmpty()) return;

          // 日付指定のルーティンの場合
          if (r.cycle === 'dayofwee') {
            const cycleValAry = r.cycleValue.split(',');
            // 今日の曜日が含まれていない場合はRecordを作成せずスキップ
            if (!cycleValAry.includes(String(now.getDay()))) return;
          }

          if (r.startedAt.getHours() > r.endedAt.getHours()) {
            // 22〜6時みたいなものは、22〜24時と0〜6時みたいに分ける
            realm.write(() => {
              realm.create(
                'Record',
                Record.generate({
                  userId: user._id.toString(),
                  routineId: r._id.toString(),
                  title: r.title,
                  color: r.color,
                  date: new Date(),
                  startedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0),
                  endedAt: new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    r.endedAt.getHours(),
                    r.endedAt.getMinutes(),
                  ),
                }),
              );
            });

            realm.write(() => {
              realm.create(
                'Record',
                Record.generate({
                  userId: user._id.toString(),
                  routineId: r._id.toString(),
                  title: r.title,
                  color: r.color,
                  date: new Date(),
                  startedAt: new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    r.startedAt.getHours(),
                    r.startedAt.getMinutes(),
                  ),
                  endedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
                }),
              );
            });
          } else {
            realm.write(() => {
              realm.create(
                'Record',
                Record.generate({
                  userId: user._id.toString(),
                  routineId: r._id.toString(),
                  title: r.title,
                  color: r.color,
                  date: new Date(),
                  startedAt: new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    r.startedAt.getHours(),
                    r.startedAt.getMinutes(),
                  ),
                  endedAt: new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    r.endedAt.getHours(),
                    r.endedAt.getMinutes(),
                  ),
                }),
              );
            });
          }
        });
      }

      lastCheckRef.current = now;
    });

    return () => subscription.remove();
  }, []);

  const users = useQuery(User);
  if (users.isEmpty() || !users[0]) {
    // ユーザーが存在しない場合は、エラー画面を表示する
    router.navigate('/create-user');
  }
  const user = users[0];
  const records = useQuery(Record).filtered(
    'routineId == null and date >= $0 and date <= $1',
    new Date(`${today.toLocaleDateString('sv-SE')} 00:00:00`), // スウェーデンの表示形式は「2025-02-01」となるのでそれを使用する
    new Date(`${today.toLocaleDateString('sv-SE')} 23:59:59`),
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

  const routines = useQuery(Record).filtered(
    'routineId != null and date >= $0',
    new Date(`${today.toLocaleDateString('sv-SE')} 00:00:00`),
  );

  let d: Array<ChartDataType> = [];
  let freeTime = 24;
  routines.forEach((routine, index) => {
    const start =
      Math.floor((routine.startedAt.getHours() + routine.startedAt.getMinutes() / 60) * 100) / 100;
    const end =
      Math.floor((routine.endedAt.getHours() + routine.endedAt.getMinutes() / 60) * 100) / 100;

    if (routine.startedAt.getHours() > routine.endedAt.getHours()) {
      // 22〜6時みたいなものは、22〜24時と0〜6時みたいに分ける
      d.push({
        label: routine.title,
        start: start,
        end: 24,
        color: routine.color,
      });
      freeTime = freeTime - Math.floor((24 - start) * 100) / 100;
      d.push({
        label: routine.title,
        start: 0,
        end: end,
        color: routine.color,
      });
      freeTime = freeTime - Math.floor(end * 100) / 100;
    } else {
      // 日付を跨がない場合
      freeTime = freeTime - Math.floor((end - start) * 100) / 100;
      d.push({
        label: routine.title,
        start: start,
        end: end,
        color: routine.color,
      });
    }
  });

  let investTime = 0;
  records.forEach(record => {
    const start =
      Math.floor((record.startedAt.getHours() + record.startedAt.getMinutes() / 60) * 100) / 100;
    const end =
      Math.floor((record.endedAt.getHours() + record.endedAt.getMinutes() / 60) * 100) / 100;
    d.push({
      label: record.title,
      start: start,
      end: end,
      color: record.color,
    });
    investTime = investTime + (end - start);
  });

  const { colors } = useTheme();
  const { isDark } = useThemeContext();
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [startedAd, setStartedAd] = useState(new Date());
  const [endedAt, setEndedAt] = useState(new Date());
  const [isError, setIsError] = useState(false);
  const [routineColor, setRoutineColor] = useState(DefaultChartColor);

  const onPressFunction = () => {
    setVisible(true);
  };

  const resetState = () => {
    // 値をリセット
    setTitle('');
    setStartedAd(new Date());
    setEndedAt(new Date());
    setRoutineColor(DefaultChartColor);
    setVisible(false);
  };

  // 稼働追加時の処理
  const onAddRecord = () => {
    if (isError || title === '') return;

    // 開始時間が被っているものを抽出
    let existsTodayRecords = realm
      .objects(Record)
      .filtered('startedAt <= $0 and endedAt >= $0', startedAd);

    if (existsTodayRecords.isEmpty()) {
      // 開始時間で被っているレコードがなければ終了時間が被っているものを抽出
      existsTodayRecords = realm
        .objects(Record)
        .filtered('startedAt <= $0 and endedAt >= $0', endedAt);
    }

    if (existsTodayRecords.isEmpty()) {
      // 上記でもない場合は開始時間と終了時間の間にyっているものを抽出
      existsTodayRecords = realm
        .objects(Record)
        .filtered('startedAt >= $0 and endedAt <= $1', startedAd, endedAt);

      if (!existsTodayRecords.isEmpty()) {
        // 完全に被っている場合は、1件目を取得しここでアラートを表示して終了
        // NOTE: 後続の処理の分数チェックでは対応できないためここでチェックする
        const overlappedRecord = existsTodayRecords[0];
        Alert.alert(
          '',
          `追加しようとしている時間帯にすでに【${overlappedRecord.title}】が存在しています`,
          [{ text: 'OK', style: 'default' }],
        );
        return;
      }
    }

    // 既存レコードの中で、開始時間と終了時間が今回追加しようとしているレコードの時間帯に被っているものを抽出
    // NOTE: 開始時間、または終了時間が被っている場合の分数チェック
    if (!existsTodayRecords.isEmpty()) {
      const overlappedRecord = existsTodayRecords.find(r => {
        const startHour = startedAd.getHours();
        const endHour = endedAt.getHours();

        if (r.startedAt.getHours() <= startHour && r.endedAt.getHours() >= startHour) {
          // 開始時間の前後が被っている場合
          if (r.endedAt.getHours() === startHour) {
            // 開始時間の分までチェックする
            if (r.endedAt.getMinutes() >= startedAd.getMinutes()) {
              // 開始時間の分数が既存のルーティンの終了時間の分数より大きい場合は被っている
              return true;
            } else {
              return false;
            }
          }
          return true;
        } else if (r.startedAt.getHours() <= endHour && r.endedAt.getHours() >= endHour) {
          // 終了時間の前後が被っている場合
          if (r.startedAt.getHours() === endHour) {
            // 終了時間の分までチェックする
            if (r.startedAt.getMinutes() <= endedAt.getMinutes()) {
              // 終了時間の分数が既存のルーティンの開始時間の分数より大きい場合は被っている
              return true;
            } else {
              return false;
            }
          }
          return true;
        }
      });

      if (overlappedRecord) {
        Alert.alert(
          '',
          `追加しようとしている時間帯にすでに【${overlappedRecord.title}】が存在しています`,
          [{ text: 'OK', style: 'default' }],
        );
        return;
      }
    }

    realm.write(() => {
      realm.create(
        'Record',
        Record.generate({
          userId: user._id.toString(),
          date: new Date(),
          title: title,
          color: routineColor,
          startedAt: startedAd,
          endedAt: endedAt,
        }),
      );
    });

    // 値をリセット
    resetState();
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <SafeAreaView>
          <Text style={{ ...styles.title, color: colors.text }}>TLA</Text>
        </SafeAreaView>
        <View style={{ ...styles.card, backgroundColor: colors.card }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => router.navigate('/today-asset')}
          >
            <Text style={{ ...styles.cardTitle, color: colors.text }}>
              {today.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric' })} アセット
            </Text>
            <Ionicons name="chevron-forward" size={24} color={'gray'} />
          </TouchableOpacity>
          {d.length > 0 ? (
            <SvgPieChart chartData={d} />
          ) : (
            <View style={{ alignItems: 'center', padding: 50 }}>
              <Text style={{ color: colors.text }}>データがありません</Text>
            </View>
          )}
        </View>

        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
          <Banner size={BannerAdSize.LARGE_BANNER} />
        </View>

        <View style={{ ...styles.card, marginTop: 20, backgroundColor: colors.card }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              borderBottomWidth: 2,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ ...styles.cardTitle, color: colors.text, paddingVertical: 5 }}>
              今日の投資時間
            </Text>
            <Text style={{ ...styles.cardTitle, color: colors.text, fontSize: 22 }}>
              {totalHours}時間{totalMinutes}分
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
                  borderBottomColor: colors.border,
                }}
              >
                <Text style={{ fontSize: 16, color: colors.text }}>{item.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
                    {item.startedAt.toLocaleTimeString('ja-JP', {
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      paddingHorizontal: 5,
                      color: colors.text,
                    }}
                  >
                    〜
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
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
          <View style={{ ...styles.card, backgroundColor: colors.card, width: screenWidth - 40 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomWidth: 2,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ ...styles.cardTitle, color: colors.text }}>今日の投資時間割合</Text>
              <Text style={{ ...styles.cardTitle, color: colors.text, fontSize: 22 }}>
                {Math.floor((investTime / freeTime) * 100)}%
              </Text>
            </View>
            <View style={{ padding: 10 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ width: '50%' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingBottom: 5,
                    }}
                  >
                    <Text style={{ fontSize: 16, color: colors.text }}>隙間時間</Text>
                    <Text style={{ fontSize: 16, color: colors.text }}>
                      {Math.floor(freeTime * 10) / 10}時間
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 16, color: colors.text }}>投資時間</Text>
                    <Text style={{ fontSize: 16, color: colors.text }}>
                      {totalHours}時間{totalMinutes}分
                    </Text>
                  </View>
                </View>

                <AnimatedCircularProgress
                  size={screenWidth / 3}
                  width={20}
                  rotation={0}
                  fill={Math.floor((investTime / freeTime) * 100)}
                  tintColor={getRateColor(Math.floor((investTime / freeTime) * 100))}
                  backgroundColor={isDark ? '#191e2c' : '#e7e7ea'}
                >
                  {fill => (
                    <Text style={{ ...styles.percentText, color: colors.text }}>
                      {Math.trunc(fill)}%
                    </Text>
                  )}
                </AnimatedCircularProgress>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      <FloatingActionButton onPressFunction={onPressFunction} />
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={visible}
        onRequestClose={() => resetState()}
      >
        <View style={{ alignItems: 'flex-end', backgroundColor: colors.card }}>
          <Ionicons
            name="close-circle-outline"
            size={26}
            color="gray"
            style={{ padding: 10 }}
            onPress={() => resetState()}
          />
        </View>
        <View
          style={{
            alignItems: 'center',
            height: '100%',
            padding: 20,
            backgroundColor: colors.card,
          }}
        >
          <View style={{ width: '100%' }}>
            <Text style={{ ...styles.title, color: colors.text }}>投資時間追加</Text>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>項目</Text>
              <TextInput
                defaultValue={title}
                style={{
                  color: colors.text,
                  width: '100%',
                  borderColor: isError ? 'red' : 'lightgray',
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 8,
                  fontSize: 16,
                }}
                inputAccessoryViewID={'home-accessory'}
                onChangeText={value => {
                  if (value === '') {
                    setIsError(true);
                  } else {
                    setIsError(false);
                    setTitle(value);
                  }
                }}
              />
              <TextInputAccessory accessoryId={'home-accessory'} />
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>カラー</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 10 }}>
                {ChartColors.map((color, i) => {
                  return (
                    <TouchableOpacity
                      key={`color_${i}`}
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: color,
                        marginHorizontal: 10,
                        borderColor: Colors.light.tint,
                        borderWidth: color === routineColor ? 5 : 0,
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      onPress={() => setRoutineColor(color)}
                    >
                      {color === routineColor && (
                        <Ionicons name="checkmark" size={28} color={Colors.light.tint} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>時間</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <DateTimePicker
                  value={startedAd}
                  themeVariant={isDark ? 'dark' : 'light'}
                  mode="time"
                  display="spinner"
                  style={{ flex: 1, marginRight: 10 }}
                  locale="ja-JP"
                  onChange={(event, date) => {
                    if (!date) return;
                    setStartedAd(date);
                  }}
                />
                <Text style={{ textAlign: 'center', padding: 10, color: colors.text }}>〜</Text>
                <DateTimePicker
                  value={endedAt}
                  themeVariant={isDark ? 'dark' : 'light'}
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
    paddingBottom: 100,
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
