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
import KycProcess from './KycProcess';
import TextInputComponent from '@src/common/components/TextInputComponent';
import DropdownWithModal from '@src/common/components/DropdownWithModal';
import MobileNumberInputComponent from '@src/common/components/MobileNumberComponent';
import UploadDoc from './UploadDoc';
import MemberDetails from './MemberDetails';
import MemberOnboarding from './MemberOnboarding';
import Application from './Application';
import Signature from './Signature';
import Verification from './Verification';

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
    isdCode,
    mobileNumber,
    email,
    loanAmount,
    loanTenure,
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
      tenureInYears: Number(loanTenure),
      interestRate: Number(tentativeInterestRate),
    });
    try {
      setLoading(true);
      const { data } = await instance.post(
        'api/v1/loans/application/calculate',
        {
          loanAmount: 500000.0,
          tenureInYears: loanTenure,
          interestRate: tentativeInterestRate,
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
            Loan Calculator
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            Calculate your EMI and get personalised offers
          </Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Input Fields Section */}
        <View style={styles.formSection}>
          {/* Purpose of Loan */}
          <DropdownWithModal
            options={[
              { label: 'Personal Loan', value: 'Personal Loan' },
              { label: 'Home Loan', value: 'Home Loan' },
              { label: 'Car Loan', value: 'Car Loan' },
            ]}
            value={loanPurpose}
            setValue={value => dispatch(setState({ loanPurpose: value }))}
            placeholder="Select Purpose of Loan"
            header="Purpose of Loan"
            label="Purpose of Loan"
            required
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
            placeholder="Select Purpose of Loan"
            header="Loan Amount"
            label="Loan Amount"
            required
          />
          <DropdownWithModal
            options={[
              { label: '3 years', value: '3' },
              { label: '4 years', value: '4' },
              { label: '5 years', value: '5' },
            ]}
            value={loanTenure}
            setValue={value => dispatch(setState({ loanTenure: value }))}
            placeholder="Select Purpose of Loan"
            header="Loan Tenure"
            label="Loan Tenure"
            required
          />
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={styles.summaryCardContainer}>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>
              Tentative Interest Rate
            </Text>
            <View style={styles.interestRateContainer}>
              <TextInput
                value={tentativeInterestRate ? tentativeInterestRate : '0.0'}
                onChangeText={value =>
                  dispatch(setState({ tentativeInterestRate: value }))
                }
                keyboardType="numeric"
                style={styles.interestRateInput}
              />
              <Text style={[styles.percentageSymbol, { color: '#6C4FF7' }]}>
                %
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.summaryCard,
              { backgroundColor: '#F3F1FF', borderColor: '#6C4FF7' },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: colors.text }]}>
              Monthly EMI
            </Text>
            <Text style={[styles.summaryValue, { color: '#6C4FF7' }]}>
              ₹{monthlyEMI}
            </Text>
          </View>
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
              ₹{principalAmount}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.text }]}>
              Total Interest
            </Text>
            <View style={styles.dottedLine} />
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              ₹{totalInterest}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: colors.text }]}>
              Total Amount Payable
            </Text>
            <View style={styles.dottedLine} />
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              ₹{totalAmountPayable}
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
            navigation.navigate('Application' as never);
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
      backgroundColor: '#FFFFFF',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: wp(4),
      paddingTop: hp(2),
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
