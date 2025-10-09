import { useNavigation } from '@react-navigation/native';
import Loader from '@src/common/components/Loader';
import Stepper from '@src/common/components/Stepper';
import KeyboardAwareScrollView from '@src/common/components/KeyboardAwareScrollView';
import { useTheme } from '@src/common/utils/ThemeContext';
import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import PersonalDoc from './PersonalDoc';
import LoanDoc from './LoanDoc';
import Button from '@src/common/components/Button';
import { logAlert, logErr, logSuccess } from '@src/common/utils/logger';
import { authInstance, instance } from '@src/services';
import { useDispatch, useSelector } from 'react-redux';
import { setState } from '@src/store/customer';
import Header from '@src/common/components/Header';
import PersonalDocumentModal from '@src/common/components/PersonalDocumentModal';
import LoanDocumentModal from '@src/common/components/LoanDocumentModal';
import LinkedEntities from './LinkedEntities';
import axios from 'axios';

const Application = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const dispatch = useDispatch();

  const styles = createStyles(colors, isDark);
  const custData = useSelector((state: any) => state.customer);

  const {
    idpFirstName,
    idpLastName,
    idpDateOfBirth,
    mobileNumber,
    email,
    idpGender,
    idpAddress,
  } = custData;

  const handleHelpPress = () => {
    if (currentStep === 0) {
      setShowPersonalModal(true);
    } else if (currentStep === 1) {
      setShowLoanModal(true);
    }
  };

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       await getDocuments();
  //     } catch (error) {
  //       console.log(error, 'error');
  //       logErr(error);
  //     }
  //   })();
  // }, []);

  const uploadPersonalDocuments = async () => {
    try {
      const uploadPromises: Promise<any>[] = [];

      // Iterate through each personalDoc
      custData.personalDocuments?.forEach(
        (personalDoc: any, docIndex: number) => {
          if (personalDoc?.doc && personalDoc.doc.length > 0) {
            // Upload each document in the doc array separately (skip last empty document)

            personalDoc.doc.forEach((document: any, imgIndex: number) => {
              const formData = new FormData();

              // Append required fields
              formData.append('customerId', 'CUST2025100819198216');
              formData.append('documentCategory', 'PERSONAL');
              formData.append('file', {
                uri: document.uri,
                type: document.type || 'image/jpeg',
                name:
                  //document.fileName ||
                  //document.name ||
                  `PERSONAL-DOCUMENT-${docIndex + 1}.${
                    document.type?.split('/')[1]
                  }`,
              } as any);

              // Append metadata if available
              if (
                personalDoc.details &&
                Object.keys(personalDoc.details).length > 0
              ) {
                formData.append(
                  'metadata',
                  JSON.stringify(personalDoc.details),
                );
              }
              console.log(formData, 'formData');

              console.log(
                `Uploading document ${docIndex + 1}_${imgIndex + 1}:`,
                document.fileName || document.name,
              );

              // Push the upload promise to array
              const uploadPromise = axios.post(
                'http://192.168.86.30:8083/api/v1/documents/upload-single',
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                },
              );
              uploadPromises.push(uploadPromise);
            });
          }
        },
      );

      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        const results = await Promise.all(uploadPromises);
        console.log('All documents uploaded successfully:', results.length);
        logSuccess(`${results.length} document(s) uploaded successfully`);
        return true;
      } else {
        logAlert('No documents to upload');
        return false;
      }
      return true;
    } catch (error: any) {
      console.log('Error uploading documents:', error?.response);
      logErr(error);
      //return false;
      throw error;
    }
  };

  const uploadLoanDocuments = async () => {
    try {
      const uploadPromises: Promise<any>[] = [];

      // Iterate through each personalDoc
      custData.loanDocuments?.forEach((loanDoc: any, docIndex: number) => {
        if (loanDoc?.doc && loanDoc.doc.length > 0) {
          // Upload each document in the doc array separately (skip last empty document)

          loanDoc.doc.forEach((document: any, imgIndex: number) => {
            const formData = new FormData();

            // Append required fields
            formData.append('customerId', 'CUST2025100819198216');
            formData.append('documentCategory', 'LOAN_APPLICATION');
            formData.append('file', {
              uri: document.uri,
              type: document.type || 'image/jpeg',
              name:
                //document.fileName ||
                //document.name ||
                `LOAN-DOCUMENT-${docIndex + 1}.${document.type?.split('/')[1]}`,
            } as any);

            // Append metadata if available
            if (loanDoc.details && Object.keys(loanDoc.details).length > 0) {
              formData.append('metadata', JSON.stringify(loanDoc.details));
            }
            console.log(formData, 'formData');

            console.log(
              `Uploading document ${docIndex + 1}_${imgIndex + 1}:`,
              document.fileName || document.name,
            );

            // Push the upload promise to array
            const uploadPromise = axios.post(
              'http://192.168.86.30:8083/api/v1/documents/upload-single',
              formData,
              {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              },
            );
            uploadPromises.push(uploadPromise);
          });
        }
      });

      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        const results = await Promise.all(uploadPromises);
        console.log('All documents uploaded successfully:', results.length);
        logSuccess(`${results.length} document(s) uploaded successfully`);
        return true;
      } else {
        logAlert('No documents to upload');
        return false;
      }
      return true;
    } catch (error: any) {
      console.log('Error uploading documents:', error?.response);
      logErr(error);
      //return false;
      throw error;
    }
  };

  const uploadEntitiesDocuments = async () => {
    try {
      const uploadPromises: Promise<any>[] = [];

      // Iterate through each personalDoc
      custData.linkedEntitiesDocuments?.forEach(
        (loanDoc: any, docIndex: number) => {
          if (loanDoc?.doc && loanDoc.doc.length > 0) {
            // Upload each document in the doc array separately (skip last empty document)

            loanDoc.doc.forEach((document: any, imgIndex: number) => {
              const formData = new FormData();

              // Append required fields
              formData.append('customerId', 'CUST2025100819198216');
              formData.append('documentCategory', 'LINKED_CUSTOMER');
              formData.append('file', {
                uri: document.uri,
                type: document.type || 'image/jpeg',
                name:
                  //document.fileName ||
                  //document.name ||
                  `LINKED-DOCUMENT-${docIndex + 1}.${
                    document.type?.split('/')[1]
                  }`,
              } as any);

              // Append metadata if available
              if (loanDoc.details && Object.keys(loanDoc.details).length > 0) {
                formData.append('metadata', JSON.stringify(loanDoc.details));
              }
              console.log(formData, 'formData');

              console.log(
                `Uploading document ${docIndex + 1}_${imgIndex + 1}:`,
                document.fileName || document.name,
              );

              // Push the upload promise to array
              const uploadPromise = axios.post(
                'http://192.168.86.30:8083/api/v1/documents/upload-single',
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                },
              );
              uploadPromises.push(uploadPromise);
            });
          }
        },
      );

      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        const results = await Promise.all(uploadPromises);
        console.log('All documents uploaded successfully:', results.length);
        logSuccess(`${results.length} document(s) uploaded successfully`);
        return true;
      } else {
        logAlert('No documents to upload');
        return false;
      }
      return true;
    } catch (error: any) {
      console.log('Error uploading documents:', error?.response);
      logErr(error);
      //return false;
      throw error;
    }
  };

  const handleContinue = async () => {
    try {
      if (currentStep === 0) {
        setLoading(true);

        // Upload all personal documents separately
        try {
          await uploadPersonalDocuments();
        } catch (error) {
          console.log('Failed to upload documents:', error);
          setLoading(false);
          return;
        }

        setLoading(false);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        await uploadEntitiesDocuments();
        setCurrentStep(2);
      } else if (currentStep === 2) {
        if (!isConfirmed) {
          logAlert('Please confirm the documents');
          return;
        }

        setLoading(true);
        await uploadLoanDocuments();
        console.log({
          firstName: idpFirstName,
          lastName: idpLastName,
          dateOfBirth: idpDateOfBirth,
          mobileNumber: mobileNumber,
          email: email,
          gender: idpGender,
          address: idpAddress,
        });

        const { data: customerData } = await instance.post(
          '/api/v1/loans/customer/create',
          {
            firstName: idpFirstName,
            lastName: idpLastName,
            dateOfBirth: idpDateOfBirth,
            mobileNumber: mobileNumber,
            email: email,
            gender: idpGender,
            address: idpAddress,
          },
        );

        console.log(customerData, 'data');
        const result = customerData?.responseStructure?.data;
        if (customerData?.status == 201) {
          dispatch(
            setState({
              isMember: result?.existingCustomer,
              customerId: result?.customerId,
              firstName: result?.firstName,
              lastName: result?.lastName,
              dateOfBirth: result?.dateOfBirth,
              gender: result?.gender,
              address: result?.address,
              email: result?.email,
            }),
          );

          logSuccess('Customer created successfully');
          navigation.navigate('Verification');
        } else {
          dispatch(
            setState({
              isMember: result?.existingCustomer,
              customerId: result?.customerId,
              firstName: result?.firstName,
              lastName: result?.lastName,
              dateOfBirth: result?.dateOfBirth,
              gender: result?.gender,
              address: result?.address,
              email: result?.email,
            }),
          );

          navigation.navigate('MemberDetails');
        }
      }
    } catch (error: any) {
      console.log(error, 'error');
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

      <Header title={'Upload Documents'} onHelpPress={handleHelpPress} />
      <Stepper
        steps={['Personal Documents', 'Linked Entities', 'Loan Documents']}
        onClick={(index: number) => {
          setCurrentStep(index);
        }}
        currentStep={currentStep}
      />
      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 0 && <PersonalDoc setLoading={setLoading} />}
        {currentStep === 1 && <LinkedEntities setLoading={setLoading} />}
        {currentStep === 2 && <LoanDoc setLoading={setLoading} />}
      </KeyboardAwareScrollView>
      {currentStep === 2 && (
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsConfirmed(!isConfirmed)}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: isConfirmed ? colors.primary : colors.surface,
                borderColor: colors.primary,
              },
            ]}
          >
            {isConfirmed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>
            I confirm all the above documents are correct and authorise the bank
            to proceed.
          </Text>
        </TouchableOpacity>
      )}
      <Button
        buttonStyle={{
          marginVertical: hp(3),
        }}
        text="Continue"
        onPress={handleContinue}
      />

      {/* Modals */}
      <PersonalDocumentModal
        visible={showPersonalModal}
        onClose={() => setShowPersonalModal(false)}
      />
      <LoanDocumentModal
        visible={showLoanModal}
        onClose={() => setShowLoanModal(false)}
      />
    </SafeAreaView>
  );
};

export default Application;

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
    text: {
      color: '#585858',
      fontSize: hp(1.2),
    },
    Imagecontainer: {
      borderRadius: hp(0.4),
      backgroundColor: '#E4E4E4',
      alignItems: 'center',
      justifyContent: 'center',
      height: hp(30),
      padding: hp(1),
      shadowColor: '#000',
      overflow: 'hidden',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 8,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: hp(3) - hp(2),
      objectFit: 'contain',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: wp(4),
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
  });
