import { SafeAreaView, StyleSheet, View } from 'react-native';
import Header from '@src/common/components/Header';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '@src/common/components/Loader';
import { useEffect, useState } from 'react';
import { useTheme } from '@src/common/utils/ThemeContext';
import KeyboardAwareScrollView from '@src/common/components/KeyboardAwareScrollView';
import TextInputComponent from '@src/common/components/TextInputComponent';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useIsFocused } from '@react-navigation/native';
import { logErr } from '@src/common/utils/logger';
import { instance } from '@src/services';
import Button from '@src/common/components/Button';
import { useNavigation } from '@react-navigation/native';
import DropdownWithModal from '@src/common/components/DropdownWithModal';
import DocumentUpload from '@src/common/components/DocumentUpload';
import { setState } from '@src/store/customer';
import { idpExtract } from '@src/common/utils/idp';
import TextHeader from '@src/common/components/TextHeader';

const AddBeneficiary = () => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const custData = useSelector((state: any) => state.customer);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [beneficiaryOptions, setBeneficiaryOptions] = useState<any[]>([]);
  const [jointPartnerOptions, setJointPartnerOptions] = useState<any[]>([]);

  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('');
  const [selectedBeneficiaryName, setSelectedBeneficiaryName] = useState('');
  const [selectedJointPartnerId, setSelectedJointPartnerId] = useState('');
  const [selectedJointPartnerName, setSelectedJointPartnerName] = useState('');
  const [showBeneficiaryDocuments, setShowBeneficiaryDocuments] =
    useState(false);
  const [showJointPartnerDocuments, setShowJointPartnerDocuments] =
    useState(false);

  const { additionalBeneficiary, additionalJointPartner } = useSelector(
    (state: any) => state.customer,
  );

  const beneficiaryDocuments =
    additionalBeneficiary.length > 0
      ? additionalBeneficiary
      : [{ id: 1, name: 'Beneficiary Document', doc: [], details: {} }];
  const jointPartnerDocuments =
    additionalJointPartner.length > 0
      ? additionalJointPartner
      : [{ id: 1, name: 'Joint Partner Document', doc: [], details: {} }];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const [beneficiaries, jointPartners]: any = await Promise.all([
          instance.get(
            `api/v1/loans/customer/linked-customers?customerId=${custData.customerId}`,
          ),
          instance.get(
            `api/v1/loans/customer/linked-customers?customerId=${custData.customerId}`,
          ),
        ]);
        const beneficiaryData =
          beneficiaries?.data?.responseStructure?.data ?? [];
        const jointPartnerData =
          jointPartners?.data?.responseStructure?.data ?? [];

        setBeneficiaryOptions(
          beneficiaryData.map((item: any) => ({
            label: String(item?.fullName ?? '').trim(),
            value: String(item?.linkedCustomerId ?? ''),
          })),
        );
        setJointPartnerOptions(
          jointPartnerData.map((item: any) => ({
            label: String(item?.fullName ?? '').trim(),
            value: String(item?.linkedCustomerId ?? ''),
          })),
        );
      } catch (error) {
        console.log(error, 'error');
        logErr(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [isFocused]);

  const handleContinue = async () => {
    // try {
    //   setLoading(true);
    //   const { data } = await instance.post(
    //     'api/v1/loans/customer/linked-entity',
    //     {
    //       customerId: custData.customerId,
    //       beneficiaries: {
    //         firstName:
    //           additionalBeneficiary[0]?.details?.name.split(' ')[0] ||
    //           additionalBeneficiary[0]?.details?.firstName,
    //         lastName:
    //           additionalBeneficiary[0]?.details?.name.split(' ')[1] ||
    //           additionalBeneficiary[0]?.details?.lastName,
    //         dateOfBirth: custData.dateOfBirth,
    //         emailId: custData.email,
    //         mobileNumber: custData.mobileNumber,
    //       },
    //       jointPartners: {
    //         firstName:
    //           additionalJointPartner[0]?.details?.name.split(' ')[0] ||
    //           additionalJointPartner[0]?.details?.firstName ||
    //           selectedJointPartnerName.split(' ')[0],
    //         lastName: selectedJointPartnerName.split(' ')[1] || '',
    //         dateOfBirth: custData.dateOfBirth,
    //         emailId: custData.email,
    //         mobileNumber: custData.mobileNumber,
    //       },
    //     },
    //   );
    // } catch (error) {
    //   console.log(error, 'error');
    //   logErr(error);
    // } finally {
    //   setLoading(false);
    // }

    (navigation as any).navigate('Pep');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Loader loading={loading} />
      <Header title="Add Beneficiary" subTitle="" />
      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <TextHeader
            title="Beneficiary & Joint Details"
            subtitle="Provide beneficiary and joint partner details"
          />
          <DropdownWithModal
            header="Beneficiary"
            options={beneficiaryOptions}
            value={selectedBeneficiaryName}
            passIdAndDesc
            setValue={(id: string, desc?: string) => {
              setSelectedBeneficiaryId(String(id ?? ''));
              setSelectedBeneficiaryName(String(desc ?? ''));
            }}
            label="Beneficiary"
            placeholder="Select Beneficiary"
          />
          <Button
            buttonStyle={{
              marginVertical: hp(3),
            }}
            text="Upload beneficiary documents"
            onPress={() => setShowBeneficiaryDocuments(true)}
          />
          {showBeneficiaryDocuments &&
            beneficiaryDocuments.map((item: any, index: number) => (
              <DocumentUpload
                header="Upload Additional Document"
                headerDesc=""
                limit={2}
                images={item?.doc}
                details={item?.details || {}}
                setImages={async (images: any) => {
                  let updatedDocuments = [...additionalBeneficiary];

                  if (images.length == 0) {
                    updatedDocuments.splice(index, 1);
                    dispatch(
                      setState({ additionalBeneficiary: updatedDocuments }),
                    );
                    return;
                  }

                  // Process images to set proper document names
                  console.log('Original images:', images);

                  const existingDocs = updatedDocuments[index]?.doc || [];
                  const newDocs = [...existingDocs, ...images];

                  updatedDocuments[index] = {
                    ...updatedDocuments[index],
                    doc: newDocs,
                    details: updatedDocuments[index]?.details || {},
                  };

                  dispatch(
                    setState({
                      additionalBeneficiary: [...updatedDocuments],
                    }),
                  );

                  try {
                    setLoading(true);
                    const response: any = await idpExtract(images);
                    console.log(response, 'response');

                    // Determine document type based on IDP response and update document names
                    let documentType = 'AadhaarCard'; // default

                    if (
                      response?.['Card Type'] ==
                        'National Identification Card' ||
                      response?.['NATIONAL IDENTIFICATION CARD']
                    ) {
                      documentType = 'NationalId';
                    } else if (response?.license_number) {
                      documentType = 'DriversPermit';
                    } else if (
                      response?.['Card Type'] == 'Driving License' ||
                      response?.driver_license_number
                    ) {
                      documentType = 'DriversPermit';
                    } else if (response?.['Card Type'] == 'Voter ID') {
                      documentType = 'VoterID';
                    } else if (
                      response?.pancard_number ||
                      response?.card_type == 'Permanent Account Number Card' ||
                      response?.panc_number
                    ) {
                      documentType = 'PanCard';
                    } else if (
                      response?.aadhaar_number ||
                      response?.aadhar_number
                    ) {
                      documentType = 'AadhaarCard';
                    } else if (
                      response?.pancard_number ||
                      response?.pan_number ||
                      response?.pan_card_number
                    ) {
                      documentType = 'PanCard';
                    } else if (
                      response?.passport_number ||
                      response?.passport_no ||
                      response?.['Passport No.']
                    ) {
                      documentType = 'Passport';
                    } else if (
                      response?.driving_license_number ||
                      response?.dl_number
                    ) {
                      documentType = 'DriversPermit';
                    } else if (
                      response?.voter_id ||
                      response?.voter_id_number
                    ) {
                      documentType = 'VoterID';
                    }

                    console.log(`IDP detected document type: ${documentType}`);

                    // Update document names based on IDP response
                    let updatedDocumentsWithNames = [...updatedDocuments];
                    updatedDocumentsWithNames[index] = {
                      ...updatedDocumentsWithNames[index],
                      doc: updatedDocumentsWithNames[index].doc.map(
                        (doc: any, docIndex: number) => {
                          const fileExtension =
                            doc.type?.split('/')[1] ||
                            doc.fileName?.split('.')[1] ||
                            'jpg';
                          const fileName = `${documentType}${
                            docIndex > 0 ? `_${docIndex + 1}` : ''
                          }.${fileExtension}`;

                          return {
                            ...doc,
                            name: fileName,
                            fileName: fileName,
                          };
                        },
                      ),
                    };

                    console.log(
                      `Updated document names to: ${documentType}`,
                      updatedDocumentsWithNames[index].doc,
                    );

                    const updateData: any = {};

                    if (response?.name) {
                      // Split name into firstName and lastName if possible
                      const nameParts = response.name.trim().split(' ');
                      if (nameParts.length >= 2) {
                        updateData.firstName = nameParts[0];
                        updateData.lastName = nameParts.slice(1).join(' ');
                      } else {
                        updateData.firstName = response.name;
                        updateData.lastName = ''; // Empty if no last name
                      }
                    }

                    if (response?.date_of_birth) {
                      // Convert from DD/MM/YYYY to YYYY-MM-DD
                      const dateParts = response.date_of_birth.split('/');
                      if (dateParts.length === 3) {
                        const [day, month, year] = dateParts;
                        updateData.dateOfBirth = `${year}-${month}-${day}`;
                      } else {
                        updateData.dateOfBirth = response.date_of_birth;
                      }
                    }

                    //   if (response?.date_of_birth) {
                    //     // Convert from DD/MM/YYYY to YYYY-MM-DD
                    //     const dateParts = response.date_of_birth.split('/');
                    //     if (dateParts.length === 3) {
                    //       const [day, month, year] = dateParts;
                    //       updateData.idpDateOfBirth = `${year}-${month}-${day}`;
                    //     } else {
                    //       updateData.idpDateOfBirth = response.date_of_birth;
                    //     }
                    //   }

                    //   if (response?.gender) {
                    //     updateData.idpGender = response.gender.toUpperCase();
                    //   }

                    //   // if (response?.mobile_number) {
                    //   //   updateData.mobileNumber = response.mobile_number;
                    //   // }

                    //   // if (response?.aadhaar_number) {
                    //   //   updateData.aadhaarNumber = response.aadhaar_number;
                    //   // }

                    //   // if (response?.vid) {
                    //   //   updateData.vid = response.vid;
                    //   // }

                    //   if (response?.address) {
                    //     updateData.idpAddress = response.address;
                    //   }
                    // }

                    // Update document details with the renamed documents and split names
                    updatedDocumentsWithNames[index] = {
                      ...updatedDocumentsWithNames[index],
                      details: {
                        ...response,
                        ...updateData, // Include firstName and lastName
                      },
                    };

                    dispatch(
                      setState({
                        additionalBeneficiary: [...updatedDocumentsWithNames],
                      }),
                    );
                  } catch (error) {
                    console.log(error, 'error');
                    logErr(error);
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            ))}
          <DropdownWithModal
            header="Joint Partner"
            options={jointPartnerOptions}
            value={selectedJointPartnerName}
            passIdAndDesc
            setValue={(id: string, desc?: string) => {
              setSelectedJointPartnerId(String(id ?? ''));
              setSelectedJointPartnerName(String(desc ?? ''));
            }}
            label="Joint Partner"
            placeholder="Select Joint Partner"
          />
          <Button
            buttonStyle={{
              marginVertical: hp(3),
            }}
            text="Upload joint partner documents"
            onPress={() => setShowJointPartnerDocuments(true)}
          />
          {showJointPartnerDocuments &&
            jointPartnerDocuments.map((item: any, index: number) => (
              <DocumentUpload
                header="Upload Additional Document"
                headerDesc=""
                limit={2}
                images={item?.doc}
                details={item?.details || {}}
                setImages={async (images: any) => {
                  let updatedDocuments = [...additionalJointPartner];

                  if (images.length == 0) {
                    updatedDocuments.splice(index, 1);
                    dispatch(
                      setState({ additionalJointPartner: updatedDocuments }),
                    );
                    return;
                  }

                  // Process images to set proper document names
                  console.log('Original images:', images);

                  const existingDocs = updatedDocuments[index]?.doc || [];
                  const newDocs = [...existingDocs, ...images];

                  updatedDocuments[index] = {
                    ...updatedDocuments[index],
                    doc: newDocs,
                    details: updatedDocuments[index]?.details || {},
                  };

                  dispatch(
                    setState({
                      additionalJointPartner: [...updatedDocuments],
                    }),
                  );

                  try {
                    setLoading(true);
                    const response: any = await idpExtract(images);
                    console.log(response, 'response');

                    // Determine document type based on IDP response and update document names
                    let documentType = 'AadhaarCard'; // default

                    if (
                      response?.['Card Type'] ==
                        'National Identification Card' ||
                      response?.['NATIONAL IDENTIFICATION CARD']
                    ) {
                      documentType = 'NationalId';
                    } else if (response?.license_number) {
                      documentType = 'DriversPermit';
                    } else if (
                      response?.['Card Type'] == 'Driving License' ||
                      response?.driver_license_number
                    ) {
                      documentType = 'DriversPermit';
                    } else if (response?.['Card Type'] == 'Voter ID') {
                      documentType = 'VoterID';
                    } else if (
                      response?.pancard_number ||
                      response?.card_type == 'Permanent Account Number Card' ||
                      response?.panc_number
                    ) {
                      documentType = 'PanCard';
                    } else if (
                      response?.aadhaar_number ||
                      response?.aadhar_number
                    ) {
                      documentType = 'AadhaarCard';
                    } else if (
                      response?.pancard_number ||
                      response?.pan_number ||
                      response?.pan_card_number
                    ) {
                      documentType = 'PanCard';
                    } else if (
                      response?.passport_number ||
                      response?.passport_no ||
                      response?.['Passport No.']
                    ) {
                      documentType = 'Passport';
                    } else if (
                      response?.driving_license_number ||
                      response?.dl_number
                    ) {
                      documentType = 'DriversPermit';
                    } else if (
                      response?.voter_id ||
                      response?.voter_id_number
                    ) {
                      documentType = 'VoterID';
                    }

                    console.log(`IDP detected document type: ${documentType}`);

                    // Update document names based on IDP response
                    let updatedDocumentsWithNames = [...updatedDocuments];
                    updatedDocumentsWithNames[index] = {
                      ...updatedDocumentsWithNames[index],
                      doc: updatedDocumentsWithNames[index].doc.map(
                        (doc: any, docIndex: number) => {
                          const fileExtension =
                            doc.type?.split('/')[1] ||
                            doc.fileName?.split('.')[1] ||
                            'jpg';
                          const fileName = `${documentType}${
                            docIndex > 0 ? `_${docIndex + 1}` : ''
                          }.${fileExtension}`;

                          return {
                            ...doc,
                            name: fileName,
                            fileName: fileName,
                          };
                        },
                      ),
                    };

                    console.log(
                      `Updated document names to: ${documentType}`,
                      updatedDocumentsWithNames[index].doc,
                    );

                    const updateData: any = {};

                    if (response?.name) {
                      // Split name into firstName and lastName if possible
                      const nameParts = response.name.trim().split(' ');
                      if (nameParts.length >= 2) {
                        updateData.firstName = nameParts[0];
                        updateData.lastName = nameParts.slice(1).join(' ');
                      } else {
                        updateData.firstName = response.name;
                        updateData.lastName = ''; // Empty if no last name
                      }
                    }

                    if (response?.date_of_birth) {
                      // Convert from DD/MM/YYYY to YYYY-MM-DD
                      const dateParts = response.date_of_birth.split('/');
                      if (dateParts.length === 3) {
                        const [day, month, year] = dateParts;
                        updateData.dateOfBirth = `${year}-${month}-${day}`;
                      } else {
                        updateData.dateOfBirth = response.date_of_birth;
                      }
                    }

                    //   if (response?.date_of_birth) {
                    //     // Convert from DD/MM/YYYY to YYYY-MM-DD
                    //     const dateParts = response.date_of_birth.split('/');
                    //     if (dateParts.length === 3) {
                    //       const [day, month, year] = dateParts;
                    //       updateData.idpDateOfBirth = `${year}-${month}-${day}`;
                    //     } else {
                    //       updateData.idpDateOfBirth = response.date_of_birth;
                    //     }
                    //   }

                    //   if (response?.gender) {
                    //     updateData.idpGender = response.gender.toUpperCase();
                    //   }

                    //   // if (response?.mobile_number) {
                    //   //   updateData.mobileNumber = response.mobile_number;
                    //   // }

                    //   // if (response?.aadhaar_number) {
                    //   //   updateData.aadhaarNumber = response.aadhaar_number;
                    //   // }

                    //   // if (response?.vid) {
                    //   //   updateData.vid = response.vid;
                    //   // }

                    //   if (response?.address) {
                    //     updateData.idpAddress = response.address;
                    //   }
                    // }

                    // Update document details with the renamed documents and split names
                    updatedDocumentsWithNames[index] = {
                      ...updatedDocumentsWithNames[index],
                      details: {
                        ...response,
                        ...updateData, // Include firstName and lastName
                      },
                    };

                    dispatch(
                      setState({
                        additionalJointPartner: [...updatedDocumentsWithNames],
                      }),
                    );
                  } catch (error) {
                    console.log(error, 'error');
                    logErr(error);
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            ))}
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

export default AddBeneficiary;

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: hp(5),
    },

    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
  });
