import Banner from '@/components/Banner';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import TextInputAccessory from '@/components/ui/TextIputAccesory';
import { ChartColors, Colors, getRateColor } from '@/constants/Colors';
import { Record, User } from '@/lib/realmSchema';
import { useThemeContext } from '@/Themecontext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@react-navigation/native';
import { useQuery, useRealm } from '@realm/react';
import { useRouter } from 'expo-router';
import { Fragment, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { CalendarList, LocaleConfig } from 'react-native-calendars';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { BannerAdSize } from 'react-native-google-mobile-ads';

const screenWidth = Dimensions.get('window').width;

export default function ScheduleScreen() {
  const realm = useRealm();
  const router = useRouter();
  const { colors } = useTheme();
  const { isDark } = useThemeContext();
  const [selected, setSelected] = useState(new Date().toISOString().split('T')[0]);
  const [visible, setVisible] = useState(false);
  const [visibleAddModal, setVisibleAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [startedAt, setStartedAt] = useState(new Date());
  const [endedAt, setEndedAt] = useState(new Date());
  const [editRecord, setEditRecord] = useState<Record | null>(null);
  const [routineColor, setRoutineColor] = useState('red');
  const [date, setDate] = useState(new Date(selected));

  const users = useQuery(User);
  if (users.isEmpty() || !users[0]) {
    // ユーザーが存在しない場合は、エラー画面を表示する
    router.navigate('/create-user');
  }
  const user = users[0];

  const records = useQuery(Record).filtered(
    'routineId == null and date >= $0 and date <= $1',
    new Date(`${selected} 00:00:00`),
    new Date(`${selected} 23:59:59`),
  );
  LocaleConfig.locales['ja'] = {
    monthNames: [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ],
    dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
    locale: 'jp',
  };
  LocaleConfig.defaultLocale = 'ja';

  const onEditRecord = () => {
    if (!editRecord) return;

    realm.write(() => {
      editRecord.title = title;
      editRecord.startedAt = startedAt;
      editRecord.endedAt = endedAt;
    });

    resetState();
  };

  // リセット処理
  const resetState = () => {
    setVisible(false);
    // 値を初期化
    setTitle('');
    setEndedAt(new Date());
    setStartedAt(new Date());
    setEditRecord(null);
    setVisibleAddModal(false);
    setDate(new Date(selected));
    setRoutineColor('red');
  };

  let markedDates: { [date: string]: { marked: boolean; dotColor: string } } = {};
  const recordsForMonth = useQuery(Record).filtered(
    'routineId == null and date >= $0 and date < $1',
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
  );
  recordsForMonth.forEach(r => {
    const date = r.date;
    // ゼロパディングしないとCalendar側で表示されないのでゼロパディングしておく
    // let dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    let dateStr = date.toLocaleDateString('sv-SE'); // スウェーデンの表示形式は「2025-02-01」となるのでそれを使用する

    // すでに該当日付があれば、処理しない
    if (markedDates[dateStr] !== undefined) return;

    // 稼働時間を取得する
    const records = useQuery(Record).filtered(
      'routineId == null and date >= $0 and date <= $1',
      new Date(`${dateStr} 00:00:00`),
      new Date(`${dateStr} 23:59:59`),
    );
    let totalHours = 0;
    let totalMinutes = 0;
    // 稼働の合計時間を計算
    const totalTime = records.reduce((acc, record) => {
      const startedAt = record.startedAt.getTime();
      const endedAt = record.endedAt.getTime();
      return acc + (endedAt - startedAt);
    }, 0);
    // 合計時間を時間と分に変換
    totalHours = Math.floor(totalTime / (1000 * 60 * 60));
    totalMinutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));

    // ルーティンの時間を取得
    const routines =
      useQuery(Record).filtered(
        'routineId != null and date >= $0 and date < $1',
        new Date(`${dateStr} 00:00:00`),
        new Date(`${dateStr} 23:59:59`),
      ) ?? [];
    // 隙間時間
    let freeTime = 24;
    routines.forEach((routine, index) => {
      const start =
        Math.floor((routine.startedAt.getHours() + routine.startedAt.getMinutes() / 60) * 100) /
        100;
      const end =
        Math.floor((routine.endedAt.getHours() + routine.endedAt.getMinutes() / 60) * 100) / 100;

      if (routine.startedAt.getHours() > routine.endedAt.getHours()) {
        // 22〜6時みたいなものは、22〜24時と0〜6時みたいに分ける
        freeTime = freeTime - Math.floor((24 - start) * 100) / 100;
        freeTime = freeTime - Math.floor(end * 100) / 100;
      } else {
        // 日付を跨がない場合
        freeTime = freeTime - Math.floor((end - start) * 100) / 100;
      }
    });

    // 投資時間を取得
    let investTime = 0;
    records.forEach(record => {
      const start =
        Math.floor((record.startedAt.getHours() + record.startedAt.getMinutes() / 60) * 100) / 100;
      const end =
        Math.floor((record.endedAt.getHours() + record.endedAt.getMinutes() / 60) * 100) / 100;
      investTime = investTime + (end - start);
    });

    const rate = Math.floor((investTime / freeTime) * 100);
    const dotColor = getRateColor(rate);

    markedDates[dateStr] = { marked: true, dotColor: dotColor };
  });

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

  const routines =
    useQuery(Record).filtered(
      'routineId != null and date >= $0 and date < $1',
      new Date(`${selected} 00:00:00`),
      new Date(`${selected} 23:59:59`),
    ) ?? [];
  // 隙間時間
  let freeTime = 24;
  routines.forEach((routine, index) => {
    const start =
      Math.floor((routine.startedAt.getHours() + routine.startedAt.getMinutes() / 60) * 100) / 100;
    const end =
      Math.floor((routine.endedAt.getHours() + routine.endedAt.getMinutes() / 60) * 100) / 100;

    if (routine.startedAt.getHours() > routine.endedAt.getHours()) {
      // 22〜6時みたいなものは、22〜24時と0〜6時みたいに分ける
      freeTime = freeTime - Math.floor((24 - start) * 100) / 100;
      freeTime = freeTime - Math.floor(end * 100) / 100;
    } else {
      // 日付を跨がない場合
      freeTime = freeTime - Math.floor((end - start) * 100) / 100;
    }
  });

  // 投資時間
  let investTime = 0;
  records.forEach(record => {
    const start =
      Math.floor((record.startedAt.getHours() + record.startedAt.getMinutes() / 60) * 100) / 100;
    const end =
      Math.floor((record.endedAt.getHours() + record.endedAt.getMinutes() / 60) * 100) / 100;
    investTime = investTime + (end - start);
  });

  const onAddRecord = () => {
    if (!title || !startedAt || !endedAt) return;

    if (
      !realm
        .objects(Record)
        .filtered('routineId == null and startedAt <= $0 and endedAt >= $0', startedAt)
        .isEmpty()
    ) {
      Alert.alert('', '追加しようとしている時間帯にすでに記録が存在しています', [
        { text: 'OK', style: 'default' },
      ]);
      return;
    }

    realm.write(() => {
      realm.create(
        'Record',
        Record.generate({
          userId: user._id.toString(),
          date: date,
          title: title,
          color: routineColor,
          startedAt: startedAt,
          endedAt: endedAt,
        }),
      );
    });

    resetState();
  };

  return (
    <>
      <SafeAreaView>
        <Banner size={BannerAdSize.FULL_BANNER} />
        <Fragment>
          <CalendarList
            key={isDark ? 'dark' : 'light'} // 動的にカレンダーのスタイルが切り替わるフラグ
            theme={{
              backgroundColor: colors.card,
              calendarBackground: colors.card,
              dayTextColor: colors.text,
              todayTextColor: Colors.light.tint,
              // @ts-ignore
              'stylesheet.calendar.header': {
                dayTextAtIndex0: {
                  color: '#D25565', // 日曜
                },
                dayTextAtIndex6: {
                  color: '#3674B5', // 土曜
                },
              },
            }}
            pagingEnabled={true}
            horizontal={true}
            onDayPress={day => {
              setSelected(day.dateString);
              setDate(new Date(day.dateString));
            }}
            markedDates={{
              ...markedDates,
              [selected]: {
                selected: true,
                disableTouchEvent: true,
                selectedColor: Colors.light.tint,
              },
            }}
          />
        </Fragment>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        <View>
          <View
            style={{
              ...styles.card,
              backgroundColor: colors.card,
              width: screenWidth - 40,
              paddingVertical: 10,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomWidth: 2,
                borderBottomColor: colors.border,
              }}
            >
              <Text style={{ ...styles.cardTitle, color: colors.text }}>
                {`${new Date(selected).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })} `}
                の投資時間割合
              </Text>
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
          <Text style={{ padding: 5, paddingTop: 20, fontWeight: 'bold', color: 'gray' }}>
            投資した時間
          </Text>
          <View style={{ ...styles.card, backgroundColor: colors.card }}>
            {records.length === 0 ? (
              // 投資時間がない場合
              <View
                style={{
                  ...styles.sectionListItemView,
                  borderBottomWidth: 0,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: colors.text }}>投資時間はありません</Text>
              </View>
            ) : (
              // 投資時間がある場合
              <FlatList
                data={records}
                keyExtractor={item => item._id.toString()}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      ...styles.sectionListItemView,
                      borderBottomWidth: records.length === index + 1 ? 0 : 1,
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
                      <TouchableOpacity
                        style={{ paddingLeft: 10 }}
                        onPress={() => {
                          setEditRecord(item);
                          setTitle(item.title);
                          setStartedAt(item.startedAt);
                          setEndedAt(item.endedAt);
                          setVisible(true);
                        }}
                      >
                        <Ionicons name="ellipsis-vertical" size={18} color={'gray'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>
      <FloatingActionButton onPressFunction={() => setVisibleAddModal(true)} />

      {/* Add Modal */}
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={visibleAddModal}
        onRequestClose={() => {
          resetState();
        }}
      >
        <View style={{ alignItems: 'flex-end', backgroundColor: colors.card }}>
          <Ionicons
            name="close-circle-outline"
            size={26}
            color={'gray'}
            style={{ padding: 10 }}
            onPress={() => {
              resetState();
            }}
          />
        </View>
        <ScrollView
          contentContainerStyle={{
            backgroundColor: colors.card,
            padding: 20,
            paddingBottom: 40,
          }}
        >
          <Text style={{ fontSize: 24, paddingBottom: 25, fontWeight: 'bold', color: colors.text }}>
            投資時間追加
          </Text>
          <View
            style={{
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>日付</Text>
            <DateTimePicker
              value={date}
              mode="date"
              locale="ja-JP"
              themeVariant={isDark ? 'dark' : 'light'}
            />
          </View>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>項目</Text>
            <TextInput
              defaultValue={title}
              style={{
                borderWidth: 1,
                borderColor: 'lightgray',
                borderRadius: 10,
                padding: 8,
                fontSize: 16,
              }}
              onChangeText={text => setTitle(text)}
              inputAccessoryViewID="addRecordInput"
            />
            <TextInputAccessory accessoryId="addRecordInput" />
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
                value={startedAt}
                themeVariant={isDark ? 'dark' : 'light'}
                mode="time"
                display="spinner"
                style={{ flex: 1, marginRight: 10 }}
                locale="ja-JP"
                onChange={(event, date) => {
                  if (!date) return;
                  setStartedAt(date);
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
        </ScrollView>
      </Modal>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => resetState()}
      >
        <TouchableWithoutFeedback onPress={() => resetState()}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
        </TouchableWithoutFeedback>
        <View
          style={{
            height: 'auto',
            backgroundColor: colors.card,
            marginTop: 'auto',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
              paddingBlock: 0,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                if (!editRecord) return;
                Alert.alert('削除しますか？', '', [
                  { text: 'キャンセル', style: 'cancel' },
                  {
                    text: '削除する',
                    style: 'destructive',
                    onPress: () => {
                      realm.write(() => {
                        realm.delete(editRecord);
                      });
                      resetState();
                    },
                  },
                ]);
              }}
            >
              <Ionicons name="trash-outline" size={26} color={'red'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => resetState()}>
              <Ionicons name="close-circle-outline" size={26} color={'gray'} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              backgroundColor: colors.card,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 30,
              paddingVertical: 20,
            }}
          >
            <View style={{ width: '100%' }}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>項目</Text>
                <TextInput
                  placeholder=""
                  style={{
                    borderWidth: 1,
                    borderColor: 'lightgray',
                    borderRadius: 10,
                    padding: 10,
                    fontSize: 16,
                    color: colors.text,
                  }}
                  value={title}
                  onChangeText={text => setTitle(text)}
                />
              </View>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>時間</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <DateTimePicker
                    themeVariant={isDark ? 'dark' : 'light'}
                    value={startedAt}
                    mode="time"
                    display="spinner"
                    style={{ flex: 1, marginRight: 10 }}
                    onChange={(event, date) => {
                      if (!date) return;
                      setStartedAt(date);
                    }}
                  />
                  <Text style={{ color: colors.text }}>〜</Text>
                  <DateTimePicker
                    themeVariant={isDark ? 'dark' : 'light'}
                    value={endedAt}
                    mode="time"
                    display="spinner"
                    style={{ flex: 1, marginLeft: 10 }}
                    onChange={(event, date) => {
                      if (!date) return;
                      setEndedAt(date);
                    }}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: Colors.light.tint,
                  marginTop: 30,
                }}
                onPress={() => onEditRecord()}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                  保存する
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
    paddingBottom: 150,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingHorizontal: 5,
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
  percentText: {
    fontSize: 18,
    color: 'black',
  },
});
