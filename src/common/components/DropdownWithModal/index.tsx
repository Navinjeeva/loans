import { closeIcon, drop_down } from '@src/common/assets';
import { DROPDOWNS } from '@src/services';
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
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import { useDebounce } from '@src/common/utils/string';
import { useTheme } from '@src/common/utils/ThemeContext';

const DropdownWithModal = ({
  options = [],
  value = '',
  toShowValue = '',
  setValue = (id: string, desc?: string) => {},
  placeholder = 'SELECT OPTION',
  header = '',
  style = {},
  showImage = false,
  label = '',
  subLabel = '',
  labelStyle = {},
  required = false,
  passIdAndDesc = false,
  type = '',
  subtype = undefined,
  isSearchable = true,
  disabled = false,
  alllowClear = false,
  iconStyle = {},
  error = '',
  manualSearch = false,
  manualSearchText = '',
  removeHeader = false,
  setManualSearchText = () => {},
  dropdownFetchFunction = (type, search, subtype = '') => {},
}: {
  options?: { label: string; value: string }[];
  value?: string | number;
  toShowValue?: string | number;
  setValue?: (id: string, desc?: string) => void;
  setManualSearchText?: (text?: string) => void;
  placeholder?: string;
  header?: string;
  style?: {};
  label?: string;
  labelStyle?: {};
  subLabel?: String;
  type?: string;
  subtype?: string;
  required?: boolean;
  passIdAndDesc?: boolean;
  isSearchable?: boolean;
  showImage?: boolean;
  disabled?: boolean;
  alllowClear?: boolean;
  iconStyle?: {};
  error?: string;
  manualSearch?: boolean;
  manualSearchText?: string;
  removeHeader?: boolean;
  dropdownFetchFunction?: (
    type: string,
    search: string,
    subtype?: string,
  ) => any;
}) => {
  const [dropdownOptions, setDropdownOptions] = useState<any[]>([]);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [image, setImage] = useState(null);
  const debouncedSearchTerm = useDebounce(searchText);
  const [filteredOptions, setFilteredOptions] = useState(
    options || dropdownOptions,
  );
  const { colors } = useTheme();

  // Helper functions to manage search state and modal
  const resetSearchStates = () => {
    setSearchText('');
    if (manualSearch) setManualSearchText('');
  };

  const closeModal = () => {
    resetSearchStates();
    setPickerVisible(false);
  };

  const openModal = () => {
    if (disabled) return;
    resetSearchStates();
    setPickerVisible(true);
  };

  useEffect(() => {
    (async () => {
      try {
        if (type) {
          let dropdownsData;

          if (dropdownFetchFunction) {
            dropdownsData = await dropdownFetchFunction(
              type,
              debouncedSearchTerm,
              subtype,
            );
          } else {
            dropdownsData = await DROPDOWNS(type, debouncedSearchTerm, subtype);
          }

          if (!debouncedSearchTerm || debouncedSearchTerm == '') {
            setDropdownOptions(
              dropdownsData.map((item: any) => ({
                label: item.keyDesc,
                value: item.keyId,
              })),
            );
          }

          setFilteredOptions([
            ...dropdownsData.map((item: any) => ({
              label: item.keyDesc,
              value: item.keyId,
            })),
          ]);
        } else {
          if (debouncedSearchTerm && debouncedSearchTerm != '') {
            setFilteredOptions([
              ...dropdownOptions.filter(option =>
                option.label
                  .toLowerCase()
                  .includes(debouncedSearchTerm.toLowerCase()),
              ),
            ]);
          } else {
            if (options && options.length > 0) {
              setDropdownOptions([...options]);
              setFilteredOptions([...options]);
            } else {
              setDropdownOptions([...dropdownOptions]);
              setFilteredOptions([...dropdownOptions]);
            }
          }
        }
      } catch (error) {
        // logErr(error);
      }
    })();
  }, [type, debouncedSearchTerm, subtype]);

  useEffect(() => {
    if (showImage && value) {
      const option: any = filteredOptions.find(item => item.value == value);
      if (option && option?.img) {
        setImage(option?.img);
      } else {
        setImage(null);
      }
    }
  }, [value, options.length, dropdownOptions.length]);

  useEffect(() => {
    if (options && options.length > 0) {
      setDropdownOptions(options);
      setFilteredOptions(options);
    } else if (debouncedSearchTerm == '') {
      setDropdownOptions(dropdownOptions);
      setFilteredOptions(dropdownOptions);
    }
  }, [[...options], [...dropdownOptions]]);

  if (label && label.length > 0)
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
                color: colors.text,
                fontSize: heightPercentageToDP(1.6),
              },
              labelStyle,
            ]}
          >
            {label}

            {required && (
              <Text
                style={{
                  color: 'red',
                  fontSize: heightPercentageToDP(1.6),
                }}
              >
                {' '}
                *
              </Text>
            )}
          </Text>
        </View>

        <TouchableOpacity
          onPress={openModal}
          disabled={disabled}
          style={[
            styles.customPicker,
            {
              borderRadius: 8,
              height: hp(6),
              borderWidth: 1.2,
              borderColor: !!error ? colors.error : colors.border,
              paddingHorizontal: widthPercentageToDP(3),
              display: 'flex',
              alignItems: 'center',
            },
          ]}
        >
          <Text
            style={[
              styles.selectedValue,
              disabled && styles.disabledText,
              {
                color: colors.text,
              },
            ]}
            numberOfLines={1}
          >
            {value ? String(value).toUpperCase() : placeholder.toUpperCase()}
          </Text>
          {alllowClear && value ? (
            <TouchableOpacity
              onPress={() => {
                if (passIdAndDesc) {
                  setValue('', '');
                } else {
                  setValue('');
                }
              }}
              disabled={disabled}
            >
              <Image
                source={closeIcon}
                style={{
                  height: 20,
                  width: 20,
                  tintColor: colors.text,
                }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={openModal} disabled={disabled}>
              <Image
                source={drop_down}
                style={{
                  height: 20,
                  width: 20,
                  tintColor: colors.text,
                }}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        <Modal
          visible={disabled ? false : isPickerVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <TouchableOpacity style={styles.modalOverlay} onPress={closeModal}>
            <View
              style={[styles.pickerModal, { backgroundColor: colors.card }]}
            >
              <Text
                style={{
                  fontSize: hp(2),
                  fontWeight: '600',
                  color: colors.buttonText,
                  backgroundColor: colors.primary,
                  textAlign: 'center',
                  paddingVertical: hp(1.5),
                }}
              >
                {header}
              </Text>
              {isSearchable && dropdownOptions.length > 5 && (
                <TextInput
                  style={[
                    styles.input,
                    { borderColor: colors.border, color: colors.text },
                  ]}
                  onChangeText={text => {
                    setSearchText(text);
                    if (manualSearch) setManualSearchText(text);
                  }}
                  value={searchText}
                  placeholder="Search..."
                  autoCapitalize="characters"
                />
              )}
              <FlatList
                data={filteredOptions.length > 0 ? [...filteredOptions] : []}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) =>
                  passIdAndDesc ? (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pickerItem,
                        { borderColor: colors.border },
                      ]}
                      onPress={() => {
                        setValue(item.value, item.label);
                        closeModal();
                      }}
                    >
                      <Text
                        style={{
                          width: '25%',
                          borderRightWidth: 1,
                          borderColor: colors.border,
                          color: colors.text,
                          paddingVertical: 10,
                          paddingRight: 10,
                          fontSize: hp(1.6),
                          flexWrap: 'wrap',
                          flex: 1,
                        }}
                      >
                        {String(item?.value).toUpperCase()}
                      </Text>
                      <Text
                        style={[
                          styles.pickerItemText,
                          {
                            paddingLeft: 10,
                            paddingVertical: 10,
                            width: '75%',
                            color: colors.text,
                          },
                        ]}
                      >
                        {String(item?.label).toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pickerItem,
                        { borderColor: colors.border },
                      ]}
                      onPress={() => {
                        setValue(item.value);
                        closeModal();
                      }}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          {
                            paddingLeft: 10,
                            paddingVertical: 15,
                            color: colors.text,
                          },
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
      </View>
    );

  return (
    <View style={styles.container}>
      <View style={[styles.customPicker, style]}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingHorizontal: wp(3),
          }}
          onPress={openModal}
          disabled={disabled}
        >
          {showImage && image ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: wp(2),
              }}
            >
              <Image
                source={{
                  uri: image,
                }}
                style={{
                  height: 20,
                  width: 25,
                }}
              />

              {value && (
                <Text
                  style={[
                    styles.selectedValue,
                    disabled && styles.disabledText,
                    {
                      color: colors.text,
                      fontWeight: 'bold',
                      fontSize: 16,
                      //backgroundColor: colors.inputBackground,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                    },
                  ]}
                  numberOfLines={1}
                >
                  +{toShowValue || value}
                </Text>
              )}
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.selectedValue,
                  disabled && styles.disabledText,
                  {
                    color: colors.text,
                    fontWeight: 'bold',
                    fontSize: 16,
                    backgroundColor: colors.inputBackground,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4,
                  },
                ]}
                numberOfLines={1}
              >
                {value && value != 'null'
                  ? String(value).toUpperCase()
                  : placeholder.toUpperCase()}
              </Text>
              <Text
                style={{
                  color: colors.text,
                  fontWeight: 'bold',
                  fontSize: 14,
                  backgroundColor: colors.inputBackground,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  borderRadius: 3,
                }}
              >
                {subLabel}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {alllowClear && value ? (
          <TouchableOpacity
            onPress={() => {
              if (passIdAndDesc) {
                setValue('', '');
              } else {
                setValue('');
              }
            }}
            disabled={disabled}
          >
            <Image
              source={closeIcon}
              style={[
                {
                  height: 20,
                  width: 20,
                },
                iconStyle,
              ]}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={openModal} disabled={disabled}>
            <Image
              source={drop_down}
              style={[
                {
                  height: 20,
                  width: 20,
                },
                iconStyle,
              ]}
            />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={isPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={closeModal}>
          <View style={[styles.pickerModal, { backgroundColor: colors.card }]}>
            {!removeHeader && (
              <Text
                style={{
                  fontSize: hp(2),
                  fontWeight: '600',
                  color: colors.buttonText,
                  backgroundColor: colors.primary,
                  textAlign: 'center',
                  paddingVertical: hp(1.5),
                }}
              >
                {header}
              </Text>
            )}
            {isSearchable && (
              <TextInput
                style={[
                  styles.input,
                  { borderColor: colors.border, color: colors.text },
                ]}
                onChangeText={text => {
                  setSearchText(text);
                  if (manualSearch) setManualSearchText(text);
                }}
                value={searchText}
                placeholder="Search..."
                autoCapitalize="characters"
              />
            )}
            <FlatList
              data={filteredOptions.length > 0 ? [...filteredOptions] : []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) =>
                passIdAndDesc ? (
                  <TouchableOpacity
                    key={index}
                    style={[styles.pickerItem, { borderColor: colors.border }]}
                    onPress={() => {
                      if (showImage && item.img) {
                        setImage(item.img);
                      }
                      setValue(item.value, item.label);
                      closeModal();
                    }}
                  >
                    <Text
                      style={{
                        width: '18%',
                        borderRightWidth: 1,
                        borderColor: colors.border,
                        color: colors.text,
                        paddingVertical: 10,
                        paddingRight: 10,
                        fontSize: hp(1.6),
                      }}
                      numberOfLines={1}
                    >
                      {String(item.value).toUpperCase()}
                    </Text>
                    <Text
                      style={[
                        styles.pickerItemText,
                        {
                          paddingLeft: 10,
                          paddingVertical: 10,
                          color: colors.text,
                        },
                      ]}
                    >
                      {String(item.label).toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    key={index}
                    style={[styles.pickerItem, { borderColor: colors.border }]}
                    onPress={() => {
                      if (showImage && item.img) {
                        setImage(item.img);
                      }
                      setValue(item.value);
                      closeModal();
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        {
                          paddingLeft: 10,
                          paddingVertical: 15,
                          color: colors.text,
                        },
                      ]}
                    >
                      {String(item.label).toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                )
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default DropdownWithModal;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  disabledText: {
    // color is now handled by theme colors
  },
  customPicker: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  selectedValue: {
    fontSize: heightPercentageToDP(1.6),
  },
  input: {
    paddingHorizontal: wp(7),
    height: hp(6),
    fontSize: hp(1.6),
    borderBottomWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModal: {
    width: wp(90),
    borderRadius: 10,
    overflow: 'hidden',
    maxHeight: hp(50),
  },
  pickerItem: {
    paddingHorizontal: wp(3),
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  pickerItemText: {
    fontSize: hp(1.6),
  },
  fontColor: {
    // color is now handled by theme colors
  },
});
