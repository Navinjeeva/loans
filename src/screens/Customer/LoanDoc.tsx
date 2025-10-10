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
import { logErr } from '@src/common/utils/logger';
import TextHeader from '@src/common/components/TextHeader';
import store from '@src/store';

const loanDoc = ({
  setLoading,
}: {
  setLoading: (loading: boolean) => void;
}) => {
  const custData = useSelector((state: any) => state.customer);
  const { loanDocuments } = custData;
  const docs =
    loanDocuments.length > 0
      ? loanDocuments
      : [{ id: 1, name: '', doc: [], details: {} }];

  const dispatch = useDispatch();

  const addDocument = () => {
    if (loanDocuments?.length < 10)
      dispatch(
        setState({
          loanDocuments: [
            ...docs,
            { id: docs.length + 1, name: '', doc: [], details: {} },
          ],
        }),
      );
  };

  const removeDocument = (index: number) => {
    let updatedDocuments = [...docs];
    updatedDocuments.splice(index, 1);
    dispatch(setState({ loanDocuments: updatedDocuments }));
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
        title="Loan Documents"
        subtitle="Upload Loan documents to proceed the application."
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

            {/*{index !== 0 && (
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
            )}*/}
          </View>

          <DocumentUpload
            header="Upload Additional Document"
            headerDesc=""
            limit={1}
            images={item?.doc}
            details={item?.details || {}}
            setImages={async (images: any) => {
              // CRITICAL: Always read from Redux store to get latest state
              // This prevents using stale component state when multiple uploads happen
              const latestState = store.getState().customer;
              const currentDocs =
                latestState.loanDocuments?.length > 0
                  ? [...latestState.loanDocuments]
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
                dispatch(setState({ loanDocuments: [...updatedDocuments] }));
                return;
              }

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

              dispatch(setState({ loanDocuments: [...updatedDocuments] }));

              try {
                // Get customer ID from Redux store
                const customerId = custData.customerId || 'APP_TEST';

                // Process only the first image for IDP extraction
                const firstImage = Array.isArray(images) ? images[0] : images;

                console.log('[IDP] Processing loan document:', firstImage);

                // IDP: Upload and extract document data using centralized manager
                documentUploadManager.queueUpload(
                  firstImage,
                  customerId,
                  index, // indexOfDoc
                  'LOAN_DOCUMENTS',
                  'MOBILE_DEVICE',
                  // onProgress callback
                  progress => {
                    console.log(
                      `[IDP] Upload progress for loan doc ${index}:`,
                      progress,
                    );
                  },
                  // onSuccess callback
                  (response: any, taskId: string) => {
                    console.log('[IDP] Loan document extracted:', response);

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

                    // CRITICAL: Use setTimeout to ensure previous Redux updates have completed
                    // This prevents race conditions when multiple documents are extracted simultaneously
                    setTimeout(() => {
                      // Get the LATEST document state from Redux store (not stale component state)
                      const latestState = store.getState().customer;
                      const currentDocs =
                        latestState.loanDocuments?.length > 0
                          ? [...latestState.loanDocuments]
                          : [{ id: 1, name: '', doc: [], details: {} }];

                      console.log(
                        '[IDP] Existing details before update:',
                        currentDocs.map(
                          (d: any, i: number) =>
                            `${i}: hasDetails=${
                              !!d.details && Object.keys(d.details).length > 0
                            }`,
                        ),
                      );

                      let latestDocuments = [...currentDocs];
                      latestDocuments[actualIndex] = {
                        ...latestDocuments[actualIndex],
                        details: response || {},
                      };

                      dispatch(
                        setState({ loanDocuments: [...latestDocuments] }),
                      );

                      console.log(
                        '[IDP] Dispatched update for loan doc index',
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

export default loanDoc;

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
