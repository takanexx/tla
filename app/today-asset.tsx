import Banner from '@/components/Banner';
import TextInputAccessory from '@/components/ui/TextIputAccesory';
import { ChartColors, Colors, DefaultChartColor } from '@/constants/Colors';
import { Record, User } from '@/lib/realmSchema';
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
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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

  const { colors } = useTheme();
  const { isDark } = useThemeContext();
  const [today, setToday] = useState(new Date());
  const [title, setTitle] = useState('');
  const [routineColor, setRoutineColor] = useState(DefaultChartColor);
  const [startedAt, setStartedAt] = useState(new Date());
  const [endedAt, setEndedAt] = useState(new Date());
  const [visible, setVisible] = useState(false);
  const [editRoutine, setEditRoutine] = useState<Record | null>(null);
  const [editType, setEditType] = useState<'routine' | 'record'>('routine');

  const routines = useQuery(Record)
    .filtered(
      'routineId != null and date >= $0',
      new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    )
    .sorted('startedAt');
  const records = useQuery(Record)
    .filtered(
      'routineId == null and date >= $0',
      new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    )
    .sorted('startedAt');

  // ルーティンの編集処理
  const editRoutineHandler = () => {
    if (!editRoutine) return;

    let query = 'routineId != null';
    if (editType === 'record') {
      query = 'routineId == null';
    }

    if (
      !realm
        .objects(Record)
        .filtered(
          `startedAt <= $0 and endedAt >= $0 and _id != $1 and ${query}`,
          startedAt,
          editRoutine._id,
        )
        .isEmpty() ||
      !realm
        .objects(Record)
        .filtered(
          `startedAt <= $0 and endedAt >= $0 and _id != $1 and ${query}`,
          endedAt,
          editRoutine._id,
        )
        .isEmpty()
    ) {
      Alert.alert('', '編集した時間帯にすでにルーティーンが存在しています', [
        { text: 'OK', style: 'default' },
      ]);
      return;
    }

    realm.write(() => {
      editRoutine.title = title;
      editRoutine.color = routineColor;
      editRoutine.startedAt = startedAt;
      editRoutine.endedAt = endedAt;
    });

    resetState();
  };

  // リセット処理
  const resetState = () => {
    setVisible(false);
    // 値を初期化
    setTitle('');
    setRoutineColor(DefaultChartColor);
    setEndedAt(new Date());
    setStartedAt(new Date());
    setEditRoutine(null);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `${today.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric' })} アセット`,
          headerBackTitle: '戻る',
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ marginTop: 10 }}>
          <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>固定ルーティン</Text>
          <View style={{ ...styles.card, backgroundColor: colors.card }}>
            {routines.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: colors.text }}>今日のルーティーンはありません</Text>
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
                          setEditRoutine(item);
                          setTitle(item.title);
                          setRoutineColor(item.color);
                          setStartedAt(item.startedAt);
                          setEndedAt(item.endedAt);
                          setEditType('routine');
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
        <View style={{ marginTop: 30 }}>
          <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>投資した時間</Text>
          <View style={{ ...styles.card, backgroundColor: colors.card }}>
            {records.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: colors.text }}>今日の投資時間はありません</Text>
              </View>
            ) : (
              <FlatList
                data={records}
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
                          setEditRoutine(item);
                          setTitle(item.title);
                          setRoutineColor(item.color);
                          setStartedAt(item.startedAt);
                          setEndedAt(item.endedAt);
                          setEditType('record');
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
              alignItems: 'flex-end',
              padding: 10,
              paddingBottom: 0,
            }}
          >
            <TouchableOpacity onPress={() => resetState()}>
              <Ionicons name="close-circle-outline" size={26} color="gray" />
            </TouchableOpacity>
          </View>
          <ScrollView
            contentContainerStyle={{
              backgroundColor: colors.card,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 30,
              paddingVertical: 20,
              paddingBottom: 50,
            }}
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
                  inputAccessoryViewID={'routineName'}
                  value={title}
                  onChangeText={text => setTitle(text)}
                />
                <TextInputAccessory accessoryId={'routineName'} />
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
                onPress={() => {
                  editRoutineHandler();
                }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                  保存する
                </Text>
              </TouchableOpacity>
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
                    'データを削除しますか？',
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
                  削除する
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
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
