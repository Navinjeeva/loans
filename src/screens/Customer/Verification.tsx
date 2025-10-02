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
import { setState } from '@src/store/customer';
import MobileNumberInputComponent from '@src/common/components/MobileNumberComponent';
import Button from '@src/common/components/Button';
import TextInputComponent from '@src/common/components/TextInputComponent';
import { OtpInput } from 'react-native-otp-entry';
import Header from '@src/common/components/Header';

const Verification = () => {
  const navigation = useNavigation() as any;
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();

  const { mobileNumber, isdCode, email } = useSelector(
    (state: any) => state.customer,
  );

  // Local state for this screen
  const [loading, setLoading] = useState(false);
  const [useSameForWhatsapp, setUseSameForWhatsapp] = useState(true);
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappIsdCode, setWhatsappIsdCode] = useState('+91');
  const [whatsappOtp, setWhatsappOtp] = useState('');
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  const styles = createStyles(colors, isDark);

  const handleVerifyMobile = async () => {
    setLoading(true);
    try {
      setMobileVerified(true);
    } catch (error) {
      console.error('Mobile verification failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsappOtp = async () => {
    setLoading(true);
    try {
    } catch (error) {
      console.error('WhatsApp OTP send failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // OTP sent successfully
    } catch (error) {
      console.error('Email OTP send failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.goBack();
  };

  const handleContinue = () => {
    // Save data to Redux store
    dispatch(
      setState({
        mobileNumber,
        isdCode,
        email,
        whatsappNumber: useSameForWhatsapp ? mobileNumber : whatsappNumber,
        whatsappIsdCode: useSameForWhatsapp ? isdCode : whatsappIsdCode,
        mobileVerified,
        whatsappVerified: useSameForWhatsapp
          ? mobileVerified
          : whatsappVerified,
        emailVerified,
      }),
    );

    navigation.navigate('MemberDetails');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >


      <Header title={" Member Onboarding"} />
      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Number Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contact Number
          </Text>
          <View style={styles.sectionDivider} />

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

          {/* Use same for WhatsApp checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setUseSameForWhatsapp(!useSameForWhatsapp)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: useSameForWhatsapp
                    ? colors.primary
                    : colors.surface,
                  borderColor: colors.primary,
                },
              ]}
            >
              {useSameForWhatsapp && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>
              Use this number for whatsapp as well
            </Text>
          </TouchableOpacity>

          {/* Mobile OTP Section */}
          {
            <View style={styles.otpSection}>
              <OtpInput
                numberOfDigits={6}
                onTextChange={setMobileOtp}
                focusColor={colors.primary}
                focusStickBlinkingDuration={500}
                textInputProps={{
                  accessibilityLabel: 'One-Time Password',
                }}
                theme={{
                  containerStyle: styles.otpContainer,
                  pinCodeContainerStyle: styles.otpBox,
                  pinCodeTextStyle: styles.otpText,
                  focusStickStyle: styles.focusStick,
                  focusedPinCodeContainerStyle: styles.activeOtpBox,
                }}
              />
              <Text style={[styles.resendText, { color: colors.primary }]}>
                Resend OTP
              </Text>
              <Button
                text="Verify"
                onPress={handleVerifyMobile}
                buttonStyle={styles.verifyButton}
                disabled={mobileOtp.length !== 5 || loading}
              />
            </View>
          }
        </View>

        {/* WhatsApp Number Section */}
        {!useSameForWhatsapp && (
          <View style={styles.section}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Whatsapp Number
            </Text>
            <MobileNumberInputComponent
              mobileNumber={whatsappNumber}
              isdCode={whatsappIsdCode}
              onChangeMobileNumber={setWhatsappNumber}
              onChangeIsdCode={(code, desc) => setWhatsappIsdCode(String(code))}
              isEditable={true}
            />
            <Button
              text="Send OTP"
              onPress={handleSendWhatsappOtp}
              buttonStyle={styles.sendOtpButton}
              disabled={!whatsappNumber || loading}
            />
          </View>
        )}

        {/* Email ID Section */}

        <TextInputComponent
          header="Email ID"
          placeholder="Enter Your Email"
          value={email}
          onChange={value => dispatch(setState({ email: value }))}
          keyboardType="email-address"
        />
        <Button
          text="Send OTP"
          onPress={handleSendEmailOtp}
          buttonStyle={styles.sendOtpButton}
          disabled={!email || loading}
        />
      </KeyboardAwareScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <Button
          text="Skip"
          onPress={handleSkip}
          buttonStyle={[styles.navigationButton, styles.skipButton]}
          textStyle={{ color: colors.primary }}
        />
        <Button
          text="Continue"
          onPress={handleContinue}
          buttonStyle={[styles.navigationButton, styles.continueButton]}
          disabled={loading}
        />
      </View>
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
    section: {
      marginBottom: hp(3),
    },
    sectionTitle: {
      fontSize: hp(2.2),
      fontWeight: '600',
      marginBottom: hp(1),
    },
    sectionDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: hp(2),
    },
    inputContainer: {
      marginBottom: hp(2),
    },
    fieldLabel: {
      fontSize: hp(1.8),
      fontWeight: '500',
      marginBottom: hp(1),
    },
    textInput: {
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: wp(2),
      paddingHorizontal: wp(3),
      height: hp(6),
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(2),
    },
    checkbox: {
      width: wp(5),
      height: wp(5),
      borderWidth: 2,
      borderRadius: wp(1),
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmark: {
      color: 'white',
      fontSize: hp(1.8),
      fontWeight: 'bold',
    },
    checkboxLabel: {
      fontSize: hp(1.6),
      marginLeft: wp(2),
    },
    otpSection: {
      alignItems: 'center',
      marginTop: hp(2),
    },
    otpContainer: {
      marginVertical: hp(2),
    },
    otpBox: {
      width: wp(12),
      height: wp(12),
      borderRadius: wp(2),
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    otpText: {
      fontSize: hp(2),
      color: colors.text,
    },
    focusStick: {
      backgroundColor: colors.primary,
    },
    activeOtpBox: {
      borderColor: colors.primary,
    },
    resendText: {
      fontSize: hp(1.6),
      fontWeight: '600',
      marginBottom: hp(2),
      textDecorationLine: 'underline',
    },
    verifyButton: {
      backgroundColor: colors.primary,
      borderRadius: wp(2),
      paddingVertical: hp(1.5),
      paddingHorizontal: wp(8),
      minWidth: wp(30),
    },
    sendOtpButton: {
      backgroundColor: colors.primary,
      borderRadius: wp(2),
      paddingVertical: hp(1.5),
      marginTop: hp(1),
    },
    bottomNavigation: {
      flexDirection: 'row',
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      gap: wp(4),
    },
    navigationButton: {
      flex: 1,
      paddingVertical: hp(2),
      borderRadius: wp(2),
      alignItems: 'center',
    },
    skipButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    continueButton: {
      backgroundColor: colors.primary,
    },
  });

export default Verification;
