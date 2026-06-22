import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import KeyboardAwareScrollView from "@src/common/LoanComponents/KeyboardAwareScrollView";
import React, { useEffect, useRef, useState } from "react";
import useHideBottomBar from "@src/components/useHideBottomBar";

import { useNavigation } from "@react-navigation/native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import Button from "@src/components/Button";
import Loader from "@src/common/components/Loader";
import { DROPDOWNS, loanInstance } from "@src/services";
import { logAlert, logErr, logSuccess } from "@src/common/utils/logger";

import { useDispatch, useSelector } from "react-redux";
import { setState } from "@src/store/customer";
import { TextInputComponent } from "@src/common";
import DropdownWithModal from "@src/common/components/DropdownWithModal";
import MobileNumberInputComponent from "@src/common/components/MobileNumberComponent";

import Header from "@src/common/LoanComponents/Header";
import CurrencyInputField from "@src/components/CurrencyInputField";
import PdfViewer from "@src/common/components/PdfViewer";
import LottieView from "lottie-react-native";
import { scale } from "react-native-size-matters";

const Customer = () => {
  useHideBottomBar();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const focusedViewRef = useRef<View | null>(null);
  const loanAmountRef = useRef<View>(null);
  const tenorRowRef = useRef<View>(null);
  const moratoriumRowRef = useRef<View>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const scrollToFocused = () => {
    if (!focusedViewRef.current || !scrollViewRef.current) return;
    focusedViewRef.current.measureLayout(
      scrollViewRef.current as any,
      (_x, y) => { scrollViewRef.current?.scrollTo({ y: y - hp(10), animated: true }); },
      () => {}
    );
  };

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
      scrollToFocused();
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState(1);
  const dispatch = useDispatch();
  const custData = useSelector((state: any) => state.customer);
  const [animationLoading, setAnimationLoading] = useState(false);
  const [amortisationSheetVisible, setAmortisationSheetVisible] =
    useState(false);
  const {
    loanPurpose,
    promotions,
    name,
    isdCode,
    isdDescription,
    mobileNumber,
    email,
    loanAmount,
    loanTenor,
    tenorDuration,
    moratorium,
    tentativeInterestRate,
    monthlyEMI,
    principalAmount,
    totalInterest,
    totalAmountPayable,
    employmentType,
  } = custData;

  const calculateEMI = async () => {
    // Validate required fields
    if (!name || name.trim() === "") {
      return logAlert("Please enter Name");
    }

    if (!loanPurpose) {
      return logAlert("Please select Purpose of Loan");
    }

    if (!employmentType) {
      return logAlert("Please select Employment Type");
    }

    if (!mobileNumber || mobileNumber.trim() === "") {
      return logAlert("Please enter Mobile Number");
    }

    if (!email || email.trim() === "") {
      return logAlert("Please enter Email");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return logAlert("Please enter a valid Email address");
    }

    if (!loanAmount) {
      return logAlert("Please enter Loan Amount");
    }

    // if (!loanTenor) {
    //   logAlert('Please select Loan Tenor');
    // }

    if (!tenorDuration || tenorDuration.trim() === "") {
      return logAlert("Please enter Tenor Duration");
    }

    // Validate tenor duration is a positive number
    if (Number(tenorDuration) <= 0) {
      return logAlert("Tenor Duration must be greater than 0");
    }

    // if (!moratorium) {
    //   return logAlert("Please select Moratorium");
    // }

    if (!tentativeInterestRate || tentativeInterestRate.trim() === "") {
      return logAlert("Please enter Interest Rate");
    }

    // Validate interest rate is a positive number
    if (Number(tentativeInterestRate) <= 0) {
      return logAlert("Interest Rate must be greater than 0");
    }
    if (Number(tentativeInterestRate) > 36) {
      return logAlert("Interest Rate must be less than 36");
    }

    if (Number(moratorium) > 6) {
      return logAlert("Moratorium must be less than 6");
    }

    try {
      setAnimationLoading(true);
      const { data } = await loanInstance.post(
        "api/v1/loans/application/calculate",
        {
          customerName: name,
          mobileIsdKey: isdCode,
          mobileIsdDescription: isdDescription,
          mobileNumber: mobileNumber,
          email: email,
          loanAmount: loanAmount,
          tenureInMonths:
            loanTenor === "Months"
              ? Number(tenorDuration)
              : Number(tenorDuration) * 12,
          interestRate: Number(tentativeInterestRate),
          moratoriumMonths:
            moratorium === "-" ? 0 : Number(moratorium.split(" ")[0]),
          loanType: loanPurpose,
        }
      );

      dispatch(
        setState({
          monthlyEMI: data.responseStructure.data.monthlyEMI,
          principalAmount: data.responseStructure.data.principalAmount,
          totalInterest: data.responseStructure.data.totalInterest,
          totalAmountPayable: data.responseStructure.data.totalAmountPayable,
          loanRequestId: data.responseStructure.data.loanRequestId,
          amortisationSheet: data.responseStructure.data.amortizationSheetPdf,
        })
      );
      setSteps(2);
    } catch (error) {
      console.log(error?.response);
      logErr(error);
    } finally {
      setTimeout(() => setAnimationLoading(false), 3000);
    }
  };

  const handleProceed = async () => {
    try {
      setLoading(true);
      const req = {
          firstName: name.includes(" ") ? name.split(" ")[0] : name,
          lastName: name.includes(" ") ? name.split(" ")[1] : "",
          dateOfBirth: null,
          mobileIsdKey: isdCode,
          mobileIsdDescription: isdDescription,
          employmentType: employmentType,
          mobileNumber: mobileNumber,
          email: email,
          gender: "",
          address: "",
        }
        console.log("Request payload for customer creation:", req);
      const { data: customerData } = await loanInstance.post(
        "/api/v1/loans/customer/create",
        req
      );

      console.log("Customer data:", customerData?.responseStructure?.data);

      const result = customerData?.responseStructure?.data;
      if (customerData?.status == 201) {
        dispatch(
          setState({
            isMember: result?.existingCustomer,
            isTecuMember: result?.isTecuMember,
            customerId: result?.customerId,
            firstName: result?.firstName,
            lastName: result?.lastName,
            dateOfBirth: result?.dateOfBirth,
            gender: result?.gender,
            address: result?.address,
            email: result?.email,
          })
        );

        navigation.navigate("LoanApplication");
      } else {
        dispatch(
          setState({
            isMember: result?.existingCustomer,
            isTecuMember: result?.isTecuMember,
            customerId: result?.customerId,
            firstName: result?.firstName,
            lastName: result?.lastName,
            dateOfBirth: result?.dateOfBirth,
            gender: result?.gender,
            address: result?.address,
            email: result?.email,
          })
        );
        navigation.navigate("LoanApplication");
      }
    } catch (error) {
      console.log("[IDP] Error fetching documents:", error);
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuotation = async () => {
    try {
      setLoading(true);
      const { data } = await loanInstance.post(
        "api/v1/loans/application/send-quotation",
        {
          loanRequestId: custData.loanRequestId,
        }
      );
      logSuccess("Quotation sent successfully");
    } catch (error) {
      console.log(error);
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
      <StatusBar
        translucent={false}
        backgroundColor={colors.background}
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      <Loader loading={loading} />
      <Header
        title={"Loan Application"}
        //showBackButton={steps !== 1}
        onBackPress={() => {
          if (steps == 2) {
            setSteps(1);
          } else navigation.goBack();
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Scrollable Content */}
        <ScrollView
          ref={scrollViewRef}
          style={[styles.content, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: steps == 1 ? hp(14) + insets.bottom : hp(2),
            flexGrow: 1,
            backgroundColor: colors.background,
          }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {animationLoading && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                marginTop: hp(-10),
              }}
            >
              <LottieView
                source={require("@src/common/animation/loading-animation.json")}
                autoPlay
                loop
                resizeMode="cover"
                style={{
                  width: scale(250),
                  height: scale(250),
                  marginBottom: 10,
                }}
              />
              <Text
                style={{
                  color: colors.primary,
                  fontWeight: 800,
                  fontStyle: "italic",
                }}
              >
                Calculating
              </Text>
            </View>
          )}
          {steps == 1 && !animationLoading && (
            <>
              {/* Input Fields Section */}
              <View style={styles.formSection}>
                {/* Name */}
                <TextInputComponent
                  header="Name"
                  placeholder="Enter Name"
                  value={name}
                  onChange={(value) => dispatch(setState({ name: value }))}
                  inputStyles={styles.textInput}
                  required
                />

                {/* Purpose of Loan */}
                <DropdownWithModal
                  options={[
                    { label: "Personal Loan", value: "PERSONAL" },
                    { label: "Home Loan", value: "HOME" },
                    { label: "Vehicle Loan", value: "VEHICLE" },
                    { label: "Education Loan", value: "EDUCATION" },
                    { label: "Unsecured Loan", value: "UNSECURED" },
                  ]}
                  value={loanPurpose}
                  setValue={(value) =>
                    dispatch(setState({ loanPurpose: value }))
                  }
                  placeholder="Select Purpose of Loan"
                  header="Purpose of Loan"
                  label="Purpose of Loan"
                  required
                />

                {/* Promotions */}
                <DropdownWithModal
                  options={[
                    { label: "Christmas Loan", value: "Christmas Loan" },
                    { label: "New Year Special", value: "New Year Special" },
                    { label: "Festival Offer", value: "Festival Offer" },
                    { label: "No Promotion", value: "No Promotion" },
                  ]}
                  value={promotions}
                  setValue={(value) =>
                    dispatch(setState({ promotions: value }))
                  }
                  placeholder="Enter Promotion"
                  header="Promotions"
                  label="Promotions"
                />

                <DropdownWithModal
                  required={true}
                  labelStyle={{ fontSize: hp(1.5) }}
                  setValue={(id, desc) => {
                    dispatch(setState({ employmentType: desc?.toUpperCase() }));
                  }}
                  passIdAndDesc
                  style={{
                    width: "100%",
                  }}
                  type="employmentStatus"
                  value={employmentType}
                  label="Employment Type"
                  header="Employment Type"
                  placeholder="SELECT EMPLOYMENT TYPE"
                  dropdownFetchFunction={DROPDOWNS}
                />

                {/* Mobile Number */}
                <View style={styles.inputContainer}>
                  <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Mobile Number <Text style={{ color: "red" }}>*</Text>
                  </Text>
                  <MobileNumberInputComponent
                    mobileNumber={mobileNumber}
                    isdCode={isdCode}
                    onChangeMobileNumber={(value) =>
                      dispatch(setState({ mobileNumber: value }))
                    }
                    onChangeIsdCode={(code, desc) =>
                      dispatch(
                        setState({
                          isdCode: String(code),
                          isdDescription: desc,
                        })
                      )
                    }
                  />
                </View>

                {/* Email */}
                <TextInputComponent
                  header="Enter mail"
                  placeholder="Enter email"
                  value={email.toLowerCase()}
                  onChange={(value) => dispatch(setState({ email: value }))}
                  keyboardType="email-address"
                  inputStyles={styles.textInput}
                  required
                />

                {/* Custom Loan Amount Input */}
                <View ref={loanAmountRef} collapsable={false} style={{ marginVertical: hp(1) }}>
                  <View style={{ flexDirection: "row", marginBottom: 5 }}>
                    <Text
                      style={{
                        fontSize: hp(1.6),
                        fontWeight: "400",
                        color: colors.text,
                      }}
                    >
                      Loan amount <Text style={{ color: "red" }}>*</Text>
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 5,
                      backgroundColor: colors.inputBackground,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: hp(1.6),
                        color: colors.text,
                        marginRight: 5,
                      }}
                    >
                      $
                    </Text>
                    <TextInput
                      value={loanAmount}
                      onChangeText={(value) =>
                        dispatch(setState({ loanAmount: value }))
                      }
                      onFocus={() => { focusedViewRef.current = loanAmountRef.current; }}
                      placeholder="Enter monthly income"
                      placeholderTextColor={colors.inputPlaceholder}
                      keyboardType="numeric"
                      maxLength={7}
                      style={{
                        flex: 1,
                        fontSize: hp(1.6),
                        color: colors.text,
                        height: hp(6),
                        paddingHorizontal: 0,
                      }}
                    />
                  </View>
                </View>

                {/* Loan Tenor and Tenor Duration Row */}
                <View ref={tenorRowRef} collapsable={false} style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <DropdownWithModal
                      options={[
                        { label: "Months", value: "Months" },
                        { label: "Years", value: "Years" },
                      ]}
                      value={loanTenor}
                      setValue={(value) =>
                        dispatch(setState({ loanTenor: value }))
                      }
                      placeholder="-"
                      header="Loan Tenor"
                      label="Loan Tenor"
                      required
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <TextInputComponent
                      header="Tenor Duration"
                      placeholder="Enter Tenor Duration"
                      value={tenorDuration}
                      maxLength={2}
                      onChange={(value) =>
                        dispatch(setState({ tenorDuration: value }))
                      }
                      onFocus={() => { focusedViewRef.current = tenorRowRef.current; }}
                      inputStyles={{ flex: 1, width: "100%" }}
                      keyboardType="numeric"
                      regex={/^[0-9]*$/}
                      missingField={!tenorDuration}
                      required
                    />
                  </View>
                </View>

                {/* Moratorium and Interest Rate Row */}
                <View ref={moratoriumRowRef} collapsable={false} style={styles.rowContainer}>
                  <View style={styles.halfWidth}>
                    <TextInputComponent
                      header="Moratorium"
                      placeholder="Enter Moratorium"
                      value={moratorium}
                      maxLength={1}
                      onChange={(value) =>
                        dispatch(setState({ moratorium: value }))
                      }
                      onFocus={() => { focusedViewRef.current = moratoriumRowRef.current; }}
                      inputStyles={{ flex: 1, width: "100%" }}
                      keyboardType="numeric"
                      regex={/^[0-9]*$/}
                      missingField={!moratorium}
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <TextInputComponent
                      value={tentativeInterestRate}
                      required
                      caps
                      customStyles={{
                        flex: 1,
                      }}
                      //maxLength={2}
                      onChange={(value) => {
                        dispatch(setState({ tentativeInterestRate: value }));
                      }}
                      placeholder="Enter Interest Rate"
                      header="Interest Rate (Annually)"
                      keyboardType="numeric"
                      onFocus={() => { focusedViewRef.current = moratoriumRowRef.current; }}
                      regex={/^[0-9.]*$/}
                      missingField={!tentativeInterestRate}
                    />
                  </View>
                </View>
              </View>
            </>
          )}

          {steps == 2 && !animationLoading && (
            <>
              <View
                style={{
                  alignItems: "center",
                  marginTop: hp(10),
                  marginBottom: hp(4),
                }}
              >
                <Text style={[styles.emiValue, { color: colors.primary }]}>
                  $ {monthlyEMI || "0"}
                  <Text style={{ fontSize: hp(2), fontWeight: "500" }}>
                    /Monthly EMI
                  </Text>
                </Text>
              </View>
              <View
                style={[
                  styles.loanBreakdown,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.textSecondary,
                  },
                ]}
              >
                <Text style={[styles.breakdownTitle, { color: colors.text }]}>
                  Loan Breakdown
                </Text>

                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                    Principal Amount
                  </Text>

                  <Text style={[styles.breakdownValue, { color: colors.text }]}>
                    $ {principalAmount || "0.00"}
                  </Text>
                </View>

                <View style={styles.breakdownRow}>
                  <Text style={[styles.breakdownLabel, { color: colors.text }]}>
                    Total Interest
                  </Text>

                  <Text style={[styles.breakdownValue, { color: colors.text }]}>
                    $ {totalInterest || "0.00"}
                  </Text>
                </View>

                <View
                  style={{
                    borderColor: "grey",
                    borderWidth: 0.3,
                    marginVertical: hp(0.8),
                  }}
                ></View>

                <View style={styles.breakdownRow}>
                  <Text
                    style={[
                      styles.breakdownLabel,
                      {
                        color: colors.text,
                        fontWeight: "bold",
                        marginTop: hp(0.1),
                      },
                    ]}
                  >
                    Total Amount Payable
                  </Text>

                  <Text
                    style={[
                      styles.breakdownValue,
                      { color: colors.text, fontWeight: "bold" },
                    ]}
                  >
                    $ {totalAmountPayable || "0.00"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    //logAlert("To be Implemented");
                  }}
                >
                  {custData.amortisationSheet && (
                    <>
                      <TouchableOpacity
                        onPress={() => setAmortisationSheetVisible(true)}
                      >
                        <Text
                          style={{ textAlign: "center", color: colors.primary }}
                        >
                          View Amortisation Sheet
                        </Text>
                      </TouchableOpacity>
                      <PdfViewer
                        visible={amortisationSheetVisible}
                        setVisible={setAmortisationSheetVisible}
                        pdfBase64={custData.amortisationSheet}
                        header="Amortisation Sheet"
                        downloadAllowed={false}
                        deleteAllowed={false}
                        onDelete={() => {}}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <View style={styles.calculateButtonContainer}>
                <Button
                  text="Send Quotation"
                  click={handleSendQuotation}
                  buttonStyle={styles.sendQuotationButton}
                  textStyle={styles.sendQuotationText}
                />

                <Button text="Proceed" click={handleProceed} />
              </View>
            </>
          )}
        </ScrollView>

        {/* Fixed Button at Bottom - Only visible in step 1 */}
        {steps == 1 && !animationLoading && !keyboardVisible && (
          <View style={[styles.fixedButtonContainer, { paddingBottom: insets.bottom || hp(2) }]}>
            <Button
              text="Calculate Monthly EMI"
              click={calculateEMI}
              disabled={
                !name ||
                name.trim() === "" ||
                !loanPurpose ||
                !employmentType ||
                !mobileNumber ||
                mobileNumber.trim() === "" ||
                !email ||
                email.trim() === "" ||
                !loanAmount ||
                !tenorDuration ||
                tenorDuration.trim() === "" ||
                !tentativeInterestRate ||
                tentativeInterestRate.trim() === ""
                  ? true
                  : false
              }
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const InfoItem = ({ text, colors }: { text: string; colors: any }) => (
  <View style={styles.infoItem}>
    <View style={[styles.bullet, { backgroundColor: colors.text }]} />
    <Text style={[styles.infoText, { color: colors.text }]}>{text}</Text>
  </View>
);

export default Customer;

const styles = StyleSheet.create({
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
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

const createStyles = (colors: any, isDark: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      //backgroundColor: '#FFFFFF',
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: wp(4),
      paddingTop: hp(5),
      paddingBottom: hp(1),
    },
    backButton: {
      marginRight: wp(4),
      marginTop: hp(0.5),
    },
    backIcon: {
      fontSize: hp(3),
      fontWeight: "bold",
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: hp(2.8),
      fontWeight: "bold",
      marginBottom: hp(0.5),
      color: "#333333",
    },
    headerSubtitle: {
      fontSize: hp(1.6),
      lineHeight: hp(2.2),
      color: "#666666",
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    formSection: {
      marginTop: hp(2),
      rowGap: hp(1),
    },
    inputContainer: {
      marginBottom: hp(2),
    },
    fieldLabel: {
      fontSize: hp(1.8),
      //fontWeight: '500',
      marginBottom: hp(1),
      //color: '#333333',
    },
    inputField: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: wp(4),
      paddingVertical: hp(1.5),
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: "#FFFFFF",
    },
    inputText: {
      fontSize: hp(1.6),
      color: "#333333",
    },
    dropdownIcon: {
      alignItems: "center",
    },
    dropdownArrow: {
      fontSize: hp(1.2),
      lineHeight: hp(1),
    },
    textInput: {
      fontSize: hp(1.6),
    },
    rowContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: hp(2),
      gap: wp(3),
    },
    halfWidth: {
      flex: 1,
    },
    interestRateField: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#E0E0E0",
      borderRadius: 8,
      backgroundColor: "#FFFFFF",
      paddingHorizontal: wp(3),
      paddingVertical: hp(1.5),
    },
    calculateButtonContainer: {
      marginVertical: hp(2),
      rowGap: hp(1.5),
    },
    emiDisplayContainer: {
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: 8,
      padding: wp(4),
      marginBottom: hp(3),
      alignItems: "center",
    },
    emiLabel: {
      fontSize: hp(1.4),
      color: "#666666",
      marginBottom: hp(0.5),
    },
    emiValue: {
      fontSize: hp(3.8),
      fontWeight: "700",
    },
    summaryCards: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: hp(3),
      marginBottom: hp(3),
      gap: wp(3),
    },
    summaryCardContainer: {
      flex: 1,
      padding: wp(4),
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#F3F1FF",
      backgroundColor: "#F3F1FF",
      alignItems: "center",
    },
    interestRateContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: hp(0.5),
    },
    summaryCard: {
      flex: 1,
      padding: wp(4),
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
    },
    interestRateInput: {
      borderColor: "#6C4FF7",
      borderWidth: 0,
      paddingHorizontal: wp(3),
      borderRadius: 8,
      fontSize: hp(2.2),
      backgroundColor: "#FFFFFF",
      height: hp(6),
      textAlign: "center",
      fontWeight: "bold",
      color: "#6C4FF7",
      marginRight: wp(2),
      width: wp(25),
    },
    percentageSymbol: {
      fontSize: hp(2.2),
      fontWeight: "bold",
    },
    summaryLabel: {
      fontSize: hp(1.4),
      color: "#666666",
      marginBottom: hp(0.5),
    },
    summaryValue: {
      fontSize: hp(2.2),
      fontWeight: "bold",
    },
    loanBreakdown: {
      borderRadius: 8,
      borderWidth: 1,
      padding: wp(4),
      marginBottom: hp(3),
    },
    breakdownTitle: {
      fontSize: hp(2),
      fontWeight: "bold",
      marginBottom: hp(2),
      color: "#333333",
    },
    breakdownRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp(1.5),
    },
    breakdownLabel: {
      fontSize: hp(1.6),
      color: "#333333",
      flex: 1,
    },
    dottedLine: {
      flex: 1,
      height: 1,
      backgroundColor: "#BFBFBF",
      marginHorizontal: wp(2),
    },
    breakdownValue: {
      fontSize: hp(1.6),
      fontWeight: "500",
      color: "#333333",
    },
    buttonContainer: {
      //paddingHorizontal: wp(4),
      paddingBottom: hp(2),
      gap: hp(1),
    },
    sendQuotationButton: {
      borderRadius: 8,
      borderWidth: 1,
      paddingVertical: hp(1.5),
      alignItems: "center",
      backgroundColor: "#FFFFFF",
      borderColor: colors.primary,
    },
    sendQuotationText: {
      fontSize: hp(1.8),
      fontWeight: "500",
      color: colors.primary,
    },
    background: {
      ...StyleSheet.absoluteFillObject,
      //zIndex: 1, // << important
      opacity: 1,
    },
    fixedButtonContainer: {
      backgroundColor: colors.background,
      paddingHorizontal: wp(4),
      paddingTop: hp(2),
    },
  });
