import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Loader from "@src/common/components/Loader";
import Stepper from "@src/common/LoanComponents/Stepper";
import KeyboardAwareScrollView from "@src/common/LoanComponents/KeyboardAwareScrollView";
import { useTheme } from "@src/common/ThemeContext";
import { useState, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  BackHandler,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import PersonalDoc from "./PersonalDoc";
import LoanDoc from "./LoanDoc";
import Button from "@src/components/Button";
import { logAlert, logErr } from "@src/common/utils/logger";
import { loanDocumentInstance, loanInstance } from "@src/services";
import { useDispatch, useSelector } from "react-redux";
import Header from "@src/common/LoanComponents/Header";
import PersonalDocumentModal from "@src/common/LoanComponents/PersonalDocumentModal";
import LoanDocumentModal from "@src/common/LoanComponents/LoanDocumentModal";
import LinkedEntities from "./LinkedEntities";

const Application = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const dispatch = useDispatch();

  const styles = createStyles(colors, isDark);
  const custData = useSelector((state: any) => state.customer);

  const {
    idpFirstName,
    idpLastName,
    idpDateOfBirth,
    mobileNumber,
    email,
    idpGender,
    idpAddress,
    isMember,
    isTecuMember,
  } = custData;

  const handleHelpPress = () => {
    if (currentStep === 0) {
      setShowPersonalModal(true);
    } else if (currentStep === 1) {
      setShowPersonalModal(true);
    } else if (currentStep === 2) {
      setShowLoanModal(true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentStep > 0) {
          setCurrentStep(currentStep - 1);
          return true; // Prevent default back behavior
        }
        return false; // Allow default back behavior (navigate to previous screen)
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      // For iOS gesture navigation
      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        if (currentStep > 0) {
          e.preventDefault();
          setCurrentStep(currentStep - 1);
        }
      });

      return () => {
        subscription.remove();
        unsubscribe();
      };
    }, [currentStep, navigation])
  );

  const uploadPersonalDocuments = async () => {
    try {
      let uploadCount = 0;
      let successCount = 0;
      let failCount = 0;

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
            uploadCount++;

            const fileName =
              document.fileName ||
              `PERSONAL-DOCUMENT-${docIndex + 1}-${imgIndex + 1}.${
                document.type?.split("/")[1]
              }`;

            try {
              console.log(`[${uploadCount}] Uploading: ${fileName}...`);

              const formData = new FormData();

              formData.append("customerId", custData.customerId);
              formData.append("documentCategory", "PERSONAL");
              formData.append("file", {
                uri: document.uri,
                type: document.type || "image/jpeg",
                name: fileName,
              } as any);

              if (
                personalDoc.details &&
                Object.keys(personalDoc.details).length > 0
              ) {
                formData.append(
                  "metadata",
                  JSON.stringify(personalDoc.details)
                );
              }

              await loanDocumentInstance.post(
                "/api/v1/documents/upload",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                  timeout: 60000,
                }
              );

              successCount++;
              console.log(`✓ [${uploadCount}] Success: ${fileName}`);
            } catch (error: any) {
              failCount++;
              console.log(`✗ [${uploadCount}] Failed: ${fileName}`, {
                message: error?.message,
                code: error?.code,
                status: error?.response?.status,
              });
              // Continue with next document even if this one fails
            }
          }
        }
      }

      console.log(
        `Personal documents upload complete: ${successCount} succeeded, ${failCount} failed out of ${uploadCount} total`
      );

      if (uploadCount === 0) {
        logAlert("No documents to upload");
        return false;
      }

      return successCount > 0;
    } catch (error: any) {
      console.log("Error uploading documents personal:", error?.response);
      logErr(error);
      throw error;
    }
  };

  const uploadBankDocuments = async () => {
    try {
      let uploadCount = 0;
      let successCount = 0;
      let failCount = 0;

      for (
        let docIndex = 0;
        docIndex < (custData.bankDocuments?.length || 0);
        docIndex++
      ) {
        const loanDoc = custData.bankDocuments[docIndex];

        if (loanDoc?.doc && loanDoc.doc.length > 0) {
          for (let imgIndex = 0; imgIndex < loanDoc.doc.length; imgIndex++) {
            const document = loanDoc.doc[imgIndex];
            uploadCount++;

            const fileName =
              document.fileName ||
              `EMPLOYMENT-DOCUMENT-${docIndex + 1}-${imgIndex + 1}.${
                document.type?.split("/")[1]
              }`;

            try {
              console.log(`[${uploadCount}] Uploading: ${fileName}...`);

              const formData = new FormData();

              formData.append("customerId", custData.customerId);
              formData.append("documentCategory", "BANK_DOCUMENT");
              formData.append("file", {
                uri: document.uri,
                type: document.type || "image/jpeg",
                name: fileName,
              } as any);

              if (loanDoc.details && Object.keys(loanDoc.details).length > 0) {
                formData.append("metadata", JSON.stringify(loanDoc.details));
              }

              await loanDocumentInstance.post(
                "/api/v1/documents/upload",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                  timeout: 60000,
                }
              );

              successCount++;
              console.log(`✓ [${uploadCount}] Success: ${fileName}`);
            } catch (error: any) {
              failCount++;
              console.log(`✗ [${uploadCount}] Failed: ${fileName}`, {
                message: error?.message,
                code: error?.code,
                status: error?.response?.status,
              });
              // Continue with next document even if this one fails
            }
          }
        }
      }

      console.log(
        `Bank documents upload complete: ${successCount} succeeded, ${failCount} failed out of ${uploadCount} total`
      );

      if (uploadCount === 0) {
        console.log("No bank documents to upload");
        return false;
      }

      return successCount > 0;
    } catch (error: any) {
      console.log("Error uploading bank documents:", {
        message: error?.message,
        code: error?.code,
        response: error?.response,
      });
      logErr(error);
      throw error;
    }
  };

  const uploadFinancialDocuments = async () => {
    try {
      let uploadCount = 0;
      let successCount = 0;
      let failCount = 0;

      for (
        let docIndex = 0;
        docIndex < (custData.financialDocuments?.length || 0);
        docIndex++
      ) {
        const loanDoc = custData.financialDocuments[docIndex];

        if (loanDoc?.doc && loanDoc.doc.length > 0) {
          for (let imgIndex = 0; imgIndex < loanDoc.doc.length; imgIndex++) {
            const document = loanDoc.doc[imgIndex];
            uploadCount++;

            const fileName =
              document.fileName ||
              `FINANCIAL-DOCUMENT-${docIndex + 1}-${imgIndex + 1}.${
                document.type?.split("/")[1]
              }`;

            try {
              console.log(`[${uploadCount}] Uploading: ${fileName}...`);

              const formData = new FormData();

              formData.append("customerId", custData.customerId);
              formData.append("documentCategory", "FINANCIAL_DOCUMENT");
              formData.append("file", {
                uri: document.uri,
                type: document.type || "image/jpeg",
                name: fileName,
              } as any);

              if (loanDoc.details && Object.keys(loanDoc.details).length > 0) {
                formData.append("metadata", JSON.stringify(loanDoc.details));
              }

              await loanDocumentInstance.post(
                "/api/v1/documents/upload",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                  timeout: 60000,
                }
              );

              successCount++;
              console.log(`✓ [${uploadCount}] Success: ${fileName}`);
            } catch (error: any) {
              failCount++;
              console.log(`✗ [${uploadCount}] Failed: ${fileName}`, {
                message: error?.message,
                code: error?.code,
                status: error?.response?.status,
              });
              // Continue with next document even if this one fails
            }
          }
        }
      }

      console.log(
        `Financial documents upload complete: ${successCount} succeeded, ${failCount} failed out of ${uploadCount} total`
      );

      if (uploadCount === 0) {
        console.log("No financial documents to upload");
        return false;
      }

      return successCount > 0;
    } catch (error: any) {
      console.log("Error uploading financial documents:", {
        message: error?.message,
        code: error?.code,
        response: error?.response,
      });
      logErr(error);
      throw error;
    }
  };

  const uploadEntitiesDocuments = async () => {
    try {
      let uploadCount = 0;
      let successCount = 0;
      let failCount = 0;

      // Process each linked entity document
      for (
        let docIndex = 0;
        docIndex < custData.linkedEntitiesDocuments?.length;
        docIndex++
      ) {
        const loanDoc = custData.linkedEntitiesDocuments[docIndex];

        // Skip if no documents to upload
        if (!loanDoc?.doc || loanDoc.doc.length === 0) {
          continue;
        }

        // Check if details exist and firstName is present
        const firstName =
          loanDoc.details?.firstName ||
          loanDoc.details?.full_name ||
          loanDoc.details?.["FULL NAME"] ||
          loanDoc.details?.name ||
          loanDoc.details?.driver_name ||
          loanDoc.details?.given_name ||
          loanDoc.details?.customer_info?.customer_name ||
          "";

        // Skip this document if no valid firstName
        if (!firstName || firstName.trim() === "") {
          console.log(
            `Skipping document at index ${docIndex}: No valid firstName found`
          );
          continue;
        }

        try {
          console.log(
            {
              customerId: custData.customerId,
              linkedCustomer: {
                firstName: firstName,
                lastName:
                  loanDoc.details?.lastName || loanDoc.details?.surname || "",
                dateOfBirth: null,
                emailId:
                  loanDoc.details?.emailId || loanDoc.details?.email || "",
                mobileNumber:
                  loanDoc.details?.mobileNumber ||
                  loanDoc.details?.mobile_number ||
                  loanDoc.details?.phone ||
                  "",
              },
            },
            "loanDoc.details"
          );
          // Call add-linked-entity API first to get UUID
          const { data } = await loanInstance.post(
            "api/v1/loans/customer/add-linked-entity",
            {
              customerId: custData.customerId,
              linkedCustomer: {
                firstName: firstName,
                lastName:
                  loanDoc.details?.lastName || loanDoc.details?.surname || "",
                dateOfBirth: null,
                emailId:
                  loanDoc.details?.emailId || loanDoc.details?.email || "",
                mobileNumber:
                  loanDoc.details?.mobileNumber ||
                  loanDoc.details?.mobile_number ||
                  loanDoc.details?.phone ||
                  "",
              },
            }
          );

          const linkedCustomerId = data.responseStructure.data.linkedCustomerId;

          // Now upload each document for this linked entity (sequentially)
          for (let imgIndex = 0; imgIndex < loanDoc.doc.length; imgIndex++) {
            const document = loanDoc.doc[imgIndex];

            const fileName =
              document.fileName ||
              `LINKED-DOCUMENT-${docIndex + 1}-${imgIndex + 1}.${
                document.type?.split("/")[1] || "jpg"
              }`;

            uploadCount++;

            try {
              console.log(`[${uploadCount}] Uploading: ${fileName}...`);

              const formData = new FormData();

              // Correct order: customerId, documentCategory, linkedCustomerId, file, then metadata
              formData.append("customerId", custData.customerId);
              formData.append("documentCategory", "LINKED_CUSTOMER");
              formData.append("linkedCustomerId", linkedCustomerId);
              formData.append("file", {
                uri: document.uri,
                type: document.type || "image/jpeg",
                name: fileName,
              } as any);

              // Append metadata last
              if (loanDoc.details && Object.keys(loanDoc.details).length > 0) {
                formData.append("metadata", JSON.stringify(loanDoc.details));
              }

              await loanDocumentInstance.post(
                "/api/v1/documents/upload",
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                  timeout: 60000,
                }
              );

              successCount++;
              console.log(`✓ [${uploadCount}] Success: ${fileName}`);
            } catch (error: any) {
              failCount++;
              console.log(`✗ [${uploadCount}] Failed: ${fileName}`, {
                message: error?.message,
                code: error?.code,
                status: error?.response?.status,
              });
              // Continue with next document even if this one fails
            }
          }
        } catch (error: any) {
          logErr(error);
          console.log(
            `Error processing linked entity at index ${docIndex}:`,
            error?.response
          );
          // Continue with next document even if this one fails
          continue;
        }
      }

      console.log(
        `Linked entity documents upload complete: ${successCount} succeeded, ${failCount} failed out of ${uploadCount} total`
      );

      if (uploadCount === 0) {
        console.log("No linked entity documents to upload");
        return false;
      }

      return successCount > 0;
    } catch (error: any) {
      console.log("Error uploading documents entities:", {
        message: error?.message,
        code: error?.code,
        response: error?.response?.data,
      });
      logErr(error);
      throw error;
    }
  };

  const handleBackPress = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleContinue = async () => {
    try {
      if (currentStep === 0) {
        setCurrentStep(1);
      } else if (currentStep === 1) {
        setCurrentStep(2);
      } else if (currentStep === 2) {
        if (!isConfirmed) {
          logAlert("Please confirm the documents");
          return;
        }

        setLoading(true);

        if (isMember && !isTecuMember) {
          // Run uploads in background without blocking navigation
          Promise.all([
            uploadPersonalDocuments(),
            uploadEntitiesDocuments(),
            uploadBankDocuments(),
            uploadFinancialDocuments(),
          ]).catch((error) => {
            console.log("Background upload error:", error);
            //logErr(error);
          });

          navigation.navigate("LoanDocumentHolderVerification");
        } else if (isMember && isTecuMember) {
          navigation.navigate("LoanDocumentHolderVerification");
        } else {
          navigation.navigate("LoanVerification");
        }
      }
    } catch (error: any) {
      console.log(error, "error");
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

      <Header
        title={"Upload Documents"}
        onHelpPress={handleHelpPress}
        onBackPress={handleBackPress}
      />

      <Stepper
        steps={["Personal Documents", "Connected Parties", "Loan Documents"]}
        onClick={(index: number) => {
          setCurrentStep(index);
        }}
        currentStep={currentStep}
      />
      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 0 && <PersonalDoc setLoading={setLoading} />}
        {currentStep === 1 && <LinkedEntities setLoading={setLoading} />}
        {currentStep === 2 && <LoanDoc setLoading={setLoading} />}
      </KeyboardAwareScrollView>
      {currentStep === 2 && (
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsConfirmed(!isConfirmed)}
        >
          <View
            style={[
              styles.checkbox,
              {
                backgroundColor: isConfirmed ? colors.primary : colors.surface,
                borderColor: colors.primary,
              },
            ]}
          >
            {isConfirmed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.checkboxLabel, { color: colors.text }]}>
            I confirm all the above documents are correct and authorise the bank
            to proceed.
          </Text>
        </TouchableOpacity>
      )}
      <Button
        buttonStyle={{
          marginVertical: hp(3),
        }}
        text="Continue"
        click={handleContinue}
      />

      {/* Modals */}
      <PersonalDocumentModal
        visible={showPersonalModal}
        type={currentStep == 0 ? "Personal" : "Connected Parties"}
        onClose={() => setShowPersonalModal(false)}
      />
      <LoanDocumentModal
        visible={showLoanModal}
        onClose={() => setShowLoanModal(false)}
      />
    </SafeAreaView>
  );
};

