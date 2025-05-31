import { Colors } from '@/constants/Colors';
import { Record, User } from '@/lib/realmSchema';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery, useRealm } from '@realm/react';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

const SettingRoutine = () => {
  const router = useRouter();
  const realm = useRealm(); // Realmのインスタンスを取得
  const users = useQuery(User);
  if (users.isEmpty() || !users[0]) {
    // ユーザーが存在しない場合は、エラー画面を表示する
    router.navigate('/create-user');
  }
  const user = users[0];

  const [title, setTitle] = useState('');
  const [startedAt, setStartedAt] = useState(new Date());
  const [endedAt, setEndedAt] = useState(new Date());
  const [visible, setVisible] = useState(false);

  const routines = useQuery(Record).filtered('type == 2').sorted('startedAt');

  // ルーティンの作成処理
  const onAddRoutineRecord = () => {
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

    setVisible(false);
    // 値を初期化
    setTitle('');
    setEndedAt(new Date());
    setStartedAt(new Date());
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
                <Ionicons name="add-circle-outline" size={22} />
              </TouchableOpacity>
            );
          },
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ marginTop: 10 }}>
          <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>固定ルーティン</Text>
          <View style={styles.card}>
            {routines.length === 0 ? (
              <View
                style={{
                  ...styles.sectionListItemView,
                  borderBottomWidth: 0,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 16 }}>固定ルーティンはまだありません</Text>
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
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{item.title}</Text>
                    <View style={{ justifyContent: 'center', flexDirection: 'row' }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                        {item.startedAt.toLocaleTimeString('ja-JP', {
                          hour: 'numeric',
                          minute: 'numeric',
                        })}
                      </Text>
                      <Text style={{ fontSize: 16, paddingHorizontal: 5 }}>〜</Text>
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
            )}
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
        </TouchableWithoutFeedback>
        <View
          style={{
            height: 'auto',
            backgroundColor: 'white',
            marginTop: 'auto',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingBottom: 40,
          }}
        >
          <View style={{ alignItems: 'flex-end', padding: 10, paddingBottom: 0 }}>
            <TouchableOpacity
              onPress={() => {
                setTitle('');
                setStartedAt(new Date());
                setEndedAt(new Date());
                setVisible(false);
              }}
            >
              <Ionicons name="close-circle-outline" size={26} color="black" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 30,
              paddingVertical: 20,
            }}
          >
            <View style={{ width: '100%' }}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, paddingBottom: 5 }}>ルーティーン名</Text>
                <TextInput
                  placeholder="ルーティーンの名前を入力"
                  style={{
                    borderWidth: 1,
                    borderColor: 'lightgray',
                    borderRadius: 10,
                    padding: 10,
                    fontSize: 16,
                    backgroundColor: '#fff',
                  }}
                  value={title}
                  onChangeText={text => setTitle(text)}
                />
              </View>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, paddingBottom: 5 }}>時間</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <DateTimePicker
                    value={startedAt}
                    mode="time"
                    display="spinner"
                    style={{ flex: 1, marginRight: 10 }}
                    onChange={(event, date) => {
                      if (!date) return;
                      setStartedAt(date);
                    }}
                  />
                  <Text>〜</Text>
                  <DateTimePicker
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
                onPress={onAddRoutineRecord}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>追加</Text>
              </TouchableOpacity>
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
