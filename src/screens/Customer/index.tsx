import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import React, { useState } from 'react';
import useHideBottomBar from '@src/common/components/useHideBottomBar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '@src/common/utils/ThemeContext';
import Button from '@src/common/components/Button';
import Loader from '@src/common/components/Loader';
import { logErr } from '@src/common/utils/logger';
import NoCustomer from './NoCustomer';
import { useDispatch, useSelector } from 'react-redux';
import { setState } from '@src/store/customer';
import kycProcess from './kycProcess';

const Stack = createNativeStackNavigator();

export const CustomerStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="customer"
    >
      <Stack.Screen name="customer" component={Customer} />
      <Stack.Screen name="NoCustomer" component={NoCustomer} />
      <Stack.Screen name="kycProcess" component={kycProcess} />
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

  // Form state
  const [formData, setFormData] = useState({
    purpose: 'Personal Loan',
    mobile: '+91 9876543210',
    email: 'sample@gmail.com',
    loanAmount: '₹12,00,000',
    tenure: '3 years',
  });

  const [calculations, setCalculations] = useState({
    interestRate: '10.99%',
    monthlyEMI: '₹36,000',
    principalAmount: '₹12,00,000',
    totalInterest: '₹96,000',
    totalAmount: '₹12,96,000',
  });

  const styles = createStyles(colors, isDark);

  const handleSendQuotation = () => {
    // Handle send quotation logic
    console.log('Sending quotation with data:', formData);
    (navigation as any).navigate('NoCustomer');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Loader loading={loading} />

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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Purpose of Loan */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Purpose of Loan
            </Text>
            <TouchableOpacity
              style={[styles.dropdownInput, { borderColor: colors.border }]}
            >
              <Text style={[styles.dropdownText, { color: colors.text }]}>
                {formData.purpose}
              </Text>
              <Text
                style={[styles.dropdownArrow, { color: colors.textSecondary }]}
              >
                ▼
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mobile Number */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Mobile Number
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
              value={formData.mobile}
              onChangeText={text => setFormData({ ...formData, mobile: text })}
              placeholder="Enter mobile number"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Mail
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
              value={formData.email}
              onChangeText={text => setFormData({ ...formData, email: text })}
              placeholder="Enter email"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Loan Amount */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Loan Amount
            </Text>
            <TouchableOpacity
              style={[styles.dropdownInput, { borderColor: colors.border }]}
            >
              <Text style={[styles.dropdownText, { color: colors.text }]}>
                {formData.loanAmount}
              </Text>
              <Text
                style={[styles.dropdownArrow, { color: colors.textSecondary }]}
              >
                ▼
              </Text>
            </TouchableOpacity>
          </View>

          {/* Loan Tenure */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Loan Tenure
            </Text>
            <TouchableOpacity
              style={[styles.dropdownInput, { borderColor: colors.border }]}
            >
              <Text style={[styles.dropdownText, { color: colors.text }]}>
                {formData.tenure}
              </Text>
              <Text
                style={[styles.dropdownArrow, { color: colors.textSecondary }]}
              >
                ▼
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calculation Cards */}
        <View style={styles.calculationCards}>
          <View
            style={[styles.calculationCard, { backgroundColor: '#E8D5FF' }]}
          >
            <Text style={styles.calculationLabel}>Tentative Interest Rate</Text>
            <Text style={[styles.calculationValue, { color: '#8B5CF6' }]}>
              {calculations.interestRate}
            </Text>
          </View>

          <View
            style={[styles.calculationCard, { backgroundColor: '#E8D5FF' }]}
          >
            <Text style={styles.calculationLabel}>Monthly EMI</Text>
            <Text style={[styles.calculationValue, { color: '#8B5CF6' }]}>
              {calculations.monthlyEMI}
            </Text>
          </View>
        </View>

        {/* Loan Breakdown */}
        <View
          style={[styles.breakdownCard, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.breakdownTitle, { color: colors.text }]}>
            Loan Breakdown
          </Text>

          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownLabel, { color: colors.text }]}>
              Principal Amount
            </Text>
            <View style={styles.breakdownDots} />
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              {calculations.principalAmount}
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownLabel, { color: colors.text }]}>
              Total Interest
            </Text>
            <View style={styles.breakdownDots} />
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              {calculations.totalInterest}
            </Text>
          </View>

          <View style={styles.breakdownItem}>
            <Text style={[styles.breakdownLabel, { color: colors.text }]}>
              Total Amount Payable
            </Text>
            <View style={styles.breakdownDots} />
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              {calculations.totalAmount}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Send Quotation Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.sendButton, { borderColor: '#8B5CF6' }]}
          onPress={handleSendQuotation}
        >
          <Text style={[styles.sendButtonText, { color: '#8B5CF6' }]}>
            Send Quotation
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1A1A1A', // Dark background
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: wp(4),
      paddingTop: hp(2),
      paddingBottom: hp(8),
    },
    formContainer: {
      marginBottom: hp(3),
    },
    inputContainer: {
      marginBottom: hp(2),
    },
    inputLabel: {
      fontSize: hp(1.8),
      fontWeight: '500',
      marginBottom: hp(1),
      color: '#FFFFFF',
    },
    textInput: {
      height: hp(6),
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: wp(4),
      fontSize: hp(1.8),
      backgroundColor: '#2A2A2A',
    },
    dropdownInput: {
      height: hp(6),
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: wp(4),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#2A2A2A',
    },
    dropdownText: {
      fontSize: hp(1.8),
      color: '#FFFFFF',
    },
    dropdownArrow: {
      fontSize: hp(1.5),
    },
    calculationCards: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(3),
      gap: wp(3),
    },
    calculationCard: {
      flex: 1,
      borderRadius: 12,
      padding: wp(4),
      alignItems: 'center',
    },
    calculationLabel: {
      fontSize: hp(1.6),
      fontWeight: '500',
      marginBottom: hp(1),
      color: '#8B5CF6',
    },
    calculationValue: {
      fontSize: hp(2.4),
      fontWeight: 'bold',
    },
    breakdownCard: {
      borderRadius: 12,
      padding: wp(4),
      marginBottom: hp(2),
    },
    breakdownTitle: {
      fontSize: hp(2.2),
      fontWeight: 'bold',
      marginBottom: hp(2),
    },
    breakdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(1.5),
    },
    breakdownLabel: {
      fontSize: hp(1.8),
      flex: 1,
    },
    breakdownDots: {
      flex: 1,
      height: 1,
      borderBottomWidth: 1,
      borderBottomColor: '#666',
      borderStyle: 'dashed',
      marginHorizontal: wp(2),
    },
    breakdownValue: {
      fontSize: hp(1.8),
      fontWeight: '500',
    },
    buttonContainer: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      backgroundColor: '#1A1A1A',
    },
    sendButton: {
      height: hp(6),
      borderWidth: 1,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    sendButtonText: {
      fontSize: hp(2),
      fontWeight: '600',
    },
  });
