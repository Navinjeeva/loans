import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '@src/common/utils/ThemeContext';
import { setState } from '@src/store/customer';
import AdditionalDocuments from './AdditionalDocuments';
import Header from '@src/common/components/Header';
import { useState } from 'react';
import { logErr } from '@src/common/utils/logger';
import DocumentUpload from '@src/common/components/DocumentUpload';
import { documentUploadManager } from '@src/common/utils/documentUploadManager';
import TextHeader from '@src/common/components/TextHeader';
import store from '@src/store';

const LinkedEntities = ({
  setLoading,
}: {
  setLoading: (loading: boolean) => void;
}) => {
  const custData = useSelector((state: any) => state.customer);
  const doc = custData.linkedEntitiesDocuments || [];

  const documents =
    doc.length > 0
      ? doc
      : [{ id: 1, name: 'Beneficiary Document', doc: [], details: {} }];

  const dispatch = useDispatch();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  const removeDocument = (index: number) => {
    let updatedDocuments = [...documents];
    updatedDocuments.splice(index, 1);
    dispatch(setState({ linkedEntitiesDocuments: updatedDocuments }));
  };

  const updateDocument = async (index: number, images: any[]) => {
    let updatedDocuments = [...(documents || [])];

    if (images.length == 0) {
      // Don't remove the document, just clear it
      updatedDocuments[index] = {
        ...updatedDocuments[index],
        doc: [],
        details: {},
      };
      dispatch(setState({ linkedEntitiesDocuments: [...updatedDocuments] }));
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

    // Automatically add an empty document if this is the last document and it has content
    const lastDocumentIndex = updatedDocuments.length - 1;
    if (index === lastDocumentIndex && images.length > 0) {
      updatedDocuments.push({
        id: updatedDocuments.length + 1,
        name: 'Linked Entities Document',
        doc: [],
        details: {},
      });
    }

    dispatch(setState({ linkedEntitiesDocuments: [...updatedDocuments] }));

    try {
      // Get customer ID from Redux store
      const customerId = custData.customerId || 'APP_TEST';

      // Process only the first image for IDP extraction
      const firstImage = Array.isArray(images) ? images[0] : images;

      console.log('[IDP] Processing linked entities document:', firstImage);

      // IDP: Upload and extract document data using centralized manager
      documentUploadManager.queueUpload(
        firstImage,
        customerId,
        index, // indexOfDoc
        'LINKED_ENTITIES_DOCUMENTS',
        'MOBILE_DEVICE',
        // onProgress callback
        progress => {
          console.log(
            `[IDP] Upload progress for linked entity doc ${index}:`,
            progress,
          );
        },
        // onSuccess callback
        (response: any, taskId: string) => {
          console.log(response, 'response');

          // Determine document type based on IDP response and update document names
          let documentType = 'AadhaarCard'; // default

          if (
            response?.['Card Type'] == 'National Identification Card' ||
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
          } else if (response?.aadhaar_number || response?.aadhar_number) {
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
          } else if (response?.driving_license_number || response?.dl_number) {
            documentType = 'DriversPermit';
          } else if (response?.voter_id || response?.voter_id_number) {
            documentType = 'VoterID';
          }

          console.log(`IDP detected document type: ${documentType}`);

          // Get the LATEST document state from Redux store (not stale component state)
          const latestState = store.getState().customer;
          const currentDocs =
            latestState.linkedEntitiesDocuments?.length > 0
              ? [...latestState.linkedEntitiesDocuments]
              : [{ id: 1, name: 'Beneficiary Document', doc: [], details: {} }];

          // Update document names based on IDP response
          let updatedDocumentsWithNames = [...currentDocs];
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
              linkedEntitiesDocuments: [...updatedDocumentsWithNames],
            }),
          );
        },
        // onError callback
        (error: Error, taskId: string) => {
          console.log(error, 'error');
          logErr(error);
        },
      );
    } catch (error) {
      console.log(error, 'error');
      logErr(error);
    }
  };

  return (
    <View style={styles.section}>
      <TextHeader
        title="Linked Entities"
        subtitle="Upload ID documents for the beneficiary and joint partners."
      />
      {documents.map((item: any, index: number) => (
        <View key={index} style={styles.documentContainer}>
          <View style={styles.documentHeader}>
            <Text style={[styles.documentTitle, { color: colors.text }]}>
              {item.name} {index + 1}
            </Text>

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
                <Text style={{ color: 'red' }}> Remove</Text>
              </Pressable>
            )}
          </View>

          <DocumentUpload
            header=""
            headerDesc=""
            limit={2}
            images={item?.doc || []}
            details={item?.details || {}}
            showDocument={true}
            onDetailsUpdate={updatedDetails => {
              let updatedDocuments = [...documents];
              updatedDocuments[index] = {
                ...updatedDocuments[index],
                details: updatedDetails,
              };
              dispatch(
                setState({ linkedEntitiesDocuments: [...updatedDocuments] }),
              );
            }}
            setImages={(images: any[]) => updateDocument(index, images)}
          />
        </View>
      ))}
    </View>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    section: {},
    sectionTitle: {
      fontSize: hp(2.2),
      fontWeight: '600',
      marginBottom: hp(0.5),
    },
    sectionSubtitle: {
      fontSize: hp(1.6),
      marginBottom: hp(2),
      lineHeight: hp(2.2),
    },
    documentContainer: {
      marginBottom: hp(2),
    },
    documentHeader: {
      marginBottom: hp(1),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    documentTitle: {
      fontSize: hp(1.8),
      fontWeight: '500',
    },
  });

export default LinkedEntities;
