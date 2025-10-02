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
import Header from '@src/common/components/Header';
import Loader from '@src/common/components/Loader';
import { idpInstance, instance } from '@src/services';
import { logAlert, logErr } from '@src/common/utils/logger';
import axios from 'axios';
import { idpExtract } from '@src/common/utils/idp';
import TextInputComponent from '@src/common/components/TextInputComponent';
import MobileNumberInputComponent from '@src/common/components/MobileNumberComponent';

const NoCustomer = () => {
  useHideBottomBar();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [doc, setDoc] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    try {
      setLoading(true);
      const response = await instance.post('/api/v1/loans/customer/create', {
        aadhaarNumber: '5623 4567 8123',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        mobileNumber: '9999999999',
        email: 'john.doe@test.com',
        gender: 'MALE',
        address: '123, Sample Street, Test City',
      });

      if (response?.status == 200) {
        navigation.navigate('KycProcess');
      }
      console.log(response);
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

      <Header
        title="Customer Doesn't Exist"
        subTitle="No existing account found in our system"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Extracted from aadhar
            </Text>
          </View>
          <View style={{}}>
            <TextInputComponent
              header="First Name"
              value={'John'}
              //inputStyles={{ width: '48%' }}
              onChange={() => { }}
              isEditable={false}
            />
            <TextInputComponent
              header="Last Name"
              value={'Doe'}
              //inputStyles={{ width: '48%' }}
              onChange={() => { }}
              isEditable={false}
            />
          </View>
          <TextInputComponent
            header="Date of Birth"
            value={'1990-01-01'}
            onChange={() => { }}
            isEditable={false}
          />
          <TextInputComponent
            header="Gender"
            value={'MALE'}
            onChange={() => { }}
            isEditable={false}
          />
          <TextInputComponent
            header="Aadhaar Number"
            value={'XXXX XXXX 1234'}
            onChange={() => { }}
            isEditable={false}
          />
          <TextInputComponent
            header="Email"
            value={'john.doe@test.com'}
            onChange={() => { }}
            isEditable={false}
          />
          <TextInputComponent
            header="Address"
            value={'123, Sample Street, Test City'}
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
          </View>
        </View>
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

export default NoCustomer;
