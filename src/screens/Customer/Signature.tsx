import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '@src/common/components/Button';
import Loader from '@src/common/components/Loader';
import KeyboardAwareScrollView from '@src/common/components/KeyboardAwareScrollView';
import { useTheme } from '@src/common/utils/ThemeContext';
import { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import SignatureScreen from 'react-native-signature-canvas';
import Header from '@src/common/components/Header';

const Signature = () => {
  const { colors, isDark } = useTheme();
  const { signatureImage, memberPicture } = useRoute().params as any;
  const styles = createStyles(colors, isDark);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [fetchedImageSign, setFetchedImageSign] = useState(null);
  const [signatureVisible, setSignatureVisible] = useState(false);
  const [pin, setPin] = useState<string | null>(null);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Loader loading={loading} />

      <Header
        title="Document Holder Verification"
        subTitle="Complete signature and passcode verification"
      />
      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <View
            style={{
              height: hp(20),
              flex: 1,
              borderColor: '#000',
              borderWidth: 1,
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {fetchedImageSign ? (
              <Image
                source={{ uri: fetchedImageSign }}
                style={styles.imagePreview}
              />
            ) : (
              <Text style={styles.uploadText}>{`No Signature\nPresent`}</Text>
            )}
          </View>

          <TouchableOpacity
            onPressIn={() => setSignatureVisible(true)}
            style={{
              flex: 1,
              height: hp(20),
              borderColor: '#000',
              borderWidth: 1,
              borderStyle: 'dashed',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {signatureImage ? (
              <Image
                source={{ uri: signatureImage }}
                style={styles.imagePreview}
              />
            ) : (
              <Text style={styles.uploadText}>{`Click To\nCapture`}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Picture Comparison Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Member Picture
        </Text>
        <View
          style={[
            styles.section,
            styles.cardContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.updateInfo, { color: colors.textSecondary }]}>
            Last Updated on 01-JAN-2025
          </Text>

          <View style={styles.pictureComparisonContainer}>
            {/* Existing Record */}
            <View style={styles.pictureComparisonItem}>
              <View style={[styles.pictureFrame, styles.existingRecordFrame]}>
                <Image
                  source={{
                    uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
                  }}
                  style={styles.comparisonPicture}
                  resizeMode="cover"
                />
              </View>
              <Text style={[styles.pictureLabel, styles.existingRecordLabel]}>
                Existing Record
              </Text>
            </View>

            {/* Current Capture */}
            <View style={styles.pictureComparisonItem}>
              <View style={[styles.pictureFrame, styles.currentCaptureFrame]}>
                <Image
                  key={`${memberPicture}-${Date.now()}`}
                  source={{
                    uri:
                      memberPicture ||
                      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
                  }}
                  style={styles.comparisonPicture}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.pictureLabel, styles.currentCaptureLabel]}>
                Current Capture
              </Text>
            </View>
          </View>

          <View style={styles.confidenceContainer}>
            <Text style={[styles.confidenceLabel, { color: colors.text }]}>
              Picture Confidence level:{' '}
              <Text style={styles.confidenceValue}>99 %</Text>
            </Text>
          </View>
        </View>

        {/* Passcode Verification Section */}
        <View style={styles.passcodeSection}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            Passcode Verification
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            Please enter the 6-digit code to confirm this transaction.
          </Text>

          <OtpInput
            // secureTextEntry={visible}
            numberOfDigits={6}
            focusColor="orange"
            focusStickBlinkingDuration={500}
            onTextChange={text => setPin(text)}
            // onFilled={handleFilled}
            theme={{
              containerStyle: styles.otpContainer,
              inputsContainerStyle: styles.inputsContainer,
              pinCodeContainerStyle: styles.pinCodeContainer,
              pinCodeTextStyle: styles.pinCodeText,
              focusStickStyle: styles.focusStick,
              focusedPinCodeContainerStyle: styles.activePinCodeContainer,
            }}
          />
        </View>
      </KeyboardAwareScrollView>

      <Button
        buttonStyle={{
          marginVertical: hp(3),
        }}
        text="Continue"
        onPress={() => {}}
      />
    </SafeAreaView>
  );
};

export default Signature;

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
    backButton: {
      marginRight: wp(4),
      marginTop: hp(0.5),
    },
    backIcon: {
      fontSize: hp(3),
      fontWeight: 'bold',
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: hp(2.8),
      fontWeight: 'bold',
      marginBottom: hp(0.5),
    },
    headerSubtitle: {
      fontSize: hp(1.6),
      lineHeight: hp(2.2),
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    imagePreview: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
      resizeMode: 'contain',
      backgroundColor: '#000',
    },
    uploadText: {
      color: '#000',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    otpContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    pinCodeContainer: {
      width: wp(10),
      height: hp(5),
      borderWidth: 1,
      borderColor: '#000',
      justifyContent: 'center',
      alignItems: 'center',
    },
    pinCodeText: {
      fontSize: 18,
      color: '#000',
    },
    focusStick: {
      backgroundColor: 'orange',
    },
    activePinCodeContainer: {
      borderColor: 'orange',
    },
    modalTitle: {
      fontSize: hp(2.6),
      marginTop: hp(1),
    },
    modalSubtitle: {
      fontSize: hp(1.8),
      marginTop: hp(1),
      marginBottom: hp(1),
    },
    signatureHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      backgroundColor: '#000',
      borderBottomWidth: 1,
      borderBottomColor: '#333',
    },
    closeSignatureButton: {
      padding: wp(2),
    },
    closeSignatureText: {
      color: '#fff',
      fontSize: hp(2.5),
      fontWeight: 'bold',
    },
    signatureTitle: {
      color: '#fff',
      fontSize: hp(2.2),
      fontWeight: '600',
      flex: 1,
      textAlign: 'center',
      marginRight: wp(10), // Compensate for close button width
    },
    section: {
      marginBottom: hp(1),
      marginTop: hp(1),
    },
    cardContainer: {
      borderRadius: wp(2),
      padding: wp(1),
      marginHorizontal: wp(1),
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    sectionTitle: {
      fontSize: hp(2),
      fontWeight: '600',
      marginTop: hp(2),
      marginLeft: wp(1),
      //marginBottom: hp(1),
    },
    updateInfo: {
      fontSize: hp(1.2),
      marginBottom: hp(1.5),
      fontStyle: 'italic',
    },
    pictureComparisonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: hp(1.5),
    },
    pictureComparisonItem: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: wp(2),
    },
    pictureFrame: {
      width: wp(25),
      height: wp(25),
      borderRadius: wp(2),
      borderWidth: 3,
      marginBottom: hp(1),
      overflow: 'hidden',
    },
    existingRecordFrame: {
      borderColor: '#FF6B35',
    },
    currentCaptureFrame: {
      borderColor: '#4CAF50',
    },
    comparisonPicture: {
      width: '100%',
      height: '100%',
    },
    pictureLabel: {
      fontSize: hp(1.4),
      fontWeight: '600',
    },
    existingRecordLabel: {
      color: '#FF6B35',
    },
    currentCaptureLabel: {
      color: '#4CAF50',
    },
    confidenceContainer: {
      alignItems: 'center',
      marginTop: hp(0.1),
    },
    confidenceLabel: {
      fontSize: hp(1.2),
    },
    confidenceValue: {
      fontSize: hp(1.2),
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    passcodeSection: {
      paddingHorizontal: wp(4.5),
      marginTop: hp(2),
      marginBottom: hp(2),
    },
  });
