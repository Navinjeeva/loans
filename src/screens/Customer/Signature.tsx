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
  const { signatureImage } = useRoute().params as any;
  const styles = createStyles(colors, isDark);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [fetchedImageSign, setFetchedImageSign] = useState(null);
  const [signatureVisible, setSignatureVisible] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const custData = useSelector((state: any) => state.customer);

  const handleContinue = async () => {
    // if (!pin) {
    //   logAlert('Please enter the passcode');
    //   return;
    // }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('customerId', custData.customerId);
      formData.append('loanType', custData.loanPurpose || 'PERSONAL');
      formData.append(
        'requestedAmount',
        custData.loanAmount?.replace(/[₹,]/g, '') || '100000',
      );
      formData.append(
        'tenureMonths',
        Number(parseInt(custData.loanTenure) * 12) || 12,
      );
      // formData.append(
      //   'principalAmount',
      //   custData.principalAmount?.replace(/[₹,]/g, '') || '100000',
      // );
      formData.append('principalAmount', custData.principalAmount || '100000');
      formData.append('totalInterest', custData.totalInterest || '10500');
      // formData.append(
      //   'totalAmountPayable',
      //   custData.totalAmountPayable?.replace(/[₹,]/g, '') || '110500',
      // );
      formData.append(
        'totalAmountPayable',
        custData.totalAmountPayable || '110500',
      );
      formData.append(
        'remarks',
        'Loan application submitted through mobile app',
      );
      // Append all documents from personalDocuments
      let totalDocuments = 0;
      custData.personalDocuments?.forEach(
        (personalDoc: any, docIndex: number) => {
          if (personalDoc?.doc && personalDoc.doc.length > 0) {
            personalDoc.doc.forEach((document: any, imgIndex: number) => {
              console.log(
                `Appending document ${docIndex + 1}_${imgIndex + 1}:`,
                document,
              );
              formData.append('documents', document);
              totalDocuments++;
            });
          }
        },
      );
      console.log(`Total documents appended: ${totalDocuments}`);
      console.log(formData, 'formData');

      // console.log(custData.personalDocuments[0]?.doc[0], 'formData');
      const { data } = await instance.post(
        '/api/v1/loans/application/create',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
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

      <Header
        title="Document Holder Verification"
        subTitle="Complete signature and passcode verification"
      />
      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <View
            style={{
              height: hp(20),
              flex: 1,
              borderColor: '#000',
              borderWidth: 1,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {fetchedImageSign ? (
              <Image
                source={{ uri: fetchedImageSign }}
                style={styles.imagePreview}
              />
            ) : (
              <Text style={styles.uploadText}>{`No Signature\nPresent`}</Text>
            )}
          </View>

          <TouchableOpacity
            onPressIn={() => setSignatureVisible(true)}
            style={{
              flex: 1,
              height: hp(20),
              borderColor: '#000',
              borderWidth: 1,
              borderStyle: 'dashed',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {signatureImage ? (
              <Image
                source={{ uri: signatureImage }}
                style={styles.imagePreview}
              />
            ) : (
              <Text style={styles.uploadText}>{`Click To\nCapture`}</Text>
            )}
          </TouchableOpacity>
        </View>
        <View
          style={{
            paddingHorizontal: wp(4.5),
            position: 'absolute',
            bottom: hp(2),
          }}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Passcode Verification
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            Please enter the 6-digit code to confirm this transaction.
          </Text>

          <OtpInput
            // secureTextEntry={visible}
            numberOfDigits={6}
            focusColor="orange"
            focusStickBlinkingDuration={500}
            onTextChange={text => setPin(text)}
            // onFilled={handleFilled}
            theme={{
              containerStyle: styles.otpContainer,
              inputsContainerStyle: styles.inputsContainer,
              pinCodeContainerStyle: styles.pinCodeContainer,
              pinCodeTextStyle: styles.pinCodeText,
              focusStickStyle: styles.focusStick,
              focusedPinCodeContainerStyle: styles.activePinCodeContainer,
            }}
          />
        </View>
      </KeyboardAwareScrollView>

      <Button
        buttonStyle={{
          marginVertical: hp(3),
        }}
        text="Continue"
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
      paddingTop: hp(5),
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
    },
    headerSubtitle: {
      fontSize: hp(1.6),
      lineHeight: hp(2.2),
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    imagePreview: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
      resizeMode: 'contain',
      backgroundColor: '#000',
    },
    uploadText: {
      color: '#000',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    otpContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    pinCodeContainer: {
      width: wp(10),
      height: hp(5),
      borderWidth: 1,
      borderColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pinCodeText: {
      fontSize: 18,
      color: '#000',
    },
    focusStick: {
      backgroundColor: 'orange',
    },
    activePinCodeContainer: {
      borderColor: 'orange',
    },
    modalTitle: {
      fontSize: hp(2.6),
      marginTop: hp(1),
    },
    modalSubtitle: {
      fontSize: hp(1.8),
      marginTop: hp(1),
      marginBottom: hp(1),
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
