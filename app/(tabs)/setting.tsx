import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>ユーザー</Text>
        <TouchableOpacity>
          <Text style={{ padding: 5, fontWeight: 'bold', color: Colors.light.tint }}>編集</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <View style={styles.sectionListItemView}>
          <Text style={{ fontSize: 16 }}>ユーザー名</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>ほげほげ</Text>
        </View>
        <View style={styles.sectionListItemView}>
          <Text style={{ fontSize: 16 }}>メールアドレス</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>設定なし</Text>
        </View>
        <View style={{ ...styles.sectionListItemView, borderBottomWidth: 0 }}>
          <Text style={{ fontSize: 16 }}>ご要望</Text>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>こちらから</Text>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>設定</Text>
        <View style={styles.card}>
          <View style={styles.sectionListItemView}>
            <Text style={{ fontSize: 16 }}>ダークモード</Text>
            <Switch value={isDarkMode} onValueChange={value => setIsDarkMode(value)} />
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
