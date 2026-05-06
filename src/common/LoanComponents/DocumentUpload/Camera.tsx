import React, { useEffect } from "react";
import { Alert } from "react-native";
import ScanbotSDK, { Page } from "react-native-scanbot-sdk";
import { Image } from "react-native";

/**
 * Rotates landscape images by 180 degrees (portrait images remain unchanged)
 * @param page - The scanned page object
 * @returns The rotated page (if landscape) or original page (if portrait)
 */
const rotateLandscapeImage = async (page: Page): Promise<Page> => {
  try {
    // Get image dimensions to check orientation
    const imageUri = page.documentImageFileUri || page.originalImageFileUri;

    return new Promise((resolve, reject) => {
      Image.getSize(
        imageUri,
        async (width, height) => {
          try {
            // If image is in portrait (height > width), return as is
            if (width >= height) {
              resolve(page);
              return;
            }
            // Image is in landscape, rotate 180 degrees
            const rotatedPage = await ScanbotSDK.rotatePage(page, 3); // 2 = 180° rotation
            resolve(rotatedPage);
          } catch (error) {
            console.error("Error rotating page:", error);
            // If rotation fails, return original page
            resolve(page);
          }
        },
        (error) => {
          console.error("Error getting image size:", error);
          // If we can't get size, return original page
          resolve(page);
        }
      );
    });
  } catch (error) {
    console.error("Error in rotateToLandscape:", error);
    return page;
  }
};

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
    try {
      // Calculate remaining slots (max 2 total images)
      const maxImages = 2;
      const remainingSlots = Math.min(
        maxImages - files.length,
        limit - files.length
      );

      if (remainingSlots <= 0) {
        Alert.alert("Limit Reached", "You can only capture up to 2 images.");
        setVisible(false);
        return;
      }

      // Launch scanner with edge detection and auto-capture (default config)
      const result = await ScanbotSDK.UI.startDocumentScanner({});

      if (result.status === "OK") {
        // Access pages from result.data
        const scanData = result.data;

        if (scanData && scanData.pages && scanData.pages.length > 0) {
          const scannedPages: Page[] = scanData.pages;

          // Limit to maximum 2 images total
          const maxImages = 2;
          const currentCount = files.length;
          const pagesToProcess = scannedPages.slice(
            0,
            maxImages - currentCount
          );

          const newImages = await Promise.all(
            pagesToProcess.map(async (page, index) => {
              // Rotate landscape images 180 degrees
              const rotatedPage = await rotateLandscapeImage(page);

              // Get the document image (cropped with perspective correction)
              const imageUri =
                rotatedPage.documentImageFileUri ||
                rotatedPage.originalImageFileUri;

              return {
                uri: imageUri,
                name: `scan_${Date.now()}_${index}.jpg`,
                type: "image/jpeg",
              };
            })
          );

          setFiles([...files, ...newImages]);

          // Show message if more images were scanned than allowed
          if (scannedPages.length > pagesToProcess.length) {
            Alert.alert(
              "Limit Reached",
              "Only 2 images can be captured. Additional images were ignored."
            );
          }
        }
      } else if (result.status === "CANCELED") {
        console.log("Scanner was cancelled by user");
      }
    } catch (error: any) {
      console.error("Document scan error:", error);
      console.error("Error details:", JSON.stringify(error));
      // Don't show alert for user cancellation
      if (error.message && !error.message.includes("cancel")) {
        Alert.alert("Scan Error", "Failed to scan document. Please try again.");
      }
    } finally {
      setVisible(false);
    }
  };

  return null; // Native full-screen scanner UI with edge detection
}
