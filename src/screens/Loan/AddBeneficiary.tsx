import { SafeAreaView, StyleSheet, View } from "react-native";
import Header from "@src/common/LoanComponents/Header";
import { useDispatch, useSelector } from "react-redux";
import Loader from "@src/common/components/Loader";
import { useEffect, useState } from "react";
import { useTheme } from "@src/common/ThemeContext";
import KeyboardAwareScrollView from "@src/common/LoanComponents/KeyboardAwareScrollView";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useIsFocused } from "@react-navigation/native";
import { logErr } from "@src/common/utils/logger";
import { loanDocumentInstance, loanInstance } from "@src/services";
import { useNavigation } from "@react-navigation/native";
import DocumentUpload from "@src/common/LoanComponents/DocumentUpload";
import { setState } from "@src/store/customer";
import TextHeader from "@src/common/LoanComponents/TextHeader";
import MultiSelectDropdownModal from "@src/common/LoanComponents/MultiSelectDropdownModal";
import { documentUploadManager } from "@src/common/utils/documentUploadManager";
import store from "@src/store";
import Button from "@src/components/Button";

const AddBeneficiary = () => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);
  const custData = useSelector((state: any) => state.customer);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [beneficiaryOptions, setBeneficiaryOptions] = useState<any[]>([]);
  const [jointPartnerOptions, setJointPartnerOptions] = useState<any[]>([]);
  const [beneficiaryDataMap, setBeneficiaryDataMap] = useState<any>({});
  const [jointPartnerDataMap, setJointPartnerDataMap] = useState<any>({});

  const [showBeneficiaryDocuments, setShowBeneficiaryDocuments] =
    useState(false);
  const [showJointPartnerDocuments, setShowJointPartnerDocuments] =
    useState(false);

  const {
    additionalBeneficiary,
    additionalJointPartner,
    selectedBeneficiaries,
    selectedJointPartner,
  } = useSelector((state: any) => state.customer);

  const getSelectedBeneficiaryIds = () => {
    return Object.keys(selectedBeneficiaries).filter(
      (key) => selectedBeneficiaries[key] === true
    );
  };

  const getSelectedJointPartnerIds = () => {
    return Object.keys(selectedJointPartner).filter(
      (key) => selectedJointPartner[key] === true
    );
  };

  const beneficiaryDocuments =
    additionalBeneficiary.length > 0
      ? additionalBeneficiary
      : [{ id: 1, name: "Beneficiary Document", doc: [], details: {} }];
  const jointPartnerDocuments =
    additionalJointPartner.length > 0
      ? additionalJointPartner
      : [{ id: 1, name: "Joint Partner Document", doc: [], details: {} }];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const { data }: any = await loanInstance.get(
          `api/v1/loans/customer/linked-customers?customerId=${custData.customerId}`
        );
        const beneficiaryData = data?.responseStructure?.data ?? [];
        const jointPartnerData = data?.responseStructure?.data ?? [];

        // Create a map of linkedCustomerId -> full data
        const beneficiaryMap: any = {};
        const jointPartnerMap: any = {};

        beneficiaryData.forEach((item: any) => {
          beneficiaryMap[String(item?.linkedCustomerId ?? "")] = item;
        });

        jointPartnerData.forEach((item: any) => {
          jointPartnerMap[String(item?.linkedCustomerId ?? "")] = item;
        });

        setBeneficiaryDataMap(beneficiaryMap);
        setJointPartnerDataMap(jointPartnerMap);

        setBeneficiaryOptions(
          beneficiaryData.map((item: any) => ({
            label: String(item?.fullName ?? "").trim(),
            value: String(item?.linkedCustomerId ?? ""),
          }))
        );
        setJointPartnerOptions(
          jointPartnerData.map((item: any) => ({
            label: String(item?.fullName ?? "").trim(),
            value: String(item?.linkedCustomerId ?? ""),
          }))
        );
      } catch (error) {
        console.log(error, "error");
        logErr(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [isFocused]);

  // Pre-populate documents when beneficiaries are selected
  useEffect(() => {
    const selectedIds = getSelectedBeneficiaryIds();

    if (Object.keys(beneficiaryDataMap).length === 0) {
      return; // Wait for data to load
    }

    if (selectedIds.length === 0) {
      // Reset to empty state when nothing is selected
      dispatch(
        setState({
          additionalBeneficiary: [
            { id: 1, name: "Beneficiary Document", doc: [], details: {} },
          ],
        })
      );
      return;
    }

    const updatedDocuments = selectedIds.map((id, index) => {
      const beneficiary = beneficiaryDataMap[id];
      if (beneficiary?.documentBase64 && beneficiary?.documentUuid) {
        // Convert base64 to data URI format
        const mimeType = beneficiary.documentMimeType || "image/jpeg";
        const uri = `data:${mimeType};base64,${beneficiary.documentBase64}`;

        return {
          id: index + 1,
          name:
            beneficiary.documentName || `Beneficiary-${beneficiary.fullName}`,
          doc: [
            {
              uri: uri,
              name:
                beneficiary.documentName || `${beneficiary.fullName}-document`,
              type: mimeType,
            },
          ],
          details: beneficiary.documentMetadata || {
            fullName: beneficiary.fullName,
          },
        };
      }
      return {
        id: index + 1,
        name: "",
        doc: [],
        details: {},
      };
    });

    // Add empty slot for new uploads
    updatedDocuments.push({
      id: updatedDocuments.length + 1,
      name: "",
      doc: [],
      details: {},
    });

    dispatch(setState({ additionalBeneficiary: updatedDocuments }));
  }, [selectedBeneficiaries, beneficiaryDataMap]);

  // Pre-populate documents when joint partners are selected
  useEffect(() => {
    const selectedIds = getSelectedJointPartnerIds();

    if (Object.keys(jointPartnerDataMap).length === 0) {
      return; // Wait for data to load
    }

    if (selectedIds.length === 0) {
      // Reset to empty state when nothing is selected
      dispatch(
        setState({
          additionalJointPartner: [
            { id: 1, name: "Joint Partner Document", doc: [], details: {} },
          ],
        })
      );
      return;
    }

    const updatedDocuments = selectedIds.map((id, index) => {
      const jointPartner = jointPartnerDataMap[id];
      if (jointPartner?.documentBase64 && jointPartner?.documentUuid) {
        // Convert base64 to data URI format
        const mimeType = jointPartner.documentMimeType || "image/jpeg";
        const uri = `data:${mimeType};base64,${jointPartner.documentBase64}`;

        return {
          id: index + 1,
          name:
            jointPartner.documentName ||
            `JointPartner-${jointPartner.fullName}`,
          doc: [
            {
              uri: uri,
              name:
                jointPartner.documentName ||
                `${jointPartner.fullName}-document`,
              type: mimeType,
            },
          ],
          details: jointPartner.documentMetadata || {
            fullName: jointPartner.fullName,
          },
        };
      }
      return {
        id: index + 1,
        name: "",
        doc: [],
        details: {},
      };
    });

    // Add empty slot for new uploads
    updatedDocuments.push({
      id: updatedDocuments.length + 1,
      name: "",
      doc: [],
      details: {},
    });

    dispatch(setState({ additionalJointPartner: updatedDocuments }));
  }, [selectedJointPartner, jointPartnerDataMap]);

  const uploadBeneficiaryDocuments = async () => {
    try {
      const uploadPromises: Promise<any>[] = [];
      const selectedIds = getSelectedBeneficiaryIds();

      // Process each beneficiary document
      for (
        let docIndex = 0;
        docIndex < custData.additionalBeneficiary?.length;
        docIndex++
      ) {
        const beneficiaryDoc = custData.additionalBeneficiary[docIndex];

        // Skip if no documents to upload
        if (!beneficiaryDoc?.doc || beneficiaryDoc.doc.length === 0) {
          continue;
        }

        // Filter out pre-existing documents (from dropdown - they have data: URI with base64)
        const newDocuments = beneficiaryDoc.doc.filter(
          (doc: any) => !doc.uri.startsWith("data:")
        );

        // Skip if no new documents to upload
        if (newDocuments.length === 0) {
          console.log(
            `Skipping beneficiary at index ${docIndex}: No new documents to upload (all documents are from dropdown)`
          );
          continue;
        }

        // Check if details exist and firstName is present
        const firstName =
          beneficiaryDoc.details?.firstName ||
          beneficiaryDoc.details?.full_name ||
          beneficiaryDoc.details?.["FULL NAME"] ||
          beneficiaryDoc.details?.name ||
          beneficiaryDoc.details?.driver_name ||
          beneficiaryDoc.details?.given_name ||
          beneficiaryDoc.details?.customer_info?.customer_name ||
          "";

        // Skip this document if no valid firstName
        if (!firstName || firstName.trim() === "") {
          console.log(
            `Skipping beneficiary document at index ${docIndex}: No valid firstName found`
          );
          continue;
        }

        try {
          let beneficiaryId = null;

          // Check if this beneficiary was selected from dropdown (already exists)
          const existingBeneficiaryId = selectedIds.find((id) => {
            const beneficiary = beneficiaryDataMap[id];
            return beneficiary?.fullName === firstName;
          });

          if (existingBeneficiaryId) {
            // Use existing beneficiary ID, don't call add-beneficiary API
            beneficiaryId = existingBeneficiaryId;
            console.log(
              `Using existing beneficiary ID for ${firstName}: ${beneficiaryId}`
            );
          } else {
            // Call add-beneficiary API for new beneficiary
            const { data } = await loanInstance.post(
              "api/v1/loans/customer/add-beneficiary",
              {
                customerId: custData.customerId,
                linkedCustomer: {
                  firstName: firstName,
                  lastName:
                    beneficiaryDoc.details?.lastName ||
                    beneficiaryDoc.details?.surname ||
                    "",
                  dateOfBirth: null,
                  emailId:
                    beneficiaryDoc.details?.emailId ||
                    beneficiaryDoc.details?.email ||
                    "",
                  mobileNumber:
                    beneficiaryDoc.details?.mobileNumber ||
                    beneficiaryDoc.details?.mobile_number ||
                    beneficiaryDoc.details?.phone ||
                    "",
                },
              }
            );
            beneficiaryId = data.responseStructure.data.linkedCustomerId;
            console.log(
              `Created new beneficiary for ${firstName}: ${beneficiaryId}`
            );
          }

          // Upload only new documents (not from dropdown)
          for (let imgIndex = 0; imgIndex < newDocuments.length; imgIndex++) {
            const document = newDocuments[imgIndex];
            const formData = new FormData();

            formData.append("metadata", JSON.stringify(beneficiaryDoc.details));
            formData.append("customerId", custData.customerId);
            formData.append("documentCategory", "LINKED_CUSTOMER");
            formData.append("linkedCustomerId", beneficiaryId);
            formData.append("file", {
              uri: document.uri,
              type: document.type || "image/jpeg",
              name: `BENEFICIARY-DOCUMENT-${docIndex + 1}-${imgIndex + 1}.${
                document.type?.split("/")[1] || "jpg"
              }`,
            } as any);

            const uploadPromise = loanDocumentInstance.post(
              "/api/v1/documents/upload",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            uploadPromises.push(uploadPromise);
          }
        } catch (error: any) {
          console.log(
            `Error processing beneficiary at index ${docIndex}:`,
            error?.response
          );
          // Continue with next document even if this one fails
          continue;
        }
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        return true;
      }
      return false;
    } catch (error: any) {
      console.log("Error uploading beneficiary documents:", error?.response);
      logErr(error);
      throw error;
    }
  };

  const uploadJointPartnerDocuments = async () => {
    try {
      const uploadPromises: Promise<any>[] = [];
      const selectedIds = getSelectedJointPartnerIds();

      // Process each joint partner document
      for (
        let docIndex = 0;
        docIndex < custData.additionalJointPartner?.length;
        docIndex++
      ) {
        const jointPartnerDoc = custData.additionalJointPartner[docIndex];

        // Skip if no documents to upload
        if (!jointPartnerDoc?.doc || jointPartnerDoc.doc.length === 0) {
          continue;
        }

        // Filter out pre-existing documents (from dropdown - they have data: URI with base64)
        const newDocuments = jointPartnerDoc.doc.filter(
          (doc: any) => !doc.uri.startsWith("data:")
        );

        // Skip if no new documents to upload
        if (newDocuments.length === 0) {
          console.log(
            `Skipping joint partner at index ${docIndex}: No new documents to upload (all documents are from dropdown)`
          );
          continue;
        }

        // Check if details exist and firstName is present
        const firstName =
          jointPartnerDoc.details?.firstName ||
          jointPartnerDoc.details?.full_name ||
          jointPartnerDoc.details?.["FULL NAME"] ||
          jointPartnerDoc.details?.name ||
          jointPartnerDoc.details?.driver_name ||
          jointPartnerDoc.details?.given_name ||
          jointPartnerDoc.details?.customer_info?.customer_name ||
          "";

        // Skip this document if no valid firstName
        if (!firstName || firstName.trim() === "") {
          console.log(
            `Skipping joint partner document at index ${docIndex}: No valid firstName found`
          );
          continue;
        }

        try {
          let jointPartnerId = null;

          // Check if this joint partner was selected from dropdown (already exists)
          const existingJointPartnerId = selectedIds.find((id) => {
            const jointPartner = jointPartnerDataMap[id];
            return jointPartner?.fullName === firstName;
          });

          if (existingJointPartnerId) {
            // Use existing joint partner ID, don't call add-joint-partner API
            jointPartnerId = existingJointPartnerId;
            console.log(
              `Using existing joint partner ID for ${firstName}: ${jointPartnerId}`
            );
          } else {
            // Call add-joint-partner API for new joint partner
            const { data } = await loanInstance.post(
              "api/v1/loans/customer/add-joint-partner",
              {
                customerId: custData.customerId,
                linkedCustomer: {
                  firstName: firstName,
                  lastName:
                    jointPartnerDoc.details?.lastName ||
                    jointPartnerDoc.details?.surname ||
                    "",
                  dateOfBirth: null,
                  emailId:
                    jointPartnerDoc.details?.emailId ||
                    jointPartnerDoc.details?.email ||
                    "",
                  mobileNumber:
                    jointPartnerDoc.details?.mobileNumber ||
                    jointPartnerDoc.details?.mobile_number ||
                    jointPartnerDoc.details?.phone ||
                    "",
                },
              }
            );
            jointPartnerId = data.responseStructure.data.linkedCustomerId;
            console.log(
              `Created new joint partner for ${firstName}: ${jointPartnerId}`
            );
          }

          // Upload only new documents (not from dropdown)
          for (let imgIndex = 0; imgIndex < newDocuments.length; imgIndex++) {
            const document = newDocuments[imgIndex];
            const formData = new FormData();

            formData.append(
              "metadata",
              JSON.stringify(jointPartnerDoc.details)
            );
            formData.append("customerId", custData.customerId);
            formData.append("documentCategory", "LINKED_CUSTOMER");
            formData.append("linkedCustomerId", jointPartnerId);
            formData.append("file", {
              uri: document.uri,
              type: document.type || "image/jpeg",
              name: `JOINT-PARTNER-DOCUMENT-${docIndex + 1}-${imgIndex + 1}.${
                document.type?.split("/")[1] || "jpg"
              }`,
            } as any);

            const uploadPromise = loanDocumentInstance.post(
              "/api/v1/documents/upload",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            uploadPromises.push(uploadPromise);
          }
        } catch (error: any) {
          console.log(
            `Error processing joint partner at index ${docIndex}:`,
            error?.response
          );
          // Continue with next document even if this one fails
          continue;
        }
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
        return true;
      }
      return false;
    } catch (error: any) {
      console.log("Error uploading joint partner documents:", error?.response);
      logErr(error);
      throw error;
    }
  };

  const handleContinue = async () => {
    try {
      setLoading(true);

      // Upload beneficiary documents
      await uploadBeneficiaryDocuments();

      // Upload joint partner documents
      await uploadJointPartnerDocuments();

      (navigation as any).navigate("LoanPep");
    } catch (error: any) {
      console.log(error?.response, "error");
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
      <Header title="Add Beneficiary" subTitle="" />
      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <TextHeader
            title="Beneficiary & Joint Details"
            subtitle="Provide beneficiary and joint partner details"
          />
          <MultiSelectDropdownModal
            value={selectedBeneficiaries}
            setValue={(id: string, desc: string) => {
              setShowBeneficiaryDocuments(true);
              if (selectedBeneficiaries[id]) {
                dispatch(
                  setState({
                    selectedBeneficiaries: {
                      ...selectedBeneficiaries,
                      [desc]: id,
                      [id]: false,
                    },
                  })
                );
              } else {
                dispatch(
                  setState({
                    selectedBeneficiaries: {
                      ...selectedBeneficiaries,
                      [desc]: id,
                      [id]: true,
                    },
                  })
                );
              }
            }}
            placeholder="Select Beneficiary"
            header="Beneficiary"
            label="Beneficiary"
            isSearchable={true}
            options={beneficiaryOptions}
            showImage={false}
            footerButtonText="Upload Beneficiary ID"
            onFooterButtonPress={() => setShowBeneficiaryDocuments(true)}
          />
          {!showBeneficiaryDocuments && <View style={{ height: hp(3) }} />}
          {showBeneficiaryDocuments &&
            beneficiaryDocuments.map((item: any, index: number) => (
              <DocumentUpload
                header="Upload Additional Document"
                headerDesc=""
                limit={2}
                images={item?.doc}
                details={item?.details || {}}
                onDetailsUpdate={(updatedDetails) => {
                  let updatedDocuments = [...beneficiaryDocuments];
                  updatedDocuments[index] = {
                    ...updatedDocuments[index],
                    details: updatedDetails,
                  };
                  dispatch(
                    setState({ additionalBeneficiary: [...updatedDocuments] })
                  );
                }}
                setImages={async (images: any) => {
                  // CRITICAL: Always read from Redux store to get latest state
                  // This prevents using stale component state when multiple uploads happen
                  const latestState = store.getState().customer;
                  const currentDocs =
                    latestState.additionalBeneficiary?.length > 0
                      ? [...latestState.additionalBeneficiary]
                      : [{ id: 1, name: "", doc: [], details: {} }];
                  let updatedDocuments = [...currentDocs];

                  if (images.length == 0) {
                    updatedDocuments[index] = {
                      ...updatedDocuments[index],
                      doc: [],
                      details: {},
                    };
                    dispatch(
                      setState({
                        additionalBeneficiary: [...updatedDocuments],
                      })
                    );
                    return;
                  }

                  const existingDocs = updatedDocuments[index]?.doc || [];
                  const newDocs = [...existingDocs, ...images];

                  updatedDocuments[index] = {
                    ...updatedDocuments[index],
                    doc: newDocs as any,
                    details: updatedDocuments[index]?.details || {},
                  };

                  const lastDocumentIndex = updatedDocuments.length - 1;
                  if (index === lastDocumentIndex && images.length > 0) {
                    updatedDocuments.push({
                      id: updatedDocuments.length + 1,
                      name: "",
                      doc: [],
                      details: {},
                    });
                  }

                  dispatch(
                    setState({ additionalBeneficiary: [...updatedDocuments] })
                  );

                  try {
                    const customerId = custData.customerId || "APP_TEST";

                    documentUploadManager.queueUpload(
                      images,
                      customerId,
                      index, // indexOfDoc
                      "BENEFICIARY_DOCUMENTS",
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

                        // CRITICAL: Use setTimeout to ensure previous Redux updates have completed
                        // This prevents race conditions when multiple documents are extracted simultaneously
                        setTimeout(() => {
                          // Get the LATEST document state from Redux store (not stale component state)
                          const latestState = store.getState().customer;
                          const currentDocs =
                            latestState.additionalBeneficiary?.length > 0
                              ? [...latestState.additionalBeneficiary]
                              : [{ id: 1, name: "", doc: [], details: {} }];

                          let latestDocuments = [...currentDocs];
                          latestDocuments[actualIndex] = {
                            ...latestDocuments[actualIndex],
                            details: response || {},
                          };

                          dispatch(
                            setState({
                              additionalBeneficiary: [...latestDocuments],
                            })
                          );
                        }, 100); // 100ms delay to ensure Redux updates complete
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
            ))}
          <MultiSelectDropdownModal
            value={selectedJointPartner}
            setValue={(id: string, desc: string) => {
              setShowJointPartnerDocuments(true);
              if (selectedJointPartner[id]) {
                dispatch(
                  setState({
                    selectedJointPartner: {
                      ...selectedJointPartner,
                      [desc]: id,
                      [id]: false,
                    },
                  })
                );
              } else {
                dispatch(
                  setState({
                    selectedJointPartner: {
                      ...selectedJointPartner,
                      [desc]: id,
                      [id]: true,
                    },
                  })
                );
              }
            }}
            placeholder="Select Joint Partner"
            header="Joint Partner"
            label="Joint Partner"
            isSearchable={true}
            options={jointPartnerOptions}
            showImage={false}
            footerButtonText="Upload Joint Partner Documents"
            onFooterButtonPress={() => setShowJointPartnerDocuments(true)}
          />
          {!showJointPartnerDocuments && <View style={{ height: hp(3) }} />}
          {showJointPartnerDocuments &&
            jointPartnerDocuments.map((item: any, index: number) => (
              <DocumentUpload
                header="Upload Additional Document"
                headerDesc=""
                limit={2}
                images={item?.doc}
                details={item?.details || {}}
                onDetailsUpdate={(updatedDetails) => {
                  let updatedDocuments = [...jointPartnerDocuments];
                  updatedDocuments[index] = {
                    ...updatedDocuments[index],
                    details: updatedDetails,
                  };
                  dispatch(
                    setState({ additionalJointPartner: [...updatedDocuments] })
                  );
                }}
                setImages={async (images: any) => {
                  // CRITICAL: Always read from Redux store to get latest state
                  // This prevents using stale component state when multiple uploads happen
                  const latestState = store.getState().customer;
                  const currentDocs =
                    latestState.additionalJointPartner?.length > 0
                      ? [...latestState.additionalJointPartner]
                      : [{ id: 1, name: "", doc: [], details: {} }];
                  let updatedDocuments = [...currentDocs];

                  if (images.length == 0) {
                    updatedDocuments[index] = {
                      ...updatedDocuments[index],
                      doc: [],
                      details: {},
                    };
                    dispatch(
                      setState({
                        additionalJointPartner: [...updatedDocuments],
                      })
                    );
                    return;
                  }

                  const existingDocs = updatedDocuments[index]?.doc || [];
                  const newDocs = [...existingDocs, ...images];

                  updatedDocuments[index] = {
                    ...updatedDocuments[index],
                    doc: newDocs as any,
                    details: updatedDocuments[index]?.details || {},
                  };

                  const lastDocumentIndex = updatedDocuments.length - 1;
                  if (index === lastDocumentIndex && images.length > 0) {
                    updatedDocuments.push({
                      id: updatedDocuments.length + 1,
                      name: "",
                      doc: [],
                      details: {},
                    });
                  }

                  dispatch(
                    setState({
                      additionalJointPartner: [...updatedDocuments],
                    })
                  );

                  try {
                    const customerId = custData.customerId || "APP_TEST";

                    documentUploadManager.queueUpload(
                      images,
                      customerId,
                      index, // indexOfDoc
                      "JOINT_PARTNER_DOCUMENTS",
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

                        setTimeout(() => {
                          const latestState = store.getState().customer;
                          const currentDocs =
                            latestState.additionalJointPartner?.length > 0
                              ? [...latestState.additionalJointPartner]
                              : [{ id: 1, name: "", doc: [], details: {} }];

                          let latestDocuments = [...currentDocs];
                          latestDocuments[actualIndex] = {
                            ...latestDocuments[actualIndex],
                            details: response || {},
                          };

                          dispatch(
                            setState({
                              additionalJointPartner: [...latestDocuments],
                            })
                          );
                        }, 100); // 100ms delay to ensure Redux updates complete
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
            ))}
        </View>
      </KeyboardAwareScrollView>
      <Button
        buttonStyle={{
          marginVertical: hp(3),
        }}
        text="Continue"
        click={handleContinue}
      />
    </SafeAreaView>
  );
};

export default AddBeneficiary;

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
  });
