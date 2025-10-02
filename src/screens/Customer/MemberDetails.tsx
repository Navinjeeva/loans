import { useNavigation } from '@react-navigation/native';
import Button from '@src/common/components/Button';
import ImageViewer from '@src/common/components/imageViewer';
import Loader from '@src/common/components/Loader';
import MobileNumberInputComponent from '@src/common/components/MobileNumberComponent';
import TextInputComponent from '@src/common/components/TextInputComponent';
import KeyboardAwareScrollView from '@src/common/components/KeyboardAwareScrollView';
import { useTheme } from '@src/common/utils/ThemeContext';
import { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useSelector } from 'react-redux';
import Header from '@src/common/components/Header';

const MemberDetails = () => {
  const [loading, setLoading] = useState(false);
  const { extraDocuments, personalDocuments } = useSelector(
    (state: any) => state.customer,
  );
  const custData = useSelector((state: any) => state.customer);
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();

  const styles = createStyles(colors, isDark);

  console.log(!custData.isMember, 'kpkmkp');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Loader loading={loading} />

      <Header
        title="Member Details"
        subTitle="Review and verify member information"
      />

      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Upload Section */}
        {custData.isMember ? (
          <>
            <View style={styles.uploadSection}>
              <View style={{}}>
                <TextInputComponent
                  header="Member Name"
                  value={'John'}
                  //inputStyles={{ width: '48%' }}
                  onChange={() => { }}
                  isEditable={false}
                />
                <TextInputComponent
                  header="Member Number"
                  value={'Doe'}
                  //inputStyles={{ width: '48%' }}
                  onChange={() => { }}
                  isEditable={false}
                />
              </View>

              <TextInputComponent
                header="Email"
                value={'john.doe@test.com'}
                onChange={() => { }}
                isEditable={false}
              />

              <View style={{ gap: hp(0.4) }}>
                <Text>Mobile Number</Text>
                <MobileNumberInputComponent
                  mobileNumber="9999999999"
                  isdCode={'91'}
                  onChangeMobileNumber={() => { }}
                  onChangeIsdCode={() => { }}
                  isEditable={false}
                />
                <TextInputComponent
                  header="Address"
                  value={'123, Sample Street, Test City'}
                  onChange={() => { }}
                  isEditable={false}
                />
              </View>
            </View>
            {extraDocuments && extraDocuments.length > 0
              ? extraDocuments.map((item: any, index: number) => (
                <ImageContainer
                  key={index}
                  imageUrl={
                    item.doc && item.doc.length > 0 ? item.doc[0].uri : ''
                  }
                  title={item.name || item.documentName || 'Document'}
                />
              ))
              : null}
          </>
        ) : (
          <>
            <View style={styles.uploadSection}>
              <View style={{}}>
                <TextInputComponent
                  header="Member Name"
                  value={custData.firstName}
                  //inputStyles={{ width: '48%' }}
                  onChange={() => { }}
                  isEditable={false}
                />
                <TextInputComponent
                  header="Member Number"
                  value={'Doe'}
                  //inputStyles={{ width: '48%' }}
                  onChange={() => { }}
                  isEditable={false}
                />
              </View>

              <TextInputComponent
                header="Email"
                value={custData.email}
                onChange={() => { }}
                isEditable={false}
              />

              <View style={{ gap: hp(0.4) }}>
                <Text>Mobile Number</Text>
                <MobileNumberInputComponent
                  mobileNumber={custData.mobileNumber}
                  isdCode={custData.isdCode}
                  onChangeMobileNumber={() => { }}
                  onChangeIsdCode={() => { }}
                  isEditable={false}
                />
                <TextInputComponent
                  header="Address"
                  value={custData.address}
                  onChange={() => { }}
                  isEditable={false}
                />
              </View>
            </View>
            {personalDocuments && personalDocuments.length > 0
              ? personalDocuments.map((item: any, index: number) => (
                <ImageContainer
                  key={index}
                  imageUrl={
                    item.doc && item.doc.length > 0 ? item.doc[0].uri : ''
                  }
                  title={item.name || item.documentName || 'Document'}
                />
              ))
              : null}
          </>
        )}
      </KeyboardAwareScrollView>

      <Button
        buttonStyle={{
          marginVertical: hp(2.5),
        }}
        text="Proceed to Digital KYC"
        onPress={() => {
          navigation.navigate('MemberOnboarding');
        }}
      />
    </SafeAreaView>
  );
};

