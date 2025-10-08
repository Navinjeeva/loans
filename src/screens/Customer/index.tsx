import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import KeyboardAwareScrollView from '@src/common/components/KeyboardAwareScrollView';
import React, { useEffect, useState } from 'react';
import useHideBottomBar from '@src/common/components/useHideBottomBar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DocumentUpload from '@src/common/components/DocumentUpload';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '@src/common/utils/ThemeContext';
import Button from '@src/common/components/Button';
import Loader from '@src/common/components/Loader';
import { idpInstance, instance } from '@src/services';
import { logAlert, logErr } from '@src/common/utils/logger';
import axios from 'axios';
import { idpExtract } from '@src/common/utils/idp';
import NoCustomer from './NoCustomer';
import { useDispatch, useSelector } from 'react-redux';
import { setState } from '@src/store/customer';
import TextInputComponent from '@src/common/components/TextInputComponent';
import DropdownWithModal from '@src/common/components/DropdownWithModal';
import MobileNumberInputComponent from '@src/common/components/MobileNumberComponent';
import UploadDoc from './UploadDoc';
import MemberDetails from './MemberDetails';
import MemberOnboarding from './MemberOnboarding';
import Application from './Application';
import Signature from './Signature';
import Verification from './Verification';
import KycProcess from './KycProcess';
import Header from '@src/common/components/Header';
import AdditionalDetails from './AdditionalDetails';
import Pep from './Pep';
import Fatca from './Fatca';
import DocumentHolderVerification from './DocumentHolderVerification';
import AddBeneficiary from './AddBeneficiary';
import FinalScreen from './FinalScreen';

const Stack = createNativeStackNavigator();

export const CustomerStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="customer"
    >
      <Stack.Screen name="customer" component={Customer} />
      <Stack.Screen name="UploadDoc" component={UploadDoc} />
      <Stack.Screen name="NoCustomer" component={NoCustomer} />
      <Stack.Screen name="KycProcess" component={KycProcess} />
      <Stack.Screen name="MemberOnboarding" component={MemberOnboarding} />
      <Stack.Screen name="MemberDetails" component={MemberDetails} />
      <Stack.Screen name="Application" component={Application} />
      <Stack.Screen name="Signature" component={Signature} />
      <Stack.Screen name="Verification" component={Verification} />
      <Stack.Screen name="AdditionalDetails" component={AdditionalDetails} />
      <Stack.Screen name="Pep" component={Pep} />
      <Stack.Screen name="Fatca" component={Fatca} />
      <Stack.Screen
        name="DocumentHolderVerification"
        component={DocumentHolderVerification}
      />
      <Stack.Screen name="AddBeneficiary" component={AddBeneficiary} />
      <Stack.Screen name="FinalScreen" component={FinalScreen} />
    </Stack.Navigator>
  );
};

