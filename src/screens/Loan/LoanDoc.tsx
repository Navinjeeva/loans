import { setState } from "@src/store/customer";
import { View, Text, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import DocumentUpload from "@src/common/LoanComponents/DocumentUpload";
import { documentUploadManager } from "@src/common/utils/documentUploadManager";
import TextHeader from "@src/common/LoanComponents/TextHeader";
import store from "@src/store";

const loanDoc = ({
  setLoading,
}: {
  setLoading: (loading: boolean) => void;
}) => {
  const custData = useSelector((state: any) => state.customer);
  const { bankDocuments, financialDocuments } = custData;
  const bankDocs =
    bankDocuments.length > 0
      ? bankDocuments
      : [{ id: 1, name: "", doc: [], details: {} }];
  const financialDocs =
    financialDocuments.length > 0
      ? financialDocuments
      : [{ id: 1, name: "", doc: [], details: {} }];

  const dispatch = useDispatch();

  const addDocument = () => {
    if (bankDocuments?.length < 10)
      dispatch(
        setState({
          bankDocuments: [
            ...bankDocs,
            { id: bankDocs.length + 1, name: "", doc: [], details: {} },
          ],
        })
      );
  };

  const removeDocument = (index: number) => {
    let updatedDocuments = [...bankDocs];
    updatedDocuments.splice(index, 1);
    dispatch(setState({ bankDocuments: updatedDocuments }));
  };

  const removeFinancialDocument = (index: number) => {
    let updatedDocuments = [...financialDocs];
    updatedDocuments.splice(index, 1);
    dispatch(setState({ financialDocuments: updatedDocuments }));
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
      <TextHeader
        title="Employment Documents"
        subtitle="Upload Employment documents to proceed the application."
      />
      {bankDocs.map((item: any, index: number) => (
        <View key={index} style={{ marginVertical: hp(2) }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {/* <Text style={[styles.header, { marginBottom: hp(1) }]}>
              Additional Document {` ${index + 1}`}
            </Text> */}

            {/*{index !== 0 && (
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
            )}*/}
          </View>

          <DocumentUpload
            header={
              item?.details?.card_type_english ||
              item?.details?.card_type ||
              item?.details?.document_type ||
              "Upload Employment Document"
            }
            showDocument={true}
            headerDesc=""
            limit={2}
            images={item?.doc}
            details={item?.details || {}}
            showPreviewButton={!item?.fromTecuApi}
            setImages={async (images: any) => {
              const latestState = store.getState().customer;
              const currentDocs =
                latestState.bankDocuments?.length > 0
                  ? [...latestState.bankDocuments]
                  : [{ id: 1, name: "", doc: [], details: {} }];
              let updatedDocuments = [...currentDocs];

              if (images.length == 0) {
                updatedDocuments[index] = {
                  ...updatedDocuments[index],
                  doc: [],
                  details: {},
                };
                dispatch(setState({ bankDocuments: [...updatedDocuments] }));
                removeDocument(index);
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

              dispatch(setState({ bankDocuments: [...updatedDocuments] }));

              try {
                const customerId = custData.customerId || "APP_TEST";

                const firstImage = Array.isArray(images) ? images[0] : images;

                documentUploadManager.queueUpload(
                  images,
                  customerId,
                  index,
                  "BSN_DOCUMENTS",
                  "MOBILE_DEVICE",
                  "employement",
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
                        latestState.bankDocuments?.length > 0
                          ? [...latestState.bankDocuments]
                          : [{ id: 1, name: "", doc: [], details: {} }];

                      let latestDocuments = [...currentDocs];
                      latestDocuments[actualIndex] = {
                        ...latestDocuments[actualIndex],
                        details: response || {},
                      };

                      dispatch(
                        setState({ bankDocuments: [...latestDocuments] })
                      );
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

      <TextHeader
        title="Financial Documents"
        subtitle="Upload Financial documents to proceed the application."
      />

      {financialDocs.map((item: any, index: number) => (
        <View key={index} style={{ marginVertical: hp(2) }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {/* <Text style={[styles.header, { marginBottom: hp(1) }]}>
              Additional Document {` ${index + 1}`}
            </Text> */}

            {/*{index !== 0 && (
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
            )}*/}
          </View>

          <DocumentUpload
            header={
              item?.details?.card_type_english ||
              item?.details?.card_type ||
              item?.details?.document_type ||
              "Upload Financial Document"
            }
            showDocument={true}
            headerDesc=""
            limit={2}
            images={item?.doc}
            details={item?.details || {}}
            showPreviewButton={!item?.fromTecuApi}
            setImages={async (images: any) => {
              const latestState = store.getState().customer;
              const currentDocs =
                latestState.financialDocuments?.length > 0
                  ? [...latestState.financialDocuments]
                  : [{ id: 1, name: "", doc: [], details: {} }];
              let updatedDocuments = [...currentDocs];

              if (images.length == 0) {
                updatedDocuments[index] = {
                  ...updatedDocuments[index],
                  doc: [],
                  details: {},
                };
                dispatch(
                  setState({ financialDocuments: [...updatedDocuments] })
                );
                removeFinancialDocument(index);
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

              dispatch(setState({ financialDocuments: [...updatedDocuments] }));

              try {
                const customerId = custData.customerId || "APP_TEST";

                const firstImage = Array.isArray(images) ? images[0] : images;

                documentUploadManager.queueUpload(
                  images,
                  customerId,
                  index,
                  "LOAN_DOCUMENTS",
                  "MOBILE_DEVICE",
                  "financial",
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
                        latestState.financialDocuments?.length > 0
                          ? [...latestState.financialDocuments]
                          : [{ id: 1, name: "", doc: [], details: {} }];

                      let latestDocuments = [...currentDocs];
                      latestDocuments[actualIndex] = {
                        ...latestDocuments[actualIndex],
                        details: response || {},
                      };

                      dispatch(
                        setState({ financialDocuments: [...latestDocuments] })
                      );
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
    </View>
  );
};

export default loanDoc;

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
  });
