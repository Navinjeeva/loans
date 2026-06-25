import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { stat } from "react-native-fs";
import { useTheme } from "@src/common/ThemeContext";
import { CloseIcon } from "@src/common/svg/CorporateLoansSvgs";

export type CapturedPhoto = {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  fileName: string;
};

interface InAppCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCaptured: (photo: CapturedPhoto) => void;
  title?: string;
  hint?: string;
}

const InAppCameraModal = ({
  visible,
  onClose,
  onCaptured,
  title = "Capture document",
  hint = "Align the document inside the frame",
}: InAppCameraModalProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [torch, setTorch] = useState<"off" | "on">("off");

  useEffect(() => {
    if (!visible || hasPermission) return;
    let cancelled = false;
    (async () => {
      const granted = await requestPermission();
      if (cancelled) return;
      if (!granted) {
        Alert.alert(
          "Camera permission required",
          "Enable camera access in your device settings to capture documents.",
        );
        onClose();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, hasPermission]);

  const capture = async () => {
    if (!cameraRef.current || isCapturing) return;
    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.takePhoto({
        flash: torch === "on" ? "on" : "off",
        enableShutterSound: true,
      });
      const uri = `file://${photo.path}`;
      let fileSize: number | undefined;
      try {
        const info = await stat(photo.path);
        fileSize = Number(info.size);
      } catch {
        // fileSize is optional; skip silently
      }
      const fileName = photo.path.split("/").pop() || `doc_${Date.now()}.jpg`;
      onCaptured({
        uri,
        width: photo.width,
        height: photo.height,
        fileSize,
        fileName,
      });
    } catch (e: any) {
      Alert.alert("Capture failed", e?.message || "Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const hasTorch = !!device?.hasTorch;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <SafeAreaView style={styles.root}>
        {device && hasPermission ? (
          <>
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={visible}
              photo
              torch={torch}
            />

            <View style={styles.overlay}>
              <View style={styles.topBar}>
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={6}
                >
                  <CloseIcon size={18} color={colors.buttonText} />
                </TouchableOpacity>
              </View>

              <View style={styles.guideContainer}>
                <View style={styles.docGuide} />
                <Text style={styles.guideHint}>{hint}</Text>
              </View>

              <View style={styles.bottomBar}>
                {hasTorch ? (
                  <TouchableOpacity
                    onPress={() => setTorch((t) => (t === "off" ? "on" : "off"))}
                    style={[
                      styles.sideBtn,
                      torch === "on" && styles.sideBtnActive,
                    ]}
                  >
                    <Text style={styles.sideBtnText}>
                      {torch === "on" ? "Flash on" : "Flash off"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.sideBtn} />
                )}

                <TouchableOpacity
                  style={[styles.shutter, isCapturing && styles.shutterDisabled]}
                  onPress={capture}
                  disabled={isCapturing}
                  activeOpacity={0.85}
                >
                  {isCapturing ? (
                    <ActivityIndicator color={colors.buttonText} />
                  ) : (
                    <View style={styles.shutterInner} />
                  )}
                </TouchableOpacity>

                <View style={styles.sideBtn} />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.permissionWrap}>
            <Text style={styles.permissionText}>
              {!device
                ? "No camera available on this device."
                : "Camera permission is required."}
            </Text>
            <TouchableOpacity
              style={styles.permBtn}
              onPress={async () => {
                await requestPermission();
              }}
            >
              <Text style={styles.permBtnText}>Grant permission</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.permCancelBtn}>
              <Text style={styles.permCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default InAppCameraModal;

const createStyles = (colors: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.cameraBg },

    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "space-between",
    },

    topBar: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingTop: hp(2),
      paddingBottom: 12,
      gap: 14,
    },
    title: {
      flex: 1,
      color: colors.buttonText,
      fontSize: 17,
      fontWeight: "700",
      letterSpacing: -0.2,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 99,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cameraScrim,
    },

    guideContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
    },
    docGuide: {
      width: wp(85),
      height: wp(85) * 1.3,
      borderRadius: 16,
      borderWidth: 2.5,
      borderColor: colors.buttonText,
    },
    guideHint: {
      color: colors.buttonText,
      fontSize: 13,
      fontWeight: "500",
    },

    bottomBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 28,
      paddingBottom: hp(4),
      paddingTop: 14,
    },
    sideBtn: {
      minWidth: 92,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 99,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cameraScrim,
    },
    sideBtnActive: { backgroundColor: colors.brand },
    sideBtnText: {
      color: colors.buttonText,
      fontSize: 12,
      fontWeight: "600",
    },

    shutter: {
      width: 78,
      height: 78,
      borderRadius: 99,
      borderWidth: 4,
      borderColor: colors.buttonText,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cameraScrim,
    },
    shutterDisabled: { opacity: 0.6 },
    shutterInner: {
      width: 60,
      height: 60,
      borderRadius: 99,
      backgroundColor: colors.buttonText,
    },

    permissionWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 18,
    },
    permissionText: {
      color: colors.buttonText,
      fontSize: 16,
      textAlign: "center",
    },
    permBtn: {
      paddingHorizontal: 22,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.brand,
    },
    permBtnText: {
      color: colors.buttonText,
      fontWeight: "700",
    },
    permCancelBtn: { paddingVertical: 10, paddingHorizontal: 18 },
    permCancelText: { color: colors.buttonText, fontSize: 13 },
  });
