import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '@src/common/components/Button';
import Loader from '@src/common/components/Loader';
import KeyboardAwareScrollView from '@src/common/components/KeyboardAwareScrollView';
import { useTheme } from '@src/common/utils/ThemeContext';
import { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import SignatureScreen from 'react-native-signature-canvas';
import Header from '@src/common/components/Header';
import { useSelector } from 'react-redux';
import { logAlert, logErr } from '@src/common/utils/logger';
import { instance } from '@src/services';

const Signature = () => {
  const { colors, isDark } = useTheme();
  const { signatureImage, memberPicture } = useRoute().params as any;
  const styles = createStyles(colors, isDark);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [fetchedImageSign, setFetchedImageSign] = useState(null);
  const [fetchedImagePicture, setFetchedImagePicture] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [signatureVisible, setSignatureVisible] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const custData = useSelector((state: any) => state.customer);

  const handleContinue = async () => {
    if (!pin || pin.length !== 6) {
      return logAlert('Please enter the passcode');
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('customerId', custData.customerId);

      // Append all documents from personalDocuments
      // let totalDocuments = 0;
      // custData.personalDocuments?.forEach(
      //   (personalDoc: any, docIndex: number) => {
      //     if (personalDoc?.doc && personalDoc.doc.length > 0) {
      //       personalDoc.doc.forEach((document: any, imgIndex: number) => {
      //         console.log(
      //           `Appending document ${docIndex + 1}_${imgIndex + 1}:`,
      //           document,
      //         );
      //         formData.append('documents', document);
      //         totalDocuments++;
      //       });
      //     }
      //   },
      // );
      // console.log(`Total documents appended: ${totalDocuments}`);
      // console.log(formData, 'formData');

      const request = {
        customerId: custData.customerId,
        loanType: custData.loanPurpose,
        requestedAmount: custData.loanAmount?.replace(/[₹,]/g, '') || '100000',
        tenureMonths: Number(parseInt(custData.loanTenure) * 12) || 12,
        principalAmount: custData.principalAmount,
        totalInterest: custData.totalInterest,
        totalAmountPayable: custData.totalAmountPayable,
        remarks: 'Loan application submitted through mobile app',
        beneficiaries: custData.selectedBeneficiaries,
        jointPartners: custData.selectedJointPartner,
      };

      // console.log(custData.personalDocuments[0]?.doc[0], 'formData');
      const { data } = await instance.post(
        '/api/v1/loans/application/create',
        request,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log(data, 'data');
    } catch (error) {
      logErr(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Loader loading={loading} />

      <Header title="Member Verification" showBackButton={true} />
      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Member Signature Section */}
        <View style={styles.verificationSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Member Signature
          </Text>

          <View style={styles.cardsContainer}>
            {/* Specimen Signature Card */}

            {custData.isMember && (
              <View style={[styles.card, { borderColor: '#FF9800' }]}>
                <View
                  style={[
                    styles.imageContainer,
                    { backgroundColor: '#FFF3E0' },
                  ]}
                >
                  {fetchedImageSign ? (
                    <Image
                      source={{ uri: fetchedImageSign }}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text
                      style={[
                        styles.placeholderText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      No Signature Present
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Current Capture Card */}
            <TouchableOpacity
              onPressIn={() => setSignatureVisible(true)}
              style={[styles.card, { borderColor: '#4CAF50' }]}
            >
              <View
                style={[styles.imageContainer, { backgroundColor: '#E8F5E8' }]}
              >
                {signatureImage ? (
                  <Image
                    source={{ uri: signatureImage }}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text
                    style={[
                      styles.placeholderText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Click To Capture
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Signature Confidence Level */}
          {custData.isMember && (
            <Text style={[styles.confidenceLevel, { color: '#4CAF50' }]}>
              Signature Confidence level 100%
            </Text>
          )}
        </View>

        {/* Member Picture Section */}
        <View style={styles.verificationSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Member Picture
          </Text>

          <View style={styles.cardsContainer}>
            {/* Existing Record Card */}
            {custData.isMember && (
              <View style={[styles.card, { borderColor: '#FF9800' }]}>
                <View
                  style={[
                    styles.imageContainer,
                    { backgroundColor: '#FFF3E0' },
                  ]}
                >
                  {fetchedImagePicture ? (
                    <Image
                      source={{ uri: fetchedImagePicture }}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text
                      style={[
                        styles.placeholderText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      No Picture Present
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Current Capture Card */}
            <View style={[styles.card, { borderColor: '#4CAF50' }]}>
              <View
                style={[styles.imageContainer, { backgroundColor: '#E8F5E8' }]}
              >
                {memberPicture ? (
                  <Image
                    source={{ uri: memberPicture }}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text
                    style={[
                      styles.placeholderText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Click To Capture
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Picture Confidence Level */}
          {custData.isMember && (
            <Text style={[styles.confidenceLevel, { color: '#4CAF50' }]}>
              Picture Confidence level 99%
            </Text>
          )}
        </View>

        {/* Passcode Verification Section */}
        <View style={styles.passcodeSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Passcode Verification
          </Text>

          <Text
            style={[styles.instructionText, { color: colors.textSecondary }]}
          >
            Please enter the 6-digit code to confirm this transaction.
          </Text>

          <View style={styles.otpContainer}>
            <OtpInput
              numberOfDigits={6}
              focusColor="#9C27B0"
              focusStickBlinkingDuration={500}
              onTextChange={text => setPin(text)}
              theme={{
                containerStyle: styles.otpWrapper,
                inputsContainerStyle: styles.inputsContainer,
                pinCodeContainerStyle: styles.pinCodeContainer,
                pinCodeTextStyle: styles.pinCodeText,
                focusStickStyle: styles.focusStick,
                focusedPinCodeContainerStyle: styles.activePinCodeContainer,
              }}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <Button
        buttonStyle={[styles.verifyButton, { backgroundColor: '#9C27B0' }]}
        text="Verify"
        textStyle={styles.verifyButtonText}
        onPress={handleContinue}
      />
    </SafeAreaView>
  );
};

export default Signature;

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: hp(5),
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    verificationSection: {
      marginBottom: hp(3),
    },
    sectionTitle: {
      fontSize: hp(2.2),
      fontWeight: '600',
      marginBottom: hp(2),
    },
    cardsContainer: {
      flexDirection: 'row',
      gap: wp(4),
      marginBottom: hp(1.5),
    },
    card: {
      flex: 1,
      borderWidth: 1,
      borderRadius: wp(2),
      padding: wp(3),
      alignItems: 'center',
    },
    imageContainer: {
      width: '100%',
      height: hp(15),
      borderRadius: wp(1.5),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: hp(1),
    },
    cardImage: {
      width: '100%',
      height: '100%',
      borderRadius: wp(1.5),
    },
    placeholderText: {
      fontSize: hp(1.6),
      textAlign: 'center',
    },
    confidenceLevel: {
      fontSize: hp(1.8),
      fontWeight: '600',
      textAlign: 'center',
    },
    passcodeSection: {
      marginBottom: hp(3),
    },
    instructionText: {
      fontSize: hp(1.8),
      marginBottom: hp(3),
      textAlign: 'center',
      lineHeight: hp(2.4),
    },
    otpContainer: {
      alignItems: 'center',
      marginBottom: hp(2),
    },
    otpWrapper: {
      alignItems: 'center',
    },
    inputsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: wp(2),
    },
    pinCodeContainer: {
      width: wp(12),
      height: hp(6),
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: wp(1),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5F5F5',
    },
    pinCodeText: {
      fontSize: hp(2.4),
      fontWeight: '600',
      color: colors.text,
    },
    focusStick: {
      backgroundColor: '#9C27B0',
      width: wp(2),
    },
    activePinCodeContainer: {
      borderColor: '#9C27B0',
      backgroundColor: '#FFFFFF',
    },
    verifyButton: {
      marginHorizontal: wp(4),
      marginVertical: hp(2),
      borderRadius: wp(2),
      paddingVertical: hp(2),
    },
    verifyButtonText: {
      color: '#FFFFFF',
      fontSize: hp(2.2),
      fontWeight: '600',
    },
    signatureHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      backgroundColor: '#000',
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    closeSignatureButton: {
      padding: wp(2),
    },
    closeSignatureText: {
      color: '#fff',
      fontSize: hp(2.5),
      fontWeight: 'bold',
    },
    signatureTitle: {
      color: '#fff',
      fontSize: hp(2.2),
      fontWeight: '600',
      flex: 1,
      textAlign: 'center',
      marginRight: wp(10), // Compensate for close button width
    },
  });
