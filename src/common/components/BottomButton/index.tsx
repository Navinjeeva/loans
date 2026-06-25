import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "@src/common/ThemeContext";

interface BottomButtonProps {
  text: string;
  onPress?: () => void;
  note?: string;
  disabled?: boolean;
  loading?: boolean;
}

const BottomButton = ({
  text,
  onPress,
  note,
  disabled = false,
  loading = false,
}: BottomButtonProps) => {
  const [press, setPress] = useState(false);
  const { colors } = useTheme();

  const isDisabled = disabled || loading;

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: colors.footerBackground,
          borderTopColor: colors.borderLight,
        },
      ]}
    >
      {note ? (
        <View style={styles.noteWrapper}>
          <Text style={[styles.noteText, { color: colors.textSecondary }]}>
            {note}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        activeOpacity={1}
        onPressIn={() => setPress(true)}
        onPressOut={() => setPress(false)}
        onPress={isDisabled ? undefined : onPress}
        style={[
          styles.button,
          {
            backgroundColor: isDisabled
              ? colors.buttonDisabledBackground
              : press
              ? colors.buttonPrimaryHover
              : colors.buttonPrimary,
            transform: [{ scale: press && !isDisabled ? 0.975 : 1 }],
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.buttonText} />
        ) : (
          <Text
            style={[
              styles.text,
              {
                color: isDisabled
                  ? colors.buttonDisabledText
                  : colors.buttonText,
              },
            ]}
            numberOfLines={1}
          >
            {text}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default BottomButton;

const styles = StyleSheet.create({
  footer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderTopWidth: 1,
    zIndex: 20,
  },
  noteWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 10,
  },
  noteText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  button: {
    width: "100%",
    height: 54,
    paddingHorizontal: 22,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
  },
  text: {
    fontSize: 16.5,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});
