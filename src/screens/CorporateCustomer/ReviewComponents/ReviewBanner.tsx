import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@src/common/ThemeContext";
import { EyeIcon } from "@src/common/svg/CorporateLoansSvgs";

interface ReviewBannerProps {
  title: string;
  subtitle: string;
}

const ReviewBanner = ({ title, subtitle }: ReviewBannerProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.banner}>
      <View style={styles.iconTile}>
        <EyeIcon size={16} color={colors.brand} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.desc} numberOfLines={2}>{subtitle}</Text>
      </View>
    </View>
  );
};

export default ReviewBanner;

const createStyles = (colors: any) =>
  StyleSheet.create({
    banner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    iconTile: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderLight,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    title: {
      fontSize: 12.5,
      fontWeight: "600",
      color: colors.ink,
      letterSpacing: -0.3,
      lineHeight: 17,
    },
    desc: {
      fontSize: 11.5,
      fontWeight: "400",
      color: colors.muted,
      lineHeight: 16,
      marginTop: 1,
    },
  });
