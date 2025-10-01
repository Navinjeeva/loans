import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import DatePicker from "react-native-date-picker";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const DateInput = ({
  label = "",
  calendarImage = "",
  onDateChange = (date: any) => {},
  date = "",
  error = "",
  style = {},
  labelstyle = {},
  disabled = false,
  required = false,
  maximumDate = undefined,
  placeholder = "Enter Date",
  minimumDate = undefined,
}: any) => {
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [manualDate, setManualDate] = useState(
    date
      ? typeof date == "object"
        ? date.toISOString().split("T")[0]
        : date
      : ""
  );

  useEffect(() => {
    setManualDate(
      date
        ? typeof date == "object"
          ? date.toISOString().split("T")[0]
          : date
        : ""
    );
  }, [date]);

  const handleConfirmDate = (selectedDate: any) => {
    setDatePickerVisible(false);
    const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
    setManualDate(formattedDate);
    onDateChange(formattedDate);
  };

  const handleManualDateChange = (input: string) => {
    if (disabled) return;
    // Remove non-digit characters for processing
    let cleanedInput = input.replace(/[^0-9]/g, "");

    // Automatically add dashes as the user types
    if (cleanedInput.length > 4 && cleanedInput.length <= 6) {
      cleanedInput = `${cleanedInput.slice(0, 4)}-${cleanedInput.slice(4)}`;
    } else if (cleanedInput.length > 6) {
      cleanedInput = `${cleanedInput.slice(0, 4)}-${cleanedInput.slice(
        4,
        6
      )}-${cleanedInput.slice(6, 8)}`;
    }

    setManualDate(cleanedInput);

    // Validate if the input matches the complete YYYY-MM-DD format and create a Date object
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(cleanedInput)) {
      const newDate = new Date(cleanedInput);

      if (!isNaN(newDate.getTime())) {
        onDateChange(cleanedInput);
      }
    } else if (cleanedInput.length == 0) {
      onDateChange("");
    }
  };

  return (
    <View style={[{ gap: hp(0.5), flex: 1 }, style]}>
      {label && (
        <Text style={[styles.text, labelstyle]}>
          {label} {required && <Text style={{ color: "red" }}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        disabled={disabled}
        style={[
          styles.dateOfBirthContainer,
          {
            borderWidth: 1.2,
            borderRadius: 8,
            borderColor: !!error ? "#E3781C" : "#00000030",
            backgroundColor: disabled ? "#F4F4F4" : "#fff",
          },
        ]}
        onPress={() => {
          if (disabled) return;
          setDatePickerVisible(true);
        }}
      >
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={"#6B6A6A"}
          style={styles.dateOfBirthInput}
          keyboardType="numeric"
          value={manualDate}
          editable={!disabled}
          onChangeText={handleManualDateChange}
        />
        <Image style={styles.calendarIcon} source={calendarImage} />
      </TouchableOpacity>

      <DatePicker
        modal
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        open={datePickerVisible}
        date={
          date
            ? moment(new Date(date).toISOString().split("T")[0]).toDate()
            : new Date()
        }
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisible(false)}
      />
    </View>
  );
};

export default DateInput;

const styles = StyleSheet.create({
  text: {
    color: "#000",
    fontSize: hp(1.6),
  },
  dateOfBirthContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: hp(0.1),
    borderRadius: hp(0.6),
    paddingHorizontal: wp(3),
    height: hp(6),
  },
  dateOfBirthInput: {
    flex: 1,
    fontSize: hp(1.6),
    color: "#000",
    paddingVertical: hp(1.4),
  },
  calendarIcon: {
    width: wp(5),
    height: wp(5),
    marginLeft: wp(2),
  },
});
