import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import useHideBottomBar from '@src/common/components/useHideBottomBar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DocumentUpload from '@src/common/components/DocumentUpload';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTheme } from '@src/common/utils/ThemeContext';
import Button from '@src/common/components/Button';
import Loader from '@src/common/components/Loader';
import { idpInstance, instance } from '@src/services';
import { logAlert, logErr } from '@src/common/utils/logger';
import axios from 'axios';
import { idpExtract } from '@src/common/utils/idp';
import TextInputComponent from '@src/common/components/TextInputComponent';
import MobileNumberInputComponent from '@src/common/components/MobileNumberComponent';
import { useDispatch, useSelector } from 'react-redux';
import { setState } from '@src/store/customer';

const kycProcess = () => {
  useHideBottomBar();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const custData = useSelector((state: any) => state.customer);

  const handleProceed = async () => {
    try {
      setLoading(true);
    } catch (error) {
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Loader loading={loading} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backIcon, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Digital KYC Process
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            Documents For New Customer
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <DocumentUpload
          header="Aadhaar Card"
          limit={1}
          images={custData.aadhaarCard}
          setImages={async image => {
            try {
              setLoading(true);

              if (image.length == 0) {
                dispatch(
                  setState({
                    aadhaarCard: [],
                  }),
                );
              }

              let updatedDocuments = [];
              const documentName = 'PROFF' + image[0]?.type.split('/')[1];

              updatedDocuments = [
                {
                  name: documentName,
                  uri: image[0].uri,
                  type: image[0].type,
                },
              ];

              //const response = await idpExtract(image);
              dispatch(
                setState({
                  aadhaarCard: updatedDocuments,
                }),
              );

              //console.log(response, 'ib9hui');
            } catch (error) {
              console.log(error?.response);
              logErr(error);
            } finally {
              setLoading(false);
            }
          }}
        />
        <DocumentUpload
          header="Pan Card"
          limit={1}
          images={custData.panCard}
          setImages={async image => {
            try {
              setLoading(true);

              if (image.length == 0) {
                dispatch(
                  setState({
                    panCard: [],
                  }),
                );
              }

              let updatedDocuments = [];
              const documentName = 'PROFF' + image[0]?.type.split('/')[1];

              updatedDocuments = [
                {
                  name: documentName,
                  uri: image[0].uri,
                  type: image[0].type,
                },
              ];

              //const response = await idpExtract(image);
              dispatch(
                setState({
                  panCard: updatedDocuments,
                }),
              );

              //console.log(response, 'ib9hui');
            } catch (error) {
              console.log(error?.response);
              logErr(error);
            } finally {
              setLoading(false);
            }
          }}
        />
      </ScrollView>

      <Button
        buttonStyle={{
          marginVertical: hp(2.5),
        }}
        text="Proceed to Digital KYC"
        onPress={handleProceed}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: wp(1),
  },
  bullet: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
    marginRight: wp(3),
    marginTop: hp(0.8),
  },
  infoText: {
    fontSize: hp(1.6),
    flex: 1,
    lineHeight: hp(2.2),
  },
});

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
  });

export default kycProcess;