const Customer = () => {
  useHideBottomBar();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const custData = useSelector((state: any) => state.customer);

  const {
    loanPurpose,
    promotions,
    name,
    isdCode,
    mobileNumber,
    email,
    loanAmount,
    loanTenor,
    tenorDuration,
    moratorium,
    tentativeInterestRate,
    monthlyEMI,
    principalAmount,
    totalInterest,
    totalAmountPayable,
  } = custData;

  // useEffect(() => {
  //   (async () => {
  //     if (loanAmount && loanTenure && tentativeInterestRate) {
  //       try {
  //         setLoading(true);
  //         const response = await instance.post(
  //           'api/v1/loans/application/calculate',
  //           {
  //             loanAmount: '500000.0',
  //             tenureInYears: 5,
  //             interestRate: 8.5,
  //           },
  //         );

  //         console.log(response);
  //       } catch (error) {
  //         console.log(error);
  //         logErr(error);
  //       } finally {
  //         setLoading(false);
  //       }

  //       // if (response?.status == 200) {
  //       //   setMonthlyEMI(response?.data?.data?.payload?.monthlyEMI);
  //       //   setPrincipalAmount(response?.data?.data?.payload?.principalAmount);
  //       //   setTotalInterest(response?.data?.data?.payload?.totalInterest);
  //       //   setTotalAmountPayable(response?.data?.data?.payload?.totalAmountPayable);
  //       // }
  //     }
  //   })();
  // }, [loanAmount, loanTenure, tentativeInterestRate]);

  const calculateEMI = async () => {
    console.log({
      loanAmount: loanAmount.replace(/[₹,]/g, '') + '.0',
      tenureInMonths: Number(tenorDuration),
      interestRate: Number(tentativeInterestRate),
    });
    try {
      setLoading(true);
      const { data } = await instance.post(
        'api/v1/loans/application/calculate',
        {
          loanAmount: parseFloat(loanAmount.replace(/[₹,]/g, '')),
          tenureInYears:
            loanTenor === 'Months'
              ? Number(tenorDuration) / 12
              : Number(tenorDuration),
          interestRate: Number(tentativeInterestRate),
        },
      );

      console.log(data.responseStructure.data);
      dispatch(
        setState({
          monthlyEMI: data.responseStructure.data.monthlyEMI,
          principalAmount: data.responseStructure.data.principalAmount,
          totalInterest: data.responseStructure.data.totalInterest,
          totalAmountPayable: data.responseStructure.data.totalAmountPayable,
        }),
      );
    } catch (error) {
      console.log(error);
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Loader loading={loading} />
      <Header title={'Loan Calculator'} showBackButton={false} />
      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Fields Section */}
        <View style={styles.formSection}>
          {/* Purpose of Loan */}
          <DropdownWithModal
            options={[
              { label: 'Personal Loan', value: 'PERSONAL' },
              { label: 'Home Loan', value: 'HOME' },
              { label: 'Vehicle Loan', value: 'VEHICLE' },
              { label: 'Education Loan', value: 'EDUCATION' },
            ]}
            value={loanPurpose}
            setValue={value => dispatch(setState({ loanPurpose: value }))}
            placeholder="Select Purpose of Loan"
            header="Purpose of Loan"
            label="Purpose of Loan"
            required
          />

          {/* Promotions */}
          <DropdownWithModal
            options={[
              { label: 'Christmas Loan', value: 'Christmas Loan' },
              { label: 'New Year Special', value: 'New Year Special' },
              { label: 'Festival Offer', value: 'Festival Offer' },
              { label: 'No Promotion', value: 'No Promotion' },
            ]}
            value={promotions}
            setValue={value => dispatch(setState({ promotions: value }))}
            placeholder="Enter Promotion"
            header="Promotions"
            label="Promotions"
          />

          {/* Name */}
          <TextInputComponent
            header="Name"
            placeholder="Enter Name"
            value={name}
            onChange={value => dispatch(setState({ name: value }))}
            inputStyles={styles.textInput}
          />

          {/* Mobile Number */}
          <View style={styles.inputContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Mobile Number
            </Text>
            <MobileNumberInputComponent
              mobileNumber={mobileNumber}
              isdCode={isdCode}
              onChangeMobileNumber={value =>
                dispatch(setState({ mobileNumber: value }))
              }
              onChangeIsdCode={(code, desc) =>
                dispatch(setState({ isdCode: String(code) }))
              }
              isEditable={true}
            />
          </View>

          {/* Email */}
          <TextInputComponent
            header="Enter mail"
            placeholder="Enter email"
            value={email}
            onChange={value => dispatch(setState({ email: value }))}
            keyboardType="email-address"
            inputStyles={styles.textInput}
          />

          <DropdownWithModal
            options={[
              { label: '₹12,00,000', value: '₹12,00,000' },
              { label: '₹15,00,000', value: '₹15,00,000' },
              { label: '₹18,00,000', value: '₹18,00,000' },
              { label: '₹20,00,000', value: '₹20,00,000' },
              { label: '₹25,00,000', value: '₹25,00,000' },
              { label: '₹30,00,000', value: '₹30,00,000' },
              { label: '₹35,00,000', value: '₹35,00,000' },
            ]}
            value={loanAmount}
            setValue={value => dispatch(setState({ loanAmount: value }))}
            placeholder="Select Loan Amount"
            header="Loan Amount"
            label="Loan Amount"
            required
          />

          {/* Loan Tenor and Tenor Duration Row */}
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <DropdownWithModal
                options={[
                  { label: 'Months', value: 'Months' },
                  { label: 'Years', value: 'Years' },
                ]}
                value={loanTenor}
                setValue={value => dispatch(setState({ loanTenor: value }))}
                placeholder="-"
                header="Loan Tenor"
                label="Loan Tenor"
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <DropdownWithModal
                options={[
                  { label: '12', value: '12' },
                  { label: '24', value: '24' },
                  { label: '36', value: '36' },
                  { label: '48', value: '48' },
                  { label: '60', value: '60' },
                ]}
                value={tenorDuration}
                setValue={value => dispatch(setState({ tenorDuration: value }))}
                placeholder="-"
                header="Tenor Duration"
                label="Tenor Duration"
                required
              />
            </View>
          </View>

          {/* Moratorium and Tentative Interest Rate Row */}
          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <DropdownWithModal
                options={[
                  { label: '-', value: '-' },
                  { label: '3 months', value: '3 months' },
                  { label: '6 months', value: '6 months' },
                  { label: '12 months', value: '12 months' },
                ]}
                value={moratorium}
                setValue={value => dispatch(setState({ moratorium: value }))}
                placeholder="Select Moratorium"
                header="Moratorium"
                label="Moratorium"
                required
              />
            </View>
            <View style={styles.halfWidth}>
              <TextInputComponent
                value={tentativeInterestRate}
                required
                caps
                headerStyles={{
                  marginBottom: hp(1.2),
                }}
                customStyles={{
                  flex: 1,
                }}
                onChange={value => {
                  dispatch(setState({ tentativeInterestRate: value }));
                }}
                placeholder="Enter Interest Rate"
                header="Interest Rate (Annually)"
                keyboardType="numeric"
                regex={/^[0-9.]*$/}
                //submitClicked={submitClicked}
                missingField={!tentativeInterestRate}
              />
            </View>
          </View>
        </View>

        {/* Calculate EMI Button */}
        <View style={styles.calculateButtonContainer}>
          <Button
            text="Calculate Monthly EMI"
            onPress={calculateEMI}
            buttonStyle={styles.calculateButton}
          />
        </View>

        {/* Monthly EMI Display */}
        <View style={styles.emiDisplayContainer}>
          <Text style={[styles.emiLabel, { color: colors.text }]}>
            Monthly EMI
          </Text>
          <Text style={[styles.emiValue, { color: '#6C4FF7' }]}>
            ₹{monthlyEMI || '0'}
          </Text>
        </View>

        {/* Loan Breakdown */}
        <View
          style={[
            styles.loanBreakdown,
            {
              backgroundColor: colors.background,
              borderColor: colors.textSecondary,
            },
          ]}
        >
          <Text style={[styles.breakdownTitle, { color: colors.text }]}>
            Loan Breakdown
          </Text>

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.text }]}>
              Principal Amount
            </Text>
            <View style={styles.dottedLine} />
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              ₹{principalAmount || '0'}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.text }]}>
              Total Interest
            </Text>
            <View style={styles.dottedLine} />
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              ₹{totalInterest || '0'}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.text }]}>
              Total Amount Payable
            </Text>
            <View style={styles.dottedLine} />
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              ₹{totalAmountPayable || '0'}
            </Text>
          </View>
          <Text style={{ textAlign: 'center', color: colors.primary }}>
            View Amortisation Sheet
          </Text>
        </View>
      </KeyboardAwareScrollView>
      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          text="Send Quotation"
          onPress={calculateEMI}
          buttonStyle={styles.sendQuotationButton}
          textStyle={styles.sendQuotationText}
        />

        <Button
          text="Proceed"
          onPress={() => {
            navigation.navigate('AddBeneficiary' as never);
          }}
          buttonStyle={styles.proceedButton}
        />
      </View>
    </SafeAreaView>
  );
};

