import React, { createContext, useContext, useState, useEffect } from "react";
import { Appearance } from "react-native";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: {
    // Background colors
    background: string;
    backgroundLight: string;
    backgroundGrey: string;
    surface: string;
    card: string;
    overlay: string;

    // Text colors
    text: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;

    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;

    // Status colors
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    info: string;
    infoLight: string;

    // Border colors
    border: string;
    borderLight: string;
    borderDark: string;

    // Input colors
    inputBackground: string;
    inputBorder: string;
    inputText: string;
    inputPlaceholder: string;
    inputDisabledBackground: string;
    inputFocusBorder: string;

    // Button colors
    buttonPrimary: string;
    buttonPrimaryHover: string;
    buttonSecondary: string;
    buttonSecondaryHover: string;
    buttonText: string;
    buttonTextSecondary: string;
    buttonDisabledBackground: string;
    buttonDisabledText: string;

    // Footer / sticky bar
    footerBackground: string;

    // Step indicator (ScreenHeader)
    stepDone: string;
    stepCurrent: string;
    stepUpcoming: string;
    stepNumber: string;
    stepNumberTotal: string;

    // Used in: ClassificationScreen (Corporate Loan onboarding)
    brand: string;
    dividerSoft: string;
    ink: string;
    ink2: string;
    muted: string;
    faint: string;
    inputLabel: string;

    // Used in: VerifyCompanyScreen (Corporate Loan) — tinted surfaces
    brandTint: string;
    dangerTint: string;
    dangerBorder: string;

    // Used in: CollateralSection — subtle surfaces & destructive accents
    surfaceSoft: string;
    danger: string;
    dangerSoft: string;
    dangerSoftBorder: string;

    // Used in: PersonKYCCard — deterministic per-person avatar palette
    avatarPalette: string[];

    // Used in: ExpandableSection — amber "Please check" status badge
    warningInk: string;
    warningSoft: string;

    // Used in: InAppCameraModal — fixed-dark camera UI surfaces
    cameraBg: string;
    cameraScrim: string;

    // Used in: DocumentPreviewModal — "Uploaded" status badge (informational blue)
    infoInk: string;
    infoSoft: string;

    // Used in: ReviewScreen declaration rows — soft success border
    successBorder: string;

    // Used in: DropDownModal / EntityEditor (bottom-sheet primitives)
    hairline: string;
    handle: string;
    modalBackdrop: string;

    // Used in: EntityEditor (form-modal accents)
    brand600: string;
    switchTrack: string;
    brandBorder: string;

    // Shadow colors
    shadow: string;
    shadowLight: string;

    // Accent colors
    accent: string;
    accentLight: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colors = {
  light: {
    // Background colors
    background: "#FFFFFF",
    backgroundLight: "#FFFFFF",
    backgroundGrey: "#FFFFFF",
    surface: "#F8F9FA",
    card: "#FFFFFF",
    overlay: "rgba(0, 0, 0, 0.5)",

    // Text colors
    text: "#000000",
    textSecondary: "#6C757D",
    textMuted: "#ADB5BD",
    textInverse: "#FFFFFF",

    // Primary colors
    primary: "#4316CC",
    primaryLight: "#7C57FF",
    // primary: "#F13937",
    // primaryLight: "#F4A261",
    primaryDark: "#D2691E",
    secondary: "#6C757D",

    // Status colors
    success: "#28A745",
    successLight: "#D4EDDA",
    warning: "#FFC107",
    warningLight: "#FFF3CD",
    error: "#DC3545",
    errorLight: "#F8D7DA",
    info: "#17A2B8",
    infoLight: "#D1ECF1",

    // Border colors
    border: "#DEE2E6",
    borderLight: "#E9ECEF",
    borderDark: "#CED4DA",

    // Input colors
    inputBackground: "#FFFFFF",
    inputBorder: "#CED4DA",
    inputText: "#000000",
    inputPlaceholder: "#6C757D",
    inputDisabledBackground: "#F5F5F5",
    inputFocusBorder: "#F13937",

    // Button colors
    buttonPrimary: "#f97316",
    //buttonPrimary: "#F13937",
    buttonPrimaryHover: "#CF5A1F",
    buttonSecondary: "#6C757D",
    buttonSecondaryHover: "#5A6268",
    buttonText: "#FFFFFF",
    buttonTextSecondary: "#6C757D",
    buttonDisabledBackground: "#EFF0F4",
    buttonDisabledText: "#9AA0AB",

    // Footer / sticky bar
    footerBackground: "rgba(255,255,255,0.92)",

    // Step indicator (ScreenHeader)
    stepDone: "#ED6E27",
    stepCurrent: "#F2A875",
    stepUpcoming: "#E6EAF0",
    stepNumber: "#6F7480",
    stepNumberTotal: "#9AA0AB",

    // Used in: ClassificationScreen (Corporate Loan onboarding)
    brand: "#ED6E27",
    dividerSoft: "#EFF1F5",
    ink: "#1A1D23",
    ink2: "#2A2E37",
    muted: "#6F7480",
    faint: "#9AA0AB",
    inputLabel: "#5B616E",

    // Used in: VerifyCompanyScreen (Corporate Loan) — tinted surfaces
    brandTint: "#FFF4EC",
    dangerTint: "#FEF2F2",
    dangerBorder: "#FECACA",

    // Used in: CollateralSection — subtle surfaces & destructive accents
    surfaceSoft: "#F6F7FA",
    danger: "#E04A3F",
    dangerSoft: "#FCEBEA",
    dangerSoftBorder: "#F3C6C2",

    // Used in: PersonKYCCard — deterministic per-person avatar palette
    avatarPalette: [
      "#C2185B",
      "#7B1FA2",
      "#1565C0",
      "#00695C",
      "#E65100",
      "#4527A0",
      "#D81B60",
      "#5E35B1",
    ],

    // Used in: ExpandableSection — amber "Please check" status badge
    warningInk: "#D97706",
    warningSoft: "#FEF4E2",

    // Used in: InAppCameraModal — fixed-dark camera UI surfaces
    cameraBg: "#000000",
    cameraScrim: "rgba(0,0,0,0.45)",

    // Used in: DocumentPreviewModal — "Uploaded" status badge (informational blue)
    infoInk: "#2563EB",
    infoSoft: "#EAF1FE",

    // Used in: ReviewScreen declaration rows — soft success border
    successBorder: "#BBE6CB",

    // Used in: DropDownModal / EntityEditor (bottom-sheet primitives)
    hairline: "#F1F2F6",
    handle: "#E2E8F0",
    modalBackdrop: "rgba(15,23,42,0.42)",

    // Used in: EntityEditor (form-modal accents)
    brand600: "#E15F26",
    switchTrack: "#D7DEE8",
    brandBorder: "#F4CBA9",

    // Shadow colors
    shadow: "rgba(0, 0, 0, 0.1)",
    shadowLight: "rgba(0, 0, 0, 0.05)",

    // Accent colors
    accent: "#F13937",
    accentLight: "#F4A261",
  },
  dark: {
    // Background colors
    background: "#201F1F",
    backgroundLight: "#2A2A2A",
    backgroundGrey: "#3C3C3C",
    surface: "#1E1E1E",
    card: "#2C2C2C",
    overlay: "rgba(0, 0, 0, 0.7)",

    // Text colors
    text: "#FFFFFF",
    textSecondary: "#B0B0B0",
    textMuted: "#808080",
    textInverse: "#000000",

    // Primary colors
    primary: "#4316CC",
    primaryLight: "#7C57FF",
    //primary: "#F13937",
    //primaryLight: "#F4A261",
    primaryDark: "#D2691E",
    secondary: "#03DAC6",

    // Status colors
    success: "#4CAF50",
    successLight: "#2E7D32",
    warning: "#FF9800",
    warningLight: "#F57C00",
    error: "#F44336",
    errorLight: "#D32F2F",
    info: "#2196F3",
    infoLight: "#1976D2",

    // Border colors
    border: "#3A3A3A",
    borderLight: "#4A4A4A",
    borderDark: "#2A2A2A",

    // Input colors
    inputBackground: "#2C2C2C",
    inputBorder: "#3A3A3A",
    inputText: "#FFFFFF",
    inputPlaceholder: "#B0B0B0",
    inputDisabledBackground: "#1E1E1E",
    inputFocusBorder: "#F13937",

    // Button colors
    buttonPrimary: "#4316CC",
    //buttonPrimary: "#F13937",
    buttonPrimaryHover: "#311299",
    buttonSecondary: "#03DAC6",
    buttonSecondaryHover: "#00BFA5",
    buttonText: "#FFFFFF",
    buttonTextSecondary: "#B0B0B0",
    buttonDisabledBackground: "#2A2A2A",
    buttonDisabledText: "#6F7480",

    // Footer / sticky bar
    footerBackground: "rgba(28,28,28,0.94)",

    // Step indicator (ScreenHeader)
    stepDone: "#ED6E27",
    stepCurrent: "#F2A875",
    stepUpcoming: "#3A3A3A",
    stepNumber: "#B0B0B0",
    stepNumberTotal: "#6F7480",

    // Used in: ClassificationScreen (Corporate Loan onboarding)
    brand: "#ED6E27",
    dividerSoft: "#3A3A3A",
    ink: "#FFFFFF",
    ink2: "#E4E6EA",
    muted: "#B0B0B0",
    faint: "#808080",
    inputLabel: "#B0B0B0",

    // Used in: VerifyCompanyScreen (Corporate Loan) — tinted surfaces
    brandTint: "#3A2415",
    dangerTint: "#3A1414",
    dangerBorder: "#5A2424",

    // Used in: CollateralSection — subtle surfaces & destructive accents
    surfaceSoft: "#2A2A2A",
    danger: "#F44336",
    dangerSoft: "#3A1414",
    dangerSoftBorder: "#5A2424",

    // Used in: PersonKYCCard — deterministic per-person avatar palette
    avatarPalette: [
      "#C2185B",
      "#7B1FA2",
      "#1565C0",
      "#00695C",
      "#E65100",
      "#4527A0",
      "#D81B60",
      "#5E35B1",
    ],

    // Used in: DropDownModal / EntityEditor (bottom-sheet primitives)
    hairline: "#2A2A2A",
    handle: "#4A4A4A",
    modalBackdrop: "rgba(0,0,0,0.6)",

    // Used in: EntityEditor (form-modal accents)
    brand600: "#E15F26",
    switchTrack: "#3A3A3A",
    brandBorder: "#5A3920",

    // Shadow colors
    shadow: "rgba(0, 0, 0, 0.3)",
    shadowLight: "rgba(0, 0, 0, 0.2)",

    // Accent colors
    accent: "#03DAC6",
    accentLight: "#00BFA5",

    // Used in: ExpandableSection — amber "Please check" status badge
    warningInk: "#FBBF24",
    warningSoft: "#3A2C14",

    // Used in: InAppCameraModal — fixed-dark camera UI surfaces
    cameraBg: "#000000",
    cameraScrim: "rgba(0,0,0,0.45)",

    // Used in: DocumentPreviewModal — "Uploaded" status badge (informational blue)
    infoInk: "#60A5FA",
    infoSoft: "#14243F",

    // Used in: ReviewScreen declaration rows — soft success border
    successBorder: "#2E5D3E",
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDark, setIsDark] = useState(Appearance.getColorScheme() === "dark");

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === "dark");
    });
    return () => subscription?.remove();
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const isLightorDark = colors[isDark ? "dark" : "light"];

  return (
    <ThemeContext.Provider
      value={{ isDark, toggleTheme, colors: colors["light"] }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default theme instead of throwing error
    return {
      isDark: false,
      toggleTheme: () => {},
      colors: colors.light,
    };
  }
  return context;
};
