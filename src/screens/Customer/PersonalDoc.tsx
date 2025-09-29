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

const PersonalDoc = () => {
  const { personalDocuments } = useSelector((state: any) => state.customer);
  const docs = personalDocuments || [{ id: 1, name: '', doc: [] }];
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const addDocument = () => {
    if (personalDocuments?.length < 10)
      dispatch(
        setState({
          personalDocuments: [
            ...docs,
            { id: docs.length + 1, name: '', doc: [] },
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
            setImages={async (images: any) => {
              setLoading(true);

              if (images.length == 0) {
                let updatedDocuments = [...docs];
                updatedDocuments.splice(index, 1);
                dispatch(setState({ personalDocuments: updatedDocuments }));
                return;
              }

              let updatedDocuments = [...docs];

              // Append new images to existing ones instead of replacing
              const existingDocs = updatedDocuments[index]?.doc || [];
              const newDocs = [...existingDocs, ...images];

              updatedDocuments[index] = {
                ...updatedDocuments[index],
                doc: newDocs,
              };

              dispatch(setState({ personalDocuments: [...updatedDocuments] }));
              setLoading(false);
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
