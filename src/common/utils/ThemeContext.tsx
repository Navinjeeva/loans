import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

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
    background: '#FFFFFF',
    backgroundLight: '#FFFFFF',
    backgroundGrey: '#FFFFFF',
    surface: '#F8F9FA',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',

    // Text colors
    text: '#000000',
    textSecondary: '#6C757D',
    textMuted: '#ADB5BD',
    textInverse: '#FFFFFF',

    // Primary colors
    primary: '#6C4FF7',
    primaryLight: '#F4A261',
    primaryDark: '#D2691E',
    secondary: '#6C757D',

    // Status colors
    success: '#28A745',
    successLight: '#D4EDDA',
    warning: '#FFC107',
    warningLight: '#FFF3CD',
    error: '#DC3545',
    errorLight: '#F8D7DA',
    info: '#17A2B8',
    infoLight: '#D1ECF1',

    // Border colors
    border: '#DEE2E6',
    borderLight: '#E9ECEF',
    borderDark: '#CED4DA',

    // Input colors
    inputBackground: '#FFFFFF',
    inputBorder: '#CED4DA',
    inputText: '#000000',
    inputPlaceholder: '#6C757D',
    inputDisabledBackground: '#F5F5F5',
    inputFocusBorder: '#F13937',

    // Button colors
    buttonPrimary: '#6C4FF7',
    buttonPrimaryHover: '#D2691E',
    buttonSecondary: '#6C757D',
    buttonSecondaryHover: '#5A6268',
    buttonText: '#FFFFFF',
    buttonTextSecondary: '#6C757D',

    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',

    // Accent colors
    accent: '#F13937',
    accentLight: '#F4A261',
  },
  dark: {
    // Background colors
    background: '#201F1F',
    backgroundLight: '#2A2A2A',
    backgroundGrey: '#3C3C3C',
    surface: '#1E1E1E',
    card: '#2C2C2C',
    overlay: 'rgba(0, 0, 0, 0.7)',

    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textMuted: '#808080',
    textInverse: '#000000',

    // Primary colors
    primary: '#6C4FF7',
    primaryLight: '#F4A261',
    primaryDark: '#D2691E',
    secondary: '#03DAC6',

    // Status colors
    success: '#4CAF50',
    successLight: '#2E7D32',
    warning: '#FF9800',
    warningLight: '#F57C00',
    error: '#F44336',
    errorLight: '#D32F2F',
    info: '#2196F3',
    infoLight: '#1976D2',

    // Border colors
    border: '#3A3A3A',
    borderLight: '#4A4A4A',
    borderDark: '#2A2A2A',

    // Input colors
    inputBackground: '#2C2C2C',
    inputBorder: '#3A3A3A',
    inputText: '#FFFFFF',
    inputPlaceholder: '#B0B0B0',
    inputDisabledBackground: '#1E1E1E',
    inputFocusBorder: '#F13937',

    // Button colors
    buttonPrimary: '#6C4FF7',
    buttonPrimaryHover: '#D2691E',
    buttonSecondary: '#03DAC6',
    buttonSecondaryHover: '#00BFA5',
    buttonText: '#FFFFFF',
    buttonTextSecondary: '#B0B0B0',

    // Shadow colors
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowLight: 'rgba(0, 0, 0, 0.2)',

    // Accent colors
    accent: '#03DAC6',
    accentLight: '#00BFA5',
  },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  //const [isDark, setIsDark] = useState(Appearance.getColorScheme() === 'dark');
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider
      value={{ isDark, toggleTheme, colors: colors[isDark ? 'dark' : 'light'] }}
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
