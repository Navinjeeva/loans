import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@src/common/ThemeContext";
import { ChevronDown, EditIcon } from "@src/common/svg/CorporateLoansSvgs";

interface ReviewSectionProps {
  title: string;
  subtitle?: string;
  onEdit: () => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const ReviewSection = ({
  title,
  subtitle,
  onEdit,
  defaultOpen = false,
  children,
}: ReviewSectionProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setOpen((o) => !o)}
          style={styles.headerHit}
        >
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            {!!subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
            )}
          </View>
          <View
            style={{
              transform: [{ rotate: open ? "180deg" : "0deg" }],
              marginLeft: 6,
            }}
          >
            <ChevronDown size={18} color={colors.faint} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onEdit}
          style={styles.editBtn}
          hitSlop={6}
        >
          <EditIcon size={13} color={colors.muted} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
};

export default ReviewSection;

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.card,
      overflow: "hidden",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    headerHit: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
    },
    title: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.ink,
      letterSpacing: -0.2,
    },
    subtitle: {
      fontSize: 11.5,
      color: colors.muted,
      marginTop: 1,
    },
    editBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 99,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.card,
      flexShrink: 0,
    },
    editText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.ink,
    },
    body: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 8,
      borderTopWidth: 1,
      borderTopColor: colors.hairline,
    },
  });
