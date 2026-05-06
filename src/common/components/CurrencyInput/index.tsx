import React, { FC } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import CurrencyInput from "react-native-currency-input";
import { useTheme } from "@src/common/ThemeContext";

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
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "number-pad";
  withLabel?: boolean;
  showFormat?: boolean;
  prefix?: string;
  placeholder?: string;
  maxValue?: undefined | number;
  minValue?: undefined | number;
}

const CurrencyInputField: FC<CustomTextInputProps> = ({
  label,
  labelStyle,
  value,
  onChangeText,
  backgroundColor = "transparent",
  style,
  isText = false,
  disabled = false,
  imageSource,
  lableimp,
  imageStyles,
  borderWidth = false,
  secureTextEntry = false,
  keyboard = "default",
  onPress,
  imgpress,
  withLabel = true,
  showFormat = false,
  placeholder = "",
  prefix = "$ ",
  maxValue = undefined,
  minValue = 0,
  ...props
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View
      style={[
        {
          // flex: 1,
          flexDirection: "row",
        },
        style,
      ]}
    >
      {showFormat && (
        <View
          style={{
            marginRight: 10,
            marginVertical: 10,
          }}
        >
          <Text style={labelStyle ? labelStyle : styles.label}>Currency</Text>
          <View
            style={{
              flex: 1,
              borderWidth: 1,
              borderRadius: 5,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 16,
              backgroundColor: colors.inputDisabledBackground,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontWeight: "bold",
                fontSize: hp(1.6),
              }}
            >
              TTD
            </Text>
          </View>
        </View>
      )}

      <View style={[withLabel && styles.container, { flex: 1 }]}>
        {withLabel && (
          <View style={{ flexDirection: "row" }}>
            {label && (
              <Text style={labelStyle ? labelStyle : styles.label}>
                {label}
              </Text>
            )}
            {lableimp && <Text style={{ color: "red" }}> *</Text>}
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
                borderColor: colors.border,
                backgroundColor: disabled
                  ? colors.inputDisabledBackground
                  : "transparent",
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
            style={[
              withLabel
                ? styles.inputContainer
                : {
                    flexDirection: "row",
                    alignItems: "center",
                    // paddingHorizontal: 10,
                    borderRadius: 5,
                    height: "auto",
                  },
              withLabel && {
                backgroundColor: disabled
                  ? colors.inputDisabledBackground
                  : backgroundColor,
                borderWidth: 1,
                borderColor: colors.border,
              },
              borderWidth && { borderWidth: 1 },
              { flex: 1 },
            ]}
          >
            <CurrencyInput
              value={Number(value)}
              editable={!disabled}
              onChangeValue={(val) => {
                if (onChangeText) onChangeText(val); // Ensure onChangeText is called with the updated value
              }}
              secureTextEntry={secureTextEntry}
              style={[
                styles.input,
                !withLabel && {
                  height: "auto",
                  paddingVertical: 0,
                },
                {
                  color: colors.text,
                  backgroundColor: disabled
                    ? colors.inputDisabledBackground
                    : "transparent",
                  paddingHorizontal: 0,
                },
              ]}
              placeholderTextColor={colors.inputPlaceholder}
              prefix={prefix}
              delimiter=","
              separator="."
              precision={2}
              minValue={-Number.MAX_SAFE_INTEGER} // Allow large negative values
              maxValue={maxValue}
              {...props}
              onChangeText={(formattedValue) => {}}
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
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      marginVertical: 10,
    },
    label: {
      marginBottom: 8,
      fontSize: hp(1.6),
      fontWeight: "400",
      color: colors.text,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      borderRadius: 8,
      height: hp(6),
    },
    textContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      borderRadius: 5,
      height: 50,
    },
    input: {
      flex: 1,
      fontSize: hp(1.6),
      color: colors.text,
      height: hp(6),
    },
    text: {
      flex: 1,
      fontSize: hp(1.6),
      color: colors.text,
    },
    image: {
      width: 20,
      height: 20,
      marginLeft: 10,
    },
  });

export default CurrencyInputField;
