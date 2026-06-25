import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@src/common/ThemeContext";

interface ReviewKVProps {
  label: string;
  value?: string | number | null;
  mono?: boolean;
}

const ReviewKV = ({ label, value, mono }: ReviewKVProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const display =
    value == null || value === "" ? "—" : typeof value === "number" ? String(value) : value;

  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
      <Text
        style={[styles.value, mono && styles.mono]}
        numberOfLines={3}
      >
        {display}
      </Text>
    </View>
  );
};

export default ReviewKV;

const createStyles = (colors: any) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 14,
      paddingVertical: 9,
    },
    label: {
      fontSize: 13,
      color: colors.muted,
      fontWeight: "500",
      flexShrink: 0,
    },
    value: {
      flex: 1,
      fontSize: 14,
      color: colors.ink,
      fontWeight: "500",
      textAlign: "right",
    },
    mono: {
      fontVariant: ["tabular-nums"],
    },
  });
