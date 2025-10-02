import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import KeyboardAwareScrollView from '@src/common/components/KeyboardAwareScrollView';
import React, { useState } from 'react';
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
import Header from '@src/common/components/Header';
import Loader from '@src/common/components/Loader';
import { idpInstance, instance } from '@src/services';
import { logAlert, logErr } from '@src/common/utils/logger';
import axios from 'axios';
import { idpExtract } from '@src/common/utils/idp';
import TextInputComponent from '@src/common/components/TextInputComponent';
import MobileNumberInputComponent from '@src/common/components/MobileNumberComponent';
import { useDispatch, useSelector } from 'react-redux';
import { setState } from '@src/store/customer';
import { OtpInput } from 'react-native-otp-entry';

const KycProcess = () => {
  useHideBottomBar();
  const navigation = useNavigation() as any;
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const inputRef = React.useRef<TextInput>(null);
  const dispatch = useDispatch();
  const custData = useSelector((state: any) => state.customer);

  const handleVerify = async () => {
    try {
      setLoading(true);
      setShowModel(true);

      const response = await instance.post(
        `api/v1/loans/customer/otp?customerId=${''}`,
      );
    } catch (error) {
      logErr(error);
    } finally {
      setLoading(false);
    }
  };
  const handleProceed = async () => {
    try {
      setLoading(true);
    } catch (error) {
      logErr(error);
    } finally {
      setLoading(false);
    }
  };
  const handleDone = async () => {
    try {
      setLoading(true);
      const response = await instance.post(
        `api/v1/loans/customer/otp/verify?customerId=${''}&otpCode=${pin}`,
      );
    } catch (error) {
      logErr(error);
    } finally {
      setLoading(false);
      setShowModel(false);
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Loader loading={loading} />

      <Header
        title="Digital KYC Process"
        subTitle="Documents For New Customer"
      />

      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DocumentUpload
          header="Aadhaar Card"
          limit={1}
          images={custData.aadhaarCard}
          setImages={async (image: any) => {
            try {
              setLoading(true);

              if (image.length == 0) {
                dispatch(
                  setState({
                    aadhaarCard: [],
                  }),
                );
              }

              let updatedDocuments = [];
              const documentName = 'PROFF' + image[0]?.type.split('/')[1];

              updatedDocuments = [
                {
                  name: documentName,
                  uri: image[0].uri,
                  type: image[0].type,
                },
              ];

              //const response = await idpExtract(image);
              dispatch(
                setState({
                  aadhaarCard: updatedDocuments,
                }),
              );

              //console.log(response, 'ib9hui');
            } catch (error) {
              const err: any = error;
              console.log(err?.response);
              logErr(err);
            } finally {
              setLoading(false);
            }
          }}
        />

        <Button
          text="Verify"
          buttonStyle={{
            marginVertical: hp(3),
          }}
          onPress={handleVerify}
        />
        <DocumentUpload
          header="Pan Card"
          limit={1}
          images={custData.panCard}
          setImages={async (image: any) => {
            try {
              setLoading(true);

              if (image.length == 0) {
                dispatch(
                  setState({
                    panCard: [],
                  }),
                );
              }

              let updatedDocuments = [];
              const documentName = 'PROOF' + image[0]?.type.split('/')[1];

              updatedDocuments = [
                {
                  name: documentName,
                  uri: image[0].uri,
                  type: image[0].type,
                },
              ];

              //const response = await idpExtract(image);
              dispatch(
                setState({
                  panCard: updatedDocuments,
                }),
              );

              //console.log(response, 'ib9hui');
            } catch (error) {
              const err: any = error;
              console.log(err?.response);
              logErr(err);
            } finally {
              setLoading(false);
            }
          }}
        />
      </KeyboardAwareScrollView>

      <Button
        buttonStyle={{
          marginVertical: hp(3),
        }}
        text="Continue"
        onPress={handleProceed}
      />

      <Modal visible={showModel} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              onPress={() => setShowModel(false)}
              style={styles.modalClose}
            >
              <Text style={{ fontSize: hp(3) }}>×</Text>
            </TouchableOpacity>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Enter Your Aadhaar OTP
            </Text>
            <Text
              style={[styles.modalSubtitle, { color: colors.textSecondary }]}
            >
              We’ve sent it to *****392
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

            <TouchableOpacity
              onPress={() => {
                /* hook up resend here */
              }}
            >
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>

            <Button
              text="Done"
              onPress={handleDone}
              buttonStyle={styles.doneButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
    uploadSection: {
      marginTop: hp(3),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(2),
    },
    iconContainer: {
      width: wp(8),
      height: wp(8),
      borderRadius: wp(4),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
    },
    cardIcon: {
      fontSize: hp(2),
    },
    sectionTitle: {
      fontSize: hp(2.2),
      fontWeight: '600',
    },
    fieldLabel: {
      fontSize: hp(1.8),
      fontWeight: '500',
      marginBottom: hp(1),
    },
    infoCard: {
      borderRadius: 12,
      borderWidth: 1,
      padding: wp(4),
      marginTop: hp(2),
      marginBottom: hp(3),
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(1.5),
    },
    warningIcon: {
      fontSize: hp(2),
      marginRight: wp(2),
    },
    infoTitle: {
      fontSize: hp(1.8),
      fontWeight: '600',
    },
    infoList: {
      gap: hp(1),
    },
    bottomContainer: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
    },
    proceedButton: {
      borderRadius: 12,
      paddingVertical: hp(2),
      alignItems: 'center',
    },
    proceedButtonText: {
      color: 'white',
      fontSize: hp(2),
      fontWeight: '600',
    },
    // Modal styles
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: wp(6),
    },
    modalCard: {
      width: '100%',
      borderRadius: 20,
      paddingVertical: hp(3),
      paddingHorizontal: wp(5),
    },
    modalClose: {
      position: 'absolute',
      right: wp(4),
      top: hp(1.5),
      zIndex: 1,
    },
    modalTitle: {
      textAlign: 'center',
      fontSize: hp(2.6),
      fontWeight: '700',
      marginTop: hp(1),
    },
    modalSubtitle: {
      textAlign: 'center',
      fontSize: hp(1.8),
      marginTop: hp(1),
      marginBottom: hp(2),
    },
    otpBoxesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginVertical: hp(1),
    },
    otpBox: {
      width: wp(12),
      height: wp(12),
      borderRadius: 12,
      backgroundColor: 'rgba(0,0,0,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: '#000000',
      borderWidth: hp(0.05),
    },
    otpDigit: {
      fontSize: hp(2.4),
      fontWeight: '600',
    },
    hiddenOtpInput: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1,
    },
    resendText: {
      textAlign: 'center',
      color: '#3B45AC',
      fontWeight: '600',
      marginTop: hp(1.5),
      marginBottom: hp(2.5),
    },
    doneButton: {
      borderRadius: 14,
      paddingVertical: hp(1.8),
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
  });

export default KycProcess;
