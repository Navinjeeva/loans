import { setState } from "@src/store/customer";
import { View, Text, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import DocumentUpload from "@src/common/LoanComponents/DocumentUpload";
import { useEffect, useState } from "react";
import { documentUploadManager } from "@src/common/utils/documentUploadManager";
import { logErr, logSuccess } from "@src/common/utils/logger";
import TextHeader from "@src/common/LoanComponents/TextHeader";
import store from "@src/store";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { loanDocumentInstance } from "@src/services";
import axios from "axios";

const PersonalDoc = ({
  setLoading,
}: {
  setLoading: (loading: boolean) => void;
}) => {
  const custData = useSelector((state: any) => state.customer);
  const { personalDocuments } = custData;
  const docs =
    personalDocuments.length > 0
      ? personalDocuments
      : [{ id: 1, name: "", doc: [], details: {} }];

  const dispatch = useDispatch();
  const [documentUploadTrigger, setDocumentUploadTrigger] = useState(0);
  const navigation = useNavigation<NavigationProp<any>>();
  const {
    idpFirstName,
    idpLastName,
    idpDateOfBirth,
    idpGender,
    idpAddress,
    mobileNumber,
    email,
    name,
    isdCode,
    isdDescription,
  } = custData;

  const getDocuments = async (customerId: string) => {
    const { data: documents } = await loanDocumentInstance.get(
      `/api/v1/documents/customer/${customerId}`
    );

    // Transform personalDocuments with grouping by document type
    const personalDocsGrouped: any = {};
    documents.responseStructure.data.personalDocuments?.forEach((doc: any) => {
      console.log("Doc:", Object.keys(doc));
      const fileExtension = doc.documentName.split(".").pop() || "jpeg";
      const mimeType =
        fileExtension === "pdf" ? "application/pdf" : `image/${fileExtension}`;

      // Convert base64 to data URI
      const base64Data = doc.documentFile.startsWith("data:")
        ? doc.documentFile
        : `data:${mimeType};base64,${doc.documentFile}`;

      // Extract document type index from filename (e.g., PERSONAL-DOCUMENT-2-1.png -> "2")
      const docNameMatch = doc.documentName.match(/-(\d+)-\d+\./);
      const docTypeIndex = docNameMatch ? docNameMatch[1] : "0";

      if (!personalDocsGrouped[docTypeIndex]) {
        personalDocsGrouped[docTypeIndex] = {
          name: doc.documentName,
          doc: [],
          details: doc.metadata || {},
          expired: doc.expired || false,
        };
      }

      // Append to the same document type
      personalDocsGrouped[docTypeIndex].doc.push({
        uri: base64Data,
        type: mimeType,
        name: doc.documentName,
        fileName: doc.documentName,
      });

      // Update expired status if any document in the group is expired
      if (doc.expired) {
        personalDocsGrouped[docTypeIndex].expired = true;
      }
    });

    const transformedPersonalDocs = Object.keys(personalDocsGrouped)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key, index) => ({
        id: index + 1,
        ...personalDocsGrouped[key],
      }));

    const linkedDocsGrouped: any = {};
    documents.responseStructure.data.linkedDocuments?.forEach((doc: any) => {
      const fileExtension = doc.documentName.split(".").pop() || "jpeg";
      const mimeType =
        fileExtension === "pdf" ? "application/pdf" : `image/${fileExtension}`;

      const base64Data = doc.documentFile.startsWith("data:")
        ? doc.documentFile
        : `data:${mimeType};base64,${doc.documentFile}`;

      // Extract document type index from filename
      const docNameMatch = doc.documentName.match(/-(\d+)-\d+\./);
      const docTypeIndex = docNameMatch ? docNameMatch[1] : "0";

      if (!linkedDocsGrouped[docTypeIndex]) {
        linkedDocsGrouped[docTypeIndex] = {
          name: doc.documentName,
          doc: [],
          details: doc.metadata || {},
          expired: doc.expired || false,
        };
      }

      linkedDocsGrouped[docTypeIndex].doc.push({
        uri: base64Data,
        type: mimeType,
        name: doc.documentName,
        fileName: doc.documentName,
      });

      // Update expired status if any document in the group is expired
      if (doc.expired) {
        linkedDocsGrouped[docTypeIndex].expired = true;
      }
    });

    const transformedLinkedDocs = Object.keys(linkedDocsGrouped)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key, index) => ({
        id: index + 1,
        ...linkedDocsGrouped[key],
      }));

    const bankDocsGrouped: any = {};
    documents.responseStructure.data.bankDocuments?.forEach((doc: any) => {
      const fileExtension = doc.documentName.split(".").pop() || "jpeg";
      const mimeType =
        fileExtension === "pdf" ? "application/pdf" : `image/${fileExtension}`;

      const base64Data = doc.documentFile.startsWith("data:")
        ? doc.documentFile
        : `data:${mimeType};base64,${doc.documentFile}`;

      // Extract document type index from filename
      const docNameMatch = doc.documentName.match(/-(\d+)-\d+\./);
      const docTypeIndex = docNameMatch ? docNameMatch[1] : "0";

      if (!bankDocsGrouped[docTypeIndex]) {
        bankDocsGrouped[docTypeIndex] = {
          name: doc.documentName,
          doc: [],
          details: doc.metadata || {},
          expired: doc.expired || false,
        };
      }

      bankDocsGrouped[docTypeIndex].doc.push({
        uri: base64Data,
        type: mimeType,
        name: doc.documentName,
        fileName: doc.documentName,
      });

      // Update expired status if any document in the group is expired
      if (doc.expired) {
        bankDocsGrouped[docTypeIndex].expired = true;
      }
    });

    const transformedBankDocs = Object.keys(bankDocsGrouped)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key, index) => ({
        id: index + 1,
        ...bankDocsGrouped[key],
      }));

    const financialDocsGrouped: any = {};
    documents.responseStructure.data.financialDocuments?.forEach((doc: any) => {
      const fileExtension = doc.documentName.split(".").pop() || "jpeg";
      const mimeType =
        fileExtension === "pdf" ? "application/pdf" : `image/${fileExtension}`;

      const base64Data = doc.documentFile.startsWith("data:")
        ? doc.documentFile
        : `data:${mimeType};base64,${doc.documentFile}`;

      // Extract document type index from filename
      const docNameMatch = doc.documentName.match(/-(\d+)-\d+\./);
      const docTypeIndex = docNameMatch ? docNameMatch[1] : "0";

      if (!financialDocsGrouped[docTypeIndex]) {
        financialDocsGrouped[docTypeIndex] = {
          name: doc.documentName,
          doc: [],
          details: doc.metadata || {},
          expired: doc.expired || false,
        };
      }

      financialDocsGrouped[docTypeIndex].doc.push({
        uri: base64Data,
        type: mimeType,
        name: doc.documentName,
        fileName: doc.documentName,
      });

      // Update expired status if any document in the group is expired
      if (doc.expired) {
        financialDocsGrouped[docTypeIndex].expired = true;
      }
    });

    const transformedFinancialDocs = Object.keys(financialDocsGrouped)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((key, index) => ({
        id: index + 1,
        ...financialDocsGrouped[key],
      }));

    transformedPersonalDocs.push({
      id: transformedPersonalDocs.length + 1,
      name: "",
      doc: [],
      details: {},
    });

    transformedLinkedDocs.push({
      id: transformedLinkedDocs.length + 1,
      name: "",
      doc: [],
      details: {},
    });

    transformedBankDocs.push({
      id: transformedBankDocs.length + 1,
      name: "",
      doc: [],
      details: {},
    });

    transformedFinancialDocs.push({
      id: transformedFinancialDocs.length + 1,
      name: "",
      doc: [],
      details: {},
    });

    dispatch(
      setState({
        personalDocuments: transformedPersonalDocs,
        linkedEntitiesDocuments: transformedLinkedDocs,
        bankDocuments: transformedBankDocs,
        financialDocuments: transformedFinancialDocs,
      })
    );
    logSuccess("Customer already exists");
    navigation.navigate("LoanMemberDetails");
  };

  const getTecuDocuments = async (customerId: string) => {
    console.log("Getting Tecu documents...", customerId);
    const { data: documents } = await axios.get(
      `https://dev-api-idocx.impactodigifin.xyz/api/v2/workspace/all-files/application?cifId=${customerId}`,
      {
        headers: {
          Authorization: `Basic ${"SXdCNHI4N0JrNFpjT1NhWDUyOWZMdjhKRHZZQ1MxWUUzcjlHd2NzU3RBQmJoS05YZ0RRaDJMbmVSbGlyc244UzpQUklZQTpJRE9DWA=="}`,
        },
      }
    );
    console.log("Tecu documents:", Object.keys(documents[0]));

    const personalDocs: any[] = [];
    const bankDocs: any[] = [];
    const financialDocs: any[] = [];
    let nationalIdCard: any = {
      name: "NATIONAL-IDENTIFICATION-CARD",
      doc: [],
      details: {},
    };
    let memberPicture: any = null;
    let signatureImage: any = null;

    documents.forEach((doc: any) => {
      console.log("Doc:", doc.fileName);

      const fileExtension = doc.fileName.split(".").pop() || "jpeg";
      const mimeType =
        fileExtension === "pdf" ? "application/pdf" : `image/${fileExtension}`;

      // Convert base64 to data URI
      const base64Data = doc.content.startsWith("data:")
        ? doc.content
        : `data:${mimeType};base64,${doc.content}`;

      const documentItem = {
        uri: base64Data,
        type: mimeType,
        name: doc.fileName,
        fileName: doc.fileName,
      };

      // Check for PROFILE-PICTURE
      if (doc.fileName.includes("PROFILE-PICTURE")) {
        memberPicture = documentItem;
        console.log("Found profile picture:", doc.fileName);
        return;
      }

      // Check for signature files - only capture one (prioritize National ID signature)
      if (
        !signatureImage &&
        doc.fileName.includes("NATIONAL-IDENTIFICATION-CARD-SIGNATURE")
      ) {
        signatureImage = documentItem;
        console.log("Found National ID signature:", doc.fileName);
        return;
      }

      if (
        !signatureImage &&
        doc.fileName.includes("DRIVERS-PERMIT-SIGNATURE")
      ) {
        signatureImage = documentItem;
        console.log("Found Drivers Permit signature:", doc.fileName);
        return;
      }

      // Only process specific document types - must match EXACTLY these names
      const isNationalIdFront = doc.fileName.includes(
        "NATIONAL-IDENTIFICATION-CARD-FRONT"
      );
      const isNationalIdBack = doc.fileName.includes(
        "NATIONAL-IDENTIFICATION-CARD-BACK"
      );
      const isNationalId = isNationalIdFront || isNationalIdBack;

      // Check for DRIVERS-PERMIT but exclude SIGNATURE and PORTRAIT variants
      const isDriversPermit =
        doc.fileName.includes("DRIVERS-PERMIT") &&
        !doc.fileName.includes("DRIVERS-PERMIT-SIGNATURE") &&
        !doc.fileName.includes("DRIVERS-PERMIT-PORTRAIT");

      const isAddressDoc = doc.fileName.includes("ADDRESS-DOCUMENT");
      const isJobLetter = doc.fileName.includes("JOB-LETTER");
      const isPaySlip = doc.fileName.includes("PAY-SLIP");

      // Skip if not one of the specific document types
      if (
        !isNationalId &&
        !isDriversPermit &&
        !isAddressDoc &&
        !isJobLetter &&
        !isPaySlip
      ) {
        console.log("Skipping document:", doc.fileName);
        return;
      }

      // Categorize based on file name
      if (isNationalId) {
        // Group National ID front and back together
        nationalIdCard.doc.push(documentItem);
        if (doc.metadata) {
          nationalIdCard.details = {
            ...nationalIdCard.details,
            ...doc.metadata,
          };
        }
        // Update expired status if any document in the group is expired
        if (doc.expired) {
          nationalIdCard.expired = true;
        } else if (nationalIdCard.expired === undefined) {
          nationalIdCard.expired = false;
        }
      } else if (isJobLetter) {
        // Bank documents
        bankDocs.push({
          name: doc.fileName,
          doc: [documentItem],
          details: doc.metadata || {},
          expired: doc.expired || false,
        });
      } else if (isPaySlip) {
        financialDocs.push({
          name: doc.fileName,
          doc: [documentItem],
          details: doc.metadata || {},
          expired: doc.expired || false,
        });
      } else if (isDriversPermit || isAddressDoc) {
        // Personal documents
        personalDocs.push({
          name: doc.fileName,
          doc: [documentItem],
          details: doc.metadata || {},
          expired: doc.expired || false,
        });
      }
    });

    // Add National ID card if it has documents
    if (nationalIdCard.doc.length > 0) {
      personalDocs.unshift(nationalIdCard);
    }

    // Add IDs to documents and mark them as from Tecu API
    const transformedPersonalDocs = personalDocs.map((doc, index) => ({
      id: index + 1,
      ...doc,
      fromTecuApi: true, // Flag to hide preview button
    }));

    const transformedBankDocs = bankDocs.map((doc, index) => ({
      id: index + 1,
      ...doc,
      fromTecuApi: true, // Flag to hide preview button
    }));

    const transformedFinancialDocs = financialDocs.map((doc, index) => ({
      id: index + 1,
      ...doc,
      fromTecuApi: true, // Flag to hide preview button
    }));

    transformedPersonalDocs.push({
      id: transformedPersonalDocs.length + 1,
      name: "",
      doc: [],
      details: {},
    });

    transformedBankDocs.push({
      id: transformedBankDocs.length + 1,
      name: "",
      doc: [],
      details: {},
    });

    transformedFinancialDocs.push({
      id: transformedFinancialDocs.length + 1,
      name: "",
      doc: [],
      details: {},
    });

    dispatch(
      setState({
        personalDocuments: transformedPersonalDocs,
        bankDocuments: transformedBankDocs,
        financialDocuments: transformedFinancialDocs,
        memberPicture: memberPicture ? [memberPicture] : [],
        signatureImage: signatureImage ? [signatureImage] : [],
      })
    );

    logSuccess("Customer already exists");
    navigation.navigate("LoanMemberDetails");
  };

  useEffect(() => {
    if (documentUploadTrigger === 1) {
      (async () => {
        try {
          if (custData.isMember && !custData.isTecuMember) {
            await getDocuments(custData.customerId);
          } else if (custData.isMember && custData.isTecuMember) {
            await getTecuDocuments(custData.customerId);
          }
        } catch (error) {
          console.log("[IDP] Error fetching documents:", error);
          //logErr(error);
        } finally {
          //setLoading(false);
        }
      })();
    }
  }, [documentUploadTrigger]);

  const addDocument = () => {
    if (personalDocuments?.length < 10)
      dispatch(
        setState({
          personalDocuments: [
            ...docs,
            { id: docs.length + 1, name: "", doc: [], details: {} },
          ],
        })
      );
  };

  const removeDocument = (index: number) => {
    let updatedDocuments = [...docs];
    updatedDocuments.splice(index, 1);
    dispatch(setState({ personalDocuments: updatedDocuments }));
  };

  const validateAndSanitizeInput = (text: string) => {
    const allowedPattern = /^[a-zA-Z0-9.,'\- ]*$/;
    if (!allowedPattern.test(text)) {
      text = text
        .split("")
        .filter((char) => /^[a-zA-Z0-9.,'\- ]$/.test(char))
        .join("");
    }
    return text;
  };

  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  return (
    <View>
      {/* <TextHeader
        title="Personal Documents"
        subtitle="Upload required personal documents."
      /> */}
      {docs.map((item: any, index: number) => (
        <View key={index} style={{ marginVertical: hp(2) }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {/* <Text style={[styles.header, { marginBottom: hp(1) }]}>
              Personal Document {` ${index + 1}`}
            </Text> */}

            {/* {index !== 0 && (
              <Pressable
                onPress={() => removeDocument(index)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.5 : 1.0,
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                ]}
              >

                <Text style={{ color: 'red' }}> Remove</Text>
              </Pressable>
            )} */}
          </View>

          <DocumentUpload
            header={
              item?.details?.card_type_english ||
              item?.details?.card_type ||
              item?.details?.document_type ||
              "Upload Personal Document"
            }
            showDocument={true}
            showPreviewButton={!item?.fromTecuApi}
            headerDesc=""
            limit={2}
            images={item?.doc}
            details={item?.details || {}}
            expired={item?.expired || false}
            setImages={async (images: any) => {
              const latestState = store.getState().customer;
              const currentDocs =
                latestState.personalDocuments?.length > 0
                  ? [...latestState.personalDocuments]
                  : [{ id: 1, name: "", doc: [], details: {} }];
              let updatedDocuments = [...currentDocs];

              if (images.length == 0) {
                updatedDocuments[index] = {
                  ...updatedDocuments[index],
                  doc: [],
                  details: {},
                };
                dispatch(
                  setState({ personalDocuments: [...updatedDocuments] })
                );
                removeDocument(index);
                return;
              }

              // Check if document is expired - if so, replace instead of append
              const isExpired =
                (updatedDocuments[index] as any)?.expired || false;
              const existingDocs = updatedDocuments[index]?.doc || [];
              const newDocs = isExpired ? images : [...existingDocs, ...images];

              // Check if this is a new document upload (empty slot being filled)
              const isNewDocument = existingDocs.length === 0;

              updatedDocuments[index] = {
                ...updatedDocuments[index],
                doc: newDocs as any,
                details: updatedDocuments[index]?.details || {},
                ...(isExpired ? { expired: false } : {}), // Clear expired flag when updating expired document
              } as any;

              const lastDocumentIndex = updatedDocuments.length - 1;
              if (index === lastDocumentIndex && images.length > 0) {
                updatedDocuments.push({
                  id: updatedDocuments.length + 1,
                  name: "",
                  doc: [],
                  details: {},
                });
              }

              dispatch(setState({ personalDocuments: [...updatedDocuments] }));

              try {
                const customerId = custData.customerId || "APP_TEST";

                // Determine if we should run IDP extraction
                // Skip IDP only if: member AND NOT expired AND NOT new document
                const shouldSkipIDP =
                  custData.isMember && !isExpired && !isNewDocument;

                console.log("Document upload decision:", {
                  isExpired,
                  isNewDocument,
                  isMember: custData.isMember,
                  shouldSkipIDP,
                  index,
                });

                if (shouldSkipIDP) {
                  // Existing non-expired document for member - skip IDP, just sync
                  console.log(
                    "Skipping IDP for existing non-expired document, syncing from backend"
                  );
                  setDocumentUploadTrigger(1);
                  return;
                }

                // Run IDP for: non-members, expired documents, or new documents
                console.log("Running IDP extraction for document");

                documentUploadManager.queueUpload(
                  images,
                  customerId,
                  index,
                  "PERSONAL_DOCUMENTS",
                  "MOBILE_DEVICE",
                  "identity",
                  (progress) => {},
                  (response: any, taskId: string) => {
                    const actualIndex = response?._indexOfDoc ?? index;

                    if (
                      response?._indexOfDoc !== undefined &&
                      response._indexOfDoc !== index
                    ) {
                      console.warn(
                        `[IDP] Index mismatch! Closure: ${index}, Response: ${response._indexOfDoc}`
                      );
                    }

                    let documentType = "AadhaarCard"; // default

                    if (
                      response?.["Card Type"] ==
                        "National Identification Card" ||
                      response?.["NATIONAL IDENTIFICATION CARD"]
                    ) {
                      documentType = "NationalId";
                    } else if (response?.license_number) {
                      documentType = "DriversPermit";
                    } else if (
                      response?.["Card Type"] == "Driving License" ||
                      response?.driver_license_number
                    ) {
                      documentType = "DriversPermit";
                    } else if (response?.["Card Type"] == "Voter ID") {
                      documentType = "VoterID";
                    } else if (
                      response?.pancard_number ||
                      response?.card_type == "Permanent Account Number Card" ||
                      response?.panc_number
                    ) {
                      documentType = "PanCard";
                    } else if (
                      response?.aadhaar_number ||
                      response?.aadhar_number
                    ) {
                      documentType = "AadhaarCard";
                    } else if (
                      response?.pancard_number ||
                      response?.pan_number ||
                      response?.pan_card_number
                    ) {
                      documentType = "PanCard";
                    } else if (
                      response?.passport_number ||
                      response?.passport_no ||
                      response?.["Passport No."]
                    ) {
                      documentType = "Passport";
                    } else if (
                      response?.driving_license_number ||
                      response?.dl_number
                    ) {
                      documentType = "DriversPermit";
                    } else if (
                      response?.voter_id ||
                      response?.voter_id_number
                    ) {
                      documentType = "VoterID";
                    }

                    setTimeout(() => {
                      const latestState = store.getState().customer;
                      const currentDocs =
                        latestState.personalDocuments?.length > 0
                          ? [...latestState.personalDocuments]
                          : [{ id: 1, name: "", doc: [], details: {} }];

                      let updatedDocumentsWithNames = [...currentDocs];

                      if (!updatedDocumentsWithNames[actualIndex]) {
                        console.warn(
                          `Document at index ${actualIndex} not found, skipping update`
                        );
                        return;
                      }

                      const currentDoc = updatedDocumentsWithNames[actualIndex];
                      const updatedDocs = (currentDoc.doc || []).map(
                        (doc: any, docIndex: number) => {
                          const fileExtension =
                            doc.type?.split("/")[1] ||
                            doc.fileName?.split(".")[1] ||
                            "jpg";
                          const fileName = `${documentType}${
                            docIndex > 0 ? `_${docIndex + 1}` : ""
                          }.${fileExtension}`;

                          return {
                            ...doc,
                            name: fileName,
                            fileName: fileName,
                          };
                        }
                      );

                      updatedDocumentsWithNames[actualIndex] = {
                        ...currentDoc,
                        doc: updatedDocs as any,
                      };

                      const updateData: any = {};

                      if (response?.name) {
                        const nameParts = response.name.trim().split(" ");
                        if (nameParts.length >= 2) {
                          updateData.idpFirstName = nameParts[0];
                          updateData.idpLastName = nameParts.slice(1).join(" ");
                        } else {
                          updateData.idpFirstName = response.name;
                          updateData.idpLastName = "";
                        }
                      }

                      if (response?.birth_date) {
                        updateData.idpDateOfBirth = response.birth_date;
                      }
                      if (response?.date_of_birth) {
                        updateData.idpDateOfBirth = response.date_of_birth;
                      }

                      if (response?.aadhaar_number || response?.aadhar_number) {
                        if (response?.date_of_birth) {
                          // Convert from DD/MM/YYYY to YYYY-MM-DD
                          const dateParts = response.date_of_birth.split("/");
                          if (dateParts.length === 3) {
                            const [day, month, year] = dateParts;
                            updateData.idpDateOfBirth = `${year}-${month}-${day}`;
                          } else {
                            updateData.idpDateOfBirth = response.date_of_birth;
                          }
                        }

                        if (response?.gender) {
                          updateData.idpGender = response.gender.toUpperCase();
                        }

                        if (response?.address) {
                          updateData.idpAddress = response.address;
                        }
                      }

                      // Update document details with the renamed documents
                      updatedDocumentsWithNames[actualIndex] = {
                        ...updatedDocumentsWithNames[actualIndex],
                        details: response || {},
                      };

                      dispatch(
                        setState({
                          ...updateData,
                          personalDocuments: [...updatedDocumentsWithNames],
                        })
                      );

                      // For members, don't sync with backend after IDP extraction
                      // Just keep the extracted data locally
                      console.log(
                        "IDP extraction complete - data updated locally"
                      );

                      // Always trigger document refresh after first document upload
                      if (index === 0) {
                        console.log(
                          "First document uploaded, triggering document refresh"
                        );
                        setDocumentUploadTrigger(1);
                      }
                    }, 100);
                  },
                  (error: Error, taskId: string) => {
                    console.log(error, "error");
                    //logErr(error);
                  }
                );
              } catch (error) {
                console.log(error, "error");
                //logErr(error);
              }
            }}
          />
        </View>
      ))}

      <View style={styles.item}>
        <Text style={styles.bullet}>{"\u2022"}</Text>
        <Text style={styles.text}>National Identification Card</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.bullet}>{"\u2022"}</Text>
        <Text style={styles.text}>Driver's Permit</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.bullet}>{"\u2022"}</Text>
        <Text style={styles.text}>Passport</Text>
      </View>
    </View>
  );
};

export default PersonalDoc;

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: hp(5),
    },
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: wp(4),
      paddingTop: hp(2),
      paddingBottom: hp(1),
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      marginHorizontal: hp(2),
    },
    bullet: {
      fontSize: 20,
      marginRight: 8,
    },
    text: {
      fontSize: 16,
      color: "#333",
    },
  });
