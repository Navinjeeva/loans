import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import KeyboardAwareScrollView from "@src/common/LoanComponents/KeyboardAwareScrollView";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { setState } from "@src/store/customer";
import MobileNumberInputComponent from "@src/common/components/MobileNumberComponent";
import Button from "@src/components/Button";
import { TextInputComponent } from "@src/common";
import { OtpInput } from "react-native-otp-entry";
import Header from "@src/common/LoanComponents/Header";
import { loanInstance } from "@src/services";
import { logErr, logSuccess } from "@src/common/utils/logger";
import TextHeader from "@src/common/LoanComponents/TextHeader";

const Verification = () => {
  const navigation = useNavigation() as any;
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();

  const { mobileNumber, isdCode, email, customerId } = useSelector(
    (state: any) => state.customer
  );

  const [loading, setLoading] = useState(false);
  const [useSameForWhatsapp, setUseSameForWhatsapp] = useState(true);
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappIsdCode, setWhatsappIsdCode] = useState("+1868");
  const [whatsappOtp, setWhatsappOtp] = useState("");
  const [whatsappVerified, setWhatsappVerified] = useState(false);
  const [whatsappOtpSent, setWhatsappOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const styles = createStyles(colors, isDark);

  const handleSendMobileOtp = async () => {
    setLoading(true);
    try {
      const response = await loanInstance.post(
        `/api/v1/loans/customer/otp/generate`,
        {
          customerId: customerId,
          communicationMode: "SMS",
          isdKey: isdCode,
          phoneNumber: mobileNumber,
        }
      );
      setMobileOtpSent(true);
    } catch (error) {
      console.error("Mobile OTP send failed:", error?.response);
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMobile = async () => {
    setLoading(true);
    try {
      const response = await loanInstance.post(
        `api/v1/loans/customer/otp/verify`,
        {
          customerId: customerId,
          otpCode: mobileOtp,
          communicationMode: "SMS",
        }
      );
      logSuccess("Mobile OTP verified successfully");
      setMobileVerified(true);
    } catch (error) {
      console.error("Mobile verification failed:", error?.response);
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsappOtp = async () => {
    setLoading(true);
    try {
      const response = await loanInstance.post(
        `/api/v1/loans/customer/otp/generate`,
        {
          customerId: customerId,
          communicationMode: "WHATSAPP",
          isdKey: useSameForWhatsapp ? isdCode : whatsappIsdCode,
          phoneNumber: useSameForWhatsapp ? mobileNumber : whatsappNumber,
        }
      );
      setWhatsappOtpSent(true);
    } catch (error: any) {
      console.error("WhatsApp OTP send failed:", error?.response);
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWhatsapp = async () => {
    setLoading(true);
    try {
      const response = await loanInstance.post(
        `api/v1/loans/customer/otp/verify`,
        {
          customerId: customerId,
          otpCode: whatsappOtp,
          communicationMode: "WHATSAPP",
        }
      );
      logSuccess("WhatsApp OTP verified successfully");
      setWhatsappVerified(true);
    } catch (error) {
      console.error("WhatsApp verification failed:", error?.response);
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmailOtp = async () => {
    setLoading(true);
    try {
      const response = await loanInstance.post(
        `/api/v1/loans/customer/otp/generate`,
        {
          customerId: customerId,
          communicationMode: "EMAIL",
          email: email,
        }
      );

      setEmailOtpSent(true);
    } catch (error) {
      console.error("Email OTP send failed:", error?.response);
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setLoading(true);
    try {
      const response = await loanInstance.post(
        `api/v1/loans/customer/otp/verify`,
        {
          customerId: customerId,
          otpCode: emailOtp,
          communicationMode: "EMAIL",
        }
      );
      logSuccess("Email OTP verified successfully");
      setEmailVerified(true);
    } catch (error) {
      console.error("Email verification failed:", error?.response);
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate("LoanAdditionalDetails");
  };

  const handleContinue = () => {
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
      })
    );

    navigation.navigate("LoanAdditionalDetails");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header title={" Member Onboarding"} subTitle={""} />
      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TextHeader
          title="Contact Information"
          subtitle="Verify your mobile, WhatsApp, or email with a 6-digit OTP"
        />
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contact Number
          </Text>
          <View style={styles.sectionDivider} />

          <View style={styles.inputContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Mobile Number
            </Text>
            <MobileNumberInputComponent
              mobileNumber={mobileNumber}
              isdCode={isdCode}
              onChangeMobileNumber={(value) =>
                dispatch(setState({ mobileNumber: value }))
              }
              onChangeIsdCode={(code, desc) =>
                dispatch(setState({ isdCode: String(code) }))
              }
              isEditable={false}
            />
          </View>

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

          {!mobileOtpSent ? (
            <Button
              text="Send OTP"
              click={handleSendMobileOtp}
              buttonStyle={styles.sendOtpButton}
              disabled={!mobileNumber || loading}
            />
          ) : !mobileVerified ? (
            <View style={styles.otpSection}>
              <OtpInput
                numberOfDigits={6}
                onTextChange={setMobileOtp}
                focusColor={colors.primary}
                focusStickBlinkingDuration={500}
                textInputProps={{
                  accessibilityLabel: "One-Time Password",
                }}
                theme={{
                  containerStyle: styles.otpContainer,
                  pinCodeContainerStyle: styles.otpBox,
                  pinCodeTextStyle: styles.otpText,
                  focusStickStyle: styles.focusStick,
                  focusedPinCodeContainerStyle: styles.activeOtpBox,
                }}
              />
              <TouchableOpacity
                onPress={handleSendMobileOtp}
                style={styles.resendText}
              >
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
              <Button
                text="Verify"
                click={handleVerifyMobile}
                buttonStyle={styles.verifyButton}
                disabled={mobileOtp.length !== 6 || loading}
              />
            </View>
          ) : (
            <View style={styles.verifiedSection}>
              <Text
                style={[
                  styles.verifiedText,
                  { color: colors.success || "#4CAF50" },
                ]}
              >
                ✓ Mobile Number Verified
              </Text>
            </View>
          )}
        </View>

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
            {!whatsappOtpSent ? (
              <Button
                text="Send OTP"
                click={handleSendWhatsappOtp}
                buttonStyle={styles.sendOtpButton}
                disabled={!whatsappNumber || loading}
              />
            ) : !whatsappVerified ? (
              <View style={styles.otpSection}>
                <OtpInput
                  numberOfDigits={6}
                  onTextChange={setWhatsappOtp}
                  focusColor={colors.primary}
                  focusStickBlinkingDuration={500}
                  textInputProps={{
                    accessibilityLabel: "One-Time Password",
                  }}
                  theme={{
                    containerStyle: styles.otpContainer,
                    pinCodeContainerStyle: styles.otpBox,
                    pinCodeTextStyle: styles.otpText,
                    focusStickStyle: styles.focusStick,
                    focusedPinCodeContainerStyle: styles.activeOtpBox,
                  }}
                />
                <TouchableOpacity
                  onPress={handleSendWhatsappOtp}
                  style={styles.resendText}
                >
                  <Text style={[styles.resendText, { color: colors.primary }]}>
                    Resend OTP
                  </Text>
                </TouchableOpacity>
                <Button
                  text="Verify"
                  click={handleVerifyWhatsapp}
                  buttonStyle={styles.verifyButton}
                  disabled={whatsappOtp.length !== 6 || loading}
                />
              </View>
            ) : (
              <View style={styles.verifiedSection}>
                <Text
                  style={[
                    styles.verifiedText,
                    { color: colors.success || "#4CAF50" },
                  ]}
                >
                  ✓ WhatsApp Number Verified
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <TextInputComponent
            header="Email ID"
            placeholder="Enter Your Email"
            value={email.toLowerCase()}
            onChange={(value) => dispatch(setState({ email: value }))}
            keyboardType="email-address"
            isEditable={false}
          />
          {!emailOtpSent ? (
            <Button
              text="Send OTP"
              click={handleSendEmailOtp}
              buttonStyle={styles.sendOtpButton}
              disabled={!email || loading}
            />
          ) : !emailVerified ? (
            <View style={styles.otpSection}>
              <OtpInput
                numberOfDigits={6}
                onTextChange={setEmailOtp}
                focusColor={colors.primary}
                focusStickBlinkingDuration={500}
                textInputProps={{
                  accessibilityLabel: "One-Time Password",
                }}
                theme={{
                  containerStyle: styles.otpContainer,
                  pinCodeContainerStyle: styles.otpBox,
                  pinCodeTextStyle: styles.otpText,
                  focusStickStyle: styles.focusStick,
                  focusedPinCodeContainerStyle: styles.activeOtpBox,
                }}
              />
              <TouchableOpacity
                onPress={handleSendEmailOtp}
                style={styles.resendText}
              >
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
              <Button
                text="Verify"
                click={handleVerifyEmail}
                buttonStyle={styles.verifyButton}
                disabled={emailOtp.length !== 6 || loading}
              />
            </View>
          ) : (
            <View style={styles.verifiedSection}>
              <Text
                style={[
                  styles.verifiedText,
                  { color: colors.success || "#4CAF50" },
                ]}
              >
                ✓ Email Verified
              </Text>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

      <View style={styles.bottomNavigation}>
        <Button
          text="Skip"
          click={handleSkip}
          buttonStyle={[styles.navigationButton, styles.skipButton]}
          textStyle={{ color: colors.primary }}
        />
        <Button
          text="Continue"
          click={handleContinue}
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
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
    },
    backButton: {
      marginRight: wp(4),
    },
    backIcon: {
      fontSize: hp(3),
      fontWeight: "bold",
    },
    headerContent: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      fontSize: hp(2.8),
      fontWeight: "bold",
    },
    helpButton: {
      marginLeft: wp(4),
    },
    helpIcon: {
      fontSize: hp(2.5),
      fontWeight: "bold",
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
      fontWeight: "600",
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
      fontWeight: "500",
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
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp(2),
    },
    checkbox: {
      width: wp(5),
      height: wp(5),
      borderWidth: 2,
      borderRadius: wp(1),
      alignItems: "center",
      justifyContent: "center",
    },
    checkmark: {
      color: "white",
      fontSize: hp(1.8),
      fontWeight: "bold",
    },
    checkboxLabel: {
      fontSize: hp(1.6),
      marginLeft: wp(2),
    },
    otpSection: {
      alignItems: "center",
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
      fontWeight: "600",
      marginBottom: hp(1),
      textDecorationLine: "underline",
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
      flexDirection: "row",
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      gap: wp(4),
    },
    navigationButton: {
      flex: 1,
      paddingVertical: hp(2),
      borderRadius: wp(2),
      alignItems: "center",
    },
    skipButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    continueButton: {
      backgroundColor: colors.primary,
    },
    verifiedSection: {
      alignItems: "center",
      marginTop: hp(2),
      paddingVertical: hp(1),
    },
    verifiedText: {
      fontSize: hp(1.8),
      fontWeight: "600",
      color: "#4CAF50",
    },
  });

export default Verification;
