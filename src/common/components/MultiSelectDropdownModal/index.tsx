import { closeIcon, drop_down } from '../../assets';
import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const MultiSelectDropdownModal = ({
  options = [],
  value = {},
  setValue = (id: string, desc: string) => {},
  placeholder = 'Select option',
  header = '',
  style = {},
  showImage = false,
  label = '',
  labelStyle = {},
  required = false,
  type = '',
  isSearchable = true,
  disabled = false,
  alllowClear = false,
  dropdownFetchFunction = (type, search, subtype = '') => {},
}: {
  options?: { label: string; value: string }[];
  value?: {
    [key: string]: any;
  };
  setValue?: (id: string, desc: string) => void;
  placeholder?: string;
  header?: string;
  style?: {};
  label?: string;
  labelStyle?: {};
  type?: string;
  required?: boolean;
  isSearchable?: boolean;
  showImage?: boolean;
  disabled?: boolean;
  alllowClear?: boolean;
  dropdownFetchFunction?: (
    type: string,
    search: string,
    subtype?: string,
  ) => any;
}) => {
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [image, setImage] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState(
    options || dropdownOptions,
  );

  useEffect(() => {
    (async () => {
      try {
        if (type && type.length > 0) {
          const dropdownsData = await dropdownFetchFunction(type, searchText);

          setDropdownOptions(
            dropdownsData.map((item: any) => ({
              label: item.keyDesc,
              value: item.keyId,
            })),
          );
        }
      } catch (error) {
        // logErr(error);
      }
    })();
  }, [type, searchText]);

  // useEffect(() => {
  //   if (searchText && searchText != "") {
  //     const filtered = options.filter((option) =>
  //       option.label.toLowerCase().includes(searchText.toLowerCase())
  //     );
  //     setFilteredOptions(filtered);
  //   } else {
  //     if (options && options.length > 0) {
  //       setFilteredOptions(options);
  //     } else setFilteredOptions(dropdownOptions);
  //   }
  // }, [searchText]);

  useEffect(() => {
    if (showImage) {
      const option: any = filteredOptions.find(
        (item: any) => item.value == value,
      );
      if (option && option?.img) {
        setImage(option?.img);
      } else {
        setImage(null);
      }
    }
  }, [value, options.length, dropdownOptions.length]);

  useEffect(() => {
    if (options && options.length > 0) {
      setFilteredOptions(options);
    } else setFilteredOptions(dropdownOptions);
  }, [options.length, dropdownOptions.length]);

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
  };

  return (
    <View style={style}>
      <View
        style={{
          flexDirection: 'row',
          marginBottom: 4,
        }}
      >
        <Text
          style={[
            {
              marginBottom: 6,
              color: '#000',
              fontSize: 13,
            },
            labelStyle,
          ]}
        >
          {label}
        </Text>

        {required && <Text style={{ color: 'red' }}> *</Text>}
      </View>

      <TouchableOpacity
        onPress={() => {
          if (disabled) return;
          setPickerVisible(prev => !prev);
        }}
        disabled={disabled}
        style={[
          styles.customPicker,
          {
            borderRadius: hp(1),
            borderWidth: 1,
            height: hp(6),
            borderColor: '#ddd',
            borderRightWidth: 1,
            paddingHorizontal: 15,
            width: '100%',
          },
        ]}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <ScrollView
            horizontal={true}
            style={{
              width: '96%',
              overflow: 'scroll',
            }}
          >
            {Object.keys(value).filter(key => value[key] === true).length >
            0 ? (
              Object.keys(value)
                .filter(key => value[key] === true)
                .map((key, index, array) => (
                  <Text
                    key={key}
                    style={[
                      styles.selectedValue,
                      disabled && styles.disabledText,
                      {
                        marginVertical: 'auto',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {options
                      .find(item => item.value == key)
                      ?.label.toUpperCase()}
                    {index < array.length - 1 ? ', ' : ''}
                  </Text>
                ))
            ) : (
              <Text
                style={[
                  styles.selectedValue,
                  disabled && styles.disabledText,
                  {
                    marginVertical: 'auto',
                  },
                ]}
                numberOfLines={1}
              >
                {placeholder}
              </Text>
            )}
          </ScrollView>
        </View>

        {alllowClear && value ? (
          <TouchableOpacity
            onPress={() => {
              setValue('', '');
            }}
            disabled={disabled}
          >
            <Image
              source={closeIcon}
              style={{
                height: 20,
                width: 20,
              }}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setPickerVisible(prev => !prev)}
            disabled={disabled}
          >
            <Image
              source={drop_down}
              style={{
                height: 20,
                width: 20,
              }}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal
        visible={disabled ? false : isPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setSearchText('');
          setPickerVisible(prev => !prev);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => {
            setSearchText('');
            setPickerVisible(prev => !prev);
          }}
        >
          <View style={styles.pickerModal}>
            <View
              style={{
                backgroundColor: '#6C4FF7',
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: hp(1.5),
                paddingHorizontal: 20,
              }}
            >
              <Text
                style={{
                  fontSize: hp(2),
                  fontWeight: '600',
                  color: '#fff',
                  textAlign: 'center',
                }}
              >
                {header}
              </Text>

              <TouchableOpacity onPress={() => setPickerVisible(prev => !prev)}>
                <Text
                  style={{
                    fontSize: hp(2),
                    fontWeight: '600',
                    color: '#fff',
                    textAlign: 'center',
                  }}
                >
                  <Text>Done</Text>
                </Text>
              </TouchableOpacity>
            </View>
            {isSearchable && (
              <TextInput
                style={styles.input}
                onChangeText={handleSearchTextChange}
                value={searchText}
                placeholder="Search..."
                autoCapitalize="characters"
              />
            )}
            <FlatList
              // data={options.length > 0 ? options : dropdownOptions}
              data={filteredOptions}
              keyExtractor={item => item.value}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  key={index}
                  style={styles.pickerItem}
                  onPress={() => {
                    setValue(item.value, item.label);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      { paddingLeft: 10, paddingVertical: 15 },
                    ]}
                  >
                    {item.label}
                  </Text>

                  <View
                    style={{
                      height: 20,
                      width: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      backgroundColor: value[item.value] ? '#E3781C' : '#fff',
                      position: 'absolute',
                      right: 10,
                      top: 15,
                      // ...{ display: item.value == value ? "flex" : "none" },
                    }}
                  ></View>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  // return (
  //   <View style={styles.container}>
  //     <View style={[styles.customPicker, style]}>
  //       <TouchableOpacity
  //         style={{
  //           flex: 1,
  //           paddingHorizontal: wp(3),
  //         }}
  //         onPress={() => setPickerVisible((prev) => !prev)}
  //         disabled={disabled}
  //       >
  //         {showImage && image ? (
  //           <Image
  //             source={{
  //               uri: image,
  //             }}
  //             style={{
  //               height: 20,
  //               width: 25,
  //             }}
  //           />
  //         ) : (
  //           <Text
  //             style={[styles.selectedValue, disabled && styles.disabledText]}
  //             numberOfLines={1}
  //           >
  //             {value && value != "null" ? value : placeholder}
  //           </Text>
  //         )}
  //       </TouchableOpacity>

  //       {alllowClear && value ? (
  //         <TouchableOpacity
  //           onPress={() => {
  //             if (passIdAndDesc) {
  //               setValue("", "");
  //             } else {
  //               setValue("");
  //             }
  //           }}
  //           disabled={disabled}
  //         >
  //           <Image
  //             source={closeIcon}
  //             style={{
  //               height: 20,
  //               width: 20,
  //             }}
  //           />
  //         </TouchableOpacity>
  //       ) : (
  //         <TouchableOpacity
  //           onPress={() => setPickerVisible((prev) => !prev)}
  //           disabled={disabled}
  //         >
  //           <Image
  //             source={dropDown}
  //             style={{
  //               height: 20,
  //               width: 20,
  //             }}
  //           />
  //         </TouchableOpacity>
  //       )}
  //     </View>

  //     <Modal
  //       visible={isPickerVisible}
  //       transparent={true}
  //       animationType="slide"
  //       onRequestClose={() => {
  //         setSearchText("");
  //         setPickerVisible((prev) => !prev);
  //       }}
  //     >
  //       <TouchableOpacity
  //         style={styles.modalOverlay}
  //         onPress={() => setPickerVisible((prev) => !prev)}
  //       >
  //         <View style={styles.pickerModal}>
  //           <Text
  //             style={{
  //               fontSize: hp(2),
  //               fontWeight: "600",
  //               color: "#fff",
  //               backgroundColor: "#E3781C",
  //               textAlign: "center",
  //               paddingVertical: hp(1.5),
  //             }}
  //           >
  //             {header}
  //           </Text>
  //           {isSearchable && (
  //             <TextInput
  //               style={styles.input}
  //               onChangeText={handleSearchTextChange}
  //               value={searchText}
  //               placeholder="Search..."
  //             />
  //           )}
  //           <FlatList
  //             data={filteredOptions.length > 0 ? filteredOptions : []}
  //             // data={[...filteredOptions]}
  //             keyExtractor={(item) => item.value}
  //             renderItem={({ item, index }) =>
  //               passIdAndDesc ? (
  //                 <TouchableOpacity
  //                   key={index}
  //                   style={styles.pickerItem}
  //                   onPress={() => {
  //                     if (showImage && item.img) {
  //                       setImage(item.img);
  //                     }
  //                     setValue(item.value, item.label);
  //                     setSearchText("");
  //                     setPickerVisible((prev) => !prev);
  //                   }}
  //                 >
  //                   <Text
  //                     style={{
  //                       width: "18%",
  //                       borderRightWidth: 1,
  //                       borderColor: "#E0E0E0",
  //                       color: "#000",
  //                       paddingVertical: 10,
  //                       paddingRight: 10,
  //                     }}
  //                     numberOfLines={1}
  //                   >
  //                     {item.value}
  //                   </Text>
  //                   <Text
  //                     style={[
  //                       styles.pickerItemText,
  //                       { paddingLeft: 10, paddingVertical: 10 },
  //                     ]}
  //                   >
  //                     {item.label}
  //                   </Text>
  //                 </TouchableOpacity>
  //               ) : (
  //                 <TouchableOpacity
  //                   key={index}
  //                   style={styles.pickerItem}
  //                   onPress={() => {
  //                     if (showImage && item.img) {
  //                       setImage(item.img);
  //                     }
  //                     setValue(item.value);
  //                     setPickerVisible((prev) => !prev);
  //                   }}
  //                 >
  //                   <Text
  //                     style={[
  //                       styles.pickerItemText,
  //                       { paddingLeft: 10, paddingVertical: 15 },
  //                     ]}
  //                   >
  //                     {item.label}
  //                   </Text>
  //                 </TouchableOpacity>
  //               )
  //             }
  //           />
  //         </View>
  //       </TouchableOpacity>
  //     </Modal>
  //   </View>
  // );
};

export default MultiSelectDropdownModal;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  disabledText: {
    color: '#999',
  },
  customPicker: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  selectedValue: {
    fontSize: hp(1.6),
    color: '#000',
  },
  input: {
    // flex: 1,
    paddingHorizontal: wp(7),
    height: hp(6),
    fontSize: hp(2),
    borderBottomWidth: 1,
    color: '#000',
    borderColor: '#E0E0E0',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModal: {
    width: wp(90),
    backgroundColor: '#fff',
    borderRadius: 10,
    // paddingVertical: hp(2),
    overflow: 'hidden',
    maxHeight: hp(50),
  },
  pickerItem: {
    paddingHorizontal: wp(3),
    borderBottomWidth: 1,
    flexDirection: 'row',
    borderColor: '#E0E0E0',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#000',
  },
});
