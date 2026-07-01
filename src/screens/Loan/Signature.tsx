import { useNavigation, useRoute } from "@react-navigation/native";
import Button from "@src/components/Button";
import Loader from "@src/common/components/Loader";
import KeyboardAwareScrollView from "@src/common/LoanComponents/KeyboardAwareScrollView";
import { useTheme } from "@src/common/ThemeContext";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import Header from "@src/common/LoanComponents/Header";
import { useDispatch, useSelector } from "react-redux";
import { logAlert, logErr } from "@src/common/utils/logger";
import instance, {
  loanDocumentInstance,
  loanInstance,
  idpInstance,
  loanIdpInstance,
} from "@src/services";
import { formDataFileFormer } from "@src/common/utils/string";
import { setState } from "@src/store/customer";
import RNFS from "react-native-fs";
import { LoanDetailView } from "./DocumentHolderVerification";

const Signature = () => {
  const { colors, isDark } = useTheme();
  const { signatureImage, memberPicture } = useRoute().params as any;
  const styles = createStyles(colors, isDark);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const [fetchedImageSign, setFetchedImageSign] = useState<string | null>(null);
  const [fetchedImagePicture, setFetchedImagePicture] = useState<string | null>(
    null
  );
  const [capturedImage, setCapturedImage] = useState(null);
  const [signatureVisible, setSignatureVisible] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const [signaturePercentage, setSignaturePercentage] = useState<number | null>(
    null
  );
  const [picturePercentage, setPicturePercentage] = useState<number | null>(
    null
  );
  const custData = useSelector((state: any) => state.customer);
  const dispatch = useDispatch();

  const formatBase64Image = (base64Data: string): string => {
    if (!base64Data) return "";

    if (base64Data.startsWith("data:image")) {
      return base64Data;
    }

    return `data:image/jpeg;base64,${base64Data}`;
  };

  const saveBase64ToFile = async (
    base64String: any,
    fileName = "temp-signature.png"
  ) => {
    if (!base64String) {
      console.error("No base64String provided!");
      return;
    }

    const path = `${RNFS.TemporaryDirectoryPath}/${fileName}`;

    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");

    try {
      await RNFS.writeFile(path, base64Data, "base64");
      const filePath = "file://" + path;
      return filePath;
    } catch (err) {
      console.error("writeFile error:", err);
      throw err;
    }
  };

  const compareSignature = async (signature: string) => {
    if (!fetchedImageSign) {
      return;
    }
    try {
      setLoading(true);

      let formData = new FormData();

      const fileUri = await saveBase64ToFile(
        fetchedImageSign,
        "server-signature.png"
      );
      const actualSignature = await saveBase64ToFile(
        signature,
        "user-signature.png"
      );

      formData.append("documents", {
        uri: fileUri,
        name: "server-signature.png",
        type: "image/png",
      });

      formData.append("documents", {
        uri: actualSignature,
        name: "user-signature.png",
        type: "image/png",
      });

      const { data: resData } = await loanIdpInstance.post(
        "/api/v1/comparison/signature",
        formData
      );

      console.log("Signature comparison response:", resData);

      // Handle different possible response structures
      const confidence =
        resData?.data?.confidence ||
        resData?.["i-body"]?.["Match-Confidence"] ||
        resData?.confidence ||
        0;

      setSignaturePercentage(confidence);
    } catch (error: any) {
      //logErr(error);
      console.log("Error comparing signature:", error?.response || error);

      // Handle network errors gracefully
      if (!error.response) {
        console.log(
          "Network error: Unable to connect to signature comparison service"
        );
        // logAlert(
        //   "Unable to connect to signature comparison service. Please check your network connection."
        // );
      } else {
        console.log(
          "Signature comparison error:",
          error.response?.data || error.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const comparePicture = async (picture: string) => {
    if (!fetchedImagePicture) {
      return;
    }
    try {
      setLoading(true);

      let formData = new FormData();

      formData.append("documents", {
        uri: fetchedImagePicture,
        name: "server-picture.png",
        type: "image/png",
      });

      formData.append("documents", {
        uri: picture,
        name: "user-picture.png",
        type: "image/png",
      });

      const { data: resData } = await loanIdpInstance.post(
        "/api/v1/comparison/face",
        formData
      );

      console.log("Picture comparison response:", resData);

      // Handle different possible response structures
      const confidence =
        resData?.metadata?.confidence ||
        resData?.data?.["i-body"]?.["Match-Confidence"] ||
        resData?.["i-body"]?.["Match-Confidence"] ||
        resData?.confidence ||
        0;

      if (resData?.profile_match?.error) {
        //logErr(resData.profile_match.error);
      }

      setPicturePercentage(confidence);
    } catch (error: any) {
      //logErr(error);
      console.log("Error comparing picture:", error?.response || error);

      // Handle network errors gracefully
      if (!error.response) {
        console.log(
          "Network error: Unable to connect to face comparison service"
        );
        // logAlert(
        //   "Unable to connect to face comparison service. Please check your network connection."
        // );
      } else {
        console.log(
          "Picture comparison error:",
          error.response?.data || error.message
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (custData.isMember && !custData.isTecuMember) {
      (async () => {
        try {
          setLoading(true);
          const { data } = await loanDocumentInstance.get(
            `/api/v1/documents/customer/personal/${custData.customerId}`
          );

          const pictureData = data.responseStructure.data.picture.documentFile;
          const signatureData =
            data.responseStructure.data.signature.documentFile;

          const pictureBase64 = pictureData
            ? formatBase64Image(pictureData)
            : null;
          const signatureBase64 = signatureData
            ? formatBase64Image(signatureData)
            : null;

          setFetchedImageSign(signatureBase64);
          setFetchedImagePicture(pictureBase64);
          await compareSignature(signatureImage);
          await comparePicture(memberPicture);
        } catch (error) {
          //logErr(error);
          console.error("Error fetching images:", error);
        } finally {
          setLoading(false);
        }
      })();
    } else if (custData.isMember && custData.isTecuMember) {
      setFetchedImageSign(custData.signatureImage[0]?.uri);
      setFetchedImagePicture(custData.memberPicture[0]?.uri);
    }
  }, []);

  const uploadDocuments = async (loanId: string) => {
    try {
      const formData = new FormData();
      let totalFiles = 0;

      // Upload Personal Documents
      for (
        let docIndex = 0;
        docIndex < (custData.personalDocuments?.length || 0);
        docIndex++
      ) {
        const personalDoc = custData.personalDocuments[docIndex];
        if (personalDoc?.doc && personalDoc.doc.length > 0) {
          for (
            let imgIndex = 0;
            imgIndex < personalDoc.doc.length;
            imgIndex++
          ) {
            const document = personalDoc.doc[imgIndex];
            const fileName =
              document.fileName ||
              `PERSONAL-${docIndex + 1}-${imgIndex + 1}.${
                document.type?.split("/")[1] || "jpg"
              }`;

            formData.append("files", {
              uri: document.uri,
              type: document.type || "image/jpeg",
              name: fileName,
            } as any);
            totalFiles++;
          }
        }
      }

      // Upload Linked Entities Documents
      for (
        let docIndex = 0;
        docIndex < (custData.linkedEntitiesDocuments?.length || 0);
        docIndex++
      ) {
        const linkedDoc = custData.linkedEntitiesDocuments[docIndex];
        if (linkedDoc?.doc && linkedDoc.doc.length > 0) {
          for (let imgIndex = 0; imgIndex < linkedDoc.doc.length; imgIndex++) {
            const document = linkedDoc.doc[imgIndex];
            const fileName =
              document.fileName ||
              `LINKED-${docIndex + 1}-${imgIndex + 1}.${
                document.type?.split("/")[1] || "jpg"
              }`;

            formData.append("files", {
              uri: document.uri,
              type: document.type || "image/jpeg",
              name: fileName,
            } as any);
            totalFiles++;
          }
        }
      }

      // Upload Bank Documents
      for (
        let docIndex = 0;
        docIndex < (custData.bankDocuments?.length || 0);
        docIndex++
      ) {
        const bankDoc = custData.bankDocuments[docIndex];
        const documentCategory =
          bankDoc?.details?.document_type === "Letter"
            ? "Job-Letter"
            : bankDoc?.details?.document_info?.type
            ? bankDoc?.details?.document_info?.type
            : "BANK_DOCUMENT";
        if (bankDoc?.doc && bankDoc.doc.length > 0) {
          for (let imgIndex = 0; imgIndex < bankDoc.doc.length; imgIndex++) {
            const document = bankDoc.doc[imgIndex];
            const fileName =
              document.fileName ||
              documentCategory +
                `-${docIndex + 1}.${document.type?.split("/")[1] || "jpg"}`;

            formData.append("files", {
              uri: document.uri,
              type: document.type || "image/jpeg",
              name: fileName,
            } as any);
            totalFiles++;
          }
        }
      }

      // Upload Financial Documents
      for (
        let docIndex = 0;
        docIndex < (custData.financialDocuments?.length || 0);
        docIndex++
      ) {
        const financialDoc = custData.financialDocuments[docIndex];

        // const documentCategory =
        //   financialDoc?.details?.document_info?.type === "Payslip"
        //     ? "Salary-Slip"
        //     : financialDoc?.details?.document_info?.type == "Invoice"
        //     ? "Proof-of-other-doc"
        //     : "FINANCIAL_DOCUMENT";

        const documentCategory = "Salary-Slip";
        console.log("documentCategory", documentCategory);
        if (financialDoc?.doc && financialDoc.doc.length > 0) {
          for (
            let imgIndex = 0;
            imgIndex < financialDoc.doc.length;
            imgIndex++
          ) {
            const document = financialDoc.doc[imgIndex];
            const fileName =
              document.fileName ||
              documentCategory +
                `-${docIndex + 1}.${document.type?.split("/")[1] || "jpg"}`;
            formData.append("files", {
              uri: document.uri,
              type: document.type || "image/jpeg",
              name: fileName,
            } as any);
            totalFiles++;
          }
        }
      }

      if (totalFiles === 0) {
        console.log("No documents to upload");
        return;
      }

      // Append loanId and cif
      formData.append("loanId", loanId);
      formData.append("cif", custData.customerId);

      console.log(`Uploading ${totalFiles} documents...`);

      await loanDocumentInstance.post("/api/v1/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 180000, // 3 minutes timeout for multiple files
      });

      console.log(`✓ Documents upload complete: ${totalFiles} files`);
    } catch (error: any) {
      console.log("Error uploading documents:", {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
      });
      //logErr(error);
    }
  };

  const handleContinue = async () => {
    if (!pin || pin.length !== 6) {
      return logAlert("Please enter the passcode");
    }
    if (pin !== "121212") {
      return logAlert("Please enter the correct passcode");
    }
    try {
      setLoading(true);

      if (signatureImage) {
        const formData = new FormData();
        formData.append("customerId", custData.customerId);
        formData.append("documentCategory", "PERSONAL");
        formData.append(
          "file",
          await formDataFileFormer({
            uri: signatureImage,
            name: "SIGNATURE" + ".jpg",
            type: "image/jpeg",
          })
        );
        const response = await loanDocumentInstance.post(
          "/api/v1/documents/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      if (memberPicture) {
        const formData = new FormData();

        formData.append("customerId", custData.customerId);
        formData.append("documentCategory", "PERSONAL");
        formData.append(
          "file",
          await formDataFileFormer({
            uri: memberPicture,
            name: "PICTURE" + ".jpg",
            type: "image/jpeg",
          })
        );
        const response = await loanDocumentInstance.post(
          "/api/v1/documents/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      const beneficiaryIds = custData.selectedBeneficiaries
        ? Object.entries(custData.selectedBeneficiaries)
            .filter(([key, value]) => value === true)
            .map(([key]) => key)
        : [];

      const jointPartnerIds = custData.selectedJointPartner
        ? Object.entries(custData.selectedJointPartner)
            .filter(([key, value]) => value === true)
            .map(([key]) => key)
        : [];

      const request = {
        customerId: custData.customerId,
        loanRequestId: custData.loanRequestId,
        remarks: "Loan application submitted through mobile app",
        beneficiaries: beneficiaryIds,
        jointPartners: jointPartnerIds,
      };

      const { data } = await loanInstance.post(
        "/api/v1/loans/application/create",
        request,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const loanId = data.responseStructure.data.loanId;

      console.log("Loan data:", data.responseStructure);

      dispatch(
        setState({
          finalScreen: {
            memberName: data.responseStructure.data.memberName,
            loanId: loanId,
            loanType: data.responseStructure.data.loanType,
            loanAmount: data.responseStructure.data.loanAmount,
            tentativeEmi: data.responseStructure.data.tentativeEmi,
            installmentStartDate:
              data.responseStructure.data.installmentStartDate,
            maturityDate: data.responseStructure.data.maturityDate,
            tenureInMonths: data.responseStructure.data.tenureInMonths,
            loanApplicationPdf: data.responseStructure.data?.loanApplicationPdf,
          },
        })
      );

      // Upload all documents in background
      if (custData?.isMember && !custData?.isTecuMember) {
        uploadDocuments(loanId).catch((error) => {
          console.log("Error uploading documents:", error);
        });
      }

      navigation.navigate("LoanFinalScreen");
    } catch (error) {
      console.log("Error submitting loan application:", error);
      logErr(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Loader loading={loading} />

      <Header title="Member Verification" showBackButton={true} />
      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <LoanDetailView
          header="View Summary"
          content={{
            "Member Name": custData?.name || custData?.customerName,
            "Member No": custData?.customerId,
            "Loan Category": `${custData?.loanPurpose} LOAN`,
            Promotions: custData.promotions,
            "loan Amount": "$ " + custData.principalAmount,
            "Annual Interest Rate": custData.tentativeInterestRate,
            "Tentative EMI": "$ " + custData.monthlyEMI,
            "Tenor in Month":
              custData?.loanTenor === "Months"
                ? Number(custData?.tenorDuration)
                : Number(custData?.tenorDuration) * 12,
            "Installment Start Date": custData?.installmentStartDate,
            "Maturity Date": custData?.maturityDate,
          }}
        />
        {/* Member Signature Section */}
        <View style={styles.verificationSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Member Signature
          </Text>

          <View style={styles.cardsContainer}>
            {/* Specimen Signature Card */}

            {custData.isMember && (
              <View style={[styles.card, { borderColor: "#FF9800" }]}>
                <View
                  style={[
                    styles.imageContainer,
                    { backgroundColor: "#FFF3E0" },
                  ]}
                >
                  {fetchedImageSign ? (
                    <Image
                      source={{ uri: fetchedImageSign }}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text
                      style={[
                        styles.placeholderText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      No Signature Present
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Current Capture Card */}
            <TouchableOpacity
              onPressIn={() => setSignatureVisible(true)}
              style={[styles.card, { borderColor: "#4CAF50" }]}
            >
              <View
                style={[styles.imageContainer, { backgroundColor: "#E8F5E8" }]}
              >
                {signatureImage ? (
                  <Image
                    source={{ uri: signatureImage }}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text
                    style={[
                      styles.placeholderText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Click To Capture
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Signature Confidence Level */}
          {custData.isMember && signaturePercentage !== null && (
            <Text
              style={[
                styles.confidenceLevel,
                {
                  color:
                    signaturePercentage >= 70
                      ? "#4CAF50"
                      : signaturePercentage >= 50
                      ? "#FF9800"
                      : "#F44336",
                },
              ]}
            >
              Signature Match Confidence: {signaturePercentage.toFixed(2)}%
            </Text>
          )}
        </View>

        {/* Member Picture Section */}
        <View style={styles.verificationSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Member Picture
          </Text>

          <View style={styles.cardsContainer}>
            {/* Existing Record Card */}
            {custData.isMember && (
              <View style={[styles.card, { borderColor: "#FF9800" }]}>
                <View
                  style={[
                    styles.imageContainer,
                    { backgroundColor: "#FFF3E0" },
                  ]}
                >
                  {fetchedImagePicture ? (
                    <Image
                      source={{ uri: fetchedImagePicture }}
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text
                      style={[
                        styles.placeholderText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      No Picture Present
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Current Capture Card */}
            <View style={[styles.card, { borderColor: "#4CAF50" }]}>
              <View
                style={[styles.imageContainer, { backgroundColor: "#E8F5E8" }]}
              >
                {memberPicture ? (
                  <Image
                    source={{ uri: memberPicture }}
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text
                    style={[
                      styles.placeholderText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Click To Capture
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Picture Confidence Level */}
          {custData.isMember && picturePercentage !== null && (
            <Text
              style={[
                styles.confidenceLevel,
                {
                  color:
                    picturePercentage >= 70
                      ? "#4CAF50"
                      : picturePercentage >= 50
                      ? "#FF9800"
                      : "#F44336",
                },
              ]}
            >
              Picture Match Confidence: {picturePercentage.toFixed(2)}%
            </Text>
          )}
        </View>

        {/* Passcode Verification Section */}
        <View style={styles.passcodeSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Passcode Verification
          </Text>

          <Text
            style={[styles.instructionText, { color: colors.textSecondary }]}
          >
            Please enter the 6-digit code to confirm this transaction.
          </Text>

          <View style={styles.otpContainer}>
            <OtpInput
              numberOfDigits={6}
              autoFocus={false}
              focusColor="#9C27B0"
              focusStickBlinkingDuration={500}
              onTextChange={(text) => setPin(text)}
              theme={{
                containerStyle: styles.otpWrapper,
                inputsContainerStyle: styles.inputsContainer,
                pinCodeContainerStyle: styles.pinCodeContainer,
                pinCodeTextStyle: styles.pinCodeText,
                focusStickStyle: styles.focusStick,
                focusedPinCodeContainerStyle: styles.activePinCodeContainer,
              }}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <Button
        buttonStyle={styles.verifyButton}
        text="Verify"
        textStyle={styles.verifyButtonText}
        click={handleContinue}
      />
    </SafeAreaView>
  );
};

export default Signature;

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    verificationSection: {
      marginBottom: hp(3),
    },
    sectionTitle: {
      fontSize: hp(2.2),
      fontWeight: "600",
      marginBottom: hp(2),
    },
    cardsContainer: {
      flexDirection: "row",
      gap: wp(4),
      marginBottom: hp(1.5),
    },
    card: {
      flex: 1,
      borderWidth: 1,
      borderRadius: wp(2),
      padding: wp(3),
      alignItems: "center",
    },
    imageContainer: {
      width: "100%",
      height: hp(15),
      borderRadius: wp(1.5),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: hp(1),
    },
    cardImage: {
      width: "100%",
      height: "100%",
      borderRadius: wp(1.5),
    },
    placeholderText: {
      fontSize: hp(1.6),
      textAlign: "center",
    },
    confidenceLevel: {
      fontSize: hp(1.8),
      fontWeight: "600",
      textAlign: "center",
    },
    passcodeSection: {
      marginBottom: hp(3),
    },
    instructionText: {
      fontSize: hp(1.8),
      marginBottom: hp(3),
      textAlign: "center",
      lineHeight: hp(2.4),
    },
    otpContainer: {
      alignItems: "center",
      marginBottom: hp(2),
    },
    otpWrapper: {
      alignItems: "center",
    },
    inputsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: wp(2),
    },
    pinCodeContainer: {
      width: wp(12),
      height: hp(6),
      borderWidth: 1,
      borderColor: "#E0E0E0",
      borderRadius: wp(1),
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
    },
    pinCodeText: {
      fontSize: hp(2.4),
      fontWeight: "600",
      color: colors.text,
    },
    focusStick: {
      backgroundColor: "#9C27B0",
      width: wp(2),
    },
    activePinCodeContainer: {
      borderColor: "#9C27B0",
      backgroundColor: colors.inputBackground,
    },
    verifyButton: {
      marginHorizontal: wp(4),
      marginVertical: hp(2),
      borderRadius: wp(2),
      paddingVertical: hp(2),
    },
    verifyButtonText: {
      color: "#FFFFFF",
      fontSize: hp(2.2),
      fontWeight: "600",
    },
    signatureHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: wp(4),
      paddingVertical: hp(2),
      backgroundColor: "#000",
      borderBottomWidth: 1,
      borderBottomColor: "#333",
    },
    closeSignatureButton: {
      padding: wp(2),
    },
    closeSignatureText: {
      color: "#fff",
      fontSize: hp(2.5),
      fontWeight: "bold",
    },
    signatureTitle: {
      color: "#fff",
      fontSize: hp(2.2),
      fontWeight: "600",
      flex: 1,
      textAlign: "center",
      marginRight: wp(10),
    },
  });
