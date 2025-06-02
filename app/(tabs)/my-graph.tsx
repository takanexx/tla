import { Colors } from '@/constants/Colors';
import { Exam, ExamResult, User } from '@/lib/realmSchema';
import { useThemeContext } from '@/Themecontext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@react-navigation/native';
import { useQuery, useRealm } from '@realm/react';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

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
  const router = useRouter();
  const realm = useRealm();
  const users = useQuery(User); // 現在のユーザーを取得
  if (users.isEmpty() || !users[0]) {
    // ユーザーが存在しない場合は、エラー画面を表示する
    router.navigate('/create-user');
  }
  const user = users[0]; // 最初のユーザーを取得
  // ユーザーに紐づく試験データを取得
  const exam = useQuery(Exam).filtered('userId == $0', user._id.toString())[0] ?? null; // ユーザーに紐づく試験データを取得
  let firstShowChartData = null;

  if (exam?.results.length > 0) {
    firstShowChartData = {
      labels: exam?.results
        .sorted('date')
        .map(result =>
          result.date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
        ),
      datasets: [
        {
          data: exam?.results.sorted('date').map(result => result.score),
          strokeWidth: 2,
        },
      ],
    };
  }
  const { colors } = useTheme();
  const { isDark, toggleTheme } = useThemeContext();
  const [chartData, setChartData] = useState<Object | any>(firstShowChartData);
  const [visible, setVisible] = useState(false);
  const [visibleAddResultModal, setVisibleAddResultModal] = useState(false);
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [score, setScore] = useState<number | null>(null);
  const [editData, setEditData] = useState({
    title: '',
    date: new Date(),
  });
  const [isDeleteProgress, setIsDeleteProgress] = useState(false);

  // 試験データの作成処理
  const onCreateExam = () => {
    const examResults: ExamResult[] = [];
    // 試験結果がある場合は、試験結果を作成
    if (date && score) {
      const examResult: ExamResult = ExamResult.generate({
        date: date,
        score: score,
      }) as unknown as ExamResult;
      examResults.push(examResult);

      // チャートデータを更新
      setChartData({
        labels: [date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })],
        datasets: [
          {
            data: [score],
            strokeWidth: 2,
          },
        ],
      });
    }

    // 試験データを作成（試験結果を含む）
    realm.write(() => {
      realm.create(
        'Exam',
        Exam.generate({ userId: user._id.toString(), title: title, results: examResults }),
      );
    });

    // タイトルを空にしてモーダルを閉じる
    setTitle('');
    setVisible(false);
    setDate(new Date());
    setScore(null);
  };

  // 試験結果の追加処理
  const onAddExamResult = () => {
    if (score === null) return;

    // 試験結果を作成し試験データに追加
    const examResult: ExamResult = ExamResult.generate({
      date: date,
      score: score,
    }) as unknown as ExamResult;
    realm.write(() => {
      exam?.results.push(examResult);
    });

    // チャートデータを更新
    setChartData({
      labels: exam?.results
        .sorted('date')
        .map(result =>
          result.date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' }),
        ),
      datasets: [
        {
          data: exam?.results.sorted('date').map(result => result.score),
          strokeWidth: 2,
        },
      ],
    });

    setVisibleAddResultModal(false);
    setDate(new Date());
    setScore(null);
  };

  if (!exam) {
    return (
      <View style={{ padding: 20 }}>
        <SafeAreaView>
          <Text style={styles.title}>試験データ</Text>
        </SafeAreaView>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 60,
          }}
        >
          <Text style={{ fontSize: 18, color: 'gray' }}>試験データがありません</Text>
          <TouchableOpacity
            style={{
              paddingHorizontal: 30,
              paddingVertical: 10,
              borderRadius: 5,
              backgroundColor: Colors.light.tint,
              marginTop: 20,
            }}
            onPress={() => setVisible(true)}
          >
            <Text style={{ fontWeight: 'bold', color: '#fff' }}>試験データを作成</Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          presentationStyle="pageSheet"
          visible={visible}
          onRequestClose={() => setVisible(false)}
          style={{ backgroundColor: colors.card }}
        >
          <View style={{ alignItems: 'flex-end', backgroundColor: colors.card }}>
            <Ionicons
              name="close-circle-outline"
              size={26}
              color={'gray'}
              style={{ padding: 10 }}
              onPress={() => setVisible(false)}
            />
          </View>
          <View
            style={{
              alignItems: 'center',
              padding: 20,
              height: '100%',
              backgroundColor: colors.card,
            }}
          >
            <View style={{ width: '100%' }}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>試験名</Text>
                <TextInput
                  defaultValue={title}
                  style={{
                    width: '100%',
                    borderColor: 'lightgray',
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 8,
                    fontSize: 16,
                    color: colors.text,
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
                <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>試験日</Text>
                <DateTimePicker
                  themeVariant={isDark ? 'dark' : 'light'}
                  value={date}
                  mode="date"
                  locale="ja-JP"
                  onChange={(event, value) => {
                    if (!value) return;
                    setDate(value);
                  }}
                />
              </View>

              <View
                style={{
                  marginBottom: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>点数</Text>
                <TextInput
                  defaultValue=""
                  keyboardType="numeric"
                  style={{
                    color: colors.text,
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
        <Text style={{ ...styles.title, color: colors.text }}>試験データ</Text>
        <TouchableOpacity onPress={() => setVisibleEditModal(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="gray" style={{ marginBottom: 10 }} />
        </TouchableOpacity>
      </SafeAreaView>

      <View>
        <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>最近の試験結果</Text>
        <View style={{ ...styles.card, backgroundColor: colors.card }}>
          <View style={{ ...styles.sectionListItemView, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 16, color: colors.text }}>試験名</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
              {exam?.title}
            </Text>
          </View>
          <View style={{ ...styles.sectionListItemView, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 16, color: colors.text }}>試験日</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
              {exam?.results.length > 0
                ? exam?.results.sorted('date', true)[0].date.toLocaleDateString('ja-JP')
                : 'ー'}
            </Text>
          </View>
          <View style={{ ...styles.sectionListItemView, borderBottomWidth: 0 }}>
            <Text style={{ fontSize: 16, color: colors.text }}>点数</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
              {exam?.results.length > 0 ? `${exam?.results[0]?.score}点` : 'ー'}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>グラフ</Text>
        <View style={{ ...styles.card, backgroundColor: colors.card }}>
          <Text style={{ fontWeight: 'bold', color: 'gray', padding: 5, textAlign: 'center' }}>
            {exam?.title}
          </Text>
          {!chartData ? (
            <Text style={{ fontSize: 16, textAlign: 'center', color: colors.text }}>
              試験結果はまだありません
            </Text>
          ) : (
            <LineChart
              transparent
              fromZero
              data={chartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              yAxisSuffix="点"
              yAxisInterval={20}
              formatYLabel={value => {
                return Math.trunc(Number(value)).toString();
              }}
            />
          )}
        </View>
      </View>

      <View style={{ marginTop: 20 }}>
        <View style={{ alignItems: 'center', flexDirection: 'row' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>結果一覧</Text>
            <TouchableOpacity
              style={{ paddingLeft: 10 }}
              onPress={() => setVisibleAddResultModal(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="gray" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <TouchableOpacity
              style={{ paddingLeft: 10 }}
              onPress={() => {
                if (!exam?.results.length) return;
                setIsDeleteProgress(!isDeleteProgress);
              }}
            >
              <Ionicons
                name={isDeleteProgress ? 'arrow-undo-outline' : 'trash-outline'}
                size={20}
                color={isDeleteProgress ? 'gray' : 'red'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ ...styles.card, backgroundColor: colors.card }}>
          {exam?.results.length === 0 ? (
            // 試験結果がまだない場合
            <View
              style={{
                ...styles.sectionListItemView,
                borderBottomWidth: 0,
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 16, color: colors.text }}>試験結果はまだありません</Text>
            </View>
          ) : (
            // 試験結果がある場合
            <FlatList
              data={exam?.results.sorted('date')}
              keyExtractor={item => item.date.toString()}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <View
                  style={{
                    ...styles.sectionListItemView,
                    borderBottomWidth: exam?.results.length === index + 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isDeleteProgress && (
                      <TouchableOpacity
                        onPress={() => {
                          // 対象の試験結果を削除する
                          // NOTE: 試験結果一覧のデータはソート後のデータであるため、indexをそのまま使うことはできないかつ、
                          //       sorted()後のデータを使ってもデータ自体更新はされないので、ソート前と後のデータを比較して削除する
                          let deleteIndex: number = -1;
                          exam?.results.forEach((result, i) => {
                            if (
                              result.date.getTime() === item.date.getTime() &&
                              result.score === item.score
                            ) {
                              deleteIndex = i;
                            }
                          });
                          if (deleteIndex === -1) return;

                          // 試験結果を削除
                          realm.write(() => {
                            exam?.results.splice(deleteIndex, 1);
                          });

                          let data = null;
                          if (exam?.results.length > 0) {
                            data = {
                              labels: exam?.results.sorted('date').map(result =>
                                result.date.toLocaleDateString('ja-JP', {
                                  month: 'numeric',
                                  day: 'numeric',
                                }),
                              ),
                              datasets: [
                                {
                                  data: exam?.results.sorted('date').map(result => result.score),
                                  strokeWidth: 2,
                                },
                              ],
                            };
                          }
                          setChartData(data);
                          setIsDeleteProgress(false);
                        }}
                      >
                        <Ionicons
                          name="remove-circle"
                          size={22}
                          color="red"
                          style={{ marginRight: 10 }}
                        />
                      </TouchableOpacity>
                    )}
                    <Text style={{ fontSize: 16, color: colors.text }}>
                      {item.date.toLocaleDateString('ja-JP')}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
                    {item.score}点
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>

      {/* 試験結果追加モーダル */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visibleAddResultModal}
        onRequestClose={() => setVisibleAddResultModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisibleAddResultModal(false)}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
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
          <View style={{ alignItems: 'flex-end', padding: 10, paddingBottom: 0 }}>
            <Ionicons
              name="close-circle-outline"
              size={26}
              color={'gray'}
              onPress={() => setVisibleAddResultModal(false)}
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
              <View
                style={{
                  marginBottom: 20,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>試験日</Text>
                <DateTimePicker
                  themeVariant={isDark ? 'dark' : 'light'}
                  value={date}
                  mode="date"
                  locale="ja-JP"
                  onChange={(event, dateVal) => {
                    if (event.type === 'dismissed') return;
                    setDate(dateVal ?? new Date());
                  }}
                />
              </View>

              <View
                style={{
                  marginBottom: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>点数</Text>
                <TextInput
                  defaultValue=""
                  keyboardType="numeric"
                  style={{
                    color: colors.text,
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
              <TouchableOpacity
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: Colors.light.tint,
                  marginTop: 10,
                }}
                onPress={onAddExamResult}
              >
                <Text style={{ fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
                  追加する
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={visibleEditModal}
        onRequestClose={() => setVisibleEditModal(false)}
      >
        <View style={{ alignItems: 'flex-end', backgroundColor: colors.card }}>
          <Ionicons
            name="close-circle-outline"
            size={26}
            color={'gray'}
            style={{ padding: 10 }}
            onPress={() => setVisibleEditModal(false)}
          />
        </View>
        <View
          style={{
            alignItems: 'center',
            padding: 20,
            backgroundColor: colors.card,
            height: '100%',
          }}
        >
          <View style={{ width: '100%' }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, paddingBottom: 5, color: colors.text }}>試験名</Text>
              <TextInput
                defaultValue={exam?.title}
                style={{
                  color: colors.text,
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
          </View>
          <View style={{ width: '100%' }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
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
                          realm.delete(exam);
                        });
                        setVisibleEditModal(false);
                        setChartData(null);
                      },
                    },
                  ],
                  { cancelable: false },
                );
              }}
            >
              <Text style={{ fontWeight: 'bold', color: 'red', textAlign: 'center' }}>
                試験データを削除する
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
    paddingBottom: 100,
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
