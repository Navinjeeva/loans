import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '@src/common/utils/ThemeContext';

type Props = {
  title: string;
  subtitle?: string;
  style?: any;
};

const TextHeader = ({ title, subtitle, style }: Props) => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: wp(1.5),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingBottom: hp(1),
    },
    title: {
      fontSize: hp(2.2),
      fontWeight: '600',
      marginBottom: hp(0.5),
    },
    subtitle: {
      fontSize: hp(1.4),
      lineHeight: hp(2.2),
    },
  });

export default TextHeader;
