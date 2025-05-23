import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const CustomDropdown = () => {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState('オプションを選択');
  const triggerRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 100 });

  const toggleDropdown = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    if (triggerRef.current && visible) {
      triggerRef.current.measure((fx, fy, width, height, px, py) => {
        setPosition({ x: fx, y: py + height, width: 100 });
      });
    }
  }, [visible]);

  const handleSelect = option => {
    setSelected(option);
    setVisible(false);
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity ref={triggerRef} onPress={toggleDropdown}>
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color="gray"
            // style={{ marginBottom: 10 }}
            style={styles.buttonText}
          />
          {/* <Text style={}>{selected} ▼</Text> */}
        </TouchableOpacity>

        {visible && (
          <Modal transparent visible={visible} animationType="fade" onRequestClose={toggleDropdown}>
            <TouchableWithoutFeedback onPress={toggleDropdown}>
              <View style={styles.modalOverlay}>
                <View
                  style={[
                    styles.dropdown,
                    {
                      top: position.y,
                      right: position.x + 16,
                      width: position.width,
                    },
                  ]}
                >
                  <TouchableOpacity style={styles.option} onPress={() => handleSelect('編集')}>
                    <Text style={styles.optionText}>✏️ 編集</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.option} onPress={() => handleSelect('削除')}>
                    <Text style={styles.optionText}>🗑️ 削除</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </View>
    </View>
  );
};

export default CustomDropdown;

const styles = StyleSheet.create({
  safeArea: {
    // flex: 1,
  },
  container: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
  },
});
