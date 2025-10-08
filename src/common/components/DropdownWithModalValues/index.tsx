import { closeIcon, drop_down } from '@src/common/assets';
import { DROPDOWNS } from '@src/services';
import { useDebounce } from '@src/common/utils/string';
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

const DropdownWithModal = ({
  options = [],
  value = '',
  setValue = (id: string, desc?: string) => {},
  placeholder = 'SELECT OPTION',
  header = '',
  style = {},
  showImage = false,
  label = '',
  labelStyle = {},
  required = false,
  passIdAndDesc = false,
  type = '',
  subtype = undefined,
  isSearchable = true,
  disabled = false,
  alllowClear = false,
  iconStyle = {},
  hasError = false,
  manualSearch = false,
  manualSearchText = '',
  setManualSearchText = () => {},
}: {
  options?: { label: string; value: string }[];
  value?: string;
  setValue?: (id: string, desc?: string) => void;
  setManualSearchText?: (text?: string) => void;
  placeholder?: string;
  header?: string;
  style?: {};
  label?: string;
  labelStyle?: {};
  type?: string;
  subtype?: string;
  required?: boolean;
  passIdAndDesc?: boolean;
  isSearchable?: boolean;
  showImage?: boolean;
  disabled?: boolean;
  alllowClear?: boolean;
  iconStyle?: {};
  hasError?: boolean;
  manualSearch?: boolean;
  manualSearchText?: string;
}) => {
  const [dropdownOptions, setDropdownOptions] = useState<any[]>([]);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [image, setImage] = useState(null);
  const debouncedSearchTerm = useDebounce(searchText);
  const [filteredOptions, setFilteredOptions] = useState(
    options || dropdownOptions,
  );

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

  const selectItem = (itemValue: string, itemLabel?: string) => {
    if (passIdAndDesc) {
      setValue(itemValue, itemLabel);
    } else {
      setValue(itemValue);
    }

    if (showImage) {
      const selectedOption = filteredOptions.find(
        item => item.value === itemValue,
      );
      if (selectedOption && selectedOption.img) {
        setImage(selectedOption.img);
      }
    }

    closeModal();
  };

  useEffect(() => {
    (async () => {
      try {
        if (type) {
          const dropdownsData = await DROPDOWNS(
            type,
            debouncedSearchTerm,
            subtype,
          );

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
                color: '#000',
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
              borderRadius: hp(1),
              borderWidth: 1,
              height: hp(6),
              borderColor: hasError ? 'red' : '#BFBFBF',
              borderRightWidth: 1,
              backgroundColor: disabled ? '#F5F5F5' : '#fff',
              paddingHorizontal: 15,
              width: '100%',
            },
          ]}
        >
          <Text
            style={[
              styles.selectedValue,
              disabled && styles.disabledText,
              styles.fontColor,
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
            <View style={styles.pickerModal}>
              <Text
                style={{
                  fontSize: hp(2),
                  fontWeight: '600',
                  color: '#fff',
                  backgroundColor: '#6C4FF7',
                  textAlign: 'center',
                  paddingVertical: hp(1.5),
                }}
              >
                {header}
              </Text>
              {isSearchable && dropdownOptions.length > 5 && (
                <TextInput
                  style={styles.input}
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
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.pickerItem}
                    onPress={() => selectItem(item.value, item.label)}
                  >
                    {passIdAndDesc ? (
                      <>
                        <Text
                          style={{
                            width: '25%',
                            borderRightWidth: 1,
                            borderColor: '#E0E0E0',
                            color: '#000',
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
                            },
                          ]}
                        >
                          {String(item?.label).toUpperCase()}
                        </Text>
                      </>
                    ) : (
                      <Text
                        style={[
                          styles.pickerItemText,
                          { paddingLeft: 10, paddingVertical: 15 },
                        ]}
                      >
                        {String(item?.label).toUpperCase()}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
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
            <Image
              source={{
                uri: image,
              }}
              style={{
                height: 20,
                width: 25,
              }}
            />
          ) : (
            <Text
              style={[styles.selectedValue, disabled && styles.disabledText]}
              numberOfLines={1}
            >
              {value && value != null
                ? String(value).toUpperCase()
                : placeholder.toUpperCase()}
            </Text>
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
          <View style={styles.pickerModal}>
            <Text
              style={{
                fontSize: hp(2),
                fontWeight: '600',
                color: '#fff',
                backgroundColor: '#E3781C',
                textAlign: 'center',
                paddingVertical: hp(1.5),
              }}
            >
              {header}
            </Text>
            {isSearchable && (
              <TextInput
                style={styles.input}
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
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  key={index}
                  style={styles.pickerItem}
                  onPress={() => selectItem(item.value, item.label)}
                >
                  {passIdAndDesc ? (
                    <>
                      <Text
                        style={{
                          width: '18%',
                          borderRightWidth: 1,
                          borderColor: '#E0E0E0',
                          color: '#000',
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
                          { paddingLeft: 10, paddingVertical: 10 },
                        ]}
                      >
                        {String(item.label).toUpperCase()}
                      </Text>
                    </>
                  ) : (
                    <Text
                      style={[
                        styles.pickerItemText,
                        { paddingLeft: 10, paddingVertical: 15 },
                      ]}
                    >
                      {String(item.label).toUpperCase()}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
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
    color: '#999',
  },
  customPicker: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  selectedValue: {
    fontSize: heightPercentageToDP(1.6),
    color: '#000',
  },
  input: {
    paddingHorizontal: wp(7),
    height: hp(6),
    fontSize: hp(1.6),
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
    fontSize: hp(1.6),
    color: '#000',
  },
  fontColor: {
    color: '#000',
  },
});
