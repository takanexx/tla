import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRealm } from '@realm/react';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import {
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
  const realm = useRealm(); // Realmのインスタンスを取得
  const [title, setTitle] = useState('');
  const [startedAt, setStartedAt] = useState(new Date());
  const [endedAt, setEndedAt] = useState(new Date());
  const [visible, setVisible] = useState(false);

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
        <View style={{ marginTop: 20 }}>
          <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>固定ルーティン</Text>
          <View style={styles.card}>
            <View style={styles.sectionListItemView}>
              <Text style={{ fontSize: 16 }}>ほげほげ</Text>
              <View>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>1.0.0</Text>
              </View>
            </View>
            <View style={styles.sectionListItemView}>
              <Text style={{ fontSize: 16 }}>プライバシーポリシー</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>外部リンク</Text>
            </View>
            <View style={{ ...styles.sectionListItemView, borderBottomWidth: 0 }}>
              <Text style={{ fontSize: 16 }}>ご要望</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>こちらから</Text>
            </View>
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
            <Ionicons
              name="close-circle-outline"
              size={26}
              color="black"
              onPress={() => {
                setTitle('');
                setStartedAt(new Date());
                setEndedAt(new Date());
                setVisible(false);
              }}
            />
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
                onPress={() => {
                  setVisible(false);
                  setTitle('');
                  setStartedAt(new Date());
                  setEndedAt(new Date());
                }}
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