const InfoItem = ({ text, colors }: { text: string; colors: any }) => (
  <View style={styles.infoItem}>
    <View style={[styles.bullet, { backgroundColor: colors.text }]} />
    <Text style={[styles.infoText, { color: colors.text }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: wp(1),
  },
  bullet: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
    marginRight: wp(3),
    marginTop: hp(0.8),
  },
  infoText: {
    fontSize: hp(1.6),
    flex: 1,
    lineHeight: hp(2.2),
  },
});

const createStyles = (colors: any, isDark: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: hp(5),
      backgroundColor: '#FFFFFF',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: wp(4),
      paddingTop: hp(5),
      paddingBottom: hp(1),
    },
    backButton: {
      marginRight: wp(4),
      marginTop: hp(0.5),
    },
    backIcon: {
      fontSize: hp(3),
      fontWeight: 'bold',
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: hp(2.8),
      fontWeight: 'bold',
      marginBottom: hp(0.5),
      color: '#333333',
    },
    headerSubtitle: {
      fontSize: hp(1.6),
      lineHeight: hp(2.2),
      color: '#666666',
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    formSection: {
      marginTop: hp(2),
    },
    inputContainer: {
      marginBottom: hp(2),
    },
    fieldLabel: {
      fontSize: hp(1.8),
      //fontWeight: '500',
      marginBottom: hp(1),
      //color: '#333333',
    },
    inputField: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: '#FFFFFF',
    },
    inputText: {
      fontSize: hp(1.6),
      color: '#333333',
    },
    dropdownIcon: {
      alignItems: 'center',
    },
    dropdownArrow: {
      fontSize: hp(1.2),
      lineHeight: hp(1),
    },
    textInput: {
      fontSize: hp(1.6),
    },
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(2),
      gap: wp(3),
    },
    halfWidth: {
      flex: 1,
    },
    interestRateField: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: wp(3),
      paddingVertical: hp(1.5),
    },
    calculateButtonContainer: {
      marginVertical: hp(3),
    },
    calculateButton: {
      backgroundColor: '#6C4FF7',
      borderRadius: 8,
      paddingVertical: hp(1.8),
      alignItems: 'center',
    },
    emiDisplayContainer: {
      backgroundColor: '#F3F1FF',
      borderRadius: 8,
      padding: wp(4),
      marginBottom: hp(3),
      alignItems: 'center',
    },
    emiLabel: {
      fontSize: hp(1.4),
      color: '#666666',
      marginBottom: hp(0.5),
    },
    emiValue: {
      fontSize: hp(2.8),
      fontWeight: 'bold',
    },
    summaryCards: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: hp(3),
      marginBottom: hp(3),
      gap: wp(3),
    },
    summaryCardContainer: {
      flex: 1,
      padding: wp(4),
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#F3F1FF',
      backgroundColor: '#F3F1FF',
      alignItems: 'center',
    },
    interestRateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(0.5),
    },
    summaryCard: {
      flex: 1,
      padding: wp(4),
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
    },
    interestRateInput: {
      borderColor: '#6C4FF7',
      borderWidth: 0,
      paddingHorizontal: wp(3),
      borderRadius: 8,
      fontSize: hp(2.2),
      backgroundColor: '#FFFFFF',
      height: hp(6),
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#6C4FF7',
      marginRight: wp(2),
      width: wp(25),
    },
    percentageSymbol: {
      fontSize: hp(2.2),
      fontWeight: 'bold',
    },
    summaryLabel: {
      fontSize: hp(1.4),
      color: '#666666',
      marginBottom: hp(0.5),
    },
    summaryValue: {
      fontSize: hp(2.2),
      fontWeight: 'bold',
    },
    loanBreakdown: {
      borderRadius: 8,
      borderWidth: 1,
      padding: wp(4),
      marginBottom: hp(3),
    },
    breakdownTitle: {
      fontSize: hp(2),
      fontWeight: 'bold',
      marginBottom: hp(2),
      color: '#333333',
    },
    breakdownRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(1.5),
    },
    breakdownLabel: {
      fontSize: hp(1.6),
      color: '#333333',
      flex: 1,
    },
    dottedLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#BFBFBF',
      marginHorizontal: wp(2),
    },
    breakdownValue: {
      fontSize: hp(1.6),
      fontWeight: '500',
      color: '#333333',
    },
    buttonContainer: {
      paddingHorizontal: wp(4),
      paddingBottom: hp(2),
      gap: hp(1),
    },
    sendQuotationButton: {
      borderRadius: 8,
      borderWidth: 1,
      paddingVertical: hp(1.5),
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderColor: '#6C4FF7',
    },
    sendQuotationText: {
      fontSize: hp(1.8),
      fontWeight: '500',
      color: '#6C4FF7',
    },
    proceedButton: {
      backgroundColor: '#6C4FF7',
      borderRadius: 8,
      paddingVertical: hp(1.5),
      alignItems: 'center',
    },
  });
