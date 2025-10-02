import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Pressable,
  Image,
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
import { eyeIcons } from '@src/common/assets';
import AdditionalDocuments from './AdditionalDocuments';
import Header from '@src/common/components/Header';

const UploadDoc = () => {
  useHideBottomBar();
  const navigation = useNavigation() as any;
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [clicked, setClicked] = useState(false);

  const dispatch = useDispatch();
  const { extraDocuments } = useSelector((state: any) => state.customer);

  // Use extraDocuments from Redux as the source of truth
  const docs =
    extraDocuments.length > 0 ? extraDocuments : [{ id: 1, name: '', doc: [] }];

  const handleProceed = async () => {
    try {
      setLoading(true);
      navigation.navigate('MemberDetails');
    } catch (error) {
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  const addDocument = () => {
    if (docs?.length < 10)
      dispatch(
        setState({
          extraDocuments: [...docs, { id: docs.length + 1, name: '', doc: [] }],
        }),
      );
  };

  const removeDocument = (index: number) => {
    let updatedDocuments = [...docs];
    updatedDocuments.splice(index, 1);
    dispatch(setState({ extraDocuments: updatedDocuments }));
  };

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

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Loader loading={loading} />

      <Header
        title="Upload Documents"
        subTitle="Submit require document to complete Your loan application"
      />

      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginVertical: hp(2) }}>
          <View>
            {docs.map((item: any, index: number) => (
              <View key={index} style={{ marginVertical: hp(2) }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={[styles.header, { marginBottom: hp(1) }]}>
                    Additional Document {` ${index + 1}`}
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      gap: wp(4),
                    }}
                  >
                    {index !== 0 && (
                      <Pressable
                        onPress={() => removeDocument(index)}
                        style={({ pressed }) => [
                          {
                            opacity: pressed ? 0.5 : 1.0,
                            flexDirection: 'row',
                            alignItems: 'center',
                          },
                        ]}
                      >
                        <Image
                          source={eyeIcons}
                          style={{
                            height: hp(2),
                            width: wp(4),
                          }}
                        />
                        <Text style={{ color: 'red' }}> Remove</Text>
                      </Pressable>
                    )}

                    <Pressable
                      onPress={addDocument}
                      style={({ pressed }) => [
                        {
                          opacity: pressed ? 0.5 : 1.0,
                          flexDirection: 'row',
                          alignItems: 'center',
                        },
                      ]}
                    >
                      {/* <Image source={eyeIcons} /> */}
                      <Text style={{ color: '#E3781C' }}> Add</Text>
                    </Pressable>
                  </View>
                </View>

                <DocumentUpload
                  header="Upload Additional Document"
                  headerDesc=""
                  limit={1}
                  images={item?.doc}
                  details={{
                    'First Name': 'Manikandan',
                    'Last Name': 'Duraisamy',
                    'Date of Birth': '16/07/1986',
                    'PAN Number': 'BNZPM2501F',
                    'Mobile Number': '864-9031',
                  }}
                  setImages={async (images: any) => {
                    setLoading(true);
                    let updatedDocuments = [...docs];

                    if (images.length == 0) {
                      let updatedDocuments = [...docs];
                      updatedDocuments.splice(index, 1);
                      dispatch(setState({ extraDocuments: updatedDocuments }));
                      setLoading(false);
                      return;
                    }

                    try {
                      const response = await idpExtract(images);
                      console.log(response, 'response');
                    } catch (error) {
                      console.log(error, 'error');
                      logErr(error);
                    }

                    // Append new images to existing ones instead of replacing
                    const existingDocs = updatedDocuments[index]?.doc || [];
                    const newDocs = [...existingDocs, ...images];

                    updatedDocuments[index] = {
                      ...updatedDocuments[index],
                      doc: newDocs,
                    };

                    dispatch(
                      setState({ extraDocuments: [...updatedDocuments] }),
                    );
                    setLoading(false);
                  }}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Joint Partner Documents */}
        <AdditionalDocuments
          title="Joint Partner"
          subtitle="Upload Joint Partner Documents"
          storeKey="jointPartnerDocuments"
        />

        {/* Beneficiary Documents */}
        <AdditionalDocuments
          title="Beneficiary"
          subtitle="Upload Beneficiary Documents"
          storeKey="beneficiaryDocuments"
        />

        {/* Linked Identities Documents */}
        <AdditionalDocuments
          title="Linked Identities"
          subtitle="Upload Linked Identities Documents"
          storeKey="linkedIdentitiesDocuments"
        />
      </KeyboardAwareScrollView>

      <Button
        buttonStyle={{
          marginVertical: hp(3),
        }}
        text="Continue"
        onPress={handleProceed}
      />
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

export default UploadDoc;
