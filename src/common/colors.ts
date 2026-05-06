// Simple color theme system with light and dark colors
export const colors = {
  light: {
    // Background colors
    background: "#FFFFFF",
    surface: "#F8F9FA",
    card: "#FFFFFF",

    // Text colors
    text: "#000000",
    textSecondary: "#6C757D",
    textMuted: "#ADB5BD",

    // Primary colors
    primary: "#F13937",
    secondary: "#6C757D",

    // Status colors
    success: "#28A745",
    warning: "#FFC107",
    error: "#DC3545",
    info: "#17A2B8",

    // Border colors
    border: "#DEE2E6",

    // Input colors
    inputBackground: "#FFFFFF",
    inputBorder: "#CED4DA",
    inputText: "#000000",
    inputPlaceholder: "#6C757D",

    // Button colors
    buttonPrimary: "#F13937",
    buttonSecondary: "#6C757D",
    buttonText: "#FFFFFF",
  },

  dark: {
    // Background colors
    background: "#121212",
    surface: "#1E1E1E",
    card: "#2C2C2C",

    // Text colors
    text: "#FFFFFF",
    textSecondary: "#B0B0B0",
    textMuted: "#808080",

    // Primary colors
    primary: "#F13937",
    secondary: "#03DAC6",

    // Status colors
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",

    // Border colors
    border: "#3A3A3A",

    // Input colors - Updated to match the image design
    inputBackground: "#2C2C2C", // Dark gray background like in the image
    inputBorder: "#FFFFFF", // White border like in the image
    inputText: "#FFFFFF", // White text
    inputPlaceholder: "#B0B0B0", // Light gray placeholder

    // Button colors
    buttonPrimary: "#F13937",
    buttonSecondary: "#03DAC6",
    buttonText: "#FFFFFF",
  },
};

// Helper function to get current theme colors
export const getThemeColors = (isDark: boolean) => {
  return isDark ? colors.dark : colors.light;
};

// Helper function to detect system theme
export const getSystemTheme = () => {
  const { Appearance } = require("react-native");
  return Appearance.getColorScheme() === "dark";
};
