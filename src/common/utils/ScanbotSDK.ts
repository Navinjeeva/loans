import ScanbotSDK from "react-native-scanbot-sdk";

// SDK initialization state
let sdkInitialized = false;
let sdkInitPromise: Promise<boolean> | null = null;

// Scanbot SDK License Key
const SCANBOT_LICENSE_KEY =
  "TEG7ckVw9wKeAxi87Ul910RzQ20/4y" +
  "oOrDbiJpZlyBoncYGH2JxFPFsOevjR" +
  "Ti6mHVSDJzQi2xCwGdKCChsZizYLD9" +
  "IxCSoCbv6ZJCTXlRW+ISOQobuRRRFd" +
  "1K2mQ5RMWwJSeeLSw1RsPZe4M0oyB7" +
  "+f+aGTSDRgrik2F6aSRfoI7XiAKj7A" +
  "sq0eisx6CSF2ISf/xmyGz86EeMOR3G" +
  "fkmY9Ao2OaRk980OtEfvMGLbbtcYBs" +
  "bSbQ3iZZJ8EqbsSif+s6h9Cx3RRYhE" +
  "TTI25KItgh39oxJloy4VGqMzUVmo+2" +
  "IYqVIdUx5igYq6EuYMIgvTOYNYRbdJ" +
  "n3Bbz1XSdmdw==\nU2NhbmJvdFNESw" +
  "puZXQuaW1wYWN0by5CMkMKMTc2NDAy" +
  "ODc5OQo4Mzg4NjA3CjE5\n";

/**
 * Initialize Scanbot SDK
 * Call this once when the app launches
 */
export const initializeScanbotSDK = async (): Promise<boolean> => {
  // If already initialized or initializing, return existing promise
  if (sdkInitialized) {
    return true;
  }

  if (sdkInitPromise) {
    return sdkInitPromise;
  }

  // Create initialization promise
  sdkInitPromise = (async () => {
    try {
      const sdk = await ScanbotSDK.initializeSDK({
        licenseKey: SCANBOT_LICENSE_KEY,
        loggingEnabled: true,
        storageImageFormat: "JPG",
        storageImageQuality: 100,
      });

      sdkInitialized = true;
      return true;
    } catch (error: any) {
      console.error("❌ SDK initialization error:", error);
      console.error("Error details:", JSON.stringify(error));
      // Reset on error to allow retry
      sdkInitPromise = null;
      return false;
    }
  })();

  return sdkInitPromise;
};

/**
 * Check if SDK is initialized
 */
export const isScanbotSDKInitialized = (): boolean => {
  return sdkInitialized;
};
