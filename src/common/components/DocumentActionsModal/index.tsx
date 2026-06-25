import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import {
  CloseIcon,
  EyeIcon,
  RefreshIcon,
  DownloadIcon,
  TrashIcon,
  ChevronRightEMI as ChevronRight,
} from "@src/common/svg/CorporateLoansSvgs";

interface DocumentActionsModalProps {
  visible: boolean;
  onClose: () => void;
  docName: string;
  fileMeta?: string; // e.g. "JPG · 3.7 MB"
  onPreview: () => void;
  onReplace: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

type Action = {
  key: string;
  title: string;
  Icon: (p: any) => JSX.Element;
  onPress: () => void;
  destructive?: boolean;
};

const DocumentActionsModal = ({
  visible,
  onClose,
  docName,
  fileMeta,
  onPreview,
  onReplace,
  onDownload,
  onDelete,
}: DocumentActionsModalProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const sheetY = useRef(new Animated.Value(1)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const sheetHeight = hp(100) * 0.62;
  const translateY = sheetY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, sheetHeight],
  });

  useEffect(() => {
    if (visible) {
      sheetY.setValue(1);
      backdrop.setValue(0);
      Animated.parallel([
        Animated.timing(sheetY, {
          toValue: 0,
          duration: 300,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const close = () => {
    Animated.parallel([
      Animated.timing(sheetY, {
        toValue: 1,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const ACTIONS: Action[] = [
    { key: "preview", title: "Preview document", Icon: EyeIcon, onPress: onPreview },
    { key: "replace", title: "Replace document", Icon: RefreshIcon, onPress: onReplace },
    { key: "download", title: "Download", Icon: DownloadIcon, onPress: onDownload },
    { key: "delete", title: "Delete document", Icon: TrashIcon, onPress: onDelete, destructive: true },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <View style={styles.root}>
        <TouchableWithoutFeedback onPress={close}>
          <Animated.View
            style={[styles.backdrop, { opacity: backdrop, backgroundColor: colors.modalBackdrop }]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, maxHeight: sheetHeight, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: colors.handle }]} />
          </View>

          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{docName}</Text>
              {!!fileMeta && <Text style={styles.subtitle}>{fileMeta}</Text>}
            </View>
            <TouchableOpacity onPress={close} style={styles.closeBtn} hitSlop={6}>
              <CloseIcon size={18} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {ACTIONS.map((a) => {
              const fg = a.destructive ? colors.danger : colors.ink;
              const iconBg = a.destructive ? colors.dangerSoft : colors.buttonDisabledBackground;
              const iconBorder = a.destructive ? colors.dangerSoftBorder : "transparent";
              return (
                <TouchableOpacity
                  key={a.key}
                  activeOpacity={0.85}
                  onPress={a.onPress}
                  style={styles.actionRow}
                >
                  <View style={[styles.iconBox, { backgroundColor: iconBg, borderColor: iconBorder }]}>
                    <a.Icon size={20} color={fg} />
                  </View>
                  <Text style={[styles.actionTitle, { color: fg }]}>{a.title}</Text>
                  <ChevronRight size={18} color={colors.muted} />
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default DocumentActionsModal;

const createStyles = (colors: any) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: "flex-end" },
    backdrop: { ...StyleSheet.absoluteFillObject },
    sheet: {
      width: "100%",
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      overflow: "hidden",
    },
    handleWrap: { paddingTop: 10, paddingBottom: 6, alignItems: "center" },
    handle: { width: 40, height: 5, borderRadius: 99 },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 22,
      paddingTop: 10,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
      gap: 12,
    },
    title: { fontSize: 22, fontWeight: "700", color: colors.ink, letterSpacing: -0.4 },
    subtitle: { fontSize: 14, color: colors.muted, marginTop: 4 },
    closeBtn: {
      width: 34,
      height: 34,
      borderRadius: 99,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.buttonDisabledBackground,
    },

    body: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28, gap: 8 },

    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 6,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      flexShrink: 0,
    },
    actionTitle: { flex: 1, fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  });
