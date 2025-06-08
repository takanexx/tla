import Banner from '@/components/Banner';
import { Colors } from '@/constants/Colors';
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
  const user = users[0];

  const { colors } = useTheme();
  const { isDark } = useThemeContext();
  const [title, setTitle] = useState('');
  const [startedAt, setStartedAt] = useState(new Date());
  const [endedAt, setEndedAt] = useState(new Date());
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [editRoutine, setEditRoutine] = useState<Record | null>(null);

  const routines = useQuery(Record).filtered('type == 2').sorted('startedAt');

  // ルーティンの作成処理
  const onAddRoutineRecord = () => {
    if (
      !realm.objects(Record).filtered('startedAt <= $0 and endedAt >= $0', startedAt).isEmpty() ||
      !realm.objects(Record).filtered('startedAt <= $0 and endedAt >= $0', endedAt).isEmpty()
    ) {
      Alert.alert('', '追加しようとしている時間帯にすでにルーティーンが存在しています', [
        { text: 'OK', style: 'default' },
      ]);
      return;
    }

    realm.write(() => {
      realm.create(
        'Record',
        Record.generate({
          userId: user._id.toString(),
          title: title,
          type: 2, // 固定ルーティン
          startedAt: startedAt,
          endedAt: endedAt,
        }),
      );
    });
    resetState();
  };

  // ルーティンの編集処理
  const onEditRoutineRecord = () => {
    if (!editRoutine) return;

    if (
      !realm
        .objects(Record)
        .filtered('startedAt <= $0 and endedAt >= $0 and _id != $1', startedAt, editRoutine._id)
        .isEmpty() ||
      !realm
        .objects(Record)
        .filtered('startedAt <= $0 and endedAt >= $0 and _id != $1', endedAt, editRoutine._id)
        .isEmpty()
    ) {
      Alert.alert('', '編集した時間帯にすでにルーティーンが存在しています', [
        { text: 'OK', style: 'default' },
      ]);
      return;
    }

    realm.write(() => {
      editRoutine.title = title;
      editRoutine.startedAt = startedAt;
      editRoutine.endedAt = endedAt;
    });

    resetState();
  };

  // リセット処理
  const resetState = () => {
    setVisible(false);
    setModalType('add');
    // 値を初期化
    setTitle('');
    setEndedAt(new Date());
    setStartedAt(new Date());
    setEditRoutine(null);
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
          <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>固定ルーティン</Text>
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
                  固定ルーティンはまだありません
                </Text>
              </View>
            ) : (
              <FlatList
                data={useQuery(Record).filtered('type == 2').sorted('startedAt')}
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
                    <Text style={{ fontSize: 16, color: colors.text }}>{item.title}</Text>
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
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Banner size={BannerAdSize.LARGE_BANNER} />
        </View>
      </ScrollView>
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
              alignItems: 'flex-end',
              padding: 10,
              paddingBottom: 0,
            }}
          >
            <TouchableOpacity onPress={() => resetState()}>
              <Ionicons name="close-circle-outline" size={26} color="gray" />
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
                onPress={() => {
                  if (modalType === 'edit') {
                    onEditRoutineRecord();
                  } else {
                    onAddRoutineRecord();
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
                      '試験データを削除しますか？',
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
                    ルーティンを削除する
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
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
