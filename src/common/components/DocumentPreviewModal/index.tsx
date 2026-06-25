import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  ScrollView,
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
  DocCheckIcon,
  ShieldIcon,
  ArrowRightIcon,
  DownloadIcon,
  RefreshIcon,
  LockIcon,
} from "@src/common/svg/CorporateLoansSvgs";

interface DocumentPreviewModalProps {
  visible: boolean;
  onClose: () => void;
  docName: string;       // e.g. "Certificate of Incorporation"
  fileName?: string;     // e.g. "Certificate_of_Incorporation.jpg"
  fileSize?: string;     // e.g. "4.2 MB"
  fileType?: string;     // e.g. "JPG"
  uri?: string;          // file:// path of the picked image
  mimeType?: string;     // e.g. "image/jpeg" — used to decide image vs skeleton
  onDownload?: () => void;
  onReplace?: () => void;
  onViewFull?: () => void;
}

const DocumentPreviewModal = ({
  visible,
  onClose,
  docName,
  fileName,
  fileSize,
  fileType,
  uri,
  mimeType,
  onDownload,
  onReplace,
  onViewFull,
}: DocumentPreviewModalProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const sheetY = useRef(new Animated.Value(1)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const sheetHeight = hp(100) * 0.85;
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

  const metaLine =
    fileSize && fileType
      ? `${fileSize} · ${fileType}`
      : fileSize || fileType || "";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={close}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <TouchableWithoutFeedback onPress={close}>
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: backdrop, backgroundColor: colors.modalBackdrop },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              maxHeight: sheetHeight,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: colors.handle }]} />
          </View>

          {/* Title row */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Document preview</Text>
              {!!fileName && (
                <Text style={styles.subtitle} numberOfLines={1}>{fileName}</Text>
              )}
            </View>
            <TouchableOpacity onPress={close} style={styles.closeBtn} hitSlop={6}>
              <CloseIcon size={18} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Uploaded badge + meta */}
            <View style={styles.statusRow}>
              <View style={styles.uploadedPill}>
                <DocCheckIcon size={14} color={colors.infoInk} />
                <Text style={styles.uploadedText}>Uploaded</Text>
              </View>
              {!!metaLine && <Text style={styles.metaText}>{metaLine}</Text>}
            </View>

            {/* Preview card — real image when available, skeleton fallback otherwise */}
            <TouchableOpacity activeOpacity={0.9} onPress={onViewFull} style={styles.previewCard}>
              <View style={styles.previewStripe} />
              {uri && (!mimeType || mimeType.startsWith("image/")) ? (
                <View style={styles.imageWrap}>
                  <View style={styles.imageHeader}>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.previewEyebrow}>OFFICIAL ISSUING AUTHORITY</Text>
                      <Text style={styles.previewTitle} numberOfLines={2}>{docName}</Text>
                    </View>
                  </View>
                  <Image
                    source={{ uri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <View style={styles.previewBody}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.previewEyebrow}>OFFICIAL ISSUING AUTHORITY</Text>
                    <Text style={styles.previewTitle} numberOfLines={2}>{docName}</Text>
                    <View style={styles.skeletonGrid}>
                      {[0, 1, 2, 3].map((i) => (
                        <View key={i} style={styles.skeletonRow}>
                          <View style={[styles.skeletonShortBar, { backgroundColor: colors.borderLight }]} />
                          <View
                            style={[
                              styles.skeletonLongBar,
                              {
                                backgroundColor: colors.hairline,
                                width: ["88%", "76%", "82%", "60%"][i] as any,
                              },
                            ]}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={styles.shieldTile}>
                    <ShieldIcon size={22} color={colors.faint} />
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* View full document — primary CTA */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onViewFull}
              style={styles.viewFullBtn}
            >
              <Text style={styles.viewFullText}>View full document</Text>
              <ArrowRightIcon size={18} color={colors.buttonText} />
            </TouchableOpacity>

            {/* Secondary actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity activeOpacity={0.85} onPress={onDownload} style={styles.actionBtn}>
                <DownloadIcon size={20} color={colors.ink2} />
                <Text style={styles.actionLabel}>Download</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.85} onPress={onReplace} style={styles.actionBtn}>
                <RefreshIcon size={20} color={colors.ink2} />
                <Text style={styles.actionLabel}>Replace</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.85} onPress={close} style={styles.actionBtn}>
                <CloseIcon size={20} color={colors.ink2} />
                <Text style={styles.actionLabel}>Close</Text>
              </TouchableOpacity>
            </View>

            {/* Encryption footer */}
            <View style={styles.secureRow}>
              <LockIcon size={14} color={colors.muted} />
              <Text style={styles.secureText}>
                This document is securely encrypted and visible only to authorized bank personnel.
              </Text>
            </View>
            
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default DocumentPreviewModal;

const createStyles = (colors: any) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: "flex-end"},
    backdrop: { ...StyleSheet.absoluteFillObject },
    sheet: {
      width: "100%",
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      overflow: "hidden",
    },
    handleWrap: { paddingTop: 10, paddingBottom: 4, alignItems: "center" },
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
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.ink,
      letterSpacing: -0.4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.muted,
      marginTop: 4,
    },
    closeBtn: {
      width: 34,
      height: 34,
      borderRadius: 99,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.buttonDisabledBackground,
    },

    bodyScroll: { flexGrow: 0, flexShrink: 1 },
    body: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 14 },

    // Uploaded badge row
    statusRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    uploadedPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 99,
      backgroundColor: colors.infoSoft,
    },
    uploadedText: { fontSize: 13, fontWeight: "700", color: colors.infoInk },
    metaText: { fontSize: 14, color: colors.muted, fontWeight: "500" },

    // Skeleton preview card
    previewCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.card,
      overflow: "hidden",
    },
    previewStripe: { height: 8, backgroundColor: colors.brand },
    previewBody: {
      flexDirection: "row",
      gap: 14,
      padding: 18,
    },
    imageWrap: {
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 14,
      gap: 12,
    },
    imageHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
    previewImage: {
      width: "100%",
      height: 220,
      borderRadius: 10,
      backgroundColor: colors.buttonDisabledBackground,
    },
    previewEyebrow: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.6,
      color: colors.brand600,
    },
    previewTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.ink,
      letterSpacing: -0.3,
      marginTop: 4,
    },
    skeletonGrid: { marginTop: 18, gap: 10 },
    skeletonRow: { flexDirection: "row", alignItems: "center", gap: 9 },
    skeletonShortBar: { width: 70, height: 9, borderRadius: 3 },
    skeletonLongBar: { height: 9, borderRadius: 3 },
    shieldTile: {
      width: 46,
      height: 46,
      borderRadius: 10,
      backgroundColor: colors.buttonDisabledBackground,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    // Primary CTA
    viewFullBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 16,
      borderRadius: 14,
      backgroundColor: colors.brand,
    },
    viewFullText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.buttonText,
      letterSpacing: -0.2,
    },

    // Secondary actions
    actionsRow: { flexDirection: "row", gap: 9 },
    actionBtn: {
      flex: 1,
      alignItems: "center",
      gap: 6,
      paddingVertical: 14,
      borderRadius: 13,
      backgroundColor: colors.buttonDisabledBackground,
    },
    actionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.ink2,
    },

    // Encryption footer
    secureRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: colors.buttonDisabledBackground,
    },
    secureText: {
      flex: 1,
      fontSize: 12.5,
      color: colors.muted,
      lineHeight: 17,
      fontWeight: "500",
    },
  });
