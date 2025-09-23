import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Button = ({
  onPress,
  text,
  buttonStyle = {},
  disabled = false,
  textStyle = {},
}: any) => {
  return (
    <TouchableOpacity
      style={[styles.submitButton, buttonStyle]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={[styles.submitButtonText, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  submitButton: {
    marginHorizontal: hp(2),
    padding: 15,
    backgroundColor: '#6C4FF7',
    borderRadius: 8,
    alignItems: 'center',
    // marginBottom: hp(5),
  },
  submitButtonText: {
    color: '#fff',
    fontSize: hp(1.8),
  },
});
