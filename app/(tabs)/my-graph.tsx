import { Colors } from '@/constants/Colors';
import { Exam, ExamResult } from '@/lib/realmSchema';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery, useRealm } from '@realm/react';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const data = {
  labels: ['1月', '3月', '4月', '7月', '8月', '9月'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
      strokeWidth: 2,
    },
  ],
};

const chartConfig = {
  backgroundGradientFrom: '#1E2923',
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: '#08130D',
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(13, 111, 168, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false, // optional
};

export default function MyGraphScreen() {
  const realm = useRealm();
  const [exam, setExam] = useState<Exam | null>(useQuery(Exam)[0] ?? null);
  const [visible, setVisible] = useState(false);
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [score, setScore] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    title: '',
    date: new Date(),
  });
  console.log('exam', exam);

  const onCreateExam = () => {
    let examResults: ExamResult[] = [];
    // 試験結果がある場合は、試験結果を作成
    if (date && score) {
      const examResult: ExamResult = ExamResult.generate({
        date: date,
        score: score,
      }) as unknown as ExamResult;
      console.log(examResult);
      examResults.push(examResult);
      console.log(examResults);
    }

    // 試験データを作成（試験結果を含む）
    const newExam = realm.write(() => {
      return realm.create(
        'Exam',
        Exam.generate({ userId: '', title: title, results: examResults }),
      ) as unknown as Exam;
    });
    setExam(newExam);

    // タイトルを空にしてモーダルを閉じる
    setTitle('');
    setVisible(false);
    setDate(new Date());
    setScore(null);
  };

  if (!exam) {
    return (
      <View style={{ padding: 20 }}>
        <SafeAreaView>
          <Text style={styles.title}>試験グラフ</Text>
        </SafeAreaView>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 60 }}>
          <Text style={{ fontSize: 18, color: 'gray' }}>試験データがありません</Text>
          <TouchableOpacity
            style={{ padding: 10, borderRadius: 5, backgroundColor: '#e0e0e0', marginTop: 20 }}
            onPress={() => setVisible(true)}
          >
            <Text style={{ fontWeight: 'bold' }}>試験データを作成</Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          presentationStyle="pageSheet"
          visible={visible}
          onRequestClose={() => setVisible(false)}
        >
          <View style={{ alignItems: 'flex-end' }}>
            <Ionicons
              name="close-circle-outline"
              size={26}
              color="black"
              style={{ padding: 10 }}
              onPress={() => setVisible(false)}
            />
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ width: '100%' }}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, paddingBottom: 5 }}>試験名</Text>
                <TextInput
                  defaultValue={title}
                  style={{
                    width: '100%',
                    borderColor: 'lightgray',
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 8,
                    fontSize: 16,
                  }}
                  onChangeText={text => setTitle(text)}
                />
              </View>
              <View
                style={{
                  marginBottom: 20,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, paddingBottom: 5 }}>試験日</Text>
                <DateTimePicker value={date} mode="date" locale="ja-JP" />
              </View>

              <View
                style={{
                  marginBottom: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontSize: 16, paddingBottom: 5 }}>点数</Text>
                <TextInput
                  defaultValue=""
                  keyboardType="numeric"
                  style={{
                    width: 120,
                    borderColor: 'lightgray',
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 8,
                    fontSize: 16,
                  }}
                  onChangeText={text => setScore(Number(text))}
                />
              </View>
            </View>
            <View style={{ width: '100%' }}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 5,
                  backgroundColor: Colors.light.tint,
                  marginTop: 20,
                }}
                onPress={onCreateExam}
              >
                <Text style={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
                  追加する
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SafeAreaView style={{ justifyContent: 'space-between', flexDirection: 'row', zIndex: 1 }}>
        <Text style={styles.title}>試験グラフ</Text>
        <TouchableOpacity onPress={() => setVisibleEditModal(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="gray" style={{ marginBottom: 10 }} />
        </TouchableOpacity>
      </SafeAreaView>
      <View style={styles.card}>
        <Text style={{ fontWeight: 'bold', color: 'gray', padding: 5, textAlign: 'center' }}>
          {exam?.title}
        </Text>
        <LineChart
          transparent
          data={data}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>結果</Text>
        <View style={styles.card}>
          {exam?.results.length === 0 ? (
            // 試験結果がまだない場合
            <View
              style={{
                ...styles.sectionListItemView,
                borderBottomWidth: 0,
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16 }}>試験結果はまだありません</Text>
            </View>
          ) : (
            // 試験結果がある場合
            exam?.results.map((result, index) => (
              <View
                key={index}
                style={{
                  ...styles.sectionListItemView,
                  borderBottomWidth: exam?.results.length === index + 1 ? 0 : 1,
                }}
              >
                <Text style={{ fontSize: 16 }}>{result.date.toLocaleDateString('ja-JP')}</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{result.score}点</Text>
              </View>
            ))
          )}
        </View>
      </View>
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={visibleEditModal}
        onRequestClose={() => setVisibleEditModal(false)}
      >
        <View style={{ alignItems: 'flex-end' }}>
          <Ionicons
            name="close-circle-outline"
            size={26}
            color="black"
            style={{ padding: 10 }}
            onPress={() => setVisibleEditModal(false)}
          />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%' }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, paddingBottom: 5 }}>試験名</Text>
              <TextInput
                defaultValue={exam?.title}
                style={{
                  width: '100%',
                  borderColor: 'lightgray',
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 8,
                  fontSize: 16,
                }}
                onChangeText={(text: string) => {
                  setEditData({ ...editData, title: text });
                }}
              />
            </View>
            <View
              style={{
                marginBottom: 20,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, paddingBottom: 5 }}>試験日</Text>
              <DateTimePicker value={date} mode="date" locale="ja-JP" />
            </View>

            <View
              style={{
                marginBottom: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{ fontSize: 16, paddingBottom: 5 }}>点数</Text>
              <TextInput
                defaultValue=""
                keyboardType="numeric"
                style={{
                  width: 120,
                  borderColor: 'lightgray',
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 8,
                  fontSize: 16,
                }}
              />
            </View>
          </View>
          <View style={{ width: '100%' }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 5,
                backgroundColor: Colors.light.tint,
                marginTop: 20,
              }}
              onPress={() => {
                realm.write(() => {
                  exam.title = editData.title;
                });
                setVisibleEditModal(false);
              }}
            >
              <Text style={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
                保存する
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                top: 0,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 5,
                borderColor: 'red',
                borderWidth: 1,
                backgroundColor: 'white',
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
                          realm.delete(exam);
                        });
                        setExam(null);
                        setVisibleEditModal(false);
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
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
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
