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
import { initialState, setState } from '@src/store/memberOnboarding';
import DocumentUpload from '@src/common/components/DocumentUpload';
import DateInput from '@src/common/components/DateInput';
import { calendar1 } from '@src/common/assets/icons';
import CurrencyInputField from '@src/common/components/CurrencyInputField';
import DropdownWithModal from '@src/common/components/DropdownWithModalValues';

const validateAndSanitizeInput = (text: string) => {
  const allowedPattern = /^[a-zA-Z0-9.,'\- ]*$/;
  if (!allowedPattern.test(text)) {
    text = text
      .split('')
      .filter(char => /^[a-zA-Z0-9.,'\- ]$/.test(char))
      .join('');
  }
  return text;
};

const employementStatusRequiredKeys = {
  F: {
    name: 'FULL TIME PERMANENT',
    fields: [
      'employementStatus',
      'employementStatusId',
      'jobLetter',
      'uploadSlip',
      'employerKey',
      'employerDesc',
      // "employeeId",
      'employmentDesc',
      'dateOfJoining',
      'employementOccupation',
      'employementSector',
      'employementSectorId',
      'employementType',
      'employmentTypeKeyId',
      'salaryFrequencyKey',
      'salaryFrequency',
      'incomeRangeKey',
      'incomeRangeKeyDesc',
      'employementSourceFund',
      'employerAddress1',
      'employerCity',
      'employerCountry',
      'employerCountryDesc',
      // "employementSourceFundOthers",
    ],
  },
  T: {
    name: 'FULL TIME TEMPORARY',
    fields: [
      'employementStatus',
      'employementStatusId',
      'jobLetter',
      'uploadSlip',
      'employerKey',
      'employerDesc',
      // "employeeId",
      'employmentDesc',
      'dateOfJoining',
      'employementOccupation',
      'employementSector',
      'employementSectorId',
      'employementType',
      'employmentTypeKeyId',
      'salaryFrequencyKey',
      'salaryFrequency',
      'incomeRangeKey',
      'incomeRangeKeyDesc',
      'employementSourceFund',
      'employerAddress1',
      'employerCity',
      'employerCountry',
      'employerCountryDesc',
      // "employementSourceFundOthers",
    ],
  },
  O: {
    name: 'OTHER',
    fields: [
      'employementStatus',
      'employementStatusId',
      'jobLetter',
      'uploadSlip',
      'employerKey',
      'employerDesc',
      // "employeeId",
      'employmentDesc',
      'dateOfJoining',
      'employementOccupation',
      'employementSector',
      'employementSectorId',
      'employementType',
      'employmentTypeKeyId',
      'salaryFrequencyKey',
      'salaryFrequency',
      'incomeRangeKey',
      'incomeRangeKeyDesc',
      'employementSourceFund',
      'employerAddress1',
      'employerCity',
      'employerCountry',
      'employerCountryDesc',
      // "employementSourceFundOthers",
    ],
  },
  P: {
    name: 'PART TIME',
    fields: [
      'employementStatus',
      'employementStatusId',
      'jobLetter',
      'uploadSlip',
      'employerKey',
      'employerDesc',
      // "employeeId",
      'employmentDesc',
      'dateOfJoining',
      'employementOccupation',
      'employementSector',
      'employementSectorId',
      'employementType',
      'employmentTypeKeyId',
      'salaryFrequencyKey',
      'salaryFrequency',
      'incomeRangeKey',
      'incomeRangeKeyDesc',
      'employementSourceFund',
      'employerAddress1',
      'employerCity',
      'employerCountry',
      'employerCountryDesc',
      // "employementSourceFundOthers",
    ],
  },
  N: {
    name: 'RETIRED NON PENSIONED',
    fields: [
      'employementStatus',
      'employementStatusId',
      'bankStatement',
      'employerKey',
      'employerDesc',
      'employmentDesc',
      'employementOccupation',
      'employementSector',
      'employementSectorId',
      'employementType',
      'employmentTypeKeyId',
      'employementSourceFund',
      // "employementSourceFundOthers",
    ],
  },
  R: {
    name: 'RETIRED PENSIONED',
    fields: [
      'employementStatus',
      'employementStatusId',
      'bankStatement',
      'employerKey',
      'employerDesc',
      'employmentDesc',
      'employementOccupation',
      'employementSector',
      'employementSectorId',
      'employementType',
      'employmentTypeKeyId',
      'employementSourceFund',
      // "employementSourceFundOthers",
    ],
  },
  S: {
    name: 'SELF EMPLOYED',
    fields: [
      'employementStatus',
      'employementStatusId',
      'businessDocument',
      'appointmentLetter',
      'employerKey',
      'employerDesc',
      // "employeeId",
      'employmentDesc',
      'dateOfJoining',
      'employementOccupation',
      'employementSector',
      'employementSectorId',
      'employementType',
      'employmentTypeKeyId',
      'salaryFrequencyKey',
      'salaryFrequency',
      'incomeRangeKey',
      'incomeRangeKeyDesc',
      'employementSourceFund',
      // "employementSourceFundOthers",
      'employerAddress1',
      'employerCity',
      'employerCountry',
      'employerCountryDesc',
    ],
  },
  U: {
    name: 'UNEMPLOYED',
    fields: [
      'employementStatus',
      'employementStatusId',
      'employementSourceFund',
      // "employementSourceFundOthers",
    ],
  },
};

const validateKeys = (data: any) => {
  let keys = employementStatusRequiredKeys[data.employementStatusId].fields;
  let missingKeys = keys.filter((key: string) => !data[key]);
  return missingKeys;
};

const AdditionalDetails = () => {
  const [clicked, setClicked] = useState(false);
  const navigation = useNavigation() as any;
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const memberOnboardingData = useSelector(
    (store: any) => store?.memberOnboarding,
  );

  const styles = createStyles(colors, isDark);

  const handleContinue = () => {};

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Member Onboarding
          </Text>
        </View>
        <TouchableOpacity style={styles.helpButton}>
          <Text style={[styles.helpIcon, { color: colors.text }]}>?</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.label}>
            Employment Status<Text style={{ color: 'red' }}>*</Text>
          </Text>
          <View style={styles.dropdownWrapper}>
            <DropdownWithModal
              passIdAndDesc
              type="employmentStatus"
              value={memberOnboardingData.employementStatus}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    employementStatus: desc?.toUpperCase(),
                    employementStatusId: id,
                    jobLetter: null,
                    uploadSlip: null,
                    visitingCard: null,
                    businessDocument: null,
                    appointmentLetter: null,
                    bankStatement: null,
                    employerKey: id == 'S' ? 'SELF' : initialState.employerKey,
                    otherEmployer: null,
                    employerDesc:
                      id == 'S' ? 'SELF EMPLOYED' : initialState.employerDesc,
                    employeeId: initialState.employeeId,
                    employmentDesc:
                      id == 'S' ? 'SELF EMPLOYED' : initialState.employmentDesc,
                    dateOfJoining: initialState.dateOfJoining,
                    employementOccupation: initialState.employementOccupation,
                    employementSectorId:
                      id == 'S' ? 'SLFEMP' : initialState.employementSectorId,
                    employementSector:
                      id == 'S'
                        ? 'SELF EMPLOYED'
                        : initialState.employementSector,
                    employmentTypeKeyId: initialState.employmentTypeKeyId,
                    employementType: initialState.employementType,
                    salaryFrequencyKey: null,
                    salaryFrequency: null,
                    incomeRangeKey: null,
                    incomeRangeKeyDesc: null,
                    salary: null,
                    employementSourceFund: null,
                    employementSourceFundOthers: null,
                    employerAddress1: initialState.employerAddress1,
                    employerAddress2: initialState.employerAddress2,
                    employerCity: initialState.employerCity,
                    employerCountryDesc: initialState.employerCountryDesc,
                    employerCountry: initialState.employerCountry,
                    employerZipCode: initialState.employerZipCode,
                    employerWorkPhone: initialState.employerWorkPhone,
                    employerEmail: initialState.employerEmail,
                    employeeNumber: initialState.employeeNumber,
                    purposeOfBusiness: null,
                    sectorEmployedKeyId: initialState.sectorEmployedKeyId,
                    employerWorkEmail: initialState.employerWorkEmail,
                  }),
                );
              }}
              //placeholder={"Select Employment Status"}
              placeholder={'SELECT EMPLOYMENT STATUS'}
              header={'Select Employment Status'}
              style={{ paddingVertical: hp(1.6) }}
            />
          </View>
        </View>

        {memberOnboardingData.employementStatusId != 'U' &&
          memberOnboardingData.employementStatusId != 'S' &&
          memberOnboardingData.employementStatusId != 'N' &&
          memberOnboardingData.employementStatusId != 'R' && (
            <View
              style={{
                marginTop: hp(2),
              }}
            >
              <DocumentUpload
                header="Job letter"
                headerDesc="Less than 3 months old"
                limit={1}
                missing={
                  clicked &&
                  employementStatusRequiredKeys[
                    memberOnboardingData.employementStatusId
                  ]?.fields?.includes('jobLetter') &&
                  (!memberOnboardingData?.jobLetter ||
                    memberOnboardingData?.jobLetter?.length == 0)
                }
                required={employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('jobLetter')}
                images={
                  memberOnboardingData.jobLetter
                    ? [memberOnboardingData.jobLetter]
                    : []
                }
                setImages={(images: any) => {
                  setLoading(true);

                  dispatch(
                    setState({
                      jobLetter: images[0],
                    }),
                  );

                  setLoading(false);
                }}
              />
            </View>
          )}

        {memberOnboardingData.employementStatusId != 'U' &&
          (memberOnboardingData.employementStatusId == 'N' ||
            memberOnboardingData.employementStatusId == 'R') && (
            <View
              style={{
                marginTop: hp(2),
              }}
            >
              <DocumentUpload
                header="Bank Statement"
                headerDesc="Less than 3 months older"
                limit={1}
                missing={
                  clicked &&
                  employementStatusRequiredKeys[
                    memberOnboardingData.employementStatusId
                  ]?.fields?.includes('bankStatement') &&
                  (!memberOnboardingData?.bankStatement ||
                    memberOnboardingData?.bankStatement?.length == 0)
                }
                required={employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('bankStatement')}
                images={
                  memberOnboardingData.bankStatement
                    ? [memberOnboardingData.bankStatement]
                    : []
                }
                setImages={(images: any) => {
                  setLoading(true);
                  dispatch(
                    setState({
                      bankStatement: images[0],
                    }),
                  );
                  setLoading(false);
                }}
              />
            </View>
          )}

        {memberOnboardingData.employementStatusId != 'U' &&
          memberOnboardingData.employementStatusId == 'S' && (
            <View
              style={{
                marginTop: hp(2),
              }}
            >
              <DocumentUpload
                header="Business Registeration Certificate / Article of Association"
                headerDesc="Last 3 months"
                limit={1}
                missing={
                  clicked &&
                  employementStatusRequiredKeys[
                    memberOnboardingData.employementStatusId
                  ]?.fields?.includes('businessDocument') &&
                  (!memberOnboardingData?.businessDocument ||
                    memberOnboardingData?.businessDocument?.length == 0)
                }
                required={employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('businessDocument')}
                images={
                  memberOnboardingData.businessDocument
                    ? [memberOnboardingData.businessDocument]
                    : []
                }
                setImages={(images: any) => {
                  setLoading(true);
                  dispatch(
                    setState({
                      businessDocument: images[0],
                    }),
                  );
                  setLoading(false);
                }}
              />
            </View>
          )}

        {memberOnboardingData.employementStatusId != 'U' &&
          memberOnboardingData.employementStatusId == 'S' && (
            <View
              style={{
                marginTop: hp(2),
              }}
            >
              <DocumentUpload
                header="Income & Expenditure statement / Bank statement"
                headerDesc="Last 3 months"
                limit={1}
                missing={
                  clicked &&
                  employementStatusRequiredKeys[
                    memberOnboardingData.employementStatusId
                  ]?.fields?.includes('appointmentLetter') &&
                  (!memberOnboardingData?.appointmentLetter ||
                    memberOnboardingData?.appointmentLetter?.length == 0)
                }
                required={employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('appointmentLetter')}
                images={
                  memberOnboardingData.appointmentLetter
                    ? [memberOnboardingData.appointmentLetter]
                    : []
                }
                setImages={(images: any) => {
                  setLoading(true);
                  dispatch(
                    setState({
                      appointmentLetter: images[0],
                    }),
                  );
                  setLoading(false);
                }}
              />
            </View>
          )}

        {memberOnboardingData.employementStatusId != 'U' &&
          memberOnboardingData.employementStatusId != 'S' &&
          memberOnboardingData.employementStatusId != 'N' &&
          memberOnboardingData.employementStatusId != 'R' && (
            <View
              style={{
                marginTop: hp(2),
              }}
            >
              <DocumentUpload
                header="Pay slip"
                headerDesc="Less than 3 months older"
                limit={1}
                missing={
                  clicked &&
                  employementStatusRequiredKeys[
                    memberOnboardingData.employementStatusId
                  ]?.fields?.includes('uploadSlip') &&
                  (!memberOnboardingData?.uploadSlip ||
                    memberOnboardingData?.uploadSlip?.length == 0)
                }
                required={employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('uploadSlip')}
                images={
                  memberOnboardingData.uploadSlip
                    ? [memberOnboardingData.uploadSlip]
                    : []
                }
                setImages={(images: any) => {
                  setLoading(true);

                  dispatch(
                    setState({
                      uploadSlip: images[0],
                    }),
                  );

                  setLoading(false);
                }}
              />
            </View>
          )}

        {memberOnboardingData.employementStatusId != 'U' && (
          <View
            style={{
              marginTop: hp(2),
            }}
          >
            <DocumentUpload
              header="Additional Document"
              headerDesc=""
              limit={1}
              missing={
                clicked &&
                employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('visitingCard') &&
                (!memberOnboardingData?.visitingCard ||
                  memberOnboardingData?.visitingCard?.length == 0)
              }
              required={employementStatusRequiredKeys[
                memberOnboardingData.employementStatusId
              ]?.fields?.includes('visitingCard')}
              images={
                memberOnboardingData.visitingCard
                  ? [memberOnboardingData.visitingCard]
                  : []
              }
              setImages={(images: any) => {
                setLoading(true);

                dispatch(
                  setState({
                    visitingCard: images[0],
                  }),
                );

                setLoading(false);
              }}
            />
          </View>
        )}

        <View style={{ marginVertical: hp(2), gap: hp(2) }}>
          <View style={{ gap: hp(1) }}>
            {/* <Text style={{ color: "#000", fontSize: hp(1.7) }}>
                Employer
                {employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes("employerKey") ? (
                  <Text style={{ color: "red" }}>*</Text>
                ) : null}
              </Text> */}
            {/* <View
                style={{
                  borderWidth: hp(0.1),
                  borderRadius: hp(0.5),
                  // paddingVertical: hp(0.),
                }}
              > */}
            <DropdownWithModal
              required
              label="Employer"
              passIdAndDesc
              value={memberOnboardingData.employmentDesc}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    employerDesc: desc,
                    employerKey: id,
                    employmentDesc: desc,
                    otherEmployer: null,
                  }),
                );
              }}
              //placeholder={"Select Employer"}
              placeholder={'SELECT EMPLOYER'}
              header={'Select Employer'}
              style={{
                paddingVertical: hp(1.6),
              }}
              type={'employer'}
              subtype={
                memberOnboardingData.employementStatus === 'UNEMPLOYED'
                  ? 'Unemployed'
                  : undefined
              }
              hasError={clicked && !memberOnboardingData.employmentDesc}
            />
            {/* </View> */}
          </View>

          {(memberOnboardingData.employerKey == 'OTHER' ||
            memberOnboardingData.employerKey == 'SELF') && (
            <View style={{ gap: hp(1) }}>
              <TextInputComponent
                required={employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('employerKey')}
                inputStyles={{
                  fontSize: hp(1.6),
                  height: hp(5),
                }}
                header={
                  memberOnboardingData.employerKey == 'SELF'
                    ? 'Name Of Company/Business'
                    : 'Other Employer'
                }
                value={memberOnboardingData.otherEmployer}
                onChange={text =>
                  dispatch(
                    setState({
                      otherEmployer: validateAndSanitizeInput(
                        text.toUpperCase(),
                      ),
                    }),
                  )
                }
                maxLength={105}
                removeCharsImmediately={true}
                caps={true}
                submitClicked={clicked}
                missingField={!memberOnboardingData.otherEmployer}
              />
            </View>
          )}

          {memberOnboardingData.employementStatusId != 'U' &&
            memberOnboardingData.employementStatusId != 'N' &&
            memberOnboardingData.employementStatusId != 'R' && (
              <TextInputComponent
                // required={employementStatusRequiredKeys[
                //   memberOnboardingData.employementStatusId
                // ]?.fields?.includes("employeeId")}
                inputStyles={{
                  fontSize: hp(1.6),
                  height: hp(5),
                }}
                maxLength={105}
                header="Employee ID"
                placeholder="Enter value"
                maxLength={50}
                value={memberOnboardingData.employeeId}
                onChange={(text: string) =>
                  dispatch(
                    setState({
                      employeeId: validateAndSanitizeInput(text.toUpperCase()),
                    }),
                  )
                }
                secureTextEntry={false}
                keyboardType="default"
                isEditable={true}
                removeCharsImmediately={true}
                caps={true}
              />
            )}

          {memberOnboardingData.employementStatusId != 'U' && (
            <View style={{ gap: hp(1) }}>
              <TextInputComponent
                required={employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('employmentDesc')}
                inputStyles={{
                  borderColor: '#BFBFBF',
                  paddingVertical: hp(0.8),
                  fontSize: hp(1.8),
                }}
                isEditable={false}
                header="Employer Description"
                value={memberOnboardingData.employmentDesc}
                onChange={text =>
                  dispatch(
                    setState({
                      employmentDesc: validateAndSanitizeInput(
                        text.toUpperCase(),
                      ),
                    }),
                  )
                }
                maxLength={105}
                removeCharsImmediately={true}
                caps={true}
                submitClicked={clicked}
                missingField={memberOnboardingData.employmentDesc == ''}
              />
            </View>
          )}

          {memberOnboardingData.employementStatusId != 'U' &&
            memberOnboardingData.employementStatusId != 'N' &&
            memberOnboardingData.employementStatusId != 'R' && (
              <View style={{ gap: hp(1), flex: 1 }}>
                <DateInput
                  required={employementStatusRequiredKeys[
                    memberOnboardingData.employementStatusId
                  ]?.fields?.includes('dateOfJoining')}
                  placeholder="YYYY-MM-DD"
                  maximumDate={new Date()}
                  label="Date Joined Company "
                  calendarImage={calendar1}
                  onDateChange={(selectedDate: any) => {
                    dispatch(
                      setState({
                        dateOfJoining: selectedDate,
                      }),
                    );
                  }}
                  date={
                    memberOnboardingData.dateOfJoining
                      ? new Date(memberOnboardingData.dateOfJoining)
                      : ''
                  }
                  submitClicked={clicked}
                  missingField={!memberOnboardingData.dateOfJoining}
                />
              </View>
            )}

          {memberOnboardingData.employementStatusId != 'U' && (
            <View style={{ gap: hp(1) }}>
              <TextInputComponent
                submitClicked={clicked}
                missingField={!memberOnboardingData.employementOccupation}
                required={employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('employementOccupation')}
                inputStyles={{
                  fontSize: hp(1.6),
                  height: hp(5),
                }}
                caps
                placeholder="Enter Occupation"
                maxLength={77}
                header="Occupation"
                value={memberOnboardingData.employementOccupation}
                onChange={(text: string) =>
                  dispatch(
                    setState({
                      employementOccupation: validateAndSanitizeInput(
                        text.toUpperCase(),
                      ),
                    }),
                  )
                }
                maxLength={105}
              />
              {/* <Text style={{ color: "#000", fontSize: hp(1.7) }}>
                  Occupation{" "}
                  {!["N", "R", "P", "U", "O"].includes(
                    memberOnboardingData.employementStatusId
                  ) ? (
                    <Text style={{ color: "red" }}>*</Text>
                  ) : null}
                </Text>
                <View
                  style={{
                    borderColor: "#B1B1B1",
                    borderWidth: hp(0.1),
                    borderRadius: hp(0.6),
                  }}
                >
                  <TextInput
                    placeholderTextColor={"#B1B1B1"}
                    //placeholder="Enter Description"
                    placeholder="ENTER DESCRIPTION"
                    maxLength={105}
                    style={{ paddingHorizontal: wp(3) }}
                    value={memberOnboardingData.employementOccupation}
                    onChangeText={(text) =>
                      dispatch(
                        setState({
                          employementOccupation: validateAndSanitizeInput(
                            text.toUpperCase()
                          ),
                        })
                      )
                    }
                  />
                </View> */}
            </View>
          )}

          {memberOnboardingData.employerDesc && (
            <View>
              {/* <Text style={{ color: "#000", fontSize: hp(1.7) }}>
                  Sector Employed
                  {employementStatusRequiredKeys[
                    memberOnboardingData.employementStatusId
                  ]?.fields?.includes("employementSectorId") ? (
                    <Text style={{ color: "red" }}>*</Text>
                  ) : null}
                </Text> */}
              <View>
                <DropdownWithModal
                  required
                  label="Sector Employed"
                  passIdAndDesc
                  value={memberOnboardingData.employementSector}
                  setValue={(id: string, desc?: string) => {
                    dispatch(
                      setState({
                        employementSector: desc?.toUpperCase(),
                        employementSectorId: id,
                        employementType: null,
                        employmentTypeKeyId: null,
                      }),
                    );
                  }}
                  //placeholder={"Select Employment Status"}
                  placeholder={'SELECT SECTOR EMPLOYED'}
                  header={'Select Employment Sector'}
                  type={'sectorEmployed'}
                  subtype={
                    memberOnboardingData.employementStatus === 'UNEMPLOYED'
                      ? 'Unemployed'
                      : undefined
                  }
                  hasError={clicked && !memberOnboardingData.employementSector}
                />
              </View>
            </View>
          )}

          {memberOnboardingData.employementSector && (
            <DropdownWithModal
              label="Employment Type"
              passIdAndDesc
              value={memberOnboardingData.employementType}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    employementType: desc?.toUpperCase(),
                    employmentTypeKeyId: id,
                  }),
                );
              }}
              required
              //placeholder={"Select Employment Type"}
              placeholder={'SELECT EMPLOYMENT TYPE'}
              header={'Select Employment Type'}
              // style={{ paddingVertical: hp(1.6) }}
              type={
                memberOnboardingData.employementSectorId
                  ? memberOnboardingData.employementSectorId
                  : 'employmentStatus'
              }
              subtype={
                memberOnboardingData.employementStatus === 'UNEMPLOYED'
                  ? 'Unemployed'
                  : undefined
              }
              hasError={clicked && !memberOnboardingData.employementType}
            />
          )}

          {memberOnboardingData.employementStatusId != 'U' &&
            memberOnboardingData.employementStatusId != 'N' &&
            memberOnboardingData.employementStatusId != 'R' && (
              <DropdownWithModal
                passIdAndDesc
                label="Salary Frequency"
                required={employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('salaryFrequencyKey')}
                value={memberOnboardingData.salaryFrequency}
                setValue={(id: string, desc?: string) => {
                  dispatch(
                    setState({
                      salaryFrequencyKey: id?.toUpperCase(),
                      salaryFrequency: desc?.toUpperCase(),
                    }),
                  );
                }}
                style={{}}
                //placeholder={"Select Employment Type"}
                placeholder={'SELECT SALARY FREQUENCY'}
                header={'Salary Frequency'}
                type="SalaryFrequency"
                hasError={clicked && !memberOnboardingData.salaryFrequency}
              />
            )}

          {memberOnboardingData.employementStatusId != 'U' &&
            memberOnboardingData.employementStatusId != 'N' &&
            memberOnboardingData.employementStatusId != 'R' && (
              <DropdownWithModal
                passIdAndDesc
                label="Income Range"
                required={employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('incomeRangeKey')}
                value={memberOnboardingData.incomeRangeKeyDesc}
                setValue={(id: string, desc?: string) => {
                  dispatch(
                    setState({
                      incomeRangeKey: id?.toUpperCase(),
                      incomeRangeKeyDesc: desc?.toUpperCase(),
                    }),
                  );
                }}
                style={{}}
                placeholder={'SELECT INCOME RANGE'}
                header={'Income Range'}
                type="IncomeRange"
                hasError={clicked && !memberOnboardingData.incomeRangeKeyDesc}
              />
            )}

          {memberOnboardingData.employementStatusId != 'U' && (
            <View style={{ gap: hp(1) }}>
              <CurrencyInputField
                value={memberOnboardingData.salary}
                onChangeText={(text: string) => {
                  dispatch(
                    setState({
                      salary: text,
                    }),
                  );
                }}
                lableimp={employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('incomeRangeKey')}
                missingField={!memberOnboardingData.salary}
                submitClicked={clicked}
                maxValue={50000000000}
                backgroundColor="#fff"
                showFormat
                label="Salary"
                // lableimp
              />
            </View>
          )}

          <DropdownWithModal
            required={employementStatusRequiredKeys[
              memberOnboardingData.employementStatusId
            ]?.fields?.includes('employementSourceFund')}
            label="Account Funded"
            value={memberOnboardingData.employementSourceFund}
            maxLength={94}
            setValue={(id: string) => {
              dispatch(
                setState({
                  employementSourceFund: id,
                }),
              );
            }}
            placeholder={'SELECT ACCOUNT FUNDED'}
            header={'Account Funded'}
            options={[
              {
                label: 'Via Salary',
                value: 'Via Salary',
              },
              {
                label: 'Others',
                value: 'Others',
              },
            ]}
            hasError={clicked && !memberOnboardingData.employementSourceFund}
          />

          {memberOnboardingData.employementSourceFund === 'Others' && (
            <TextInputComponent
              inputStyles={{
                fontSize: hp(1.6),
                height: hp(5),
                color: '#000',
              }}
              required={employementStatusRequiredKeys[
                memberOnboardingData.employementStatusId
              ]?.fields?.includes('employementSourceFund')}
              value={memberOnboardingData.employementSourceFundOthers}
              onChange={(text: string) => {
                dispatch(
                  setState({
                    employementSourceFundOthers: text,
                  }),
                );
              }}
              submitClicked={clicked}
              missingField={!memberOnboardingData.employementSourceFundOthers}
              placeholder="Enter Other Source"
              header="Other Source"
            />
          )}

          <View style={{ gap: hp(1) }}>
            <TextInputComponent
              // regex={/^[a-zA-Z0-9 .'\-#,]*$/}
              // regex={/^[a-zA-Z0-9 .\'\-#]*$/}
              regex={/^[a-zA-Z0-9 .',\-#]*$/}
              required={employementStatusRequiredKeys[
                memberOnboardingData.employementStatusId
              ]?.fields?.includes('employerAddress1')}
              inputStyles={{
                fontSize: hp(1.6),
                height: hp(5),
              }}
              maxLength={105}
              header="Address Line 1"
              placeholder="ENTER ADDRESS LINE 1"
              keyboardType="default"
              onChange={text =>
                dispatch(
                  setState({
                    employerAddress1: text.toUpperCase(),
                  }),
                )
              }
              value={memberOnboardingData.employerAddress1}
              missingField={
                employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('employerAddress1') &&
                !memberOnboardingData.employerAddress1
              }
              submitClicked={clicked}
            />
          </View>

          <View style={{ gap: hp(1) }}>
            <TextInputComponent
              regex={/^[a-zA-Z0-9 .',\-#]*$/}
              inputStyles={{
                fontSize: hp(1.6),
                height: hp(5),
              }}
              required={employementStatusRequiredKeys[
                memberOnboardingData.employementStatusId
              ]?.fields?.includes('employerAddress2')}
              header="Address Line 2"
              maxLength={105}
              placeholder="ENTER ADDRESS LINE 2"
              keyboardType="default"
              onChange={text =>
                dispatch(
                  setState({
                    employerAddress2: text.toUpperCase(),
                    // employerAddress2: validateAndSanitizeInput(
                    //   text.toUpperCase()
                    // ),
                  }),
                )
              }
              value={memberOnboardingData.employerAddress2}
              // missingField={!memberOnboardingData.employerAddress2}
              // submitClicked={clicked}
            />
            {/* <Text style={{ color: "#000", fontSize: hp(1.7) }}>
                Address Line 2
              </Text>
              <View
                style={{
                  borderColor: "#B1B1B1",
                  borderWidth: hp(0.1),
                  borderRadius: hp(0.6),
                }}
              >
                <TextInput
                  placeholderTextColor={"#B1B1B1"}
                  //placeholder="Enter Address Line 2"
                  placeholder="ENTER ADDRESS LINE 2"
                  maxLength={105}
                  style={{ paddingHorizontal: wp(3) }}
                  onChangeText={(text) =>
                    dispatch(
                      setState({
                        employerAddress2: validateAndSanitizeInput(
                          text.toUpperCase()
                        ),
                      })
                    )
                  }
                />
              </View> */}
          </View>

          <View style={{ gap: hp(1) }}>
            <TextInputComponent
              regex={/^[a-zA-Z0-9 {}\.\',\-]*$/}
              required={employementStatusRequiredKeys[
                memberOnboardingData.employementStatusId
              ]?.fields?.includes('employerCity')}
              inputStyles={{
                fontSize: hp(1.6),
                height: hp(5),
              }}
              header="City"
              placeholder="Enter City"
              keyboardType="default"
              maxLength={105}
              onChange={text =>
                dispatch(
                  setState({
                    employerCity: text.toUpperCase(),
                  }),
                )
              }
              value={memberOnboardingData.employerCity}
              missingField={
                employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes('employerCity') &&
                !memberOnboardingData.employerCity
              }
              submitClicked={clicked}
            />
          </View>

          <View style={{ gap: hp(1) }}>
            {/* <Text style={{ color: "#000", fontSize: hp(1.7) }}>
                Country
                {employementStatusRequiredKeys[
                  memberOnboardingData.employementStatusId
                ]?.fields?.includes("employerCountry") ? (
                  <Text style={{ color: "red" }}>*</Text>
                ) : null}
              </Text> */}
            <View
            // style={{
            //   borderWidth: hp(0.1),
            //   borderRadius: hp(0.5),
            //   borderColor: "#B1B1B1",
            //   // paddingVertical: hp(0.),
            // }}
            >
              <DropdownWithModal
                passIdAndDesc
                value={memberOnboardingData.employerCountryDesc}
                setValue={(id: string, desc?: string) => {
                  dispatch(
                    setState({
                      employerCountryDesc: desc?.toUpperCase(),
                      employerCountry: id,
                    }),
                  );
                }}
                required
                label="Country"
                //placeholder={"Select Country"}
                placeholder={'SELECT COUNTRY'}
                header={'Select Country'}
                // style={{
                //   paddingVertical: hp(1.6),
                // }}
                type={'nationality'}
                hasError={
                  employementStatusRequiredKeys[
                    memberOnboardingData.employementStatusId
                  ]?.fields?.includes('employerCity') &&
                  clicked &&
                  !memberOnboardingData.employerCountryDesc
                }
              />
            </View>
          </View>

          <View style={{ gap: hp(1) }}>
            <TextInputComponent
              maxLength={10}
              regex={/^[a-zA-Z0-9]+$/}
              inputStyles={{
                fontSize: hp(1.6),
                height: hp(5),
              }}
              maxLength={8}
              required={employementStatusRequiredKeys[
                memberOnboardingData.employementStatusId
              ]?.fields?.includes('employerZipCode')}
              header="Zip Code"
              placeholder="Enter Zip Code"
              keyboardType="default"
              onChange={text =>
                dispatch(
                  setState({
                    employerZipCode: validateAndSanitizeInput(
                      text.toUpperCase(),
                    ),
                  }),
                )
              }
              value={memberOnboardingData.employerZipCode}
            />

            {/* <Text style={{ color: "#000", fontSize: hp(1.7) }}>Zip Code</Text>
              <View
                style={{
                  borderColor: "#B1B1B1",
                  borderWidth: hp(0.1),
                  borderRadius: hp(0.6),
                }}
              >
                <TextInput
                  placeholderTextColor={"#B1B1B1"}
                  //placeholder="Enter Zip Code"
                  placeholder="ENTER ZIP CODE"
                  style={{ paddingHorizontal: wp(3) }}
                  value={memberOnboardingData.employerZipCode}
                  onChangeText={(text) =>
                    dispatch(
                      setState({
                        employerZipCode: validateAndSanitizeInput(
                          text.toUpperCase()
                        ),
                      })
                    )
                  }
                  maxLength={8}
                />
              </View> */}
          </View>

          <View style={{ gap: hp(1) }}>
            <Text style={{ color: '#000', fontSize: hp(1.7) }}>Work Phone</Text>
            <View>
              <MobileNumberInputComponent
                regex={/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/}
                isdCode={memberOnboardingData?.employerWorkPhoneIsd}
                mobileNumber={memberOnboardingData?.employerWorkPhone}
                onChangeMobileNumber={(num: string) => {
                  dispatch(
                    setState({
                      employerWorkPhone: num,
                    }),
                  );
                }}
                onChangeIsdCode={(id: string, desc: string) => {
                  dispatch(
                    setState({
                      employerWorkPhoneIsd: id,
                      employerWorkPhoneIsdDesc: desc,
                    }),
                  );
                }}
              />
            </View>
          </View>

          <View style={{ gap: hp(1) }}>
            <TextInputComponent
              inputStyles={{
                fontSize: hp(1.6),
                height: hp(5),
              }}
              header="Work Email"
              keyboardType="email-address"
              maxLength={59}
              onChange={text =>
                dispatch(
                  setState({
                    employerWorkEmail: text.toUpperCase(),
                  }),
                )
              }
              maxLength={255}
              placeholder="Enter Work Email"
              value={memberOnboardingData.employerWorkEmail}
            />
          </View>

          <View style={{ gap: hp(1) }}>
            <DropdownWithModal
              options={[
                { value: 'Shares', label: 'Shares' },
                { value: 'Fixed Deposit', label: 'Fixed Deposit' },
                { value: 'Loan', label: 'Loan' },
                { value: 'LinCU', label: 'LinCU' },
              ]}
              value={memberOnboardingData.purposeOfBusiness}
              setValue={id => {
                dispatch(
                  setState({
                    purposeOfBusiness: validateAndSanitizeInput(
                      id.toUpperCase(),
                    ),
                  }),
                );
              }}
              header="Purpose and Nature of Business Relationship"
              label="Purpose and Nature of Business Relationship"
              placeholder="Select option"
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <Button
        text="Continue"
        onPress={handleContinue}
        //buttonStyle={[styles.navigationButton, styles.continueButton]}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
    },
    backButton: {
      marginRight: wp(4),
    },
    backIcon: {
      fontSize: hp(3),
      fontWeight: 'bold',
    },
    headerContent: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: hp(2.8),
      fontWeight: 'bold',
    },
    helpButton: {
      marginLeft: wp(4),
    },
    helpIcon: {
      fontSize: hp(2.5),
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    label: {
      color: '#000',
      fontSize: hp(1.6),
      fontWeight: '500',
    },
    infoBox: {
      borderColor: '#08A6FF',
      borderStyle: 'dotted',
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      borderWidth: 2,
      borderRadius: 5,
      backgroundColor: '#E9F5FA7A',
    },
    warningIcon: {
      position: 'absolute',
      height: hp(3.5),
      width: wp(7),
      bottom: -14,
      end: -2,
    },
    dropdownWrapper: {
      borderColor: '#B1B1B1',
      borderWidth: hp(0.1),
      borderRadius: hp(0.5),
      marginTop: hp(1),
    },
  });

export default AdditionalDetails;