export default Application;

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
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
      fontWeight: "bold",
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: hp(2.8),
      fontWeight: "bold",
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
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp(2),
    },
    iconContainer: {
      width: wp(8),
      height: wp(8),
      borderRadius: wp(4),
      justifyContent: "center",
      alignItems: "center",
      marginRight: wp(3),
    },
    cardIcon: {
      fontSize: hp(2),
    },
    sectionTitle: {
      fontSize: hp(2.2),
      fontWeight: "600",
    },
    fieldLabel: {
      fontSize: hp(1.8),
      fontWeight: "500",
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
      flexDirection: "row",
      alignItems: "center",
      marginBottom: hp(1.5),
    },
    warningIcon: {
      fontSize: hp(2),
      marginRight: wp(2),
    },
    infoTitle: {
      fontSize: hp(1.8),
      fontWeight: "600",
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
      alignItems: "center",
    },
    proceedButtonText: {
      color: "white",
      fontSize: hp(2),
      fontWeight: "600",
    },
    // Modal styles
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "center",
      alignItems: "center",
      padding: wp(6),
    },
    modalCard: {
      width: "100%",
      borderRadius: 20,
      paddingVertical: hp(3),
      paddingHorizontal: wp(5),
    },
    modalClose: {
      position: "absolute",
      right: wp(4),
      top: hp(1.5),
      zIndex: 1,
    },
    modalTitle: {
      textAlign: "center",
      fontSize: hp(2.6),
      fontWeight: "700",
      marginTop: hp(1),
    },
    modalSubtitle: {
      textAlign: "center",
      fontSize: hp(1.8),
      marginTop: hp(1),
      marginBottom: hp(2),
    },
    otpBoxesRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      marginVertical: hp(1),
    },
    otpBox: {
      width: wp(12),
      height: wp(12),
      borderRadius: 12,
      backgroundColor: "rgba(0,0,0,0.05)",
      justifyContent: "center",
      alignItems: "center",
      borderColor: "#000000",
      borderWidth: hp(0.05),
    },
    otpDigit: {
      fontSize: hp(2.4),
      fontWeight: "600",
    },
    hiddenOtpInput: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1,
    },
    resendText: {
      textAlign: "center",
      color: "#3B45AC",
      fontWeight: "600",
      marginTop: hp(1.5),
      marginBottom: hp(2.5),
    },
    doneButton: {
      borderRadius: 14,
      paddingVertical: hp(1.8),
    },
    otpContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    inputsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    pinCodeContainer: {
      width: wp(10),
      height: hp(5),
      borderWidth: 1,
      borderColor: "#000",
      justifyContent: "center",
      alignItems: "center",
    },
    pinCodeText: {
      fontSize: 18,
      color: "#000",
    },
    focusStick: {
      backgroundColor: "orange",
    },
    activePinCodeContainer: {
      borderColor: "orange",
    },
    text: {
      color: "#585858",
      fontSize: hp(1.2),
    },
    Imagecontainer: {
      borderRadius: hp(0.4),
      backgroundColor: "#E4E4E4",
      alignItems: "center",
      justifyContent: "center",
      height: hp(30),
      padding: hp(1),
      shadowColor: "#000",
      overflow: "hidden",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 8,
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: hp(3) - hp(2),
      objectFit: "contain",
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: wp(4),
    },
    checkbox: {
      width: wp(5),
      height: wp(5),
      borderWidth: 2,
      borderRadius: wp(1),
      alignItems: "center",
      justifyContent: "center",
    },
    checkmark: {
      color: "white",
      fontSize: hp(1.8),
      fontWeight: "bold",
    },
    checkboxLabel: {
      fontSize: hp(1.6),
      marginLeft: wp(2),
    },
  });
