import {View, Modal, ActivityIndicator, StyleSheet} from 'react-native';
import React from 'react';
import {MD2Colors} from 'react-native-paper';

const Loader = ({loading}: {loading: boolean}) => {
  return (
    <Modal visible={loading} transparent={true} animationType="fade">
      <View style={styles.modalBackground}>
        <ActivityIndicator
          animating={true}
          color={MD2Colors.orange400}
          size="large"
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default Loader;
