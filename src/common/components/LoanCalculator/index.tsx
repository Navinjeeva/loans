import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '@src/common/utils/ThemeContext';
import TextInputComponent from '@src/common/components/TextInputComponent';
import DropdownWithModal from '@src/common/components/DropdownWithModal';
import MobileNumberInputComponent from '@src/common/components/MobileNumberComponent';

interface LoanCalculatorProps {
  onSendQuotation?: () => void;
  onProceed?: () => void;
}

const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  onSendQuotation,
  onProceed,
}) => {
  const { colors, isDark } = useTheme();

  // Form state
  const [loanPurpose, setLoanPurpose] = useState('Personal Loan');
  const [isdCode, setIsdCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [email, setEmail] = useState('sample@gmail.com');
  const [loanAmount, setLoanAmount] = useState('₹12,00,000');
  const [loanTenure, setLoanTenure] = useState('3 years');

  const [tentativeInterestRate, setTentativeInterestRate] = useState('10.99');
  const [monthlyEMI, setMonthlyEMI] = useState('₹36,000');
  const [principalAmount, setPrincipalAmount] = useState('₹12,00,000');
  const [totalInterest, setTotalInterest] = useState('₹96,000');
  const [totalAmountPayable, setTotalAmountPayable] = useState('₹12,96,000');

  // Function to calculate EMI
  const calculateEMI = (principal: string, rate: string, tenure: string) => {
    // Extract numeric values
    const principalNum = parseFloat(principal.replace(/[₹,]/g, ''));
    const rateNum = parseFloat(rate);
    const tenureNum = parseInt(tenure.split(' ')[0]) * 12; // Convert years to months

    if (principalNum && rateNum && tenureNum) {
      const monthlyRate = rateNum / (12 * 100); // Convert annual rate to monthly
      const emi =
        (principalNum * monthlyRate * Math.pow(1 + monthlyRate, tenureNum)) /
        (Math.pow(1 + monthlyRate, tenureNum) - 1);

      const totalInterestAmount = emi * tenureNum - principalNum;
      const totalPayable = principalNum + totalInterestAmount;

      setMonthlyEMI(`₹${Math.round(emi).toLocaleString('en-IN')}`);
      setTotalInterest(
        `₹${Math.round(totalInterestAmount).toLocaleString('en-IN')}`,
      );
      setTotalAmountPayable(
        `₹${Math.round(totalPayable).toLocaleString('en-IN')}`,
      );
    }
  };

  // Handle interest rate change
  const handleInterestRateChange = (value: string) => {
    setTentativeInterestRate(value);
    calculateEMI(loanAmount, value, loanTenure);
  };

  const styles = createStyles(colors, isDark);

  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Input Fields Section */}
      <View style={styles.formSection}>
        {/* Purpose of Loan */}
        <View style={styles.inputContainer}>
          <Text style={styles.fieldLabel}>Purpose of Loan *</Text>
          <View style={styles.dropdownField}>
            <Text style={styles.dropdownText}>{loanPurpose.toUpperCase()}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </View>
        </View>

        {/* Mobile Number */}
        <View style={styles.inputContainer}>
          <Text style={styles.fieldLabel}>Mobile Number</Text>
          <View style={styles.mobileField}>
            <View style={styles.isdSection}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.isdCode}>+91</Text>
            </View>
            <Text style={styles.mobileNumber}>98765-43210</Text>
          </View>
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.fieldLabel}>Enter mail</Text>
          <View style={styles.inputField}>
            <Text style={styles.inputText}>{email}</Text>
          </View>
        </View>

        {/* Loan Amount */}
        <View style={styles.inputContainer}>
          <Text style={styles.fieldLabel}>Loan Amount *</Text>
          <View style={styles.dropdownField}>
            <Text style={styles.dropdownText}>{loanAmount}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </View>
        </View>

        {/* Loan Tenure */}
        <View style={styles.inputContainer}>
          <Text style={styles.fieldLabel}>Loan Tenure *</Text>
          <View style={styles.dropdownField}>
            <Text style={styles.dropdownText}>{loanTenure.toUpperCase()}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </View>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Tentative Interest Rate</Text>
          <View style={styles.interestRateContainer}>
            <View style={styles.interestRateInput}>
              <Text style={styles.interestRateText}>
                {tentativeInterestRate}
              </Text>
            </View>
            <Text style={styles.percentageSymbol}>%</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Monthly EMI</Text>
          <Text style={styles.summaryValue}>{monthlyEMI}</Text>
        </View>
      </View>

      {/* Loan Breakdown */}
      <View style={styles.loanBreakdown}>
        <Text style={styles.breakdownTitle}>Loan Breakdown</Text>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Principal Amount</Text>
          <View style={styles.dottedLine} />
          <Text style={styles.breakdownValue}>{principalAmount}</Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Total Interest</Text>
          <View style={styles.dottedLine} />
          <Text style={styles.breakdownValue}>{totalInterest}</Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Total Amount Payable</Text>
          <View style={styles.dottedLine} />
          <Text style={styles.breakdownValue}>{totalAmountPayable}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.sendQuotationButton}
          onPress={onSendQuotation}
        >
          <Text style={styles.sendQuotationText}>Send Quotation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.proceedButton} onPress={onProceed}>
          <Text style={styles.proceedButtonText}>Proceed</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: any, isDark: any) =>
  StyleSheet.create({
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
      fontWeight: '500',
      marginBottom: hp(1),
      color: '#333333',
    },
    dropdownField: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E5E5',
      backgroundColor: '#FFFFFF',
    },
    dropdownText: {
      fontSize: hp(1.6),
      color: '#333333',
      fontWeight: '500',
    },
    dropdownArrow: {
      fontSize: hp(1.4),
      color: '#666666',
    },
    mobileField: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E5E5',
      backgroundColor: '#FFFFFF',
    },
    isdSection: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: wp(3),
    },
    flag: {
      fontSize: hp(2),
      marginRight: wp(2),
    },
    isdCode: {
      fontSize: hp(1.6),
      color: '#333333',
      fontWeight: '500',
    },
    mobileNumber: {
      fontSize: hp(1.6),
      color: '#333333',
      fontWeight: '500',
    },
    inputField: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E5E5',
      backgroundColor: '#FFFFFF',
    },
    inputText: {
      fontSize: hp(1.6),
      color: '#333333',
    },
    summaryCards: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: hp(3),
      marginBottom: hp(3),
      gap: wp(3),
    },
    summaryCard: {
      flex: 1,
      padding: wp(4),
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#6C4FF7',
      backgroundColor: '#F3F1FF',
      alignItems: 'center',
    },
    interestRateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: hp(0.5),
      justifyContent: 'center',
    },
    interestRateInput: {
      borderColor: '#6C4FF7',
      borderWidth: 1,
      paddingHorizontal: wp(3),
      paddingVertical: hp(1),
      borderRadius: 8,
      backgroundColor: '#FFFFFF',
      marginRight: wp(2),
      minWidth: wp(20),
      height: hp(5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    interestRateText: {
      fontSize: hp(2.2),
      fontWeight: 'bold',
      color: '#6C4FF7',
    },
    percentageSymbol: {
      fontSize: hp(2.2),
      fontWeight: 'bold',
      color: '#6C4FF7',
    },
    summaryLabel: {
      fontSize: hp(1.4),
      color: '#333333',
      marginBottom: hp(0.5),
    },
    summaryValue: {
      fontSize: hp(2.2),
      fontWeight: 'bold',
      color: '#6C4FF7',
    },
    loanBreakdown: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E5E5',
      padding: wp(4),
      marginBottom: hp(3),
      backgroundColor: '#FFFFFF',
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
      backgroundColor: '#E5E5E5',
      marginHorizontal: wp(2),
    },
    breakdownValue: {
      fontSize: hp(1.6),
      fontWeight: '500',
      color: '#333333',
    },
    buttonContainer: {
      paddingBottom: hp(2),
      gap: hp(1),
    },
    sendQuotationButton: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#6C4FF7',
      paddingVertical: hp(1.5),
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
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
    proceedButtonText: {
      color: '#FFFFFF',
      fontSize: hp(1.8),
      fontWeight: '600',
    },
  });

export default LoanCalculator;
