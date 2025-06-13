import { Colors } from '@/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function FloatingActionButton({
  onPressFunction,
}: {
  onPressFunction?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={onPressFunction}>
          <View style={styles.button}>
            <Ionicons name="add" color={'white'} size={35} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 150,
    right: 80,
  },
  buttonContainer: {
    flexDirection: 'column',
  },
  button: {
    flexDirection: 'row',
    position: 'absolute',
    height: 55,
    width: 55,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowOffset: {
      width: 10,
      height: 10,
    },
    backgroundColor: Colors.light.tint,
  },
});
