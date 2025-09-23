import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from "react-native";
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from "react-native-responsive-screen";

interface TextInputComponentProps {
  header?: string; // Optional header
  placeholder?: string;
  value: string;
  onChange?: (text: string) => void;
  regex?: RegExp; // Optional regex for validation
  errorMessage?: string; // Optional error message for invalid input
  customStyles?: any; // Optional custom styles
  headerStyles?: any; // Optional custom styles
  inputStyles?: any; // Optional input-specific styles
  secureTextEntry?: boolean; // For password fields
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad"; // Custom keyboard type
  isEditable?: boolean; // Determines if input is editable
  required?: boolean; // Determines if input is editable
  autocapitalize?: "none" | "sentences" | "words" | "characters"; // Determines if input is editable
  removeCharsImmediately?: boolean; // Determines if input is editable
  image?: ImageSourcePropType;
  imageStyles?: any;
  maxLength?: number;
  autoFocus?: boolean;
  caps?: boolean;
  imagePress?: () => void;
  missingField?: boolean;
  submitClicked?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

const TextInputComponent: React.FC<TextInputComponentProps> = ({
  header = "",
  placeholder = "Enter value",
  value,
  onChange,
  regex,
  errorMessage = "",
  customStyles = {},
  headerStyles = {},
  inputStyles = {},
  secureTextEntry = false,
  keyboardType = "default",
  isEditable = true,
  required = false,
  removeCharsImmediately = true,
  autocapitalize = "characters",
  maxLength,
  image,
  imageStyles = {},
  autoFocus = false,
  caps = true,
  imagePress = () => {},
  missingField = false,
  submitClicked = false,
  multiline = false,
  numberOfLines = 1,
}) => {
  const [isValid, setIsValid] = useState(true);
  const handleTextChange = (text: string) => {
    if (keyboardType == "email-address") {
      if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(text)) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
      const filteredText = text.toLocaleUpperCase();

      if (maxLength && filteredText.length > maxLength) return;

      if (onChange) {
        onChange(filteredText.toLocaleUpperCase());
      }
    } else if (regex) {
      if (removeCharsImmediately) {
        const filteredText = text
          .split("")
          .filter((char) => regex.test(char))
          .join("");

        if (maxLength && filteredText.length > maxLength) return;
        if (caps) {
          if (onChange) {
            onChange(filteredText.toLocaleUpperCase());
          }
        } else {
          if (onChange) {
            onChange(filteredText);
          }
        }
      } else {
        if (regex.test(text)) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }

        if (maxLength && text.length > maxLength) return;

        if (onChange) {
          if (caps) {
            onChange(text.toLocaleUpperCase());
          } else {
            onChange(text);
          }
        }
      }
    } else {
      if (maxLength && text.length > maxLength) return;
      if (onChange) {
        if (caps) {
          onChange(text.toLocaleUpperCase());
        } else {
          onChange(text);
        }
      }
    }
  };

  return (
    <View style={[styles.container, customStyles]}>
      {/* Optional Header */}
      {header ? (
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <Text style={[styles.header, headerStyles]}>{header}</Text>
          {required && <Text style={{ color: "red" }}> *</Text>}
        </View>
      ) : null}

      {/* Input Field */}
      <View
        style={[
          styles.textInput,
          inputStyles,
          !isValid && styles.errorInput,
          !isEditable && styles.disabledInput,
          submitClicked && missingField && styles.missingField,
          {
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1.2,
            height: multiline ? "auto" : heightPercentageToDP(6),
            backgroundColor: isEditable ? "#fff" : "#F5F5F5",
          },
        ]}
      >
        <TextInput
          style={[
            inputStyles,
            {
              fontSize: heightPercentageToDP(1.6),
              flex: 1,
              color: "#000",
            },
            !isValid && styles.errorInput,
            !isEditable && styles.disabledInput,
          ]}
          placeholderTextColor={"gray"}
          maxLength={maxLength ? maxLength : undefined}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            handleTextChange(e.nativeEvent.text);
          }}
          numberOfLines={multiline ? numberOfLines || 1 : undefined}
          secureTextEntry={secureTextEntry}
          // keyboardType={keyboardType}
          keyboardType={
            keyboardType === "default" ? "visible-password" : keyboardType
          }
          editable={isEditable} // Control editability
          autoCapitalize={autocapitalize}
          autoFocus={autoFocus}
          multiline={multiline}
          autoCorrect={false}
          spellCheck={false}
          // importantForAutofill="no"
          // autoComplete="off"
          textContentType="none"
          textAlignVertical={multiline ? "top" : undefined}
        />

        {image ? (
          <TouchableOpacity onPress={imagePress}>
            <Image source={image} style={imageStyles} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Show error message if input is invalid */}
      {!isValid && <Text style={styles.errorMessage}>{errorMessage}</Text>}
    </View>
  );
};

export default TextInputComponent;

const styles = StyleSheet.create({
  container: {},
  header: {
    fontSize: heightPercentageToDP(1.6),
    color: "black",
    marginBottom: 5,
  },
  textInput: {
    borderColor: "#BFBFBF",
    borderWidth: 1,
    paddingHorizontal: widthPercentageToDP(3),
    borderRadius: 8,
    fontSize: heightPercentageToDP(1.6),
    backgroundColor: "#FFF",
  },
  errorInput: {
    borderColor: "red",
  },
  errorMessage: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  image: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  missingField: {
    borderColor: "red",
  },
});
