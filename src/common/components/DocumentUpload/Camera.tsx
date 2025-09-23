import React, { useEffect } from "react";
import { PermissionsAndroid, Platform, Alert } from "react-native";
import DocumentScanner from "react-native-document-scanner-plugin";

export default function Camera({
  visible = false,
  setVisible,
  onCancelHandler,
  limit,
  setFiles,
  files,
}: {
  visible: boolean;
  setVisible: (v: boolean) => void;
  onCancelHandler: () => void;
  limit: number;
  setFiles: (images: any[]) => void;
  files: any[];
}) {
  useEffect(() => {
    if (visible) {
      launchScanner();
    }
  }, [visible]);

  const launchScanner = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert("Permission Required", "Camera permission is required.");
        setVisible(false);
        onCancelHandler?.();
        return;
      }
    }

    try {
      const { scannedImages } = await DocumentScanner.scanDocument({
        croppedImageQuality: 90,
        responseType: "imageFilePath",
        maxNumDocuments: limit - files.length,
        letUserAdjustCrop: false,
        enableTorch: false,
        autoSnappingSensitivity: "low",
      });

      if (scannedImages?.length) {
        const newImages = scannedImages.map((path) => ({
          uri: path,
          name: path.split("/").pop() ?? "scan.jpg",
          type: "image/jpeg",
        }));
        setFiles([...files, ...newImages]);
      }
    } catch (error: any) {
      console.warn("Document scan cancelled:", error.message);
    } finally {
      setVisible(false);
    }
  };

  return null; // 👈 No UI shown, scanner is native and full-screen
}
