import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function SettingScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
