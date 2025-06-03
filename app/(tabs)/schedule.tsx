import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { Record } from '@/lib/realmSchema';
import { useThemeContext } from '@/Themecontext';
import { useTheme } from '@react-navigation/native';
import { useQuery } from '@realm/react';
import { Fragment, useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CalendarList, LocaleConfig } from 'react-native-calendars';

export default function ScheduleScreen() {
  const { colors } = useTheme();
  const { isDark } = useThemeContext();
  const [selected, setSelected] = useState(new Date().toISOString().split('T')[0]);
  const records = useQuery(Record).filtered(
    'type == 1 and startedAt >= $0 and startedAt <= $1',
    new Date(selected),
    new Date(`${selected} 23:59:59`),
  );
  LocaleConfig.locales['ja'] = {
    monthNames: [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ],
    dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
    locale: 'jp',
  };
  LocaleConfig.defaultLocale = 'ja';

  return (
    <>
      <SafeAreaView>
        <Fragment>
          <CalendarList
            key={isDark ? 'dark' : 'light'} // 動的にカレンダーのスタイルが切り替わるフラグ
            theme={{
              backgroundColor: colors.card,
              calendarBackground: colors.card,
              dayTextColor: colors.text,
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
          <View style={{ ...styles.card, backgroundColor: colors.card }}>
            {records.length === 0 ? (
              // 稼働がない場合
              <View
                style={{
                  ...styles.sectionListItemView,
                  borderBottomWidth: 0,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: colors.text }}>稼働はありません</Text>
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
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 16, color: colors.text }}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
                        {item.startedAt.toLocaleTimeString('ja-JP', {
                          hour: 'numeric',
                          minute: 'numeric',
                        })}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          paddingHorizontal: 5,
                          color: colors.text,
                        }}
                      >
                        〜
                      </Text>
                      <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
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
