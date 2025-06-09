import { Colors } from '@/constants/Colors';
import { User } from '@/lib/realmSchema';
import { useThemeContext } from '@/Themecontext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useQuery, useRealm } from '@realm/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const { colors } = useTheme();
  const { isDark, toggleTheme } = useThemeContext();
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
      <View style={{ ...styles.card, backgroundColor: colors.card }}>
        <View style={{ ...styles.sectionListItemView, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 16, color: colors.text }}>ユーザー名</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>{user.name}</Text>
        </View>
        <View style={{ ...styles.sectionListItemView, borderBottomWidth: 0 }}>
          <Text style={{ fontSize: 16, color: colors.text }}>メールアドレス</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>{user.email}</Text>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>設定</Text>
        <View style={{ ...styles.card, backgroundColor: colors.card }}>
          <View
            style={{
              ...styles.sectionListItemView,
              paddingVertical: 5,
              borderBottomColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 16, color: colors.text }}>テーマ</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text
                style={{ fontSize: 16, fontWeight: 'bold', paddingRight: 5, color: colors.text }}
              >
                {isDark ? (
                  <Ionicons
                    name="moon"
                    size={20}
                    color={'#B771E5'}
                    style={{ paddingHorizontal: 5 }}
                  />
                ) : (
                  <Ionicons
                    name="sunny"
                    size={20}
                    color={'#FF9D23'}
                    style={{ paddingHorizontal: 5 }}
                  />
                )}
              </Text>
              <Switch
                value={isDark}
                onValueChange={value => {
                  toggleTheme();
                  realm.write(() => {
                    user.theme = value ? 'dark' : 'light'; // ユーザーのテーマを更新
                  });
                }}
              />
            </View>
          </View>
          <View style={{ ...styles.sectionListItemView, borderBottomColor: colors.border }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
              }}
              onPress={() => router.navigate('/setting-routine')}
            >
              <Text style={{ fontSize: 16, color: colors.text }}>ルーティーン</Text>
              <Ionicons name="chevron-forward" color={colors.text} size={14} />
            </TouchableOpacity>
          </View>
          <View style={{ ...styles.sectionListItemView, borderBottomWidth: 0 }}>
            <Text style={{ fontSize: 16, color: colors.text }}>プラン</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
              フリープラン
            </Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>アプリ</Text>
        <View style={{ ...styles.card, backgroundColor: colors.card }}>
          <View style={{ ...styles.sectionListItemView, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 16, color: colors.text }}>バージョン</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>1.0.0</Text>
          </View>
          <View style={{ ...styles.sectionListItemView, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 16, color: colors.text }}>プライバシーポリシー</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>外部リンク</Text>
          </View>
          <View style={{ ...styles.sectionListItemView, borderBottomWidth: 0 }}>
            <Text style={{ fontSize: 16, color: colors.text }}>ご要望</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>こちらから</Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 40 }}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'アカウントを削除しますか？',
              'ユーザーに紐づく全てのデータが削除されます。削除したデータを復元することはできません。',
              [
                {
                  text: 'キャンセル',
                  style: 'cancel',
                },
                {
                  text: '削除する',
                  style: 'destructive',
                  onPress: () => {
                    realm.write(() => {
                      realm.deleteAll(); // 全てのデータを削除
                    });
                    router.replace('/create-user'); // ユーザー削除後にユーザー作成画面へ遷移
                  },
                },
              ],
            );
          }}
          style={{
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderRadius: 10,
            borderColor: 'red',
            borderWidth: 1,
            marginTop: 30,
          }}
        >
          <Text style={{ fontSize: 16, color: 'red', textAlign: 'center' }}>アカウントの削除</Text>
        </TouchableOpacity>
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
            backgroundColor: colors.card,
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
              color={'gray'}
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
                <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>
                  ユーザー名
                </Text>
                <TextInput
                  defaultValue={name}
                  onChangeText={value => setName(value)}
                  style={{
                    color: colors.text,
                    borderColor: 'lightgray',
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 8,
                    fontSize: 16,
                  }}
                />
              </View>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>
                  メールアドレス
                </Text>
                <TextInput
                  defaultValue={email}
                  onChangeText={value => setEmail(value)}
                  keyboardType="email-address"
                  style={{
                    color: colors.text,
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
