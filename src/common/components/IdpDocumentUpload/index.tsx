import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import React from "react";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import {
  cameraIcon,
  download,
  fileIcon,
  pdf,
  singleFile,
  multiFile,
  extractData,
  upload,
  CloudStorage,
} from "../../assets";
import { Portal } from "react-native-paper";
import { pick, types } from "@react-native-documents/picker";
import { logAlert } from "../../utils/logger";
import Camera from "../DocumentUpload/Camera";
import PdfViewer from "../PdfViewer";
import { getBase64Data } from "../../utils/format";
import Loader from "../Loader";
import ImageViewer from "../ImageViewer";
import RNBlobUtil from "react-native-blob-util";
import { useTheme } from "../../ThemeContext";

const convertContentUriToBase64 = async (
  contentUri: string
): Promise<string | null> => {
  try {
    const base64Data = await RNBlobUtil.fs.readFile(contentUri, "base64");
    return base64Data;
  } catch (error) {
    console.error("Error reading content URI:", error);
    return null;
  }
};

const IdpDocumentUpload = ({
  header = "Upload Documents",
  headerDesc = "",
  title = "Upload or Capture Documents",
  description = "Supported formats: JPEG, PNG, PDF",
  images = [],
  setImages = () => {},
  limit = 1,
  required = false,
  missing = false,
  disabled = false,
  onExtractData = () => {},
  onReUpload = () => {},
  showExtractButton = false,
}: {
  header?: string;
  headerDesc?: string;
  title?: string;
  description?: string;
  images?: any[];
  setImages?: any;
  limit?: number;
  required?: boolean;
  missing?: boolean;
  disabled?: boolean;
  onExtractData?: () => void;
  onReUpload?: () => void;
  showExtractButton?: boolean;
}) => {
  const { colors } = useTheme();
  const [visible, setVisible] = React.useState<any>();
  const [loading, setLoading] = React.useState(false);
  const [showCamera, setShowCamera] = React.useState(false);
  const [uploadMode, setUploadMode] = React.useState<"single" | "multiple">(
    "single"
  );

  const handleDocumentPick = async (isMulti: boolean) => {
    try {
      const results = await pick({
        type: [types.pdf, types.images],
        allowMultiSelection: isMulti,
      });

      if (isMulti && results.length > limit) {
        logAlert(`You can only select ${limit} file${limit > 1 ? "s" : ""}`);
        return;
      }

      let newFiles: any = [];
      for (const element of results) {
        newFiles.push({
          uri: element.uri,
          name: element.name?.replace(/[^a-zA-Z0-9. ]/g, ""),
          type: element.type,
        });
      }

      setImages(newFiles);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log("User cancelled the picker");
      } else {
        throw err;
      }
    }
  };

  const handleReUpload = () => {
    setImages([]);
    setUploadMode("single");
    onReUpload();
  };

  const handleSingleUpload = () => {
    setUploadMode("single");
    handleDocumentPick(false);
  };

  const handleMultipleUpload = () => {
    setUploadMode("multiple");
    handleDocumentPick(true);
  };

  const isMultiUpload = uploadMode === "multiple" || images.length > 1;
  const showUploadMore = isMultiUpload && images.length < limit;

  return (
    <View>
      <Loader loading={loading} />
      {visible ? (
        visible.type == "application/pdf" ? (
          <PdfViewer
            visible={true}
            setVisible={setVisible}
            pdfBase64={visible.uri}
            header={visible.name}
            downloadAllowed={false}
            deleteAllowed={!disabled}
            onDelete={() => {
              setImages(images.filter((image, i) => i !== visible.index));
              setVisible(false);
            }}
          />
        ) : (
          <ImageViewer
            visible={true}
            setVisible={setVisible}
            image={visible.uri}
            header={visible.name}
            downloadAllowed={false}
            deleteAllowed={!disabled}
            onDelete={() => {
              setImages(images.filter((image, i) => i !== visible.index));
              setVisible(false);
            }}
          />
        )
      ) : null}

      {showCamera && (
        <Camera
          setVisible={setShowCamera}
          visible={showCamera}
          onCancelHandler={() => setShowCamera(false)}
          limit={2}
          setFiles={setImages}
          files={images}
        />
      )}

      {header && (
        <View style={{ paddingBottom: hp(1), flexDirection: "column" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: wp(0.5),
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: hp(1.8),
                  fontWeight: "600",
                }}
              >
                {header}{" "}
                {required && (
                  <Text
                    style={{
                      color: "red",
                    }}
                  >
                    *
                  </Text>
                )}
              </Text>
            </View>
          </View>
          {headerDesc && (
            <View>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: hp(1.5),
                }}
              >
                {headerDesc ? `(${headerDesc})` : null}
              </Text>
            </View>
          )}
        </View>
      )}

      <View
        style={[
          styles.uploadContainer,
          {
            borderStyle: "dashed",
            backgroundColor: disabled ? "#F4F4F4" : "#FFFFFF",

            minHeight: images.length > 0 ? hp(15) : hp(15),
          },
        ]}
      >
        {images.length > 0 ? (
          <View style={styles.uploadedFilesContainer}>
            <View
              style={[
                styles.filesGrid,
                uploadMode === "single" && images.length === 1
                  ? styles.singleFileGrid
                  : styles.multiFileGrid,
              ]}
            >
              {images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={async () => {
                    setLoading(true);
                    if (image.type === "application/pdf") {
                      if (image.uri.includes("content://")) {
                        if (Platform.OS === "android") {
                          const base64 = await convertContentUriToBase64(
                            image.uri
                          );
                          setVisible({
                            index: index,
                            uri: base64,
                            type: "application/pdf",
                            name: image.name.replace(/[^a-zA-Z0-9. ]/g, ""),
                          });
                        } else {
                          getBase64Data(image.uri)
                            .then((base64) => {
                              setVisible({
                                index: index,
                                uri: image.uri,
                                type: "application/pdf",
                                name: image.name.replace(/[^a-zA-Z0-9. ]/g, ""),
                              });
                            })
                            .catch((err) => {});
                        }
                      } else {
                        setVisible({
                          index: index,
                          uri: image.uri,
                          type: "application/pdf",
                          name: image.name.replace(/[^a-zA-Z0-9. ]/g, ""),
                        });
                      }
                    } else {
                      setVisible({
                        index: index,
                        uri: image.uri,
                        type: image.type,
                        name: image.name.replace(/[^a-zA-Z0-9. ]/g, ""),
                      });
                    }
                    setLoading(false);
                  }}
                  style={[
                    uploadMode === "single" && images.length === 1
                      ? styles.singleFilePreview
                      : styles.multiFilePreview,
                  ]}
                >
                  {image.type === "application/pdf" ? (
                    <Image source={pdf} style={styles.pdfIcon} />
                  ) : (
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.imagePreview}
                    />
                  )}
                </TouchableOpacity>
              ))}

              {showUploadMore && (
                <TouchableOpacity
                  onPress={handleMultipleUpload}
                  style={styles.uploadMoreButton}
                >
                  <View style={styles.cloudIconContainer}>
                    <Image source={upload} style={styles.cloudIcon} />
                  </View>
                  <Text style={styles.uploadMoreText}>Upload More</Text>
                  <Text style={styles.uploadMoreSubText}>
                    Click here to upload more
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                onPress={handleReUpload}
                style={[styles.actionButton, styles.reUploadButton]}
              >
                <Image source={CloudStorage} style={styles.cameraIcon} />
                <Text style={styles.reUploadButtonText}>Re-Upload</Text>
              </TouchableOpacity>

              {showExtractButton && (
                <TouchableOpacity
                  onPress={onExtractData}
                  style={[styles.actionButton, styles.extractButton]}
                >
                  <Image source={extractData} style={styles.cameraIcon} />
                  <Text style={styles.extractButtonText}>Extract Data</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <TouchableOpacity
            disabled={disabled}
            style={styles.emptyUploadContainer}
            onPress={() => {}}
          >
            <View style={styles.cloudIconContainer}>
              <Image source={upload} style={styles.cloudIcon} />
            </View>
            <Text style={styles.uploadTitle}>{title}</Text>
            <Text style={styles.uploadDescription}>{description}</Text>

            <View style={styles.uploadOptionsContainer}>
              <TouchableOpacity
                onPress={handleSingleUpload}
                style={[styles.uploadOptionButton, styles.singleUploadButton]}
              >
                <Image source={singleFile} style={styles.cameraIcon} />

                <Text style={styles.singleUploadText}>Single Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleMultipleUpload}
                style={[styles.uploadOptionButton, styles.multiUploadButton]}
              >
                <Image source={multiFile} style={styles.cameraIcon} />
                <Text style={styles.multiUploadText}>Multi-Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setUploadMode("single");
                  setShowCamera(true);
                }}
                style={[styles.uploadOptionButton, styles.takePhotoButton]}
              >
                <Image source={cameraIcon} style={styles.cameraIcon} />
                <Text style={styles.takePhotoText}>Take a Photo</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default IdpDocumentUpload;

const styles = StyleSheet.create({
  uploadContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp(2),
    justifyContent: "center",
    borderColor: "#F13937",
    borderStyle: "dashed",
    alignItems: "center",
    borderWidth: 1,
    padding: wp(2),
  },
  uploadedFilesContainer: {
    width: "90%",
  },
  filesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: hp(2),
  },
  singleFileGrid: {
    justifyContent: "center", // This centers the item
  },
  multiFileGrid: {
    justifyContent: "flex-start",
    gap: 15,
  },
  filePreview: {
    height: hp(28),
    borderRadius: wp(2),
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },
  singleFilePreview: {
    width: wp(45), // A fixed width for the single item
    borderWidth: 2,
    borderColor: "#F13937",
    // borderStyle: "dashed",
    height: hp(17),
    borderRadius: wp(2),
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },
  multiFilePreview: {
    width: wp(35),
    height: hp(14),
    borderColor: "#F13937",
    borderRadius: wp(2),
    overflow: "hidden",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  pdfIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadMoreButton: {
    height: hp(14),
    width: wp(42),
    borderRadius: wp(2),
    borderWidth: wp(0.2),
    borderColor: "#F13937",
    //borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  uploadMoreIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  plusIcon: {
    color: "#FFFFFF",
    fontSize: hp(2.5),
    fontWeight: "bold",
  },
  uploadMoreText: {
    fontSize: hp(1.4),
    fontWeight: "400",
    color: "#F13937",
    textAlign: "center",
  },
  uploadMoreSubText: {
    fontSize: hp(1),
    color: "#666666",
    textAlign: "center",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: wp(2),
    paddingHorizontal: wp(4),
  },
  actionButton: {
    flexDirection: "row",
    gap: wp(0.8),
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: wp(1.5),
    justifyContent: "center",
    alignItems: "center",
    minWidth: wp(25),
    maxWidth: wp(30),
  },
  extractButton: {
    backgroundColor: "#F13937",
  },
  extractButtonText: {
    color: "#FFFFFF",
    fontSize: hp(1.3),
    fontWeight: "600",
  },
  reUploadButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  reUploadButtonText: {
    color: "#000000",
    fontSize: hp(1.3),
    fontWeight: "600",
  },
  emptyUploadContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingVertical: hp(3),
  },
  cloudIconContainer: {
    //marginBottom: hp(2),
  },
  cloudIcon: {
    width: wp(15),
    height: hp(8),
    resizeMode: "contain",
    //tintColor: "#4285F4",
  },
  uploadTitle: {
    fontSize: hp(2),
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginBottom: hp(0.5),
  },
  uploadDescription: {
    fontSize: hp(1.4),
    color: "#666666",
    textAlign: "center",
    marginBottom: hp(3),
  },
  uploadOptionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: hp(1.5),
  },
  uploadOptionButton: {
    flex: 1,
    paddingVertical: hp(1),
    paddingHorizontal: wp(1),
    borderRadius: wp(1),
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  singleUploadButton: {
    flexDirection: "row",
    gap: wp(1),
    backgroundColor: "#FFF3E0",
    borderColor: "#FFB74D",
  },
  singleUploadText: {
    color: "#F57C00",
    fontSize: hp(1.2),
    fontWeight: "600",
    textAlign: "center",
  },
  multiUploadButton: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    borderColor: "#F13937",
    gap: wp(1),
  },
  multiUploadText: {
    color: "#F13937",
    fontSize: hp(1.2),
    fontWeight: "600",
    textAlign: "center",
  },
  takePhotoButton: {
    flexDirection: "row",
    backgroundColor: "#FFF3E0",
    borderColor: "#F13937",
    gap: wp(1),
  },
  cameraIcon: {
    width: wp(4),
    height: wp(4),
    resizeMode: "contain",
  },
  takePhotoText: {
    color: "#F13937",
    fontSize: hp(1.2),
    fontWeight: "600",
    textAlign: "center",
  },
});
