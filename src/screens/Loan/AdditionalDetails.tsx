import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import React, { useState } from "react";
import KeyboardAwareScrollView from "@src/common/LoanComponents/KeyboardAwareScrollView";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import MobileNumberInputComponent from "@src/common/components/MobileNumberComponent";
import Button from "@src/components/Button";
import TextInputComponent from "@src/common/components/TextInputComponent";
import { setState } from "@src/store/customer";
import DropdownWithModal from "@src/components/common/DropdownWithModal";
import { logAlert, logErr } from "@src/common/utils/logger";
import { loanDocumentInstance, loanInstance } from "@src/services";
import Header from "@src/common/LoanComponents/Header";
import TextHeader from "@src/common/LoanComponents/TextHeader";
import Loader from "@src/common/components/Loader";

const AdditionalDetails = () => {
  const [clicked, setClicked] = useState(false);
  const navigation = useNavigation() as any;
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const custData = useSelector((state: any) => state.customer);
  const { linkedEntitiesDocuments } = custData;

  const {
    nationality,
    residency,
    countryOfBirth,
    placeOfBirth,
    preferredModeOfCommunicationDesc,
    maritalStatus,
    highLevelOfEducation,
    countryOfIssuance,
    spouseFirstName,
    spouseLastName,
    spouseMobileNumber,
    spouseMobileIsdKey,
    spouseMobileIsdDescription,
  } = custData.additionalDetails;
  const styles = createStyles(colors, isDark);

  const validateAndSanitizeInput = (text: string) => {
    const allowedPattern = /^[a-zA-Z0-9 .'-]*$/;
    if (!allowedPattern.test(text)) {
      text = text
        .split("")
        .filter((char) => /^[a-zA-Z0-9 .'-]*$/.test(char))
        .join("");
    }
    return text;
  };

  const uploadEntitiesDocuments = async () => {
    try {
      const uploadPromises: Promise<any>[] = [];

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

          // Now upload each document for this linked entity
          for (let imgIndex = 0; imgIndex < loanDoc.doc.length; imgIndex++) {
            const document = loanDoc.doc[imgIndex];
            const formData = new FormData();

            formData.append("metadata", JSON.stringify(loanDoc.details));
            formData.append("customerId", custData.customerId);
            formData.append("documentCategory", "LINKED_CUSTOMER");
            formData.append("linkedCustomerId", linkedCustomerId);
            formData.append("file", {
              uri: document.uri,
              type: document.type || "image/jpeg",
              name: `LINKED-DOCUMENT-${docIndex + 1}-${imgIndex + 1}.${
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
          logErr(error);
          console.log(
            `Error processing linked entity at index ${docIndex}:`,
            error?.response
          );
          // Continue with next document even if this one fails
          continue;
        }
      }

      if (uploadPromises.length > 0) {
        const results = await Promise.all(uploadPromises);
        return true;
      } else {
        //logAlert("No documents to upload linked entities");
        return false;
      }
    } catch (error: any) {
      console.log("Error uploading documents:", error?.response);
      logErr(error);
      throw error;
    }
  };

  const handleContinue = async () => {
    if (
      maritalStatus === "MARRIED" ||
      maritalStatus === "REMARRIED" ||
      maritalStatus === "COMMON LAW"
    ) {
      if (!spouseFirstName) {
        return logAlert("Please enter spouse first name");
      }
      if (!spouseLastName) {
        return logAlert("Please enter spouse last name");
      }
      if (!spouseMobileNumber) {
        return logAlert("Please enter spouse mobile number");
      }
    }
    try {
      setLoading(true);

      await uploadEntitiesDocuments();

      const { data } = await loanInstance.post(
        "api/v1/loans/customer/details",
        {
          customerId: custData.customerId,
          additionalDetail: {
            nationality: nationality,
            residency: residency,
            placeOfBirth: placeOfBirth,
            countryOfBirth: countryOfBirth,
            countryOfIssuance: countryOfIssuance || "",
            maritalStatus: maritalStatus,
            highLevelOfEducation: highLevelOfEducation || "",
            spouseName:
              (spouseFirstName || "").trim() +
              " " +
              (spouseLastName || "").trim(),
            spouseMobileNumber: spouseMobileNumber || "",
            spouseMobileIsd: spouseMobileIsdKey || "",
          },
        }
      );
      navigation.navigate("LoanAddBeneficiary");
    } catch (error) {
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
      <Header title="Additional Details" />

      <KeyboardAwareScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <TextHeader
            title="Additional Information"
            subtitle="Complete the member's additional info"
          />
          <View style={styles.dropdownContainer}>
            <DropdownWithModal
              passIdAndDesc
              value={nationality}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      nationality: desc,
                      primaryNationalityKeyId: id,
                    },
                  })
                );
              }}
              //placeholder={`Select Nationality 1`}
              placeholder={`SELECT NATIONALITY `}
              header={"Nationality "}
              style={{ fontSize: hp(1.6), fontWeight: "bold" }}
              label={"Nationality "}
              //required
              type={"nationality"}
              hasError={clicked && !nationality}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <DropdownWithModal
              passIdAndDesc
              value={residency}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      residency: desc,
                      residencyKeyId: id,
                    },
                  })
                );
              }}
              placeholder={`SELECT RESIDENCY`}
              header="Residency"
              style={{ fontSize: 10, fontWeight: "bold" }}
              label="Residency"
              //required={true}
              type="nationality"
              isSearchable
              options={[]}
              showImage={false}
              hasError={clicked && !residency}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <DropdownWithModal
              passIdAndDesc
              value={countryOfBirth}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      countryOfBirth: desc,
                      countryOfBirthKeyId: id,
                    },
                  })
                );
              }}
              //placeholder={`Select Country of Birth`}
              placeholder={`SELECT COUNTRY OF BIRTH`}
              header="Country of Birth"
              style={{ fontSize: 10, fontWeight: "bold" }}
              label="Country of Birth"
              //required={true}
              type="birthPlace"
              isSearchable
              options={[]}
              showImage={false}
              hasError={clicked && !countryOfBirth}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <TextInputComponent
              inputStyles={{
                fontSize: hp(1.6),
                height: hp(5),
              }}
              header="Place of Birth"
              headerStyles={{
                marginBottom: 6,
              }}
              placeholder="ENTER PLACE OF BIRTH"
              value={placeOfBirth}
              maxLength={75}
              onChange={(text: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      placeOfBirth: validateAndSanitizeInput(
                        text.toUpperCase()
                      ),
                    },
                  })
                );
              }}
              //required
              submitClicked={clicked}
              missingField={!placeOfBirth}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <DropdownWithModal
              passIdAndDesc
              value={countryOfIssuance}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      countryOfIssuance: desc,
                    },
                  })
                );
              }}
              //placeholder={`Select Nationality 1`}
              placeholder={`SELECT COUNTRY OF ISSUANCE `}
              header={"Country of Issuance"}
              style={{ fontSize: hp(1.6), fontWeight: "bold" }}
              label={"Country of Issuance"}
              //required
              type={"nationality"}
              hasError={clicked && !countryOfIssuance}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <DropdownWithModal
              value={preferredModeOfCommunicationDesc}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      preferredModeOfCommunication: id,
                      preferredModeOfCommunicationDesc: desc,
                    },
                  })
                );
              }}
              passIdAndDesc
              placeholder={`SELECT MODE OF COMMUNICATION`}
              header="Preferred Mode of Communication"
              style={{ fontSize: 10, fontWeight: "bold" }}
              label="Preferred Mode of Communication"
              //required={true}
              type="preferredMethodOfCommunication"
              isSearchable
              options={[]}
              showImage={false}
              hasError={clicked && !preferredModeOfCommunicationDesc}
            />
          </View>
          <View style={styles.dropdownContainer}>
            <DropdownWithModal
              passIdAndDesc
              value={maritalStatus}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      maritalStatus: desc?.toUpperCase(),
                      maritalStatusKeyId: id,
                    },
                  })
                );
              }}
              placeholder={`SELECT MARITAL STATUS`}
              header="Marital Status"
              style={{ fontSize: 10, fontWeight: "bold" }}
              label="Marital Status"
              //required={true}
              type="maritalStatus"
              isSearchable
              options={[]}
              showImage={false}
              hasError={clicked && !maritalStatus}
            />
          </View>

          {(maritalStatus === "MARRIED" ||
            maritalStatus === "REMARRIED" ||
            maritalStatus === "COMMON LAW") && (
            <View style={{ marginBottom: hp(2) }}>
              <Text style={[styles.label, { color: colors.text }]}>
                Spouse First Name <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInputComponent
                placeholder="ENTER SPOUSE FIRST NAME"
                maxLength={105}
                autocapitalize="characters"
                value={spouseFirstName}
                onChange={(text: string) => {
                  dispatch(
                    setState({
                      additionalDetails: {
                        ...custData.additionalDetails,
                        spouseFirstName: text,
                      },
                    })
                  );
                }}
                submitClicked={clicked}
                //missingField={clicked && !spouse?.firstName}
              />

              <Text style={[styles.label, { color: colors.text }]}>
                Spouse Last Name <Text style={{ color: "red" }}>*</Text>
              </Text>
              <TextInputComponent
                //required
                placeholder="ENTER SPOUSE LAST NAME"
                maxLength={105}
                autocapitalize="characters"
                value={spouseLastName}
                onChange={(text: string) => {
                  dispatch(
                    setState({
                      additionalDetails: {
                        ...custData.additionalDetails,
                        spouseLastName: text,
                      },
                    })
                  );
                }}
                submitClicked={clicked}
                //missingField={clicked && !spouse?.lastName}
              />

              <Text style={[styles.label, { color: colors.text }]}>
                Spouse Mobile Number <Text style={{ color: "red" }}>*</Text>
              </Text>

              <MobileNumberInputComponent
                isdCode={String(spouseMobileIsdKey)}
                mobileNumber={spouseMobileNumber}
                onChangeMobileNumber={(num: string) => {
                  dispatch(
                    setState({
                      additionalDetails: {
                        ...custData.additionalDetails,
                        spouseMobileNumber: num,
                      },
                    })
                  );
                }}
                onChangeIsdCode={(code: string | number, desc: string) => {
                  dispatch(
                    setState({
                      additionalDetails: {
                        ...custData.additionalDetails,
                        spouseMobileIsdKey: code,
                        spouseMobileIsdDescription:
                          desc || "TRINIDAD AND TOBAGO",
                      },
                    })
                  );
                }}
                submitClicked={clicked}
              />
            </View>
          )}

          <View style={styles.dropdownContainer}>
            <DropdownWithModal
              passIdAndDesc
              value={highLevelOfEducation}
              setValue={(id: string, desc?: string) => {
                dispatch(
                  setState({
                    additionalDetails: {
                      ...custData.additionalDetails,
                      highLevelOfEducation: desc?.toUpperCase(),
                      highLevelOfEducationKeyId: id,
                    },
                  })
                );
              }}
              placeholder={`SELECT HIGHEST LEVEL OF EDUCATION`}
              header="Highest Level of Education"
              style={{ fontSize: 10, fontWeight: "bold" }}
              label="Highest Level of Education"
              //required={true}
              type="highestLevelOfEducation"
              isSearchable
              options={[]}
              showImage={false}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

      <Button
        text="Continue"
        click={handleContinue}
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
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: wp(4),
    },
    dropdownContainer: {
      marginBottom: hp(2),
      color: "#000",
    },
    label: {
      marginBottom: hp(1),
      color: "#000",
    },
  });

export default AdditionalDetails;
