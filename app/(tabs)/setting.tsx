import { Colors } from '@/constants/Colors';
import { User } from '@/lib/realmSchema';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useRealm } from '@realm/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function SettingScreen() {
  const router = useRouter();
  const realm = useRealm(); // Realmのインスタンスを取得
  const users = useQuery(User); // 現在のユーザーを取得
  if (users.isEmpty() || !users[0]) {
    // ユーザーが存在しない場合は、エラー画面を表示する
    router.navigate('/create-user');
  }

  const user = users[0]; // 最初のユーザーを取得
  const [isDarkMode, setIsDarkMode] = useState(user.theme === 'dark');
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  // ユーザー情報を更新する関数
  const onUpdateUser = () => {
    realm.write(() => {
      user.name = name; // ユーザー名を更新
      user.email = email; // メールアドレスを更新
    });
    setVisible(false); // モーダルを閉じる
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>ユーザー</Text>
        <TouchableOpacity onPress={() => setVisible(true)}>
          <Text style={{ padding: 5, fontWeight: 'bold', color: Colors.light.tint }}>編集</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <View style={styles.sectionListItemView}>
          <Text style={{ fontSize: 16 }}>ユーザー名</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{user.name}</Text>
        </View>
        <View style={{ ...styles.sectionListItemView, borderBottomWidth: 0 }}>
          <Text style={{ fontSize: 16 }}>メールアドレス</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{user.email}</Text>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>設定</Text>
        <View style={styles.card}>
          <View style={{ ...styles.sectionListItemView, paddingVertical: 5 }}>
            <Text style={{ fontSize: 16 }}>テーマ</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', paddingRight: 5 }}>
                {isDarkMode ? 'ダーク' : 'ライト'}
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={value => {
                  setIsDarkMode(value);
                  realm.write(() => {
                    user.theme = value ? 'dark' : 'light'; // ユーザーのテーマを更新
                  });
                }}
              />
            </View>
          </View>
          <View style={{ ...styles.sectionListItemView, borderBottomWidth: 0 }}>
            <Text style={{ fontSize: 16 }}>プラン</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>フリープラン</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>アプリ</Text>
        <View style={styles.card}>
          <View style={styles.sectionListItemView}>
            <Text style={{ fontSize: 16 }}>バージョン</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>1.0.0</Text>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
        </TouchableWithoutFeedback>
        <SafeAreaView
          style={{
            height: 'auto',
            backgroundColor: 'white',
            marginTop: 'auto',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            marginBottom: 40,
          }}
        >
          <View style={{ alignItems: 'flex-end', padding: 10, paddingBottom: 0 }}>
            <Ionicons
              name="close-circle-outline"
              size={26}
              color="black"
              onPress={() => setVisible(false)}
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
                <Text style={{ fontSize: 16, paddingBottom: 5 }}>ユーザー名</Text>
                <TextInput
                  defaultValue={name}
                  onChangeText={value => setName(value)}
                  style={{
                    borderColor: 'lightgray',
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 8,
                    fontSize: 16,
                  }}
                />
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, paddingBottom: 5 }}>メールアドレス</Text>
                <TextInput
                  defaultValue={email}
                  onChangeText={value => setEmail(value)}
                  keyboardType="email-address"
                  style={{
                    borderColor: 'lightgray',
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 8,
                    fontSize: 16,
                  }}
                />
              </View>
              <TouchableOpacity
                onPress={onUpdateUser}
                style={{
                  marginTop: 20,
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: Colors.light.tint,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>保存する</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

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
