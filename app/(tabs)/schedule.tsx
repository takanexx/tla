import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { Record } from '@/lib/realmSchema';
import { useQuery } from '@realm/react';
import { Fragment, useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';

export default function ScheduleScreen() {
  const [selected, setSelected] = useState(new Date().toISOString().split('T')[0]);
  const records = useQuery(Record).filtered(
    'type == 1 and startedAt >= $0 and startedAt <= $1',
    new Date(selected),
    new Date(`${selected} 23:59:59`),
  );

  return (
    <>
      <SafeAreaView>
        <Fragment>
          <CalendarList
            theme={{
              // @ts-ignore
              'stylesheet.calendar.header': {
                dayTextAtIndex0: {
                  color: 'red',
                },
                dayTextAtIndex6: {
                  color: 'blue',
                },
              },
            }}
            pagingEnabled={true}
            horizontal={true}
            onDayPress={day => {
              setSelected(day.dateString);
            }}
            markedDates={{
              [selected]: { selected: true, disableTouchEvent: true },
            }}
          />
        </Fragment>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.container}>
        {/* <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>固定スケジュール</Text>
        <View style={styles.card}>
          <View style={styles.sectionListItemView}>
            <Text style={{ fontSize: 16 }}>睡眠</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>23時〜5時</Text>
          </View>
          <View style={{ ...styles.sectionListItemView, borderBottomWidth: 0 }}>
            <Text style={{ fontSize: 16 }}>仕事</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>9時〜18時</Text>
          </View>
        </View> */}

        <View style={{}}>
          <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>
            {`${new Date(selected).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })} `}
            稼働したタスク
          </Text>
          <View style={styles.card}>
            {records.length === 0 ? (
              // 稼働がない場合
              <View
                style={{
                  ...styles.sectionListItemView,
                  borderBottomWidth: 0,
                  justifyContent: 'center',
                }}
              >
                <Text>稼働はありません</Text>
              </View>
            ) : (
              // 稼働がある場合
              <FlatList
                data={records}
                keyExtractor={item => item._id.toString()}
                scrollEnabled={false}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      ...styles.sectionListItemView,
                      borderBottomWidth: records.length === index + 1 ? 0 : 1,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                        {item.startedAt.toLocaleTimeString('ja-JP', {
                          hour: 'numeric',
                          minute: 'numeric',
                        })}
                      </Text>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', paddingHorizontal: 5 }}>
                        〜
                      </Text>
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
      <FloatingActionButton />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    // minHeight: '100%',
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
