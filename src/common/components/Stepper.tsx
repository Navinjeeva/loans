import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '../utils/ThemeContext';

const Stepper = ({
  steps,
  currentStep,
  onClick = (index: number) => {},
}: {
  steps: string[];
  currentStep: number;
  onClick?: (index: number) => void;
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.stepper, { backgroundColor: colors.background }]}>
      {steps.map((step: string, index: number) => (
        <React.Fragment key={index}>
          <TouchableOpacity
            onPress={() => onClick(index)}
            style={styles.stepButton}
          >
            <Text
              style={[
                styles.stepText,
                {
                  color:
                    index === currentStep ? colors.primary : colors.textMuted,
                },
              ]}
            >
              {step.split('_').join(' ')}
            </Text>
          </TouchableOpacity>
          {index < steps.length - 1 && (
            <Text style={[styles.separator, { color: colors.textMuted }]}>
              ›
            </Text>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
    marginTop: hp(0.5),
    marginHorizontal: wp(5),
  },
  stepButton: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
  },
  stepText: {
    fontSize: hp(1.4),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  separator: {
    fontSize: hp(2),
    marginHorizontal: wp(1),
  },
});

export default Stepper;
