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
    <View style={styles.stepper}>
      <View style={styles.container}>
        <View style={styles.stepContainer}>
          {steps.map((step: string, index: number) => (
            <TouchableOpacity
              onPress={() => onClick(index)}
              key={index}
              style={[
                styles.textView,
                {
                  backgroundColor:
                    index == currentStep ? colors.primary : 'transparent',
                  borderRadius: wp(15),
                  minHeight: 47,
                },
              ]}
            >
              <Text
                style={[
                  styles.textContainer,
                  {
                    fontSize: hp(1.2),
                    color: index == currentStep ? '#fff' : '#000',
                  },
                ]}
              >
                {step.split('_').join(' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContainer: {
    marginVertical: hp(0.5),
    flexDirection: 'row',
    width: wp(88),
    justifyContent: 'space-between',
  },
  stepper: {
    backgroundColor: '#FFF9F0',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#FF9C47',
    marginHorizontal: wp(5),
    borderRadius: wp(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp(1),
    // paddingHorizontal:wp(4),
    // paddingVertical : hp(2)
  },
  textView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(0.5),
  },
  textContainer: {
    alignItems: 'center',
    paddingVertical: hp(1.3),
    paddingHorizontal: wp(1),

    textAlign: 'center',
  },
});

export default Stepper;
