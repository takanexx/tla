import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { Fragment, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';

export default function ScheduleScreen() {
  const [selected, setSelected] = useState(new Date().toISOString().split('T')[0]);

  return (
    <>
      <SafeAreaView>
        <Fragment>
          <CalendarList
            theme={{
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
          <Text style={{ padding: 5, fontWeight: 'bold', color: 'gray' }}>稼働したタスク</Text>
          <View style={styles.card}>
            <View style={styles.sectionListItemView}>
              <Text style={{ fontSize: 16 }}>勉強</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>6時〜7時</Text>
            </View>
            <View style={{ ...styles.sectionListItemView, borderBottomWidth: 0 }}>
              <Text style={{ fontSize: 16 }}>勉強</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>8時〜11時</Text>
            </View>
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
