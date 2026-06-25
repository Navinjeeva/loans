import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@src/common/ThemeContext";
import { DocCheckIcon, EditIcon } from "@src/common/svg/CorporateLoansSvgs";

interface ReviewDocRowProps {
  name: string;
  fileType?: string;
  fileSize?: string;
  onPreview?: () => void;
  onEdit?: () => void;
}

const ReviewDocRow = ({
  name,
  fileType,
  fileSize,
  onPreview,
  onEdit,
}: ReviewDocRowProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const meta = [fileType, fileSize].filter(Boolean).join(" · ");

  return (
    <View style={styles.row}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPreview}
        style={styles.thumb}
      >
        <DocCheckIcon size={19} color={colors.infoInk} />
        <View style={styles.thumbAccent} />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPreview}
        style={{ flex: 1, minWidth: 0 }}
      >
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        {!!meta && <Text style={styles.meta} numberOfLines={1}>{meta}</Text>}
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
  );
};

export default ReviewDocRow;

const createStyles = (colors: any) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      paddingVertical: 9,
      paddingHorizontal: 11,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    thumb: {
      width: 38,
      height: 46,
      borderRadius: 7,
      backgroundColor: colors.infoSoft,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      position: "relative",
    },
    thumbAccent: {
      position: "absolute",
      bottom: 4,
      left: 5,
      right: 5,
      height: 2,
      borderRadius: 2,
      backgroundColor: colors.infoInk,
      opacity: 0.5,
    },
    name: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.ink,
    },
    meta: {
      fontSize: 11,
      color: colors.faint,
      marginTop: 2,
      fontVariant: ["tabular-nums"],
    },
    editBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
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
  });