export const ImageContainer = ({ imageUrl, title }: any) => {
  const [showDoc, setShowDoc] = useState(false);
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  return (
    <View
      style={{
        marginVertical: hp(2),
        gap: hp(1),
        position: 'relative',
      }}
    >
      <ImageViewer
        image={imageUrl}
        visible={showDoc}
        setVisible={setShowDoc}
        header={title}
      />

      <Text style={styles.text}>{title}</Text>

      <TouchableOpacity
        onPress={() => setShowDoc(true)}
        style={styles.Imagecontainer}
      >
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image]}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default MemberDetails;

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
    uploadSection: {
      marginTop: hp(3),
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(2),
    },
    iconContainer: {
      width: wp(8),
      height: wp(8),
      borderRadius: wp(4),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: wp(3),
    },
    cardIcon: {
      fontSize: hp(2),
    },
    sectionTitle: {
      fontSize: hp(2.2),
      fontWeight: '600',
    },
    fieldLabel: {
      fontSize: hp(1.8),
      fontWeight: '500',
      marginBottom: hp(1),
    },
    infoCard: {
      borderRadius: 12,
      borderWidth: 1,
      padding: wp(4),
      marginTop: hp(2),
      marginBottom: hp(3),
    },
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: hp(1.5),
    },
    warningIcon: {
      fontSize: hp(2),
      marginRight: wp(2),
    },
    infoTitle: {
      fontSize: hp(1.8),
      fontWeight: '600',
    },
    infoList: {
      gap: hp(1),
    },
    bottomContainer: {
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
    },
    proceedButton: {
      borderRadius: 12,
      paddingVertical: hp(2),
      alignItems: 'center',
    },
    proceedButtonText: {
      color: 'white',
      fontSize: hp(2),
      fontWeight: '600',
    },
    // Modal styles
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: wp(6),
    },
    modalCard: {
      width: '100%',
      borderRadius: 20,
      paddingVertical: hp(3),
      paddingHorizontal: wp(5),
    },
    modalClose: {
      position: 'absolute',
      right: wp(4),
      top: hp(1.5),
      zIndex: 1,
    },
    modalTitle: {
      textAlign: 'center',
      fontSize: hp(2.6),
      fontWeight: '700',
      marginTop: hp(1),
    },
    modalSubtitle: {
      textAlign: 'center',
      fontSize: hp(1.8),
      marginTop: hp(1),
      marginBottom: hp(2),
    },
    otpBoxesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginVertical: hp(1),
    },
    otpBox: {
      width: wp(12),
      height: wp(12),
      borderRadius: 12,
      backgroundColor: 'rgba(0,0,0,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: '#000000',
      borderWidth: hp(0.05),
    },
    otpDigit: {
      fontSize: hp(2.4),
      fontWeight: '600',
    },
    hiddenOtpInput: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1,
    },
    resendText: {
      textAlign: 'center',
      color: '#3B45AC',
      fontWeight: '600',
      marginTop: hp(1.5),
      marginBottom: hp(2.5),
    },
    doneButton: {
      borderRadius: 14,
      paddingVertical: hp(1.8),
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
    text: {
      color: '#585858',
      fontSize: hp(1.2),
    },
    Imagecontainer: {
      borderRadius: hp(0.4),
      backgroundColor: '#E4E4E4',
      alignItems: 'center',
      justifyContent: 'center',
      height: hp(30),
      padding: hp(1),
      shadowColor: '#000',
      overflow: 'hidden',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 8,
    },
    image: {
      width: '100%',
      height: '100%',
      borderRadius: hp(3) - hp(2),
      objectFit: 'contain',
    },
  });
