// import { closeIcon, dropDown } from "../../assets";
// import { useDebounce } from "../../utils/string";
import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const ModalComponent = ({
  visible = false,
  setVisible,
  header = "",
  filteredOptions = [],
  passIdAndDesc = false,
  setValue = () => {},
}: {
  visible?: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  header?: string;
  filteredOptions?: any[];
  passIdAndDesc?: boolean;
  setValue: (value: any, label?: string) => void;
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        // setSearchText("");
        // if (manualSearch) setManualSearchText("");
        setVisible((prev) => !prev);
      }}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        onPress={() => {
          //   setSearchText("");
          //   if (manualSearch) setManualSearchText("");
          setVisible((prev) => !prev);
        }}
      >
        <View style={styles.pickerModal}>
          <Text
            style={{
              fontSize: hp(2),
              fontWeight: "600",
              color: "#fff",
              backgroundColor: "#F13937",
              textAlign: "center",
              paddingVertical: hp(1.5),
            }}
          >
            {header}
          </Text>
          {/* {isSearchable && dropdownOptions.length > 5 && (
            <TextInput
              style={styles.input}
              onChangeText={(text) => {
                setSearchText(text);
                if (manualSearch) setManualSearchText(text);
              }}
              value={searchText}
              placeholder="Search..."
            />
          )} */}
          <FlatList
            data={filteredOptions.length > 0 ? [...filteredOptions] : []}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) =>
              passIdAndDesc ? (
                <TouchableOpacity
                  key={index}
                  style={styles.pickerItem}
                  onPress={() => {
                    setValue(item.value, item.label);
                    setVisible((prev) => !prev);
                  }}
                >
                  <Text
                    style={{
                      width: "25%",
                      borderRightWidth: 1,
                      borderColor: "#E0E0E0",
                      color: "#000",
                      paddingVertical: 10,
                      paddingRight: 10,
                      fontSize: hp(1.8),
                    }}
                    numberOfLines={1}
                  >
                    {String(item?.value).toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      styles.pickerItemText,
                      {
                        paddingLeft: 10,
                        paddingVertical: 10,
                        width: "75%",
                      },
                    ]}
                  >
                    {String(item?.label).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  key={index}
                  style={styles.pickerItem}
                  onPress={() => {
                    setValue(item.value);
                    setVisible((prev) => !prev);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      { paddingLeft: 10, paddingVertical: 15 },
                    ]}
                  >
                    {String(item?.label).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              )
            }
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ModalComponent;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  disabledText: {
    color: "#999",
  },
  customPicker: {
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
  },
  selectedValue: {
    fontSize: hp(1.8),
    color: "#000",
  },
  input: {
    // flex: 1,
    paddingHorizontal: wp(7),
    height: hp(6),
    fontSize: hp(2),
    borderBottomWidth: 1,
    color: "#000",
    borderColor: "#E0E0E0",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  pickerModal: {
    width: wp(90),
    backgroundColor: "#fff",
    borderRadius: 10,
    // paddingVertical: hp(2),
    overflow: "hidden",
    maxHeight: hp(50),
  },
  pickerItem: {
    paddingHorizontal: wp(3),
    borderBottomWidth: 1,
    flexDirection: "row",
    borderColor: "#E0E0E0",
  },
  pickerItemText: {
    fontSize: hp(1.8),
    color: "#000",
  },
});
