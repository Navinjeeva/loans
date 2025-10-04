import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '@src/common/utils/ThemeContext';
import { setState } from '@src/store/customer';
import AdditionalDocuments from './AdditionalDocuments';
import Header from '@src/common/components/Header';

const LinkedEntities = ({
  setLoading,
}: {
  setLoading: (loading: boolean) => void;
}) => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  const { linkedEntitiesDocuments } = useSelector(
    (state: any) => state.customer,
  );

  return (
    <View style={styles.container}>
      <Header
        title="Linked Entities"
        subTitle="Add information about joint partners and beneficiaries"
      />

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Joint Partners
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Add joint partners who will be co-borrowers for this loan
          </Text>

          <AdditionalDocuments
            title="Joint Partner Documents"
            subtitle="Upload documents for joint partners"
            storeKey="jointPartnerDocuments"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Beneficiaries
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Add beneficiaries who will receive loan proceeds
          </Text>

          <AdditionalDocuments
            title="Beneficiary Documents"
            subtitle="Upload documents for beneficiaries"
            storeKey="beneficiaryDocuments"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Linked Entities
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Upload additional documents for linked entities
          </Text>

          <AdditionalDocuments
            title="Linked Entity Documents"
            subtitle="Upload additional documents for linked entities"
            storeKey="linkedEntitiesDocuments"
          />
        </View>
      </View>
    </View>
  );
};

export default LinkedEntities;

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    section: {
      marginBottom: hp(3),
    },
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
  });
