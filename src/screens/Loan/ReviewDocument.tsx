import Header from "@src/common/LoanComponents/Header";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native";
import KeyboardAwareScrollView from "@src/common/LoanComponents/KeyboardAwareScrollView";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import Button from "@src/components/Button";
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import DocumentUpload from "@src/common/LoanComponents/DocumentUpload";
import { documentUploadManager } from "@src/common/utils/documentUploadManager";
import store from "@src/store";
import { useNavigation } from "@react-navigation/native";
import TextHeader from "@src/common/LoanComponents/TextHeader";
import Loader from "@src/common/components/Loader";
import { download } from "@src/common/assets";
import { loanInstance, loanDocumentInstance } from "@src/services";
import { logAlert, logErr } from "@src/common/utils/logger";

// Map API document names to display names
const DOCUMENT_NAME_MAP: { [key: string]: string } = {
  "IDENTIFICATION CARD": "National ID",
  PASSPORT: "Passport",
  "DRIVER'S PERMIT": "Driver's Permit",
  LETTER: "Job Letter",
  PAYSLIP: "Payslip",
  "UTILITY BILL": "WASA",
};

interface MissingDocument {
  name: string;
  displayName: string;
  doc: any[];
  details: any;
}

const ReviewDocument = () => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const custData = useSelector((state: any) => state.customer);

  const [missingDocuments, setMissingDocuments] = useState<MissingDocument[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let missingDocsFromAPI: any[] = [];
      try {
        const response = await loanInstance.get(
          `api/v1/loans/customer/missing-documents/${custData.customerId}`
        );
        missingDocsFromAPI =
          response.data.responseStructure.data.missingDocuments || [];
        if (missingDocsFromAPI.length == 0) {
          // Replace current screen so user can't go back to ReviewDocument
          (navigation as any).replace("LoanDocumentHolderVerification");
          return;
        }
        const parsedDocs: MissingDocument[] = missingDocsFromAPI.map(
          (docName, index) => ({
            name: docName,
            displayName: DOCUMENT_NAME_MAP[docName] || docName,
            doc: [],
            details: {},
          })
        );

        setMissingDocuments(parsedDocs);
      } catch (error) {
        console.error("[ReviewDoc] Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUploadDocument = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const uploadMissingDocuments = async () => {
    // try {
    //   const uploadPromises: Promise<any>[] = [];
    //   missingDocuments.forEach(
    //     (missingDoc: MissingDocument, docIndex: number) => {
    //       if (missingDoc?.doc && missingDoc.doc.length > 0) {
    //         missingDoc.doc.forEach((document: any, imgIndex: number) => {
    //           const formData = new FormData();
    //           let documentCategory = "LOAN_APPLICATION";
    //           const isPersonalDoc =
    //             missingDoc.name === "IDENTIFICATION CARD" ||
    //             missingDoc.name === "PASSPORT" ||
    //             missingDoc.name === "DRIVER'S PERMIT";
    //           if (missingDoc.name === "LETTER") {
    //             documentCategory = "BANK_DOCUMENT";
    //           }
    //           if (
    //             missingDoc.name === "PAYSLIP" ||
    //             missingDoc.name === "UTILITY BILL"
    //           ) {
    //             documentCategory = "FINANCIAL_DOCUMENT";
    //           }
    //           if (isPersonalDoc) {
    //             documentCategory = "PERSONAL";
    //           }
    //           formData.append("customerId", custData.customerId);
    //           formData.append("documentCategory", documentCategory);
    //           formData.append("file", {
    //             uri: document.uri,
    //             type: document.type || "image/jpeg",
    //             name: `${documentCategory}-${missingDoc.displayName}-${
    //               docIndex + 1
    //             }.${document.type?.split("/")[1] || "jpg"}`,
    //           } as any);
    //           if (
    //             missingDoc.details &&
    //             Object.keys(missingDoc.details).length > 0
    //           ) {
    //             formData.append("metadata", JSON.stringify(missingDoc.details));
    //           }
    //           const uploadPromise = loanDocumentInstance.post(
    //             "/api/v1/documents/upload",
    //             formData,
    //             {
    //               headers: {
    //                 "Content-Type": "multipart/form-data",
    //               },
    //             }
    //           );
    //           uploadPromises.push(uploadPromise);
    //         });
    //       }
    //     }
    //   );
    //   if (uploadPromises.length > 0) {
    //     const results = await Promise.all(uploadPromises);
    //     return true;
    //   } else {
    //     logAlert("No documents to upload");
    //     return false;
    //   }
    // } catch (error: any) {
    //   console.log("Error uploading missing documents:", error?.response);
    //   logErr(error);
    //   throw error;
    // }
  };

  const handleContinue = async () => {
    if (!allDocumentsUploaded) {
      // logAlert("Please upload all documents");
      // return;
    }
    try {
      setLoading(true);

      await uploadMissingDocuments();

      (navigation as any).navigate("LoanDocumentHolderVerification");
    } catch (error) {
      console.log(error, "error");
      logErr(error);
    } finally {
      setLoading(false);
    }
  };

  const allDocumentsUploaded = missingDocuments.every(
    (doc) => doc.doc.length > 0
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Loader loading={loading} />
      <Header
        title="Review Document"
        subTitle="Lead created; the following docs are pending"
      />
      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TextHeader
          //title="Review Document"
          subtitle="Leading created, the following documents are pending."
        />
        <View style={styles.documentsContainer}>
          {missingDocuments.map((document, index) => (
            <View key={index} style={styles.documentSection}>
              <TouchableOpacity
                style={styles.documentRow}
                onPress={() => handleUploadDocument(index)}
              >
                <Text style={[styles.documentName, { color: colors.text }]}>
                  {document.displayName}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    // {
                    //   backgroundColor:
                    //     document.doc.length > 0
                    //       ? colors.success
                    //       : colors.primary,
                    // },
                  ]}
                  onPress={() => handleUploadDocument(index)}
                >
                  <Image
                    source={download}
                    style={{
                      height: hp(2.5),
                      width: wp(5),
                    }}
                    tintColor={colors.primary}
                  />
                </TouchableOpacity>
              </TouchableOpacity>

              {expandedIndex === index && (
                <View style={styles.uploadSection}>
                  <DocumentUpload
                    header={`Upload ${document.displayName}`}
                    headerDesc=""
                    limit={2}
                    images={document.doc}
                    details={document.details || {}}
                    showDocument={true}
                    setImages={async (images: any) => {
                      const currentDocs = [...missingDocuments];

                      if (images.length == 0) {
                        currentDocs[index] = {
                          ...currentDocs[index],
                          doc: [],
                          details: {},
                        };
                        setMissingDocuments([...currentDocs]);
                        return;
                      }

                      const existingDocs = currentDocs[index]?.doc || [];
                      const newDocs = [...existingDocs, ...images];

                      currentDocs[index] = {
                        ...currentDocs[index],
                        doc: newDocs as any,
                        details: currentDocs[index]?.details || {},
                      };

                      setMissingDocuments([...currentDocs]);

                      try {
                        const customerId = custData.customerId || "APP_TEST";

                        const firstImage = Array.isArray(images)
                          ? images[0]
                          : images;

                        documentUploadManager.queueUpload(
                          images,
                          customerId,
                          index,
                          "MISSING_DOCUMENTS",
                          "MOBILE_DEVICE",
                          document.displayName === "National ID" ||
                            document.displayName === "Passport" ||
                            document.displayName === "Driver's Permit"
                            ? "identity"
                            : document.displayName === "Job Letter" ||
                              document.displayName === "Payslip"
                            ? "employement"
                            : "financial",
                          (progress) => {},
                          (response: any, taskId: string) => {
                            const actualIndex = response?._indexOfDoc ?? index;

                            setTimeout(() => {
                              setMissingDocuments((prevDocs) => {
                                const updatedDocs = [...prevDocs];
                                updatedDocs[actualIndex] = {
                                  ...updatedDocs[actualIndex],
                                  details: response || {},
                                };
                                return updatedDocs;
                              });
                            }, 100);
                          },
                          (error: Error, taskId: string) => {
                            console.log(error, "error");
                          }
                        );
                      } catch (error) {
                        console.log(error, "error");
                      }
                    }}
                  />
                </View>
              )}

              {index < missingDocuments.length - 1 && (
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
              )}
            </View>
          ))}
        </View>
      </KeyboardAwareScrollView>
      <Button
        text="Continue"
        click={handleContinue}
        buttonStyle={{
          marginVertical: hp(2.5),
        }}
        //disabled={!allDocumentsUploaded}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    documentsContainer: {
      marginTop: hp(2),
    },
    documentSection: {
      //marginBottom: hp(1),
    },
    documentRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      //paddingVertical: hp(2),
    },
    documentName: {
      fontSize: wp(4.2),
      fontWeight: "400",
      flex: 1,
    },
    uploadButton: {
      width: wp(12),
      height: wp(12),
      borderRadius: wp(6),
      justifyContent: "center",
      alignItems: "center",
      //   elevation: 2,
      //   shadowColor: '#000',
      //   shadowOffset: { width: 0, height: 2 },
      //   shadowOpacity: 0.1,
      //   shadowRadius: 4,
    },
    uploadIcon: {
      fontSize: wp(6),
    },
    uploadSection: {
      marginTop: hp(1),
      marginBottom: hp(2),
    },
    divider: {
      height: 1,
      width: "100%",
      marginVertical: hp(1),
    },
  });

export default ReviewDocument;
