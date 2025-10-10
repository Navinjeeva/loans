import { setState } from '@src/store/customer';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '@src/common/utils/ThemeContext';
import { eyeIcons } from '@src/common/assets';
import DocumentUpload from '@src/common/components/DocumentUpload';
import { useState } from 'react';
import TextInputComponent from '@src/common/components/TextInputComponent';
import { documentUploadManager } from '@src/common/utils/documentUploadManager';
import { logErr, logSuccess } from '@src/common/utils/logger';
import AdditionalDocuments from './AdditionalDocuments';
import TextHeader from '@src/common/components/TextHeader';
import store from '@src/store';

const PersonalDoc = ({
  setLoading,
}: {
  setLoading: (loading: boolean) => void;
}) => {
  const custData = useSelector((state: any) => state.customer);
  const { personalDocuments } = custData;
  const docs =
    personalDocuments.length > 0
      ? personalDocuments
      : [{ id: 1, name: '', doc: [], details: {} }];

  const dispatch = useDispatch();

  const addDocument = () => {
    if (personalDocuments?.length < 10)
      dispatch(
        setState({
          personalDocuments: [
            ...docs,
            { id: docs.length + 1, name: '', doc: [], details: {} },
          ],
        }),
      );
  };

  const removeDocument = (index: number) => {
    let updatedDocuments = [...docs];
    updatedDocuments.splice(index, 1);
    dispatch(setState({ personalDocuments: updatedDocuments }));
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

  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  return (
    <View>
      <TextHeader
        title="Personal Documents"
        subtitle="Upload required personal documents."
      />
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

            {/* {index !== 0 && (
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
            )} */}
          </View>

          <DocumentUpload
            header="Upload Additional Document"
            headerDesc=""
            limit={2}
            images={item?.doc}
            details={item?.details || {}}
            setImages={async (images: any) => {
              // CRITICAL: Always read from Redux store to get latest state
              // This prevents using stale component state when multiple uploads happen
              const latestState = store.getState().customer;
              const currentDocs =
                latestState.personalDocuments?.length > 0
                  ? [...latestState.personalDocuments]
                  : [{ id: 1, name: '', doc: [], details: {} }];
              let updatedDocuments = [...currentDocs];

              console.log(
                '[IDP] setImages - Current state:',
                currentDocs.map(
                  (d: any, i: number) =>
                    `${i}: hasDetails=${
                      !!d.details && Object.keys(d.details).length > 0
                    }`,
                ),
              );

              if (images.length == 0) {
                // Don't remove the document, just clear it
                updatedDocuments[index] = {
                  ...updatedDocuments[index],
                  doc: [],
                  details: {},
                };
                dispatch(
                  setState({ personalDocuments: [...updatedDocuments] }),
                );
                return;
              }

              // Process images to set proper document names
              console.log('Original images:', images);

              const existingDocs = updatedDocuments[index]?.doc || [];
              const newDocs = [...existingDocs, ...images];

              updatedDocuments[index] = {
                ...updatedDocuments[index],
                doc: newDocs as any,
                details: updatedDocuments[index]?.details || {},
              };

              // Automatically add an empty document if this is the last document and it has content
              const lastDocumentIndex = updatedDocuments.length - 1;
              if (index === lastDocumentIndex && images.length > 0) {
                updatedDocuments.push({
                  id: updatedDocuments.length + 1,
                  name: '',
                  doc: [],
                  details: {},
                });
              }

              dispatch(setState({ personalDocuments: [...updatedDocuments] }));

              try {
                // Get customer ID from Redux store
                const customerId = custData.customerId || 'APP_TEST';

                // Process only the first image for IDP extraction
                const firstImage = Array.isArray(images) ? images[0] : images;

                console.log('[IDP] Processing first image:', firstImage);
                console.log('[IDP] Queueing upload with closure index:', index);
                console.log(
                  '[IDP] Current array length after auto-add:',
                  updatedDocuments.length,
                );
                console.log(
                  '[IDP] Document being uploaded:',
                  updatedDocuments[index]?.name || `unnamed (index ${index})`,
                );

                // IDP: Upload and extract document data using centralized manager
                documentUploadManager.queueUpload(
                  firstImage,
                  customerId,
                  index, // indexOfDoc
                  'PERSONAL_DOCUMENTS',
                  'MOBILE_DEVICE',
                  // onProgress callback
                  progress => {
                    console.log(
                      `[IDP] Upload progress for doc ${index}:`,
                      progress,
                    );
                    // You can add loading state updates here if needed
                  },
                  // onSuccess callback
                  (response: any, taskId: string) => {
                    console.log('[IDP] Extracted data:', response);
                    //logSuccess('Document extracted successfully');

                    // Use the index from the response, or fall back to closure index
                    const actualIndex = response?._indexOfDoc ?? index;
                    console.log(
                      '[IDP] Using index:',
                      actualIndex,
                      'Closure index:',
                      index,
                      'Response index:',
                      response?._indexOfDoc,
                    );

                    // Warn if there's a mismatch
                    if (
                      response?._indexOfDoc !== undefined &&
                      response._indexOfDoc !== index
                    ) {
                      console.warn(
                        `[IDP] Index mismatch! Closure: ${index}, Response: ${response._indexOfDoc}`,
                      );
                    }

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

                    // CRITICAL: Use setTimeout to ensure previous Redux updates have completed
                    // This prevents race conditions when multiple documents are extracted simultaneously
                    setTimeout(() => {
                      // Get the LATEST document state from Redux store (not stale component state)
                      const latestState = store.getState().customer;
                      const currentDocs =
                        latestState.personalDocuments?.length > 0
                          ? [...latestState.personalDocuments]
                          : [{ id: 1, name: '', doc: [], details: {} }];

                      console.log(
                        '[IDP] Current documents array length:',
                        currentDocs.length,
                      );
                      console.log(
                        '[IDP] Updating document at actualIndex:',
                        actualIndex,
                      );
                      console.log(
                        '[IDP] Current document names:',
                        currentDocs.map(
                          (d: any, i: number) => `${i}: ${d.name || 'unnamed'}`,
                        ),
                      );
                      console.log(
                        '[IDP] Existing details before update:',
                        currentDocs.map(
                          (d: any, i: number) =>
                            `${i}: hasDetails=${
                              !!d.details && Object.keys(d.details).length > 0
                            }`,
                        ),
                      );

                      // Update document names based on IDP response
                      let updatedDocumentsWithNames = [...currentDocs];

                      // Ensure document exists at index
                      if (!updatedDocumentsWithNames[actualIndex]) {
                        console.warn(
                          `Document at index ${actualIndex} not found, skipping update`,
                        );
                        return;
                      }

                      const currentDoc = updatedDocumentsWithNames[actualIndex];
                      const updatedDocs = (currentDoc.doc || []).map(
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
                      );

                      updatedDocumentsWithNames[actualIndex] = {
                        ...currentDoc,
                        doc: updatedDocs as any,
                      };

                      console.log(
                        `Updated document names to: ${documentType}`,
                        updatedDocumentsWithNames[actualIndex].doc,
                      );

                      const updateData: any = {};

                      if (response?.name) {
                        updateData.name = response.name;
                        console.log(response?.name, 'name from IDP');
                        // Split name into firstName and lastName if possible
                        const nameParts = response.name.trim().split(' ');
                        if (nameParts.length >= 2) {
                          updateData.idpFirstName = nameParts[0];
                          updateData.idpLastName = nameParts.slice(1).join(' ');
                        } else {
                          updateData.idpFirstName = response.name;
                          updateData.idpLastName = ''; // Empty if no last name
                        }
                      }

                      if (response?.aadhaar_number || response?.aadhar_number) {
                        if (response?.date_of_birth) {
                          // Convert from DD/MM/YYYY to YYYY-MM-DD
                          const dateParts = response.date_of_birth.split('/');
                          if (dateParts.length === 3) {
                            const [day, month, year] = dateParts;
                            updateData.idpDateOfBirth = `${year}-${month}-${day}`;
                          } else {
                            updateData.idpDateOfBirth = response.date_of_birth;
                          }
                        }

                        if (response?.gender) {
                          updateData.idpGender = response.gender.toUpperCase();
                        }

                        if (response?.address) {
                          updateData.idpAddress = response.address;
                        }
                      }

                      // Update document details with the renamed documents
                      updatedDocumentsWithNames[actualIndex] = {
                        ...updatedDocumentsWithNames[actualIndex],
                        details: response || {},
                      };

                      console.log(
                        '[IDP] Final document details at index',
                        actualIndex,
                        ':',
                        updatedDocumentsWithNames[actualIndex].details,
                      );
                      console.log(
                        '[IDP] All documents after update:',
                        updatedDocumentsWithNames.map(
                          (d: any, i: number) =>
                            `${i}: ${d.name || 'unnamed'} - hasDetails: ${
                              !!d.details && Object.keys(d.details).length > 0
                            }`,
                        ),
                      );

                      dispatch(
                        setState({
                          ...updateData,
                          personalDocuments: [...updatedDocumentsWithNames],
                        }),
                      );

                      console.log(
                        '[IDP] Dispatched update for index',
                        actualIndex,
                      );
                    }, 100); // 100ms delay to ensure Redux updates complete
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
            }}
          />
        </View>
      ))}
    </View>
  );
};

export default PersonalDoc;

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
  });
