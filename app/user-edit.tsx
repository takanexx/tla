import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function UserEditScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ justifyContent: 'space-between', flexDirection: 'row' }}>
        <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>ユーザー</Text>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
