import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Modal,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
  MediaType,
} from 'react-native-image-picker';
//import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '@src/common/utils/ThemeContext';
import Header from '@src/common/components/Header';
import Button from '@src/common/components/Button';
import KeyboardAwareScrollView from '@src/common/components/KeyboardAwareScrollView';
import SignatureScreen from 'react-native-signature-canvas';
import { logAlert } from '@src/common/utils/logger';

// Define the navigation types
type RootStackParamList = {
  DocumentHolderVerification: undefined;
  Signature: { signatureImage: string; memberPicture: string };
};

const DocumentHolderVerification = () => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  // Correct usage of useNavigation
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // State management
  const [signatureVisible, setSignatureVisible] = useState(false);
  const [capturedSignature, setCapturedSignature] = useState<string | null>(
    null,
  );
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [memberPicture, setMemberPicture] = useState({
    uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
  });
  const [isDefaultImage, setIsDefaultImage] = useState(true);

  const handleSignatureCapture = useCallback((signature: string) => {
    setCapturedSignature(signature);
    setSignatureVisible(false);
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS permissions are handled by the library
  };

  const handleImagePicker = useCallback(async () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const hasPermission = await requestCameraPermission();
            if (!hasPermission) {
              Alert.alert(
                'Permission Denied',
                'Camera permission is required to take photos',
              );
              return;
            }

            const options = {
              mediaType: 'photo' as MediaType,
              includeBase64: false,
              maxHeight: 2000,
              maxWidth: 2000,
              saveToPhotos: false,
            };

            launchCamera(options, (response: ImagePickerResponse) => {
              if (response.didCancel) {
                console.log('User cancelled camera');
              } else if (response.errorCode) {
                console.log('Camera Error: ', response.errorMessage);
                Alert.alert(
                  'Error',
                  response.errorMessage || 'Failed to open camera',
                );
              } else if (response.assets && response.assets[0]) {
                setMemberPicture({ uri: response.assets[0].uri || '' });
                setIsDefaultImage(false);
              }
            });
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            const options = {
              mediaType: 'photo' as MediaType,
              includeBase64: false,
              maxHeight: 2000,
              maxWidth: 2000,
            };
            launchImageLibrary(options, (response: ImagePickerResponse) => {
              if (response.assets && response.assets[0]) {
                setMemberPicture({ uri: response.assets[0].uri || '' });
                setIsDefaultImage(false);
              }
            });
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  }, []);

  const handleProceed = useCallback(() => {
    if (!capturedSignature || !isConfirmed) {
      // Show validation message
      logAlert('Please capture the signature and confirm the documents');
      return;
    }
    // Navigate to Signature screen with the captured signature and member picture
    navigation.navigate('Signature', {
      signatureImage: capturedSignature,
      memberPicture: memberPicture.uri,
    });
  }, [capturedSignature, isConfirmed, navigation, memberPicture]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header
        title="Document Holder Verification"
        subTitle="Complete signature and picture verification"
      />

      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Member Signature Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Member Signature
          </Text>

          <TouchableOpacity
            style={[styles.signatureContainer, { borderColor: colors.border }]}
            onPress={() => setSignatureVisible(true)}
          >
            {capturedSignature ? (
              <Image
                source={{ uri: capturedSignature }}
                style={styles.signatureImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.signaturePlaceholder}>
                <Text
                  style={[
                    styles.signatureIcon,
                    { color: colors.textSecondary },
                  ]}
                >
                  ✍️
                </Text>
                <Text
                  style={[
                    styles.placeholderText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Tap to capture signature
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Member Picture Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Member Picture
          </Text>

          <View style={styles.centeredContainer}>
            <TouchableOpacity
              style={styles.pictureWithIconContainer}
              onPress={handleImagePicker}
            >
              <Image
                source={memberPicture}
                style={styles.memberPicture}
                resizeMode="contain"
              />
              {isDefaultImage && (
                <View style={styles.cameraIconContainer}>
                  <Text style={[styles.pictureLabel, { color: colors.text }]}>
                    📷
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirmation Checkbox */}
        <View style={styles.confirmationSection}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsConfirmed(!isConfirmed)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: isConfirmed
                    ? colors.primary
                    : colors.surface,
                  borderColor: colors.primary,
                },
              ]}
            >
              {isConfirmed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.confirmationText, { color: colors.text }]}>
              I confirm all the above documents are correct and authorise the
              bank to proceed.
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      <Button
        buttonStyle={{
          marginVertical: hp(3),
        }}
        text="Proceed"
        onPress={handleProceed}
      />

      {/* Signature Capture Modal */}
      <Modal
        visible={signatureVisible}
        animationType="slide"
        onRequestClose={() => setSignatureVisible(false)}
      >
        <View style={styles.signatureModal}>
          <SignatureScreen
            webStyle={`
              .m-signature-pad {
                position: fixed;
                margin: auto;
                top: 0;
                width: 100%;
                height: 100vw;
              }
              body, html {
                position: relative;
              }
            `}
            onClear={() => setSignatureVisible(false)}
            androidHardwareAccelerationDisabled={true}
            onOK={handleSignatureCapture}
            descriptionText="Member Signature"
            penColor="white"
            backgroundColor="black"
            clearText="Clear"
            confirmText="Confirm"
            imageType="image/jpeg"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: hp(5),
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
      marginBottom: hp(1.5),
    },
    signatureContainer: {
      height: hp(20),
      borderWidth: 1,
      borderRadius: wp(2),
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    signatureImage: {
      width: '100%',
      height: '100%',
      borderRadius: wp(2),
    },
    signaturePlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    signatureIcon: {
      fontSize: hp(4),
      marginBottom: hp(1),
    },
    placeholderText: {
      fontSize: hp(1.6),
      textAlign: 'center',
    },
    pictureContainer: {
      borderRadius: wp(2),
      padding: wp(4),
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    memberPicture: {
      width: wp(40),
      height: wp(40),
      borderRadius: wp(2),
      borderWidth: 2,
      borderColor: '#808080',
    },
    pictureLabel: {
      fontSize: hp(2.4),
      marginTop: hp(1),
      fontWeight: '800',
    },
    centeredContainer: {
      alignItems: 'center',
    },
    pictureWithIconContainer: {
      position: 'relative',
    },
    cameraIconContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      //backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: wp(2),
    },
    confirmationSection: {
      marginTop: hp(2),
      marginBottom: hp(3),
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    checkbox: {
      width: wp(5),
      height: wp(5),
      borderWidth: 2,
      borderRadius: wp(1),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: wp(3),
      marginTop: hp(0.2),
    },
    checkmark: {
      color: 'white',
      fontSize: hp(1.4),
      fontWeight: 'bold',
    },
    confirmationText: {
      fontSize: hp(1.6),
      lineHeight: hp(2.2),
      flex: 1,
    },
    buttonContainer: {
      paddingHorizontal: wp(4),
      paddingBottom: hp(2),
    },
    proceedButton: {
      borderRadius: wp(2),
      paddingVertical: hp(2),
      alignItems: 'center',
    },
    signatureModal: {
      flex: 1,
      backgroundColor: '#000',
    },
  });

export default React.memo(DocumentHolderVerification);
