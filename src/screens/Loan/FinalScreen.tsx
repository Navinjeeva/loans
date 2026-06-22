import { finalSuccess, pdf } from "@src/common/assets";
import Header from "@src/common/LoanComponents/Header";
import { useTheme } from "@src/common/ThemeContext";
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { resetState } from "@src/store/customer";
import { resetState as resetLoansState } from "@src/store/loans";
import { logAlert, PdfViewer } from "@src/common";
import { useState } from "react";
import { downloadButton } from "@src/components/images";

const FinalScreen = () => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const navigation = useNavigation();
  const custData = useSelector((state: any) => state.customer);
  const dispatch = useDispatch();
  const [pdfVisible, setPdfVisible] = useState(false);

  const finalScreenData = custData.finalScreen || {};

  const applicationDetails = [
    { label: "Member Name", value: finalScreenData.memberName || "" },
    { label: "Loan ID", value: finalScreenData.loanId || "" },
    { label: "Loan Type", value: finalScreenData.loanType || "" },
    {
      label: "Loan Amount",
      value: finalScreenData.loanAmount
        ? `$ ${finalScreenData.loanAmount}`
        : "",
    },
    {
      label: "Tentative EMI",
      value: `$ ${finalScreenData.tentativeEmi}` || "",
    },
    {
      label: "Installment Start Date",
      value: finalScreenData.installmentStartDate || "",
    },
    { label: "Maturity Date", value: finalScreenData.maturityDate || "" },
    {
      label: "Tenure in Months",
      value: finalScreenData.tenureInMonths || "",
    },
  ].filter((detail) => detail.value !== "ed"); // Only show details that have values

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header
        title="Application Submitted"
        onBackPress={() =>
          logAlert(
            "Are you sure you want to go to home?",
            () => {
              dispatch(resetState());
              dispatch(resetLoansState());
              navigation.reset({
                index: 0,
                routes: [{ name: "LoanCustomer" as never }],
              });
            },
            () => {},
          )
        }
      />

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
        <PdfViewer
          visible={pdfVisible}
          setVisible={setPdfVisible}
          pdfBase64={custData.finalScreen.loanApplicationPdf}
          header="Amortisation Sheet"
          downloadAllowed={true}
          deleteAllowed={false}
          onDelete={() => {}}
        />
        <Text
          style={{
            color: "black",
            textAlign: "left",
            fontSize: hp(2),
            fontWeight: "bold",
            width: "100%",
            marginLeft: hp(2),
            marginVertical: hp(1),
          }}
        >
          Application PDF
        </Text>
        <TouchableOpacity
          onPress={() => setPdfVisible(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#F5F1FF", // light purple
            borderWidth: 1,
            borderColor: "#7B61FF", // purple border
            borderRadius: 10,
            paddingHorizontal: wp(4),
            paddingVertical: hp(1.5),
            width: wp(90),
          }}
        >
          {/* Left Side - PDF Icon */}
          <Image
            source={pdf}
            style={{
              height: hp(4),
              width: hp(4),
              resizeMode: "contain",
            }}
          />

          {/* Middle - File info */}
          <View style={{ flex: 1, marginLeft: wp(3) }}>
            <Text
              style={{
                color: "#000",
                fontSize: hp(2),
                fontWeight: "600",
              }}
              numberOfLines={1}
            >
              Loan Application
            </Text>
            <Text>698 KB</Text>
          </View>

          {/* Right Side - Download Button */}
          <TouchableOpacity onPress={() => {}}>
            <Image
              source={downloadButton}
              style={{
                height: hp(3),
                width: hp(3),
                resizeMode: "contain",
                tintColor: "#000",
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>

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
          onPress={() => {
            dispatch(resetState());
            dispatch(resetLoansState());
            navigation.reset({
              index: 0,
              routes: [{ name: "LoanCustomer" as never }],
            });
          }}
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
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
      alignItems: "center",
    },
    successIcon: {
      width: wp(20),
      height: wp(20),
      marginTop: hp(4),
    },
    statusContainer: {
      alignItems: "center",
    },
    statusTitle: {
      fontSize: hp(2.8),
      fontWeight: "bold",
      marginBottom: hp(1),
      color: colors.text,
    },
    statusSubtitle: {
      fontSize: hp(1.6),
      color: colors.textSecondary,
      marginBottom: hp(2),
    },
    detailsCard: {
      borderRadius: wp(3),
      padding: wp(4),
      marginBottom: hp(4),
      width: "100%",
      marginTop: hp(4),
      borderColor: colors.border,
      borderWidth: 1,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: hp(1),
    },
    detailLabel: {
      fontSize: hp(1.6),
      flex: 1,
      color: colors.textSecondary,
    },
    detailValue: {
      fontSize: hp(1.6),
      fontWeight: "500",
      textAlign: "right",
      flex: 1,
      color: colors.text,
    },
    backToHomeButton: {
      borderRadius: wp(2),
      paddingVertical: hp(1.8),
      paddingHorizontal: wp(8),
      width: "100%",
      alignItems: "center",
      marginBottom: hp(2),
      backgroundColor: colors.primary,
    },
    backToHomeText: {
      fontSize: hp(1.8),
      fontWeight: "bold",
      color: colors.buttonText,
      textAlign: "center",
    },
  });
