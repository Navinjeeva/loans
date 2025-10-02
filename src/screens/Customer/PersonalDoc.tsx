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
import AdditionalDocuments from './AdditionalDocuments';

const PersonalDoc = () => {
  const { personalDocuments } = useSelector((state: any) => state.customer);
  const docs =
    personalDocuments.length > 0
      ? personalDocuments
      : [{ id: 1, name: '', doc: [], details: {} }];
  const [loading, setLoading] = useState(false);

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
                  {/* <Image
                    source={eyeIcons}
                    style={{
                      height: hp(2),
                      width: wp(4),
                    }}
                  /> */}
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
            details={item?.details || {}}
            setImages={async (images: any) => {
              let updatedDocuments = [...docs];

              if (images.length == 0) {
                updatedDocuments.splice(index, 1);
                dispatch(setState({ personalDocuments: updatedDocuments }));
                return;
              }

              const existingDocs = updatedDocuments[index]?.doc || [];
              const newDocs = [...existingDocs, ...images];

              updatedDocuments[index] = {
                ...updatedDocuments[index],
                doc: newDocs,
                details: updatedDocuments[index]?.details || {},
              };

              dispatch(setState({ personalDocuments: [...updatedDocuments] }));

              try {
                setLoading(true);
                const response: any = await idpExtract(images);
                console.log(response, 'response');

                const updateData: any = {};

                if (response?.aadhaar_number) {

                  if (response?.name) {
                    updateData.name = response.name;
                    // Split name into firstName and lastName if possible
                    const nameParts = response.name.split(' ');
                    if (nameParts.length >= 2) {
                      updateData.firstName = nameParts[0];
                      updateData.lastName = nameParts.slice(1).join(' ');
                    } else {
                      updateData.firstName = response.name;
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

                  if (response?.gender) {
                    updateData.gender = response.gender.toUpperCase();
                  }

                  // if (response?.mobile_number) {
                  //   updateData.mobileNumber = response.mobile_number;
                  // }

                  // if (response?.aadhaar_number) {
                  //   updateData.aadhaarNumber = response.aadhaar_number;
                  // }

                  // if (response?.vid) {
                  //   updateData.vid = response.vid;
                  // }

                  if (response?.address) {
                    updateData.address = response.address;
                  }

                }

                // Update document details
                let latestDocuments = [...updatedDocuments];
                latestDocuments[index] = {
                  ...latestDocuments[index],
                  details: response || {},
                };

                dispatch(
                  setState({
                    ...updateData,
                    personalDocuments: [...latestDocuments],
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
        </View>
      ))}



      {/* Linked Identities Documents */}
      <AdditionalDocuments
        title="Linked Entities"
        subtitle="Upload Additional Documents for Beneficiary and Joint Partners"
        storeKey="linkedEntitiesDocuments"
      />
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
