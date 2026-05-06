import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "../common/ThemeContext";

const Button = ({
  click,
  text,
  buttonStyle = {},
  disabled = false,
  textStyle = {},
}: any) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.submitButton,
        { backgroundColor: colors.buttonPrimary, opacity: disabled ? 0.5 : 1 },
        buttonStyle,
      ]}
      disabled={disabled}
      onPress={click}
    >
      <Text
        style={[
          styles.submitButtonText,
          { color: colors.buttonText },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  submitButton: {
    marginHorizontal: hp(2),
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    // marginBottom: hp(5),
  },
  submitButtonText: {
    fontSize: hp(1.8),
  },
});
