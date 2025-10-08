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
import { idpExtract } from '@src/common/utils/idp';
import { logErr } from '@src/common/utils/logger';
import TextHeader from '@src/common/components/TextHeader';

const loanDoc = ({
  setLoading,
}: {
  setLoading: (loading: boolean) => void;
}) => {
  const { loanDocuments } = useSelector((state: any) => state.customer);
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
              let updatedDocuments = [...docs];

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
                doc: newDocs,
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
                //setLoading(true);
                const response = await idpExtract(images);
                console.log(response, 'response');

                let latestDocuments = [...updatedDocuments];
                latestDocuments[index] = {
                  ...latestDocuments[index],
                  details: response || {},
                };

                dispatch(setState({ loanDocuments: [...latestDocuments] }));
              } catch (error) {
                console.log(error, 'error');
                logErr(error);
              } finally {
                //setLoading(false);
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
