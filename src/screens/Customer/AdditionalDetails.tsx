import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import React, { useState } from 'react';
import KeyboardAwareScrollView from '@src/common/components/KeyboardAwareScrollView';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '@src/common/utils/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MobileNumberInputComponent from '@src/common/components/MobileNumberComponent';
import Button from '@src/common/components/Button';
import TextInputComponent from '@src/common/components/TextInputComponent';
import { OtpInput } from 'react-native-otp-entry';
import { setState } from '@src/store/customer';
import DocumentUpload from '@src/common/components/DocumentUpload';
import DateInput from '@src/common/components/DateInput';
import { calendar1 } from '@src/common/assets/icons';
import CurrencyInputField from '@src/common/components/CurrencyInputField';
import DropdownWithModal from '@src/common/components/DropdownWithModalValues';
import { logErr } from '@src/common/utils/logger';
import { instance } from '@src/services';
import Header from '@src/common/components/Header';
import TextHeader from '@src/common/components/TextHeader';

const AdditionalDetails = () => {
  const [clicked, setClicked] = useState(false);
  const navigation = useNavigation() as any;
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const custData = useSelector((state: any) => state.customer);
  const { linkedEntitiesDocuments } = custData;

  const {
    nationality,
    residency,
    countryOfBirth,
    placeOfBirth,
    preferredModeOfCommunicationDesc,
    maritalStatus,
    highLevelOfEducation,
    countryOfIssuance,
  } = custData.additionalDetails;
  const styles = createStyles(colors, isDark);

  const validateAndSanitizeInput = (text: string) => {
    const allowedPattern = /^[a-zA-Z0-9 .'-]*$/;
    if (!allowedPattern.test(text)) {
      text = text
        .split('')
        .filter(char => /^[a-zA-Z0-9 .'-]*$/.test(char))
        .join('');
    }
    return text;
  };

  const handleContinue = async () => {
    try {
      setLoading(true);

      const { data } = await instance.post('api/v1/loans/customer/details', {
        customerId: custData.customerId,
        additionalDetail: {
          nationality: nationality,
          residency: residency,
          placeOfBirth: placeOfBirth,
          countryOfBirth: countryOfBirth,
          countryOfIssuance: countryOfIssuance || '',
          maritalStatus: maritalStatus,
          highLevelOfEducation: highLevelOfEducation || '',
        },
        beneficiaries: [
          {
            firstName:
              linkedEntitiesDocuments[0]?.details?.firstName ||
              linkedEntitiesDocuments[0]?.details?.name ||
              '',
            lastName: linkedEntitiesDocuments[0]?.details?.lastName || '',
            dateOfBirth: linkedEntitiesDocuments[0]?.details?.dateOfBirth,
            mobileNumber: linkedEntitiesDocuments[0]?.details?.mobile_number,
          },
        ],
        jointPartners: [
          {
            firstName:
              linkedEntitiesDocuments[1]?.details?.firstName ||
              linkedEntitiesDocuments[1]?.details?.name ||
              '',
            lastName: linkedEntitiesDocuments[1]?.details?.lastName || '',
            dateOfBirth: linkedEntitiesDocuments[1]?.details?.dateOfBirth,
            mobileNumber: linkedEntitiesDocuments[1]?.details?.mobile_number,
          },
        ],
      });
      console.log(data, 'additional details data');
      navigation.navigate('AddBeneficiary');
    } catch (error) {
      console.log(error, 'error');
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header title="Additional Details" />

      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <TextHeader
            title="Additional Information"
            subtitle="Complete the member's additional info"
          />
          <View style={styles.dropdownContainer}>
            <DropdownWithModal
              passIdAndDesc
              value={nationality}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      nationality: desc,
                      primaryNationalityKeyId: id,
                    },
                  }),
                );
              }}
              //placeholder={`Select Nationality 1`}
              placeholder={`SELECT NATIONALITY `}
              header={'Nationality '}
              style={{ fontSize: hp(1.6), fontWeight: 'bold' }}
              label={'Nationality '}
              required
              type={'nationality'}
              hasError={clicked && !nationality}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <DropdownWithModal
              passIdAndDesc
              value={residency}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      residency: desc,
                      residencyKeyId: id,
                    },
                  }),
                );
              }}
              placeholder={`SELECT RESIDENCY`}
              header="Residency"
              style={{ fontSize: 10, fontWeight: 'bold' }}
              label="Residency"
              required={true}
              type="nationality"
              isSearchable
              options={[]}
              showImage={false}
              hasError={clicked && !residency}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <DropdownWithModal
              passIdAndDesc
              value={countryOfBirth}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      countryOfBirth: desc,
                      countryOfBirthKeyId: id,
                    },
                  }),
                );
              }}
              //placeholder={`Select Country of Birth`}
              placeholder={`SELECT COUNTRY OF BIRTH`}
              header="Country of Birth"
              style={{ fontSize: 10, fontWeight: 'bold' }}
              label="Country of Birth"
              required={true}
              type="birthPlace"
              isSearchable
              options={[]}
              showImage={false}
              hasError={clicked && !countryOfBirth}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <TextInputComponent
              inputStyles={{
                fontSize: hp(1.6),
                height: hp(5),
              }}
              header="Place of Birth"
              headerStyles={{
                marginBottom: 6,
                color: '#000',
                fontSize: hp(1.8),
              }}
              placeholder="ENTER PLACE OF BIRTH"
              value={placeOfBirth}
              maxLength={75}
              onChange={(text: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      placeOfBirth: validateAndSanitizeInput(
                        text.toUpperCase(),
                      ),
                    },
                  }),
                );
              }}
              required
              submitClicked={clicked}
              missingField={!placeOfBirth}
            />
          </View>

          <View style={{ flex: 1, gap: hp(1) }}>
            <TextInputComponent
              removeCharsImmediately={true}
              header="Country of Issuance"
              placeholder="Enter Country "
              value={countryOfIssuance}
              onChange={text => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      countryOfIssuance: text,
                    },
                  }),
                );
              }}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <DropdownWithModal
              value={preferredModeOfCommunicationDesc}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      preferredModeOfCommunication: id,
                      preferredModeOfCommunicationDesc: desc,
                    },
                  }),
                );
              }}
              passIdAndDesc
              placeholder={`SELECT MODE OF COMMUNICATION`}
              header="Preferred Mode of Communication"
              style={{ fontSize: 10, fontWeight: 'bold' }}
              label="Preferred Mode of Communication"
              required={true}
              type="preferredMethodOfCommunication"
              isSearchable
              options={[]}
              showImage={false}
              hasError={clicked && !preferredModeOfCommunicationDesc}
            />
          </View>
          <View style={styles.dropdownContainer}>
            <DropdownWithModal
              passIdAndDesc
              value={maritalStatus}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      maritalStatus: desc?.toUpperCase(),
                      maritalStatusKeyId: id,
                    },
                  }),
                );
              }}
              placeholder={`SELECT MARITAL STATUS`}
              header="Marital Status"
              style={{ fontSize: 10, fontWeight: 'bold' }}
              label="Marital Status"
              required={true}
              type="maritalStatus"
              isSearchable
              options={[]}
              showImage={false}
              hasError={clicked && !maritalStatus}
            />
          </View>
          <View style={styles.dropdownContainer}>
            <DropdownWithModal
              passIdAndDesc
              value={highLevelOfEducation}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      highLevelOfEducation: desc?.toUpperCase(),
                      highLevelOfEducationKeyId: id,
                    },
                  }),
                );
              }}
              placeholder={`SELECT HIGHEST LEVEL OF EDUCATION`}
              header="Highest Level of Education"
              style={{ fontSize: 10, fontWeight: 'bold' }}
              label="Highest Level of Education"
              required={true}
              type="highestLevelOfEducation"
              isSearchable
              options={[]}
              showImage={false}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <Button
        text="Continue"
        onPress={handleContinue}
        buttonStyle={{
          marginVertical: hp(2.5),
        }}
        disabled={loading}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: hp(5),
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    dropdownContainer: {
      marginBottom: hp(2),
      color: '#000',
    },
  });

export default AdditionalDetails;
