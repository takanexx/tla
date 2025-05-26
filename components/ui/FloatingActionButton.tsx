import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function FloatingActionButton() {
  const [open, setOpen] = useState(false);

  // FABのトグル処理
  const toggleMenu = () => {
    router.push('/create-user'); // ユーザー作成画面に遷移
    setOpen(!open);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={toggleMenu}>
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
    backgroundColor: 'rgba(26, 100, 146, 0.9)',
  },
});
