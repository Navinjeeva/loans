import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
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
import {
  launchImageLibrary,
  Asset,
} from "react-native-image-picker";
import { useTheme } from "@src/common/ThemeContext";
import type { DocumentEntry } from "@src/store/corporate";
import { CameraIcon, ImageIcon , FileIcon, ChevronRight, CloseIcon, InfoIcon, LockIcon} from "@src/common/svg/CorporateLoansSvgs";
import InAppCameraModal, { CapturedPhoto } from "@src/common/components/InAppCameraModal";

const formatSize = (bytes?: number) => {
  if (!bytes) return undefined;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
};

const assetToEntry = (asset: Asset, source: "camera" | "gallery"): DocumentEntry => ({
  status: "uploaded",
  fileName: asset.fileName || `${source}_${Date.now()}.jpg`,
  size: formatSize(asset.fileSize),
  uploadedAt: Date.now(),
  uri: asset.uri,
  mimeType: asset.type,
  source,
});

interface BottomFileUploadModalProps {
  visible: boolean;
  onClose: () => void;
  docName: string;
  onPicked: (entry: DocumentEntry) => void;
}

const BottomFileUploadModal = ({
  visible,
  onClose,
  docName,
  onPicked,
}: BottomFileUploadModalProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [cameraOpen, setCameraOpen] = useState(false);

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

  const handleCamera = () => {
    setCameraOpen(true);
  };

  const handleCameraCaptured = (photo: CapturedPhoto) => {
    const entry: DocumentEntry = {
      status: "uploaded",
      fileName: photo.fileName,
      size: formatSize(photo.fileSize),
      uploadedAt: Date.now(),
      uri: photo.uri,
      mimeType: "image/jpeg",
      source: "camera",
    };
    setCameraOpen(false);
    onPicked(entry);
    close();
  };

  const handleGallery = async () => {
    const res = await launchImageLibrary({
      mediaType: "photo",
      // quality: 0.85,
      selectionLimit: 1,
    });
    if (res.didCancel) return;
    if (res.errorCode) {
      Alert.alert("Gallery error", res.errorMessage || res.errorCode);
      return;
    }
    const asset = res.assets?.[0];
    if (asset) {
      onPicked(assetToEntry(asset, "gallery"));
      close();
    }
  };

  const handleFile = () => {
    Alert.alert(
      "Document picker not installed",
      "Install react-native-document-picker to enable PDF / file picking.",
    );
  };

  const OPTIONS: {
    title: string;
    desc: string;
    Icon: (p: any) => JSX.Element;
    onPress: () => void;
  }[] = [
    { title: "Take Photo", desc: "Capture the document with your camera", Icon: CameraIcon, onPress: handleCamera },
    { title: "Choose from Gallery", desc: "Select an existing photo", Icon: ImageIcon, onPress: handleGallery },
    { title: "Upload PDF / File", desc: "Browse files on your device", Icon: FileIcon, onPress: handleFile },
  ];

  return (
    <>
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
              <Text style={styles.title}>Add document</Text>
              <Text style={styles.subtitle}>{docName}</Text>
            </View>
            <TouchableOpacity onPress={close} style={styles.closeBtn} hitSlop={6}>
              <CloseIcon size={18} color={colors.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {OPTIONS.map((o, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.85}
                onPress={o.onPress}
                style={styles.optionCard}
              >
                <View style={styles.iconBox}>
                  <o.Icon size={22} color={colors.brand} stroke={1.9} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.optionTitle}>{o.title}</Text>
                  <Text style={styles.optionDesc} numberOfLines={1}>{o.desc}</Text>
                </View>
                <ChevronRight size={18} color={colors.muted} />
              </TouchableOpacity>
            ))}

            <View style={styles.infoPill}>
              <InfoIcon size={15} color={colors.muted} />
              <Text style={styles.infoText}>PDF, JPG, PNG · Max 10 MB</Text>
            </View>

            <View style={styles.secureRow}>
              <LockIcon size={12} color={colors.faint} />
              <Text style={styles.secureText}>Encrypted & shared only with your branch</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>

    <InAppCameraModal
      visible={cameraOpen}
      onClose={() => setCameraOpen(false)}
      onCaptured={handleCameraCaptured}
      title={docName || "Capture document"}
    />
    </>
  );
};

export default BottomFileUploadModal;

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

    body: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22, gap: 10 },

    optionCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.card,
    },
    iconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.brandTint,
      flexShrink: 0,
    },
    optionTitle: { fontSize: 16, fontWeight: "700", color: colors.ink, letterSpacing: -0.2 },
    optionDesc: { fontSize: 13, color: colors.muted, marginTop: 2 },

    infoPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 11,
      paddingHorizontal: 14,
      borderRadius: 10,
      backgroundColor: colors.buttonDisabledBackground,
      marginTop: 6,
    },
    infoText: { fontSize: 13, color: colors.muted, fontWeight: "500" },

    secureRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 6,
    },
    secureText: { fontSize: 12, color: colors.faint, fontWeight: "500" },
  });
