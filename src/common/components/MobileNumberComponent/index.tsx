import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
  ImageSourcePropType,
} from 'react-native';
import DropdownWithModal from '../DropdownWithModal';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import isdCodes from '../../data/isd.json';
import { useTheme } from '@src/common/utils/ThemeContext';

export function formatPhoneNumber(numberStr: string, length: number) {
  if (!numberStr || numberStr.length < 1) return numberStr;

  const clean = numberStr.slice(0, length);

  switch (length) {
    case 7:
      return clean.replace(/(\d{3})(\d{1,4})/, '$1-$2');
    case 8:
      return clean.replace(/(\d{4})(\d{1,4})/, '$1-$2');
    case 9:
      return clean.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1-$2-$3');
    case 10:
      return clean.replace(/(\d{5})(\d{1,5})/, '$1-$2');
    case 11:
      return clean.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
    default:
      return clean; // No formatting for <7 or >11
  }
}

function calcMaxLength(length: number) {
  if (length == 7 || length == 8 || length == 10) return length + 1;
  if (length == 9 || length == 11) return length + 2;
  return length;
}

const MobileNumberInputComponent = ({
  isdCode = '',
  mobileNumber = '',
  onChangeMobileNumber = () => {},
  onChangeIsdCode = () => {},
  style = {},
  isEditable = true,
  image,
  imageStyles = {},
  missingField = false,
  submitClicked = false,
}: {
  isdCode: string | number; // ISD code (e.g., 1, 44)
  mobileNumber: string;
  onChangeMobileNumber: (number: string) => void;
  onChangeIsdCode: (code: string | number, desc: string) => void;
  style?: any;
  isEditable?: boolean;
  image?: ImageSourcePropType;
  imageStyles?: any;
  missingField?: boolean;
  submitClicked?: boolean;
}) => {
  const [isdOptions, setIsdOptions] = useState<any[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxLength, setMaxLength] = useState(7);
  const [searchText, setSearchText] = useState('');
  const [selectedCountryLabel, setSelectedCountryLabel] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState<string | number>(
    '',
  );
  const { colors } = useTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    const fetchIsdCodes = () => {
      setLoading(true);
      let response: any[] = [];

      if (searchText) {
        response = isdCodes.filter(item => {
          // console.log(
          //   String(`(+${item.value}) ` + item.label).toLowerCase(),
          //   searchText.toLowerCase(),
          //   String(`(+${item.value}) ` + item.label)
          //     .toLowerCase()
          //     .includes(searchText.toLowerCase())
          // );

          return String(`(+${item.value}) ` + item.label)
            .toLowerCase()
            .includes(searchText.toLowerCase());
        });
      } else {
        response = [...isdCodes];
      }

      // console.log(response, "response");

      const formattedOptions = response.map((item: any) => ({
        label: `(+${item.value}) ${item.label}`, // Show ISD code + label here for modal list
        value: item.id, // unique id for selection
        img: item.img,
        nsnSize: item.nsnSize,
        isdValue: item.value, // ISD code number
        originalLabel: item.label, // store original label separately
      }));

      setIsdOptions(formattedOptions);
      setFilteredOptions(formattedOptions);

      if (!isdCode || isdCode === '') {
        if (formattedOptions.length > 0) {
          onChangeIsdCode(
            formattedOptions[0].isdValue,
            formattedOptions[0].originalLabel,
          );
          setSelectedCountryLabel(formattedOptions[0].originalLabel);
          setSelectedCountryId(formattedOptions[0].value);
          setMaxLength(formattedOptions[0].nsnSize);
        }
      }
      setLoading(false);
    };

    fetchIsdCodes();
  }, [searchText]);

  // Update selected country label and maxLength when isdCode changes externally
  useEffect(() => {
    if (isdCode && isdOptions.length > 0) {
      const country = isdOptions.find(item => item.isdValue == isdCode);
      if (country) {
        setSelectedCountryLabel(country.originalLabel);
        setSelectedCountryId(country.value);
        setMaxLength(country.nsnSize);
      }
    }
  }, [isdCode, isdOptions]);

  // Handle dropdown selection
  const handleIsdChange = (id: string | number) => {
    const country = isdOptions.find(item => item.value === id);

    if (country) {
      onChangeIsdCode(country.isdValue, country.originalLabel);
      setSelectedCountryId(id);
      setSelectedCountryLabel(country.originalLabel);
      setMaxLength(country.nsnSize);
    }
  };

  // Find selected country by unique id for flag, nsnSize, ISD code
  const selectedCountry = filteredOptions.find(
    item => item.value === selectedCountryId,
  );

  const handleMobileNumberChange = (text: string) => {
    const cleanedNumber = text.replace(/[^0-9]/g, '');
    if (cleanedNumber.length <= maxLength) {
      onChangeMobileNumber(cleanedNumber);
    }
  };

  // console.log(selectedCountry, filteredOptions, selectedCountryId);

  return (
    <View
      style={[
        styles.container,
        style,
        !isEditable && styles.disabledInput,
        submitClicked && missingField && styles.missingField,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <View
            style={[styles.isdDropdown, !isEditable && styles.disabledInput]}
          >
            <DropdownWithModal
              options={filteredOptions}
              value={selectedCountryId} // unique id internally
              toShowValue={selectedCountry ? selectedCountry?.isdValue : ''}
              showImage
              disabled={!isEditable}
              setValue={id => handleIsdChange(id)}
              isSearchable
              manualSearch
              manualSearchText={searchText}
              setManualSearchText={text => setSearchText(text || '')}
              placeholder={
                selectedCountry
                  ? `+${selectedCountry.isdValue} ${selectedCountryLabel}`
                  : 'ISD'
              }
              header="ISD Code"
              style={[
                styles.dropdownStyle,
                !isEditable && styles.disabledInput,
              ]}
              iconStyle={{ display: 'none' }}
              // passIdAndDesc={true}
            />
          </View>

          <View
            style={{
              flex: 1,
              height: hp(5.5),
              flexDirection: 'row',
              alignItems: 'center',
              borderColor: colors.border,
              backgroundColor: colors.inputBackground,
            }}
          >
            <TextInput
              style={[
                styles.mobileInput,
                { color: isEditable ? colors.text : colors.textMuted },
              ]}
              placeholder="ENTER MOBILE NUMBER"
              placeholderTextColor={colors.inputPlaceholder}
              keyboardType="numeric"
              value={
                mobileNumber
                  ? formatPhoneNumber(String(mobileNumber), maxLength)
                  : ''
              }
              onChangeText={handleMobileNumberChange}
              maxLength={calcMaxLength(maxLength)}
              editable={isEditable}
            />
            {image && (
              <Image
                source={image}
                style={[styles.image, imageStyles]}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default MobileNumberInputComponent;

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: colors.inputBackground,
    },
    isdDropdown: {
      flex: 0.4,
      marginRight: wp(2),
      height: hp(5.5),
      backgroundColor: colors.inputBackground,
    },
    mobileInput: {
      flex: 1,
      fontSize: hp(1.8),
      color: colors.text,
    },
    dropdownStyle: {
      borderColor: colors.border,
      borderRightWidth: 1,
      paddingHorizontal: wp(0.5),
      width: '100%',
      height: hp(5.5),
      flex: 1,
      justifyContent: 'center',
    },
    disabledInput: {
      backgroundColor: colors.inputDisabledBackground,
      color: colors.textMuted,
    },
    image: {
      width: 20,
      height: 20,
    },
    missingField: {
      borderColor: colors.error,
    },
  });
