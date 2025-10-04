import React, { useState } from 'react';
import { useTheme } from '@src/common/utils/ThemeContext';
import { StyleSheet, View, Text, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@src/common/components/Header';
import KeyboardAwareScrollView from '@src/common/components/KeyboardAwareScrollView';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import DropdownWithModal from '@src/common/components/DropdownWithModalValues';
import TextInputComponent from '@src/common/components/TextInputComponent';
import DocumentUpload from '@src/common/components/DocumentUpload';
import { useDispatch, useSelector } from 'react-redux';
import { setState } from '@src/store/customer';
import { logAlert, logErr } from '@src/common/utils/logger';
import { useNavigation } from '@react-navigation/native';
import { instance } from '@src/services';
import Button from '@src/common/components/Button';

const Fatca = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const dispatch = useDispatch();
  const fatca = useSelector((state: any) => state.customer.fatca);
  const [loading, setLoading] = useState(false);
  const [clicked, setClicked] = useState(false);
  const custData = useSelector((state: any) => state.customer);

  // SSN validation regex
  const SSN_REGEX = /^\d{3}-?\d{2}-?\d{4}$/;

  // Initialize FATCA data if it doesn't exist
  React.useEffect(() => {
    if (!fatca) {
      dispatch(
        setState({
          fatca: {
            isGreenCardHolder: false,
            isGranteePOA: false,
            hasStandingInstructIncome: false,
            isDisclosureTaxResidency: false,
            fatcaCountry1Key: '',
            fatcaCountry1Desc: '',
            fatcaCountry2Key: '',
            fatcaCountry2Desc: '',
            ssnNo1: '',
            ssnNo2: '',
            documentType: '',
            fatcaDocument: [],
            referenceLetter: [],
          },
        }),
      );
    }
  }, [fatca, dispatch]);

  const updateFatcaData = (data: any) => {
    dispatch(setState({ fatca: { ...fatca, ...data } }));
  };

  const formatSSN = (ssn: string) => {
    // Remove any non-digit characters
    const cleaned = ssn?.replace(/\D/g, '').slice(0, 11);

    // Split into parts for formatting
    const part1 = cleaned.substring(0, 3);
    const part2 = cleaned.substring(3, 5);
    const part3 = cleaned.substring(5, 9);

    if (cleaned.length > 5) {
      return `${part1}-${part2}-${part3}`;
    } else if (cleaned.length > 3) {
      return `${part1}-${part2}`;
    } else {
      return part1;
    }
  };

  const handleSsnChange = (value: string, key: string) => {
    const formattedSSN = formatSSN(value);
    updateFatcaData({
      ssnNo1: formattedSSN,
    });
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      const { data } = await instance.post(
        'api/v1/loans/customer/fatca-declaration',
        {
          customerId: custData.customerId,
          isUsResidentOrGreenCardHolder: fatca?.isGreenCardHolder,
          isGranteeOrPoaWithUsAddress: fatca?.isGranteePOA,
          hasStandingInstructionToUsAccount: fatca?.hasStandingInstructIncome,
          isPersonSubjectToTaxResidency: fatca?.isDisclosureTaxResidency,
          country1TaxResidency: fatca?.fatcaCountry1Key,
          country1Tin: fatca?.ssnNo1,
          country2TaxResidency: fatca?.fatcaCountry2Key,
          country2Tin: fatca?.ssnNo2,
        },
      );

      console.log(data, 'data');
      navigation.navigate('DocumentHolderVerification');
    } catch (error) {
      console.log(error, 'error');
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Header title="Fatca" subTitle="Fatca" />
      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.switchLabels}>
              Are you a U.S Resident or Green Card Holder?
            </Text>
            <Switch
              trackColor={{ false: '#DADADA', true: '#FEB449' }}
              thumbColor={fatca?.isGreenCardHolder ? '#E3781C' : 'white'}
              onValueChange={value =>
                updateFatcaData({
                  isGreenCardHolder: value,
                })
              }
              value={fatca?.isGreenCardHolder || false}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.switchLabels}>
              Are you a Grantee or Power of Attorney holder or an Authorized
              Signatory with a U.S Address?
            </Text>
            <Switch
              trackColor={{ false: '#DADADA', true: '#FEB449' }}
              thumbColor={fatca?.isGranteePOA ? '#E3781C' : 'white'}
              onValueChange={value =>
                updateFatcaData({
                  isGranteePOA: value,
                })
              }
              value={fatca?.isGranteePOA || false}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.switchLabels}>
              Are you giving standing instruction for the transfer of dividend
              income/regular income to a U.S Account?
            </Text>
            <Switch
              trackColor={{ false: '#DADADA', true: '#FEB449' }}
              thumbColor={
                fatca?.hasStandingInstructIncome ? '#E3781C' : 'white'
              }
              onValueChange={value =>
                updateFatcaData({
                  hasStandingInstructIncome: value,
                })
              }
              value={fatca?.hasStandingInstructIncome || false}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text style={styles.switchLabels}>
              Are you person who must comply with disclosure requirement of Tax
              Residency?
            </Text>
            <Switch
              trackColor={{ false: '#DADADA', true: '#FEB449' }}
              thumbColor={fatca?.isDisclosureTaxResidency ? '#E3781C' : 'white'}
              onValueChange={value =>
                updateFatcaData({
                  isDisclosureTaxResidency: value,
                })
              }
              value={fatca?.isDisclosureTaxResidency || false}
            />
          </View>

          <View style={styles.column}>
            <DropdownWithModal
              passIdAndDesc
              value={fatca?.fatcaCountry1Desc}
              required={
                fatca?.isGreenCardHolder ||
                fatca?.isGranteePOA ||
                fatca?.hasStandingInstructIncome ||
                fatca?.isDisclosureTaxResidency
              }
              setValue={(id: string, desc?: string) => {
                updateFatcaData({
                  fatcaCountry1Key: id,
                  fatcaCountry1Desc: desc,
                });
              }}
              placeholder={`Select Citizenship`}
              label={'Citizenship'}
              header={'Citizenship'}
              type={'nationality'}
            />
          </View>

          <View style={styles.column}>
            <TextInputComponent
              value={fatca?.ssnNo1}
              keyboardType="numeric"
              maxLength={11}
              placeholder="SSN/ITIN"
              header="SSN/ITIN"
              required={fatca?.fatcaCountry1Key == 'US' ? true : false}
              submitClicked={clicked}
              missingField={
                fatca?.fatcaCountry1Key == 'US' &&
                (!fatca?.ssnNo1 || !SSN_REGEX.test(fatca?.ssnNo1))
              }
              //isEditable={fatca?.fatcaCountry1Key ? true : false}
              onChange={(val: string) => {
                handleSsnChange(val, 'ssnNo');
              }}
            />
          </View>
        </>
      </KeyboardAwareScrollView>
      <Button
        text="Continue"
        onPress={handleContinue}
        buttonStyle={{
          marginVertical: hp(2.5),
        }}
        disabled={loading}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    switchLabels: {
      width: '85%',
      color: colors.text,
      fontWeight: '500',
      fontSize: wp(4),
    },
    column: {
      marginVertical: wp(2),
    },
  });

export default Fatca;
