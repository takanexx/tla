import Banner from '@/components/Banner';
import TextInputAccessory from '@/components/ui/TextIputAccesory';
import { ChartColors, Colors, DefaultChartColor } from '@/constants/Colors';
import { getDayOfWeekStr } from '@/constants/date';
import { convertCycleStr } from '@/lib/realModel';
import { Record, Routine, User } from '@/lib/realmSchema';
import { useThemeContext } from '@/Themecontext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@react-navigation/native';
import { useQuery, useRealm } from '@realm/react';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BannerAdSize } from 'react-native-google-mobile-ads';

const SettingRoutine = () => {
  const router = useRouter();
  const realm = useRealm(); // Realmのインスタンスを取得
  const users = useQuery(User);
  if (users.isEmpty() || !users[0]) {
    // ユーザーが存在しない場合は、エラー画面を表示する
    router.navigate('/create-user');
  }
  const user = users[0];

  const { colors } = useTheme();
  const { isDark } = useThemeContext();
  const [title, setTitle] = useState('');
  const [routineColor, setRoutineColor] = useState(DefaultChartColor);
  const [startedAt, setStartedAt] = useState(new Date());
  const [endedAt, setEndedAt] = useState(new Date());
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [editRoutine, setEditRoutine] = useState<Routine | null>(null);
  const [fromToday, setFromToday] = useState(false);
  const [cycle, setCycle] = useState('everyday');
  const [cycleValue, setCycleValue] = useState<number[]>([]);

  const routines = useQuery(Routine).sorted('startedAt');

  /**
   * 今日からルーティーンをセットする
   * @returns
   */
  const setRoutineFromToday = (routine: Routine) => {
    // 今日のルーティンレコードを作成
    const now = new Date();
    // 日付指定のルーティンの場合
    if (routine.cycle === 'dayofweek') {
      const cycleValAry = routine.cycleValue.split(',');
      // 今日の曜日が含まれていない場合はRecordは作成せず終了
      if (!cycleValAry.includes(String(now.getDay()))) {
        resetState();
        return;
      }
    }

    // 毎日、または曜日指定で今日の曜日が含まれている場合はレコードを作成
    if (routine.startedAt.getHours() > routine.endedAt.getHours()) {
      // 日付を跨ぐ場合（22時〜6時のようなルーティン）は、22時〜24時と0時〜6時のように分割して保存する
      realm.write(() => {
        realm.create(
          'Record',
          Record.generate({
            userId: user._id.toString(),
            routineId: routine._id.toString(),
            title: routine.title,
            color: routine.color,
            date: new Date(),
            startedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0),
            endedAt: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              routine.endedAt.getHours(),
              routine.endedAt.getMinutes(),
            ),
          }),
        );
      });

      realm.write(() => {
        realm.create(
          'Record',
          Record.generate({
            userId: user._id.toString(),
            routineId: routine._id.toString(),
            title: routine.title,
            color: routine.color,
            date: new Date(),
            startedAt: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              routine.startedAt.getHours(),
              routine.startedAt.getMinutes(),
            ),
            endedAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59),
          }),
        );
      });
    } else {
      // 日付を跨がない場合
      realm.write(() => {
        realm.create(
          'Record',
          Record.generate({
            userId: user._id.toString(),
            routineId: routine._id.toString(),
            title: routine.title,
            color: routine.color,
            date: new Date(),
            startedAt: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              routine.startedAt.getHours(),
              routine.startedAt.getMinutes(),
            ),
            endedAt: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              routine.endedAt.getHours(),
              routine.endedAt.getMinutes(),
            ),
          }),
        );
      });
    }
  };

  /**
   * バリデーションチェック
   * @returns {boolean} バリデーションチェック
   */
  const validate = (): boolean => {
    if (title.trim() === '') {
      Alert.alert('', 'ルーティーン名を入力してください', [{ text: 'OK', style: 'default' }]);
      return false;
    }
    // 曜日指定のルーティーンで曜日が選択されていない場合はアラートを表示して終了
    if (cycle === 'dayofweek' && cycleValue.length === 0) {
      Alert.alert('', '曜日指定のルーティーンを追加する場合は、曜日を1つ以上選択してください', [
        { text: 'OK', style: 'default' },
      ]);
      return false;
    }

    return true;
  };

  /**
   * ルーティーンの追加処理
   * @returns {void}
   */
  const createRoutine = () => {
    // バリデーションチェック
    if (!validate()) return;

    // すでに同じ時間帯にルーティーンが存在している場合はアラートを表示して終了
    const existedRoutine = realm.objects(Routine);

    // 既存ルーティンの中で、開始時間と終了時間が今回追加しようとしているルーティンの時間帯に被っているものを抽出
    if (!existedRoutine.isEmpty()) {
      const overlappedRoutine = existedRoutine.find((element: Routine) => {
        const startHour = startedAt.getHours();
        const endHour = endedAt.getHours();

        if (element.startedAt.getHours() <= startHour && element.endedAt.getHours() >= startHour) {
          // 開始時間の前後が被っている場合
          if (element.endedAt.getHours() === startHour) {
            // 開始時間の分まで考慮する
            if (element.endedAt.getMinutes() >= startedAt.getMinutes()) {
              // 開始時間の分数が既存のルーティンの終了時間の分数より大きい場合は被っている
              return true;
            } else {
              return false;
            }
          }
          return true;
        } else if (
          element.startedAt.getHours() <= endHour &&
          element.endedAt.getHours() >= endHour
        ) {
          // 終了時間の前後が被っている場合
          if (element.startedAt.getHours() === endHour) {
            // 終了時間の分まで考慮する
            if (element.startedAt.getMinutes() <= endedAt.getMinutes()) {
              return true; // 終了時間の分数が既存のルーティンの開始時間の分数より大きい場合は被っている
            } else {
              return false;
            }
          }
        } else if (
          element.startedAt.getHours() >= startHour &&
          element.endedAt.getHours() <= endHour
        ) {
          // 完全に被っている場合
          return true;
        }
      });

      if (overlappedRoutine) {
        Alert.alert(
          '',
          `追加しようとしている時間帯にすでに【${overlappedRoutine.title}】が存在しています`,
          [{ text: 'OK', style: 'default' }],
        );
        return;
      }
    }

    // ルーティーンを追加
    const routine: Routine = realm.write(() =>
      realm.create(
        'Routine',
        Routine.generate({
          userId: user._id.toString(),
          title: title,
          color: routineColor,
          cycle: cycle,
          cycleValue: cycleValue.join(','),
          startedAt: startedAt,
          endedAt: endedAt,
        }) as unknown as Routine,
      ),
    );

    // 「今日から」フラグが立っている場合
    if (fromToday) {
      setRoutineFromToday(routine);
    }

    resetState();
  };

  // ルーティーンの編集処理
  const editRoutineHandler = () => {
    if (!editRoutine) return;
    if (!validate()) return;

    // すでに同じ時間帯にルーティーンが存在している場合はアラートを表示して終了
    // 自分自身は除外する
    const existedRoutine = realm.objects(Routine).filtered('_id != $0', editRoutine._id);

    // 既存ルーティンの中で、開始時間と終了時間が今回追加しようとしているルーティンの時間帯に被っているものを抽出
    if (!existedRoutine.isEmpty()) {
      const overlappedRoutine = existedRoutine.find((element: Routine) => {
        const startHour = startedAt.getHours();
        const endHour = endedAt.getHours();

        if (element.startedAt.getHours() <= startHour && element.endedAt.getHours() >= startHour) {
          // 開始時間の前後が被っている場合
          if (element.endedAt.getHours() === startHour) {
            // 開始時間の分まで考慮する
            if (element.endedAt.getMinutes() >= startedAt.getMinutes()) {
              // 開始時間の分数が既存のルーティンの終了時間の分数より大きい場合は被っている
              return true;
            } else {
              return false;
            }
          }
          return true;
        } else if (
          element.startedAt.getHours() <= endHour &&
          element.endedAt.getHours() >= endHour
        ) {
          // 終了時間の前後が被っている場合
          if (element.startedAt.getHours() === endHour) {
            // 終了時間の分まで考慮する
            if (element.startedAt.getMinutes() <= endedAt.getMinutes()) {
              return true; // 終了時間の分数が既存のルーティンの開始時間の分数より大きい場合は被っている
            } else {
              return false;
            }
          }
        } else if (
          element.startedAt.getHours() >= startHour &&
          element.endedAt.getHours() <= endHour
        ) {
          // 完全に被っている場合
          return true;
        }
      });

      if (overlappedRoutine) {
        Alert.alert('', `編集した時間帯にすでに【${overlappedRoutine.title}】が存在しています`, [
          { text: 'OK', style: 'default' },
        ]);
        return;
      }
    }

    realm.write(() => {
      editRoutine.title = title;
      editRoutine.color = routineColor;
      editRoutine.cycle = cycle;
      editRoutine.cycleValue = cycleValue.join(',');
      editRoutine.startedAt = startedAt;
      editRoutine.endedAt = endedAt;
    });

    // 「今日から」フラグが立っている場合
    if (fromToday) {
      setRoutineFromToday(editRoutine);
    }

    resetState();
  };

  // リセット処理
  const resetState = () => {
    setVisible(false);
    setModalType('add');
    // 値を初期化
    setTitle('');
    setRoutineColor(DefaultChartColor);
    setEndedAt(new Date());
    setStartedAt(new Date());
    setEditRoutine(null);
    setFromToday(false);
    setCycle('everyday');
    setCycleValue([]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'ルーティーン設定',
          headerBackTitle: '戻る',
          headerRight: () => {
            return (
              <TouchableOpacity onPress={() => setVisible(true)}>
                <Ionicons name="add-circle-outline" size={22} color={'gray'} />
              </TouchableOpacity>
            );
          },
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ marginTop: 10 }}>
          <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>固定ルーティーン</Text>
          <View style={{ ...styles.card, backgroundColor: colors.card }}>
            {routines.length === 0 ? (
              <View
                style={{
                  ...styles.sectionListItemView,
                  borderBottomWidth: 0,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16, color: colors.text }}>
                  固定ルーティーンはまだありません
                </Text>
              </View>
            ) : (
              <FlatList
                data={routines}
                keyExtractor={item => item._id.toString()}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      ...styles.sectionListItemView,
                      borderBottomWidth: routines.length === index + 1 ? 0 : 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, color: colors.text }}>{item.title}</Text>
                        <View
                          style={{
                            backgroundColor: item.color,
                            width: 15,
                            height: 15,
                            marginHorizontal: 5,
                          }}
                        ></View>
                      </View>
                      <Text style={{ color: 'gray', paddingLeft: 5 }}>
                        {convertCycleStr(item.cycle, item.cycleValue ?? '')}
                      </Text>
                    </View>
                    <View
                      style={{
                        justifyContent: 'center',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
                        {item.startedAt.toLocaleTimeString('ja-JP', {
                          hour: 'numeric',
                          minute: 'numeric',
                        })}
                      </Text>
                      <Text style={{ fontSize: 16, paddingHorizontal: 5, color: colors.text }}>
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
                          setModalType('edit');
                          setEditRoutine(item);
                          setTitle(item.title);
                          setRoutineColor(item.color);
                          setStartedAt(item.startedAt);
                          setEndedAt(item.endedAt);
                          setCycle(item.cycle);
                          setCycleValue(
                            item.cycleValue.split(',').filter(Boolean).map(Number) ?? [],
                          );
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
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Banner size={BannerAdSize.LARGE_BANNER} />
        </View>
      </ScrollView>
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
            color={'gray'}
            style={{ padding: 10 }}
            onPress={() => resetState()}
          />
        </View>
        <ScrollView
          contentContainerStyle={{
            backgroundColor: colors.card,
            paddingBottom: 40,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 30,
            paddingVertical: 20,
          }}
          style={{ backgroundColor: colors.card }}
        >
          <View style={{ width: '100%' }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>
                ルーティーン名
              </Text>
              <TextInput
                placeholder="ルーティーンの名前を入力"
                style={{
                  borderWidth: 1,
                  borderColor: 'lightgray',
                  borderRadius: 10,
                  padding: 10,
                  fontSize: 16,
                  color: colors.text,
                }}
                inputAccessoryViewID={'routineNameInput'}
                value={title}
                onChangeText={text => setTitle(text)}
              />
              <TextInputAccessory accessoryId={'routineNameInput'} />
            </View>
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: 'row',
                  paddingTop: 5,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>
                  固定サイクル
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: cycle === 'everyday' ? Colors.light.tint : colors.background,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                      borderRadius: 10,
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                      marginRight: 0,
                    }}
                    onPress={() => {
                      setCycle('everyday');
                      // 曜日指定の値をクリア
                      setCycleValue([]);
                    }}
                  >
                    <Text
                      style={{ fontSize: 18, color: cycle === 'everyday' ? '#fff' : colors.text }}
                    >
                      毎日
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      backgroundColor:
                        cycle === 'dayofweek' ? Colors.light.tint : colors.background,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 10,
                      paddingVertical: 7,
                      borderRadius: 10,
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                    }}
                    onPress={() => setCycle('dayofweek')}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        color: cycle === 'dayofweek' ? '#fff' : colors.text,
                      }}
                    >
                      曜日指定
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              {cycle === 'dayofweek' && (
                <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'center' }}>
                  {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                    return (
                      <TouchableOpacity
                        key={`dayofweek_${dayOfWeek}`}
                        style={{
                          backgroundColor: cycleValue.includes(dayOfWeek)
                            ? Colors.light.tint
                            : colors.background,
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingHorizontal: 13,
                          paddingVertical: 5,
                          borderRadius: 5,
                          marginHorizontal: 5,
                        }}
                        onPress={() => {
                          if (!cycleValue.includes(dayOfWeek)) {
                            setCycleValue([...cycleValue, dayOfWeek]);
                          } else {
                            setCycleValue(cycleValue.filter(d => d !== dayOfWeek));
                          }
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            color: cycleValue.includes(dayOfWeek) ? '#fff' : colors.text,
                          }}
                        >
                          {getDayOfWeekStr(dayOfWeek)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>カラー</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', paddingTop: 10 }}>
                {ChartColors.map((color, index) => {
                  return (
                    <TouchableOpacity
                      key={`color_${index}`}
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
            <View
              style={{
                marginBottom: 20,
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'row',
              }}
            >
              <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>
                今日からルーティーンをセットする
              </Text>
              <Switch value={fromToday} onValueChange={value => setFromToday(value)} />
            </View>
            <TouchableOpacity
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: Colors.light.tint,
                marginTop: 30,
              }}
              onPress={() => {
                if (modalType === 'edit') {
                  editRoutineHandler();
                } else {
                  createRoutine();
                }
              }}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                {modalType === 'add' ? '追加する' : '保存する'}
              </Text>
            </TouchableOpacity>
            {modalType !== 'add' && (
              <TouchableOpacity
                style={{
                  top: 0,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderColor: 'red',
                  borderWidth: 1,
                  marginTop: 30,
                }}
                onPress={() => {
                  Alert.alert(
                    'ルーティーンを削除しますか？',
                    '削除したデータは復元できません。',
                    [
                      {
                        text: 'キャンセル',
                        style: 'cancel',
                      },
                      {
                        text: '削除',
                        style: 'destructive',
                        onPress: () => {
                          realm.write(() => {
                            realm.delete(editRoutine);
                          });
                          resetState();
                        },
                      },
                    ],
                    { cancelable: false },
                  );
                }}
              >
                <Text style={{ fontWeight: 'bold', color: 'red', textAlign: 'center' }}>
                  ルーティーンを削除する
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 10,
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
});

export default SettingRoutine;
