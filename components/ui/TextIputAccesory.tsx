import React from 'react';
import { Button, InputAccessoryView, Keyboard, StyleSheet, View } from 'react-native';

const TextInputAccessory = ({ accessoryId }: { accessoryId: string }) => {
  return (
    <InputAccessoryView nativeID={accessoryId}>
      <View style={styles.doneBtn}>
        <Button title={'完了'} color={'#fff'} onPress={() => Keyboard.dismiss()} />
      </View>
    </InputAccessoryView>
  );
};

const styles = StyleSheet.create({
  doneBtn: {
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
});

export default TextInputAccessory;
