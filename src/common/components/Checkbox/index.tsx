import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";

const Checkbox = ({ isChecked, onToggle, message }: any) => {
  const { colors } = useTheme();
  const dynamicStyles = createStyles(colors);

  return (
    <TouchableOpacity onPress={onToggle} style={dynamicStyles.container}>
      <View
        style={[dynamicStyles.checkbox, isChecked && dynamicStyles.checked]}
      >
        {isChecked && <Text style={dynamicStyles.checkmark}>✔</Text>}
      </View>

      <Text style={dynamicStyles.label}>
        {message ? message : "Verify Member Details and Documents"}
      </Text>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: colors.primary,
      borderRadius: 4,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 6,
    },
    checked: {
      backgroundColor: colors.primary,
    },
    checkmark: {
      color: colors.textInverse,
      fontSize: 10,
    },
    label: {
      fontSize: hp(1.6),
      alignItems: "center",
      color: colors.text,
      flex: 1,
    },
  });

export default Checkbox;
