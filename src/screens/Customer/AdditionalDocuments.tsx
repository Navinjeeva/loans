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
import { idpExtract } from '@src/common/utils/idp';
import { logErr } from '@src/common/utils/logger';

interface AdditionalDocumentsProps {
  title: string;
  subtitle: string;
  storeKey:
    | 'jointPartnerDocuments'
    | 'beneficiaryDocuments'
    | 'linkedIdentitiesDocuments';
}

const AdditionalDocuments = ({
  title,
  subtitle,
  storeKey,
}: AdditionalDocumentsProps) => {
  const documents = useSelector((state: any) => state.customer[storeKey]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  const updateDocument = async (index: number, images: any[]) => {
    setLoading(true);
    let updatedDocuments = [...documents];

    if (images.length == 0) {
      updatedDocuments[index] = {
        ...updatedDocuments[index],
        doc: [],
        details: {},
      };
      dispatch(setState({ [storeKey]: updatedDocuments }));
      setLoading(false);
      return;
    }

    // Step 1: Immediately update UI with images
    updatedDocuments[index] = {
      ...updatedDocuments[index],
      doc: images,
      details: updatedDocuments[index]?.details || {},
    };

    dispatch(setState({ [storeKey]: updatedDocuments }));

    // Step 2: Fetch IDP details in background
    try {
      const response: any = await idpExtract(images);
      console.log(response, 'IDP response');

      // Update with IDP details
      let latestDocuments = [...documents];
      latestDocuments[index] = {
        ...latestDocuments[index],
        doc: images,
        details: response || {},
      };

      dispatch(setState({ [storeKey]: latestDocuments }));
    } catch (error) {
      console.log(error, 'IDP error');
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        {subtitle}
      </Text>

      {documents.map((item: any, index: number) => (
        <View key={index} style={styles.documentContainer}>
          <View style={styles.documentHeader}>
            <Text style={[styles.documentTitle, { color: colors.text }]}>
              {item.name}
            </Text>
          </View>

          <DocumentUpload
            header=""
            headerDesc=""
            limit={1}
            images={item?.doc || []}
            details={item?.details || {}}
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
    },
    documentTitle: {
      fontSize: hp(1.8),
      fontWeight: '500',
    },
  });

export default AdditionalDocuments;
