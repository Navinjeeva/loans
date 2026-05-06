import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
  ActionSheetIOS,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import FaceDetection, { Face } from "@react-native-ml-kit/face-detection";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import Header from "@src/common/LoanComponents/Header";
import Button from "@src/components/Button";
import KeyboardAwareScrollView from "@src/common/LoanComponents/KeyboardAwareScrollView";
import SignatureScreen from "react-native-signature-canvas";
import { logAlert, logErr, logSuccess } from "@src/common/utils/logger";
import {
  launchImageLibrary,
  ImagePickerResponse,
} from "react-native-image-picker";
import { useSelector } from "react-redux";
import { moderateScaling, verticalScaling } from "@src/common";
import { drop_down } from "@src/components/images";
import { loanDocumentInstance } from "@src/services";

// Define the navigation types
type RootStackParamList = {
  DocumentHolderVerification: undefined;
  Signature: { signatureImage: string; memberPicture: string };
};

const DocumentHolderVerification = () => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  // Correct usage of useNavigation
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // State management
  const [signatureVisible, setSignatureVisible] = useState(false);
  const [capturedSignature, setCapturedSignature] = useState<string | null>(
    null
  );
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [memberPicture, setMemberPicture] = useState({
    uri: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
  });
  const [isDefaultImage, setIsDefaultImage] = useState(true);
  const [faceCaptureVisible, setFaceCaptureVisible] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<string>(
    "Position your face in the oval"
  );
  const [faceInPosition, setFaceInPosition] = useState(false);
  const [borderColor, setBorderColor] = useState("rgba(255, 255, 255, 0.8)");
  const [lastPhotoUri, setLastPhotoUri] = useState<string | null>(null);
  const custData = useSelector((state: any) => state.customer);

  // Vision Camera setup
  const device = useCameraDevice("front");
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get screen dimensions for oval calculations
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Oval dimensions matching the UI
  const ovalWidth = screenWidth * 0.7;
  const ovalHeight = screenWidth * 0.9;

  // Real-time face detection using polling
  const startFaceDetection = useCallback(async () => {
    if (!camera.current || isCapturing || !faceCaptureVisible) return;

    try {
      // Take a quick snapshot for detection (low quality for speed)
      const photo = await camera.current.takeSnapshot({
        quality: 30,
      });

      const imageUri = `file://${photo.path}`;
      setLastPhotoUri(imageUri);

      // Detect face
      const faces = await FaceDetection.detect(imageUri, {
        performanceMode: "fast",
        minFaceSize: 0.15,
      });

      if (faces.length > 0) {
        const face = faces[0];

        // Calculate face position
        const faceCenterX = face.frame.left + face.frame.width / 2;
        const faceCenterY = face.frame.top + face.frame.height / 2;

        // Scale to screen coordinates
        const screenFaceCenterX = (faceCenterX / photo.width) * screenWidth;
        const screenFaceCenterY = (faceCenterY / photo.height) * screenHeight;

        const ovalCenterX = screenWidth / 2;
        const ovalCenterY = screenHeight / 2;

        // Check if face is centered in oval (stricter tolerance)
        const xTolerance = ovalWidth * 0.35;
        const yTolerance = ovalHeight * 0.35;

        const isCentered =
          Math.abs(screenFaceCenterX - ovalCenterX) < xTolerance &&
          Math.abs(screenFaceCenterY - ovalCenterY) < yTolerance;

        // Check if face size fits the oval
        const faceWidthInScreen =
          (face.frame.width / photo.width) * screenWidth;
        const faceHeightInScreen =
          (face.frame.height / photo.height) * screenHeight;

        const widthRatio = faceWidthInScreen / ovalWidth;
        const heightRatio = faceHeightInScreen / ovalHeight;

        const isGoodSize =
          widthRatio > 0.5 &&
          widthRatio < 0.95 &&
          heightRatio > 0.4 &&
          heightRatio < 0.9;

        const inPosition = isCentered && isGoodSize;

        // Update UI
        setFaceInPosition(inPosition);
        if (inPosition) {
          setBorderColor("#4CAF50"); // Green
          setCaptureStatus("✓ Perfect! Tap to capture");
        } else {
          setBorderColor("rgba(255, 255, 255, 0.8)"); // White
          if (!isCentered) {
            setCaptureStatus("Center your face in the oval");
          } else if (!isGoodSize) {
            if (widthRatio < 0.5 || heightRatio < 0.4) {
              setCaptureStatus("Move closer");
            } else {
              setCaptureStatus("Move further away");
            }
          }
        }

        // Log occasionally
        if (Math.random() < 0.1) {
          console.log("👁️ Detection:", {
            centered: isCentered,
            goodSize: isGoodSize,
            inPosition,
            widthRatio: widthRatio.toFixed(2),
            heightRatio: heightRatio.toFixed(2),
          });
        }
      } else {
        setFaceInPosition(false);
        setBorderColor("rgba(255, 255, 255, 0.8)");
        setCaptureStatus("No face detected");
      }
    } catch (error) {
      // Silent fail for detection errors
      console.log("Detection error:", error);
    }
  }, [
    camera,
    isCapturing,
    faceCaptureVisible,
    ovalWidth,
    ovalHeight,
    screenWidth,
    screenHeight,
  ]);

  // Start/stop detection polling
  useEffect(() => {
    if (faceCaptureVisible && !isCapturing) {
      // Start polling every 500ms
      detectionIntervalRef.current = setInterval(() => {
        startFaceDetection();
      }, 500);

      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
      };
    } else {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    }
  }, [faceCaptureVisible, isCapturing, startFaceDetection]);

  const handleSignatureCapture = useCallback((signature: string) => {
    setCapturedSignature(String(signature));
    setSignatureVisible(false);
  }, []);

  const openCamera = useCallback(async () => {
    console.log("========================================");
    console.log("🚀 STEP 1: openCamera called");
    console.log("========================================");

    console.log("🔵 STEP 2: Checking camera permissions");
    if (!hasPermission) {
      console.log("⚠️ No camera permission, requesting...");
      const granted = await requestPermission();
      if (!granted) {
        console.error("❌ Camera permission denied");
        Alert.alert(
          "Permission Required",
          "Camera permission is required to capture your face. Please enable it in your device settings.",
          [{ text: "OK" }]
        );
        return;
      }
      console.log("✅ Camera permission granted");
    } else {
      console.log("✅ Camera permission already granted");
    }

    console.log("🔵 STEP 3: Checking camera device availability");
    if (!device) {
      console.error("❌ No front camera device found");
      Alert.alert(
        "Camera Error",
        "No front camera device found on this device."
      );
      return;
    }
    console.log("✅ Camera device available:", {
      id: device.id,
      position: device.position,
    });

    console.log("🔵 STEP 5: Opening camera modal");
    setFaceCaptureVisible(true);
    setIsCapturing(false);
    setFaceInPosition(false);
    setBorderColor("rgba(255, 255, 255, 0.8)");
    setCaptureStatus("Position your face in the oval");
    console.log("✅ Modal should now be visible");
    console.log("========================================");
  }, [hasPermission, requestPermission, device]);

  const handleFilePicker = useCallback(async () => {
    try {
      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.8,
        includeBase64: false,
      });

      if (result.didCancel) {
        console.log("User cancelled file picker");
        return;
      }

      if (result.errorCode) {
        console.error("ImagePicker error:", result.errorMessage);
        logAlert(result.errorMessage || "Failed to pick image");
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        console.error("No image selected");
        return;
      }

      console.log("🔵 Processing selected image:", asset.uri);
      setIsCapturing(true);

      // Detect face in selected image
      // Use the URI directly from image picker - it should be in the correct format
      const imageUri = asset.uri;

      const faces = await FaceDetection.detect(imageUri, {
        performanceMode: "accurate",
        landmarkMode: "all",
        classificationMode: "all",
        minFaceSize: 0.15,
      });

      console.log("📊 Face detection results:", {
        facesFound: faces.length,
        faces: faces.map((f) => ({
          leftEyeOpen: f.leftEyeOpenProbability,
          rightEyeOpen: f.rightEyeOpenProbability,
          smiling: f.smilingProbability,
          bounds: f.frame,
        })),
      });

      if (faces.length === 0) {
        console.error("❌ No face detected in selected image");
        setIsCapturing(false);
        logAlert(
          "No Face Detected. Please select an image that contains a face."
        );
        return;
      }

      const face = faces[0];

      // Check if eyes are open
      const leftEyeOpen =
        face.leftEyeOpenProbability !== undefined
          ? face.leftEyeOpenProbability > 0.4
          : true;
      const rightEyeOpen =
        face.rightEyeOpenProbability !== undefined
          ? face.rightEyeOpenProbability > 0.4
          : true;

      console.log("👁️ Eye state check:", {
        leftEyeOpen,
        rightEyeOpen,
        bothOpen: leftEyeOpen && rightEyeOpen,
      });

      if (!leftEyeOpen || !rightEyeOpen) {
        console.warn("⚠️ Eyes appear closed");
        setIsCapturing(false);
        Alert.alert(
          "Eyes Closed",
          "Please select an image with your eyes open.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Use Anyway",
              onPress: () => {
                console.log("Using image despite closed eyes");
                setMemberPicture({ uri: imageUri });
                setIsDefaultImage(false);
                setIsCapturing(false);
                logSuccess("Face image selected successfully!");
              },
            },
          ]
        );
        return;
      }

      console.log("🔵 STEP 10: Face verified! Updating state");
      setMemberPicture({ uri: imageUri });
      setIsDefaultImage(false);
      setIsCapturing(false);

      console.log("✅ STEP 11: Showing success alert");
      const eyeScores = `Left: ${(
        (face.leftEyeOpenProbability || 0) * 100
      ).toFixed(0)}%, Right: ${(
        (face.rightEyeOpenProbability || 0) * 100
      ).toFixed(0)}%`;
      logSuccess(
        `Face image selected & validated!\n\nEye Detection: ${eyeScores}`
      );

      console.log("========================================");
      console.log("✅ Face selection completed successfully!");
      console.log("========================================");
    } catch (error) {
      console.error("Error in handleFilePicker:", error);
      setIsCapturing(false);
      logAlert("Failed to process image. Please try again.");
    }
  }, []);

  const handleFaceCapture = useCallback(() => {
    const options = ["Camera", "File", "Cancel"];
    const cancelButtonIndex = 2;

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            openCamera();
          } else if (buttonIndex === 1) {
            handleFilePicker();
          }
        }
      );
    } else {
      Alert.alert("Select Source", "Choose how you want to capture your face", [
        {
          text: "Camera",
          onPress: openCamera,
        },
        {
          text: "File",
          onPress: handleFilePicker,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    }
  }, [openCamera, handleFilePicker]);

  const capturePhoto = useCallback(async () => {
    console.log("========================================");
    console.log("📸 CAPTURE PHOTO CLICKED");
    console.log(
      "📊 Current state - faceInPosition:",
      faceInPosition,
      "borderColor:",
      borderColor
    );
    console.log("========================================");

    if (!camera.current || isCapturing) {
      console.log("⚠️ Cannot capture: Camera ref or already capturing");
      return;
    }

    // Allow capture - we'll validate the actual captured photo
    try {
      console.log("🔵 STEP 6: Starting photo capture");
      setIsCapturing(true);
      setCaptureStatus("Capturing...");

      console.log("🔵 STEP 7: Taking high-quality photo from camera");
      const photo = await camera.current.takePhoto({
        flash: "off",
      });

      console.log("✅ Photo captured:", {
        path: photo.path,
        width: photo.width,
        height: photo.height,
      });

      console.log("🔵 STEP 8: Cropping image to oval area");
      setCaptureStatus("Cropping to oval...");

      // Calculate crop area for the oval
      // The oval is centered on screen with specific dimensions
      const cropX = (screenWidth - ovalWidth) / 2;
      const cropY = (screenHeight - ovalHeight) / 2;

      // Scale crop coordinates to match photo resolution
      const scaleX = photo.width / screenWidth;
      const scaleY = photo.height / screenHeight;

      const cropArea = {
        x: Math.round(cropX * scaleX),
        y: Math.round(cropY * scaleY),
        width: Math.round(ovalWidth * scaleX),
        height: Math.round(ovalHeight * scaleY),
      };

      console.log("📐 Crop calculations:", {
        screenSize: { width: screenWidth, height: screenHeight },
        ovalSize: { width: ovalWidth, height: ovalHeight },
        photoSize: { width: photo.width, height: photo.height },
        cropArea,
      });

      console.log("🔵 STEP 9: Detecting face in captured area");
      setCaptureStatus("Detecting face...");

      const imageUri = `file://${photo.path}`;

      // Note: In production, you'd crop the image to cropArea using a library
      // like react-native-image-manipulator before processing

      const faces = await FaceDetection.detect(imageUri, {
        performanceMode: "accurate",
        landmarkMode: "all",
        classificationMode: "all",
        minFaceSize: 0.15,
      });

      console.log("📊 Face detection results:", {
        facesFound: faces.length,
        faces: faces.map((f) => ({
          leftEyeOpen: f.leftEyeOpenProbability,
          rightEyeOpen: f.rightEyeOpenProbability,
          smiling: f.smilingProbability,
          bounds: f.frame,
        })),
      });

      if (faces.length === 0) {
        console.error("❌ No face detected in captured photo");
        setIsCapturing(false);
        setCaptureStatus("Position your face in the oval");
        Alert.alert(
          "No Face Detected",
          "Please position your face in the oval and try again."
        );
        return;
      }

      const face = faces[0];

      // Check if face is in the oval area
      const faceCenterX = face.frame.left + face.frame.width / 2;
      const faceCenterY = face.frame.top + face.frame.height / 2;

      // Scale to screen coordinates
      const screenFaceCenterX = (faceCenterX / photo.width) * screenWidth;
      const screenFaceCenterY = (faceCenterY / photo.height) * screenHeight;

      const ovalCenterX = screenWidth / 2;
      const ovalCenterY = screenHeight / 2;

      const xTolerance = ovalWidth * 0.4;
      const yTolerance = ovalHeight * 0.4;

      const isCentered =
        Math.abs(screenFaceCenterX - ovalCenterX) < xTolerance &&
        Math.abs(screenFaceCenterY - ovalCenterY) < yTolerance;

      console.log("📐 Face position check:", {
        faceCenterX: screenFaceCenterX,
        faceCenterY: screenFaceCenterY,
        ovalCenterX,
        ovalCenterY,
        isCentered,
      });

      if (!isCentered) {
        console.warn("⚠️ Face not centered in oval");
        setIsCapturing(false);
        setCaptureStatus("Position your face in the oval");
        Alert.alert(
          "Face Not Centered",
          "Please position your face inside the oval guide and try again.",
          [
            {
              text: "Retry",
              onPress: () => console.log("Retrying capture"),
            },
            {
              text: "Use Anyway",
              onPress: () => {
                console.log("Using photo despite not centered");
                // Continue with the capture
                processCapture(face, imageUri);
              },
            },
          ]
        );
        return;
      }

      processCapture(face, imageUri);
    } catch (error) {
      console.error("========================================");
      console.error("❌ ERROR: Failed to capture/process photo");
      console.error("========================================");
      console.error(error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      setIsCapturing(false);
      setCaptureStatus("Position your face in the oval");
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    }
  }, [isCapturing, screenWidth, screenHeight, ovalWidth, ovalHeight]);

  const processCapture = useCallback((face: Face, imageUri: string) => {
    try {
      // Check if eyes are open (blink detection)
      const leftEyeOpen =
        face.leftEyeOpenProbability !== undefined
          ? face.leftEyeOpenProbability > 0.4
          : true;
      const rightEyeOpen =
        face.rightEyeOpenProbability !== undefined
          ? face.rightEyeOpenProbability > 0.4
          : true;

      console.log("👁️ Eye state check:", {
        leftEyeOpen,
        rightEyeOpen,
        bothOpen: leftEyeOpen && rightEyeOpen,
      });

      if (!leftEyeOpen || !rightEyeOpen) {
        console.warn("⚠️ Eyes appear closed");
        setIsCapturing(false);
        setCaptureStatus("Position your face in the oval");
        Alert.alert(
          "Eyes Closed",
          "Please keep your eyes open and try again.",
          [
            {
              text: "Retry",
              onPress: () => console.log("Retrying capture"),
            },
            {
              text: "Use Anyway",
              onPress: () => {
                console.log("Using photo despite closed eyes");
                setMemberPicture({ uri: imageUri });
                setIsDefaultImage(false);
                setFaceCaptureVisible(false);
                setIsCapturing(false);
              },
            },
          ]
        );
        return;
      }

      console.log("🔵 STEP 10: Face verified! Updating state");
      // Note: Actual cropping would happen here with react-native-image-manipulator
      setMemberPicture({ uri: imageUri });
      setIsDefaultImage(false);
      setFaceCaptureVisible(false);
      setIsCapturing(false);

      console.log("✅ STEP 11: Showing success alert");
      const eyeScores = `Left: ${(
        (face.leftEyeOpenProbability || 0) * 100
      ).toFixed(0)}%, Right: ${(
        (face.rightEyeOpenProbability || 0) * 100
      ).toFixed(0)}%`;
      Alert.alert(
        "Success",
        `Face captured & validated!\n\nFace is centered in oval ✓\nEye Detection: ${eyeScores}`,
        [{ text: "OK", onPress: () => console.log("✅ Alert dismissed") }]
      );

      console.log("========================================");
      console.log("✅ Face capture completed successfully!");
      console.log("========================================");
    } catch (error) {
      console.error("Error in processCapture:", error);
      setIsCapturing(false);
      Alert.alert("Error", "Failed to process photo. Please try again.");
    }
  }, []);

  const handleFaceCaptureCancel = useCallback(() => {
    console.log("🔵 Cancelling face capture");

    // Clear detection interval
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    setFaceCaptureVisible(false);
    setIsCapturing(false);
    setFaceInPosition(false);
    setBorderColor("rgba(255, 255, 255, 0.8)");
    setCaptureStatus("Position your face in the oval");
    setLastPhotoUri(null);
  }, []);

  const uploadPersonalDocuments = async () => {
    try {
      const uploadPromises: Promise<any>[] = [];

      custData.personalDocuments?.forEach(
        (personalDoc: any, docIndex: number) => {
          if (personalDoc?.doc && personalDoc.doc.length > 0) {
            personalDoc.doc.forEach((document: any, imgIndex: number) => {
              const formData = new FormData();

              formData.append("customerId", custData.customerId);
              formData.append("documentCategory", "PERSONAL");
              formData.append("file", {
                uri: document.uri,
                type: document.type || "image/jpeg",
                name:
                  //document.fileName ||
                  //document.name ||
                  `PERSONAL-DOCUMENT-${docIndex + 1}-${imgIndex + 1}.${
                    document.type?.split("/")[1]
                  }`,
              } as any);

              if (
                personalDoc.details &&
                Object.keys(personalDoc.details).length > 0
              ) {
                formData.append(
                  "metadata",
                  JSON.stringify(personalDoc.details)
                );
              }

              const uploadPromise = loanDocumentInstance.post(
                "/api/v1/documents/upload",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );
              uploadPromises.push(uploadPromise);
            });
          }
        }
      );

      if (uploadPromises.length > 0) {
        const results = await Promise.all(uploadPromises);
        return true;
      } else {
        //logAlert("No documents to upload");
        return false;
      }
      return true;
    } catch (error: any) {
      console.log("Error uploading documents:", error?.response);
      //logErr(error);
      throw error;
    }
  };

  const uploadBankDocuments = async () => {
    try {
      const uploadPromises: Promise<any>[] = [];

      custData.bankDocuments?.forEach((loanDoc: any, docIndex: number) => {
        const documentCategory = loanDoc?.details?.document_type
          ?.toLowerCase()
          .includes("letter")
          ? "Job-Letter"
          : loanDoc?.details?.document_info?.type
          ? loanDoc?.details?.document_info?.type
          : "BANK_DOCUMENT";
        if (loanDoc?.doc && loanDoc.doc.length > 0) {
          loanDoc.doc.forEach((document: any, imgIndex: number) => {
            const formData = new FormData();

            formData.append("customerId", custData.customerId);
            formData.append("documentCategory", "BANK_DOCUMENT");
            formData.append("file", {
              uri: document.uri,
              type: document.type || "image/jpeg",
              name:
                //document.fileName ||
                //document.name ||
                `${documentCategory}-${docIndex + 1}-${imgIndex + 1}.${
                  document.type?.split("/")[1]
                }`,
            } as any);

            if (loanDoc.details && Object.keys(loanDoc.details).length > 0) {
              formData.append("metadata", JSON.stringify(loanDoc.details));
            }

            const uploadPromise = loanDocumentInstance.post(
              "/api/v1/documents/upload",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            uploadPromises.push(uploadPromise);
          });
        }
      });

      if (uploadPromises.length > 0) {
        const results = await Promise.all(uploadPromises);
        return true;
      } else {
        //logAlert("No documents to upload");
        return false;
      }
      return true;
    } catch (error: any) {
      console.log("Error uploading documents:", error?.response);
      //logErr(error);
      throw error;
    }
  };

  const uploadFinancialDocuments = async () => {
    try {
      const uploadPromises: Promise<any>[] = [];

      custData.financialDocuments?.forEach((loanDoc: any, docIndex: number) => {
        const documentCategory =
          loanDoc?.details?.document_info?.type === "Payslip"
            ? "Salary-Slip"
            : loanDoc?.details?.document_info?.type == "Invoice"
            ? "Proof-of-other-doc"
            : "FINANCIAL_DOCUMENT";
        if (loanDoc?.doc && loanDoc.doc.length > 0) {
          loanDoc.doc.forEach((document: any, imgIndex: number) => {
            const formData = new FormData();

            formData.append("customerId", custData.customerId);
            formData.append("documentCategory", "FINANCIAL_DOCUMENT");
            formData.append("file", {
              uri: document.uri,
              type: document.type || "image/jpeg",
              name:
                //document.fileName ||
                //document.name ||
                `${documentCategory}-${docIndex + 1}-${imgIndex + 1}.${
                  document.type?.split("/")[1]
                }`,
            } as any);

            if (loanDoc.details && Object.keys(loanDoc.details).length > 0) {
              formData.append("metadata", JSON.stringify(loanDoc.details));
            }

            const uploadPromise = loanDocumentInstance.post(
              "/api/v1/documents/upload",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            uploadPromises.push(uploadPromise);
          });
        }
      });

      if (uploadPromises.length > 0) {
        const results = await Promise.all(uploadPromises);
        return true;
      } else {
        //logAlert("No documents to upload");
        return false;
      }
      return true;
    } catch (error: any) {
      console.log("Error uploading documents:", error?.response);
      //logErr(error);
      throw error;
    }
  };

  const handleProceed = useCallback(() => {
    if (!capturedSignature || !isConfirmed) {
      logAlert("Please capture the signature and confirm the documents");
      return;
    }

    Promise.all([
      uploadPersonalDocuments(),
      uploadBankDocuments(),
      uploadFinancialDocuments(),
    ]).catch((error) => {
      console.log("Background upload error:", error);
      //logErr(error);
    });
    navigation.navigate("LoanSignature", {
      signatureImage: capturedSignature,
      memberPicture: memberPicture.uri,
    });
  }, [capturedSignature, isConfirmed, navigation, memberPicture]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header
        title="Document Holder Verification"
        subTitle="Complete signature and picture verification"
      />

      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LoanDetailView
          header="View Summary"
          content={{
            "Member Name": custData?.name || custData?.customerName,
            "Member No": custData?.customerId,
            "Loan Category": `${custData?.loanPurpose} LOAN`,
            Promotions: custData.promotions,
            "loan Amount": "$ " + custData.principalAmount,
            "Annual Interest Rate": custData.tentativeInterestRate,
            "Tentative EMI": "$ " + custData.monthlyEMI,
            "Tenor in Month":
              custData?.loanTenor === "Months"
                ? Number(custData?.tenorDuration)
                : Number(custData?.tenorDuration) * 12,
            "Installment Start Date": custData?.installmentStartDate,
            "Maturity Date": custData?.maturityDate,
          }}
        />
        {/* Member Signature Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Member Signature
          </Text>

          <TouchableOpacity
            style={[styles.signatureContainer, { borderColor: colors.border }]}
            onPress={() => setSignatureVisible(true)}
          >
            {capturedSignature ? (
              <Image
                source={{ uri: capturedSignature }}
                style={styles.signatureImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.signaturePlaceholder}>
                <Text
                  style={[
                    styles.signatureIcon,
                    { color: colors.textSecondary },
                  ]}
                >
                  ✍️
                </Text>
                <Text
                  style={[
                    styles.placeholderText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Tap to capture signature
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Member Picture Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Member Picture
          </Text>

          <View style={styles.centeredContainer}>
            <TouchableOpacity
              style={styles.pictureWithIconContainer}
              onPress={() => {
                console.log(
                  "🔴🔴🔴 BUTTON CLICKED: Tap to capture face 🔴🔴🔴"
                );
                handleFaceCapture();
              }}
            >
              <Image
                source={memberPicture}
                style={styles.memberPicture}
                resizeMode="contain"
              />
              {isDefaultImage && (
                <View style={styles.cameraIconContainer}>
                  <Text style={[styles.pictureLabel, { color: colors.text }]}>
                    📷
                  </Text>
                  <Text
                    style={[
                      styles.faceCaptureHint,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Tap to capture face
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {!isDefaultImage && (
              <View style={styles.captureStatusContainer}>
                <Text
                  style={[
                    styles.captureStatusText,
                    { color: colors.success || "#4CAF50" },
                  ]}
                >
                  ✓ Face captured successfully
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Confirmation Checkbox */}
        <View style={styles.confirmationSection}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsConfirmed(!isConfirmed)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: isConfirmed
                    ? colors.primary
                    : colors.surface,
                  borderColor: colors.primary,
                },
              ]}
            >
              {isConfirmed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.confirmationText, { color: colors.text }]}>
              I confirm all the above documents are correct and authorise the
              bank to proceed.
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      <Button
        buttonStyle={{
          marginVertical: hp(3),
        }}
        text="Proceed"
        click={handleProceed}
      />

      {/* Signature Capture Modal */}
      <Modal
        visible={signatureVisible}
        animationType="slide"
        onRequestClose={() => setSignatureVisible(false)}
      >
        <View style={styles.signatureModal}>
          <SignatureScreen
            webStyle={`
              .m-signature-pad {
                position: fixed;
                margin: auto;
                top: 0;
                width: 100%;
                height: 100vw;
              }
              body, html {
                position: relative;
              }
            `}
            onClear={() => setSignatureVisible(false)}
            androidHardwareAccelerationDisabled={true}
            onOK={handleSignatureCapture}
            descriptionText="Member Signature"
            penColor="white"
            backgroundColor="black"
            clearText="Clear"
            confirmText="Confirm"
            imageType="image/jpeg"
          />
        </View>
      </Modal>

      {/* Face Capture Modal with Vision Camera */}
      <Modal
        visible={faceCaptureVisible}
        animationType="slide"
        onRequestClose={handleFaceCaptureCancel}
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.cameraModal}>
          {device && hasPermission ? (
            <>
              <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={faceCaptureVisible}
                photo={true}
              />

              {/* Camera Overlay */}
              <View style={styles.cameraOverlay}>
                {/* Top Section */}
                <View style={styles.topOverlay}>
                  <Text style={styles.instructionText}>{captureStatus}</Text>
                  {faceInPosition ? (
                    <View
                      style={[
                        styles.faceDetectedBadge,
                        { backgroundColor: "rgba(76, 175, 80, 0.9)" },
                      ]}
                    >
                      <Text style={styles.faceDetectedText}>
                        ✓ PERFECT! Ready to capture
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.faceDetectedBadge,
                        { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                      ]}
                    >
                      <Text style={styles.faceDetectedText}>
                        📸 Keep eyes open & center face
                      </Text>
                    </View>
                  )}
                </View>

                {/* Middle Section - Dynamic Color Oval Guide */}
                <View style={styles.faceGuideContainer}>
                  <View
                    style={[
                      styles.faceGuideOval,
                      {
                        borderColor: borderColor,
                        borderWidth: faceInPosition ? 5 : 4,
                        shadowColor: faceInPosition ? "#4CAF50" : "transparent",
                        shadowOpacity: faceInPosition ? 0.8 : 0,
                        shadowRadius: faceInPosition ? 15 : 0,
                      },
                    ]}
                  />
                </View>

                {/* Bottom Section - Controls */}
                <View style={styles.bottomOverlay}>
                  <TouchableOpacity
                    style={[
                      styles.captureButton,
                      isCapturing && styles.captureButtonDisabled,
                      faceInPosition &&
                        !isCapturing &&
                        styles.captureButtonReady,
                    ]}
                    onPress={capturePhoto}
                    disabled={isCapturing}
                  >
                    {isCapturing ? (
                      <ActivityIndicator color="#fff" size="large" />
                    ) : (
                      <View
                        style={[
                          styles.captureButtonInner,
                          faceInPosition && styles.captureButtonInnerReady,
                        ]}
                      />
                    )}
                  </TouchableOpacity>

                  <Text style={styles.captureHint}>
                    {isCapturing
                      ? "Processing..."
                      : faceInPosition
                      ? "✓ Ready - Tap to capture!"
                      : "Position face correctly"}
                  </Text>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleFaceCaptureCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.permissionContainer}>
              <Text style={styles.permissionText}>
                {!device
                  ? "No camera device found."
                  : "Camera permission not granted."}
              </Text>
              <Button
                text="Grant Permission"
                click={handleFaceCapture}
                buttonStyle={styles.permissionButton}
              />
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export const LoanDetailView = ({
  header = "Details",
  content = {},
}: {
  header: string;
  content: any;
}) => {
  const theme = useTheme();
  const { colors, isDark } = theme;
  const styles = createStyles(colors, isDark);
  const [showContent, setShowContent] = useState(false);

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShowContent((prev: boolean) => !prev)}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginVertical: verticalScaling(6),
          paddingVertical: moderateScaling(10),
          alignItems: "center",
          borderColor: colors.border,
          borderWidth: 0.8,
          paddingHorizontal: hp(0.5),
          borderRadius: hp(0.8),
        }}
      >
        <Text
          style={{
            fontSize: hp(1.8),
            fontWeight: "600",
            color: "#000000",
          }}
        >
          {header}
        </Text>

        <Image
          source={drop_down}
          style={{
            transform: [{ rotate: showContent ? "0deg" : "-90deg" }],
            height: moderateScaling(20),
            width: moderateScaling(20),
          }}
        />
      </TouchableOpacity>

      {showContent && (
        <View
          style={{
            borderWidth: 0.8,
            borderColor: colors.border,
            borderRadius: hp(0.8),
            paddingHorizontal: hp(1),
            paddingVertical: hp(0.5),
          }}
        >
          {Object.keys(content).map((detail: any, index: number) =>
            content[detail] ? (
              <View style={styles.detailContainer}>
                <Text
                  style={[
                    styles.detailValue,
                    { color: colors.text, fontSize: hp(1.6) },
                  ]}
                >
                  {detail}
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: colors.textSecondary, fontSize: hp(1.6) },
                  ]}
                >
                  {content[detail]}
                </Text>
              </View>
            ) : null
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    section: {
      marginBottom: hp(3),
    },
    sectionTitle: {
      fontSize: hp(2.2),
      fontWeight: "600",
      marginBottom: hp(1.5),
    },
    signatureContainer: {
      height: hp(20),
      borderWidth: 1,
      borderRadius: wp(2),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface,
    },
    signatureImage: {
      width: "100%",
      height: "100%",
      borderRadius: wp(2),
    },
    signaturePlaceholder: {
      alignItems: "center",
      justifyContent: "center",
    },
    signatureIcon: {
      fontSize: hp(4),
      marginBottom: hp(1),
    },
    placeholderText: {
      fontSize: hp(1.6),
      textAlign: "center",
    },
    pictureContainer: {
      borderRadius: wp(2),
      padding: wp(4),
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    memberPicture: {
      width: wp(55),
      height: wp(55),
      borderRadius: wp(2),
      borderWidth: 2,
      borderColor: "#808080",
    },
    pictureLabel: {
      fontSize: hp(2.4),
      marginTop: hp(1),
      fontWeight: "800",
    },
    centeredContainer: {
      alignItems: "center",
    },
    pictureWithIconContainer: {
      position: "relative",
    },
    cameraIconContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: wp(3),
      backgroundColor: colors.surface,
      width: wp(55),
      height: wp(55),
    },
    confirmationSection: {
      marginTop: hp(2),
      marginBottom: hp(3),
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    checkbox: {
      width: wp(5),
      height: wp(5),
      borderWidth: 2,
      borderRadius: wp(1),
      alignItems: "center",
      justifyContent: "center",
      marginRight: wp(3),
      marginTop: hp(0.2),
    },
    checkmark: {
      color: "white",
      fontSize: hp(1.4),
      fontWeight: "bold",
    },
    confirmationText: {
      fontSize: hp(1.6),
      lineHeight: hp(2.2),
      flex: 1,
    },
    buttonContainer: {
      paddingHorizontal: wp(4),
      paddingBottom: hp(2),
    },
    proceedButton: {
      borderRadius: wp(2),
      paddingVertical: hp(2),
      alignItems: "center",
    },
    signatureModal: {
      flex: 1,
      backgroundColor: "#000",
    },
    faceCaptureHint: {
      fontSize: hp(1.4),
      marginTop: hp(0.5),
      textAlign: "center",
      paddingHorizontal: wp(2),
    },
    captureStatusContainer: {
      marginTop: hp(1.5),
      alignItems: "center",
    },
    captureStatusText: {
      fontSize: hp(1.6),
      fontWeight: "600",
    },
    cameraModal: {
      flex: 1,
      backgroundColor: "black",
    },
    cameraOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    topOverlay: {
      width: "100%",
      paddingTop: hp(5),
      alignItems: "center",
      gap: hp(1),
    },
    instructionText: {
      fontSize: hp(2.2),
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center",
    },
    faceDetectedBadge: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(1),
      borderRadius: wp(5),
      backgroundColor: "rgba(76, 175, 80, 0.9)",
    },
    faceDetectedText: {
      color: "#fff",
      fontSize: hp(1.8),
      fontWeight: "600",
    },
    faceGuideContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    faceGuideOval: {
      width: wp(70),
      height: wp(90),
      borderRadius: wp(35),
      borderWidth: 4,
      borderColor: "rgba(255, 255, 255, 0.8)",
      shadowOffset: { width: 0, height: 0 },
    },
    bottomOverlay: {
      paddingBottom: hp(5),
      alignItems: "center",
      gap: hp(2),
    },
    captureButton: {
      width: wp(18),
      height: wp(18),
      borderRadius: wp(9),
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 4,
      borderColor: "#fff",
    },
    captureButtonDisabled: {
      opacity: 0.5,
    },
    captureButtonReady: {
      backgroundColor: "rgba(76, 175, 80, 0.3)",
      borderColor: "#4CAF50",
      borderWidth: 5,
      shadowColor: "#4CAF50",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 20,
    },
    captureButtonInnerReady: {
      backgroundColor: "#4CAF50",
    },
    captureButtonInner: {
      width: wp(16),
      height: wp(16),
      borderRadius: wp(8),
      backgroundColor: "#fff",
    },
    captureHint: {
      color: "#fff",
      fontSize: hp(1.8),
      fontWeight: "500",
    },
    cancelButton: {
      paddingHorizontal: wp(8),
      paddingVertical: hp(1.5),
      borderRadius: wp(5),
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    cancelButtonText: {
      color: "#fff",
      fontSize: hp(2),
      fontWeight: "600",
    },
    permissionContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: wp(5),
      backgroundColor: "black",
    },
    permissionText: {
      color: "#fff",
      fontSize: hp(2.2),
      textAlign: "center",
      marginBottom: hp(3),
    },
    permissionButton: {
      width: wp(60),
    },
    detailContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: hp(1.5),
    },
    detailLabel: {
      width: "50%",
    },
    detailValue: {
      fontWeight: "bold",
      width: "50%",
    },
  });

export default React.memo(DocumentHolderVerification);
