import React, { FC } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import CurrencyInput from 'react-native-currency-input';

interface CustomTextInputProps {
  value: number | null;
  onChangeText: (text: any) => void;
  label?: string;
  backgroundColor?: string;
  style?: object;
  labelStyle?: object;
  isText?: boolean;
  disabled?: boolean;
  imageSource?: ImageSourcePropType;
  lableimp?: boolean;
  imageStyles?: object;
  onPress?: () => void;
  borderWidth?: boolean;
  imgpress?: () => void;
  secureTextEntry?: boolean;
  keyboard?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'number-pad';
  withLabel?: boolean;
  showFormat?: boolean;
  prefix?: string;
  placeholder?: string;
  maxValue?: undefined | number;
  minValue?: undefined | number;
  missingField?: boolean;
  submitClicked?: boolean;
}

const CurrencyInputField: FC<CustomTextInputProps> = ({
  label,
  labelStyle,
  value,
  onChangeText,
  backgroundColor = '#e6e6e6',
  style,
  isText = false,
  disabled = false,
  imageSource,
  lableimp,
  imageStyles,
  borderWidth = false,
  secureTextEntry = false,
  keyboard = 'default',
  onPress,
  imgpress,
  withLabel = true,
  showFormat = false,
  placeholder = '',
  prefix = '$ ',
  maxValue = undefined,
  minValue = 0,
  missingField = false,
  submitClicked = false,
  ...props
}) => {
  return (
    <View
      style={[
        {
          // flex: 1,
          flexDirection: 'row',
        },
        style,
      ]}
    >
      {/* {showFormat && (
        <View
          style={{
            marginVertical: 10,
          }}
        >
          <Text style={labelStyle ? labelStyle : styles.label}>Currency</Text>
        </View>
      )} */}

      <View style={[withLabel && styles.container, { flex: 1 }]}>
        {withLabel && (
          <View style={{ flexDirection: 'row' }}>
            {label && (
              <Text style={labelStyle ? labelStyle : styles.label}>
                {label}
              </Text>
            )}
            {lableimp && <Text style={{ color: 'red' }}> *</Text>}
          </View>
        )}

        {isText ? (
          <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={[
              styles.textContainer,
              { backgroundColor },
              {
                flex: 1,
                borderWidth: 1,
                borderColor: '#B1B1B1',
                backgroundColor: disabled ? '#F4F4F4' : 'transparent',
              },
            ]}
          >
            <Text style={styles.text}>{value}</Text>
            {imageSource && (
              <Image source={imageSource} style={[styles.image, imageStyles]} />
            )}
          </TouchableOpacity>
        ) : (
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            {showFormat && (
              <View
                style={{
                  flex: 0.15,
                  borderTopWidth: 1,
                  borderLeftWidth: 1,
                  borderBottomWidth: 1,
                  borderTopLeftRadius: 5,
                  borderBottomLeftRadius: 5,
                  borderColor: '#B1B1B1',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 16,
                  backgroundColor: '#F4F4F4',
                }}
              >
                <Text
                  style={{
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: hp(2),
                  }}
                >
                  TT$
                </Text>
              </View>
            )}

            <View
              style={[
                withLabel
                  ? styles.inputContainer
                  : {
                      flexDirection: 'row',
                      alignItems: 'center',
                      // paddingHorizontal: 10,
                      borderRadius: 5,
                      height: 'auto',
                    },
                withLabel && {
                  backgroundColor: disabled ? '#F4F4F4' : backgroundColor,
                  borderWidth: 1,
                  borderColor:
                    submitClicked && missingField ? 'red' : '#B1B1B1',
                },
                borderWidth && { borderWidth: 1 },
                { flex: 1 },
              ]}
            >
              <CurrencyInput
                value={Number(value)}
                editable={!disabled}
                onChangeValue={val => {
                  if (onChangeText) onChangeText(val); // Ensure onChangeText is called with the updated value
                }}
                secureTextEntry={secureTextEntry}
                style={[
                  styles.input,
                  !withLabel && {
                    height: 'auto',
                    paddingVertical: 0,
                  },
                  {
                    color: '#000',
                    backgroundColor: disabled ? '#F4F4F4' : 'transparent',
                    paddingHorizontal: 0,
                  },
                ]}
                placeholderTextColor={'gray'}
                prefix={prefix}
                delimiter=","
                separator="."
                precision={2}
                minValue={-Number.MAX_SAFE_INTEGER} // Allow large negative values
                maxValue={maxValue}
                {...props}
                onChangeText={formattedValue => {}}
              />

              {imageSource && (
                <TouchableOpacity onPress={imgpress}>
                  <Image
                    source={imageSource}
                    style={[styles.image, imageStyles]}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginVertical: 10,
  },
  label: {
    marginBottom: 5,
    fontSize: hp(1.6),
    fontWeight: '400',
    color: '#363636',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: hp(1.6),
    color: 'black',
    height: hp(6),
  },
  text: {
    flex: 1,
    fontSize: hp(1.6),
    color: 'black',
  },
  image: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
});

export default CurrencyInputField;
