import { finalSuccess } from '@src/common/assets/icons';
import Header from '@src/common/components/Header';
import { useTheme } from '@src/common/utils/ThemeContext';
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const FinalScreen = () => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const navigation = useNavigation();
  const custData = useSelector((state: any) => state.customer);

  const finalScreenData = custData.finalScreen || {};

  const applicationDetails = [
    { label: 'Member Name', value: finalScreenData.memberName || '' },
    { label: 'Loan ID', value: finalScreenData.loanId || '' },
    { label: 'Loan Type', value: finalScreenData.loanType || '' },
    { label: 'Loan Amount', value: finalScreenData.loanAmount || '' },
    { label: 'Tentative EMI', value: finalScreenData.tentativeEmi || '' },
    {
      label: 'Instalment Start Date',
      value: finalScreenData.installmentStartDate || '',
    },
    { label: 'Maturity Date', value: finalScreenData.maturityDate || '' },
    {
      label: 'Tenure in Months',
      value: finalScreenData.tenureInMonths || '',
    },
  ].filter(detail => detail.value !== 'ed'); // Only show details that have values

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header title="Application Submitted" showBackButton={false} />

      <View style={styles.content}>
        {/* Success Icon */}
        <Image source={finalSuccess} style={styles.successIcon} />

        {/* Status Text */}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            Application Submitted
          </Text>
          <Text
            style={[styles.statusSubtitle, { color: colors.textSecondary }]}
          >
            Your application is under review
          </Text>
        </View>

        {/* Application Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
          {applicationDetails.map((detail, index) => (
            <View key={index} style={styles.detailRow}>
              <Text
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                {detail.label}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {detail.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Back to Home Button */}
        <TouchableOpacity
          style={[styles.backToHomeButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('customer' as never)}
        >
          <Text style={styles.backToHomeText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FinalScreen;

const createStyles = (colors: any, isDark: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      marginTop: hp(5),
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
      alignItems: 'center',
    },
    successIcon: {
      width: wp(20),
      height: wp(20),
      marginTop: hp(4),
    },
    statusContainer: {
      alignItems: 'center',
    },
    statusTitle: {
      fontSize: hp(2.8),
      fontWeight: 'bold',
      marginBottom: hp(1),
      color: colors.text,
    },
    statusSubtitle: {
      fontSize: hp(1.6),
      color: colors.textSecondary,
    },
    detailsCard: {
      borderRadius: wp(3),
      padding: wp(4),
      marginBottom: hp(4),
      width: '100%',
      marginTop: hp(4),
      borderColor: colors.border,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: hp(1),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailLabel: {
      fontSize: hp(1.6),
      flex: 1,
      color: colors.textSecondary,
    },
    detailValue: {
      fontSize: hp(1.6),
      fontWeight: '500',
      textAlign: 'right',
      flex: 1,
      color: colors.text,
    },
    backToHomeButton: {
      borderRadius: wp(2),
      paddingVertical: hp(1.8),
      paddingHorizontal: wp(8),
      width: '100%',
      alignItems: 'center',
      marginBottom: hp(2),
      backgroundColor: colors.primary,
    },
    backToHomeText: {
      fontSize: hp(1.8),
      fontWeight: 'bold',
      color: colors.buttonText,
      textAlign: 'center',
    },
  });
