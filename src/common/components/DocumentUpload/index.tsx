import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
  TextInput,
} from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  cameraIcon,
  documentHeader,
  download,
  fileIcon,
  pdf,
} from '@src/common/assets/icons';
import { Portal } from 'react-native-paper';
import { pick, types } from '@react-native-documents/picker';
import { logAlert } from '../../utils/logger';
import Camera from './Camera';
import PdfViewer from '../PdfViewer';
import Loader from '../Loader';
import ImageViewer from '../ImageViewer';
import RNBlobUtil from 'react-native-blob-util';

import { getBase64Data } from '@src/common/utils/format';
import { useTheme } from '@src/common/utils/ThemeContext';
import { closeIcon } from '@src/common/assets';
import { ScrollView } from 'react-native';

/**
 * DocumentUpload Component
 *
 * Usage Example:
 *
 * // Basic usage
 * <DocumentUpload
 *   header="Beneficiary Documents"
 *   images={uploadedImages}
 *   details={documentDetails}
 *   setImages={setUploadedImages}
 * />
 *
 * // With details for manual preview (click eye icon to view)
 * <DocumentUpload
 *   header="Beneficiary"
 *   images={uploadedImages}
 *   details={{
 *     "First Name": "KEMBA N",
 *     "Last Name": "FRANKLYN",
 *     "Date of Birth": "08/02/1986",
 *     "Permit Number": "19800801004",
 *     "Date of Issue": "11/05/2009",
 *     "Expiry Date": "17-04-2024",
 *     "Address": "Jade Court",
 *     "Country": "TRINIDAD & TOBAGO",
 *     "Sex": "Female",
 *     "Class": "3"
 *   }}
 *   setImages={setUploadedImages}
 *   // Document details are always shown in preview when available
 * />
 */

const convertContentUriToBase64 = async (
  contentUri: string,
): Promise<string | null> => {
  try {
    const base64Data = await RNBlobUtil.fs.readFile(contentUri, 'base64');
    return base64Data;
  } catch (error) {
    console.error('Error reading content URI:', error);
    return null;
  }
};

// Details Modal Component
const DetailsModal = ({
  visible,
  onClose,
  details,
  title,
  images = [],
  showDocument = true,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  details: Record<string, any>;
  title: string;
  images?: any[];
  showDocument?: boolean;
  onSave?: (updatedDetails: Record<string, any>) => void;
}) => {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedDetails, setEditedDetails] = React.useState(details);

  // Update local state when props change
  React.useEffect(() => {
    setEditedDetails(details);
    setIsEditing(false);
  }, [details, images, visible]);

  // Convert details object to array for better rendering
  const detailsArray = Object.entries(isEditing ? editedDetails : details);

  const handleSave = () => {
    if (onSave) {
      onSave(editedDetails);
    }
    setIsEditing(false);
  };

  const handleReset = () => {
    setEditedDetails(details);
  };

  return (
    <Portal>
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: colors.surface,
              width: '90%',
              maxHeight: '80%',
              borderRadius: wp(3),
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: wp(4),
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: hp(2.5),
                    fontWeight: '600',
                    color: colors.text,
                  }}
                >
                  {title}
                </Text>
                {onSave && (
                  <TouchableOpacity
                    style={{ marginLeft: wp(2) }}
                    onPress={() => setIsEditing(!isEditing)}
                  >
                    <Text style={{ fontSize: hp(2), color: colors.primary }}>
                      ✏️
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={onClose}>
                <Text style={{ fontSize: hp(3), color: colors.text }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView
              style={{
                padding: wp(4),
              }}
            >
              {/* Document Images at the top - only show if showDocument is true */}
              {showDocument && images && images.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginBottom: hp(3),
                    gap: wp(2),
                  }}
                >
                  {images.slice(0, 2).map((image, index) => (
                    <View
                      key={index}
                      style={{
                        width: wp(35),
                        height: hp(20),
                        backgroundColor: '#f5f5f5',
                        borderRadius: wp(2),
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: colors.border || '#e0e0e0',
                      }}
                    >
                      {image.type === 'application/pdf' ? (
                        <Image
                          source={pdf}
                          style={{
                            width: '100%',
                            height: '100%',
                          }}
                          resizeMode="contain"
                        />
                      ) : (
                        <Image
                          source={{ uri: image.uri }}
                          style={{
                            width: '100%',
                            height: '100%',
                          }}
                          resizeMode="cover"
                        />
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Document Details Form - Always show if details exist */}
              {detailsArray.length > 0 && (
                <View style={{ marginBottom: hp(2) }}>
                  {/* Render in two-column layout */}
                  {Array.from({
                    length: Math.ceil(detailsArray.length / 2),
                  }).map((_, rowIndex) => (
                    <View
                      key={rowIndex}
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: hp(2),
                        gap: wp(2),
                      }}
                    >
                      {/* Left Column */}
                      {detailsArray[rowIndex * 2] && (
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: hp(1.8),
                              fontWeight: '600',
                              color: colors.text,
                              marginBottom: hp(0.5),
                            }}
                          >
                            {detailsArray[rowIndex * 2][0]}
                          </Text>
                          <View
                            style={{
                              backgroundColor:
                                colors.inputBackground || '#f5f5f5',
                              borderRadius: wp(2),
                              padding: wp(3),
                              borderWidth: 1,
                              borderColor: colors.border || '#e0e0e0',
                            }}
                          >
                            {isEditing ? (
                              <TextInput
                                value={String(detailsArray[rowIndex * 2][1])}
                                onChangeText={text => {
                                  const key = detailsArray[rowIndex * 2][0];
                                  setEditedDetails({
                                    ...editedDetails,
                                    [key]: text,
                                  });
                                }}
                                style={{
                                  fontSize: hp(1.8),
                                  color: colors.text,
                                  padding: 0,
                                }}
                                placeholderTextColor={colors.textSecondary}
                              />
                            ) : (
                              <Text
                                style={{
                                  fontSize: hp(1.8),
                                  color: colors.textSecondary || '#666',
                                }}
                              >
                                {detailsArray[rowIndex * 2][1]}
                              </Text>
                            )}
                          </View>
                        </View>
                      )}

                      {/* Right Column */}
                      {detailsArray[rowIndex * 2 + 1] && (
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: hp(1.8),
                              fontWeight: '600',
                              color: colors.text,
                              marginBottom: hp(0.5),
                            }}
                          >
                            {detailsArray[rowIndex * 2 + 1][0]}
                          </Text>
                          <View
                            style={{
                              backgroundColor:
                                colors.inputBackground || '#f5f5f5',
                              borderRadius: wp(2),
                              padding: wp(3),
                              borderWidth: 1,
                              borderColor: colors.border || '#e0e0e0',
                            }}
                          >
                            {isEditing ? (
                              <TextInput
                                value={String(
                                  detailsArray[rowIndex * 2 + 1][1],
                                )}
                                onChangeText={text => {
                                  const key = detailsArray[rowIndex * 2 + 1][0];
                                  setEditedDetails({
                                    ...editedDetails,
                                    [key]: text,
                                  });
                                }}
                                style={{
                                  fontSize: hp(1.8),
                                  color: colors.text,
                                  padding: 0,
                                }}
                                placeholderTextColor={colors.textSecondary}
                              />
                            ) : (
                              <Text
                                style={{
                                  fontSize: hp(1.8),
                                  color: colors.textSecondary || '#666',
                                }}
                              >
                                {detailsArray[rowIndex * 2 + 1][1]}
                              </Text>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Handle special case for Mobile Number with country code */}
              {detailsArray.some(([key]) =>
                key.toLowerCase().includes('mobile'),
              ) && (
                <View style={{ marginTop: hp(1) }}>
                  <Text
                    style={{
                      fontSize: hp(1.8),
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: hp(0.5),
                    }}
                  >
                    Mobile Number
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.inputBackground || '#f5f5f5',
                      borderRadius: wp(2),
                      padding: wp(3),
                      borderWidth: 1,
                      borderColor: colors.border || '#e0e0e0',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginRight: wp(2),
                      }}
                    >
                      <Text style={{ fontSize: hp(2) }}>🇮🇳</Text>
                      <Text
                        style={{
                          fontSize: hp(1.8),
                          color: colors.textSecondary || '#666',
                          marginLeft: wp(1),
                        }}
                      >
                        +91
                      </Text>
                      <Text style={{ fontSize: hp(1.5), marginLeft: wp(1) }}>
                        ⌄
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: hp(1.8),
                        color: colors.textSecondary || '#666',
                        flex: 1,
                      }}
                    >
                      {detailsArray.find(([key]) =>
                        key.toLowerCase().includes('mobile'),
                      )?.[1] || '864-9031'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              {isEditing ? (
                <View
                  style={{
                    marginTop: hp(3),
                    marginBottom: hp(2),
                    flexDirection: 'row',
                    gap: wp(3),
                  }}
                >
                  {/* Reset Button */}
                  <TouchableOpacity
                    onPress={handleReset}
                    style={{
                      flex: 1,
                      backgroundColor: colors.surface,
                      borderRadius: wp(2),
                      paddingVertical: hp(1.5),
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: colors.primary,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        fontSize: hp(2),
                        fontWeight: '600',
                      }}
                    >
                      Reset
                    </Text>
                  </TouchableOpacity>

                  {/* Save Changes Button */}
                  <TouchableOpacity
                    onPress={handleSave}
                    style={{
                      flex: 1,
                      backgroundColor: colors.primary,
                      borderRadius: wp(2),
                      paddingVertical: hp(1.5),
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: colors.surface,
                        fontSize: hp(2),
                        fontWeight: '600',
                      }}
                    >
                      Save Changes
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ marginTop: hp(3), marginBottom: hp(2) }}>
                  <TouchableOpacity
                    onPress={onClose}
                    style={{
                      backgroundColor: colors.primary,
                      borderRadius: wp(2),
                      paddingVertical: hp(1.5),
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: colors.surface,
                        fontSize: hp(2),
                        fontWeight: '600',
                      }}
                    >
                      Ok
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const BottomSheetOptions = ({
  visible = false,
  setVisible,
  onCancelHandler,
  limit,
  setFiles,
  files,
}: {
  visible: boolean;
  setVisible: any;
  onCancelHandler: any;
  limit: number;
  setFiles: any;
  files: any;
}) => {
  const [showCamera, setShowCamera] = React.useState(false);
  const { colors } = useTheme();
  return (
    <Portal>
      {showCamera && (
        <Camera
          setVisible={setShowCamera}
          visible={showCamera}
          onCancelHandler={onCancelHandler}
          limit={limit}
          setFiles={setFiles}
          files={files}
        />
      )}
      <Modal visible={visible} animationType="slide" transparent={true}>
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
          }}
        >
          <Pressable
            onPress={() => onCancelHandler()}
            style={{
              flex: 1,
              width: '100%',
            }}
          />
          <View
            style={{
              // height: '20%',
              width: '100%',
              alignItems: 'center',
              backgroundColor: '#fff',
              paddingTop: '8%',
              paddingBottom: '8%',
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              paddingHorizontal: '5%',
              position: 'absolute',
              bottom: 0,
            }}
          >
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                gap: 10,
              }}
            >
              <TouchableOpacity
                style={{
                  height: 70,
                  width: 70,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={async () => {
                  setShowCamera(true);
                  setVisible(false);
                }}
              >
                <Image
                  source={cameraIcon}
                  style={{
                    height: 40,
                    width: 40,
                  }}
                  tintColor={colors.primary}
                />
                <Text
                  style={{
                    marginTop: 3,
                  }}
                >
                  Camera
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  height: 70,
                  width: 70,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={async () => {
                  setVisible(false);
                  const results = await pick({
                    type: [types.pdf, types.images],
                    allowMultiSelection: limit > 1,
                  });

                  if (results.length > limit) {
                    logAlert(`You can only select ${limit} file`);
                    return;
                  } else {
                    let files: any = [];
                    for (let index = 0; index < results.length; index++) {
                      const element = results[index];

                      files.push({
                        uri: element.uri,
                        name: element.name?.replace(/[^a-zA-Z0-9. ]/g, ''),
                        type: element.type,
                      });
                    }

                    setFiles(files);
                  }
                }}
              >
                <Image
                  source={fileIcon}
                  style={{
                    height: 40,
                    width: 40,
                  }}
                  tintColor={colors.primary}
                />
                <Text
                  style={{
                    marginTop: 3,
                  }}
                >
                  File
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

// const Viewer = ({ image }: { image: any }) => {
//   return (
//     <Modal visible animationType="slide" transparent={true}>
//       <View>
//         <Image
//           source={{
//             uri: image.uri,
//           }}
//           style={{
//             height: "100%",
//             width: "100%",
//             objectFit: "contain",
//           }}
//         />
//       </View>
//     </Modal>
//   );
//   if (image.type == "application/pdf") {
//     return (
//       <Image
//         source={pdf}
//         style={{
//           height: "100%",
//           width: "100%",
//           objectFit: "contain",
//         }}
//       />
//     );
//   }
// };

const CustomUploadButton = ({
  header = 'Upload Reciept',
  headerDesc = '',
  title = 'Click Here To Choose File',
  description = 'Supported formats: IMAGES & PDF',
  images = [],
  setImages = () => {},
  limit = 1,
  required = false,
  missing = false,
  disabled = false,
  details,
  showDocument = false, // Controls whether document images are shown in the preview modal
  onDetailsUpdate, // Callback when details are updated from modal
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
  details?: Record<string, any>;
  showDocument?: boolean; // Controls whether document images are shown in the preview modal
  onDetailsUpdate?: (updatedDetails: Record<string, any>) => void;
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [showOptionsModal, setShowOptionsModal] = React.useState(false);
  const [showCamera, setShowCamera] = React.useState(false);
  const [visible, setVisible] = React.useState<any>();
  const [loading, setLoading] = React.useState(false);
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<{
    title: string;
    details: Record<string, any>;
  }>({ title: '', details: {} });

  return (
    <View>
      <Loader loading={loading} />
      {showCamera && (
        <Camera
          setVisible={setShowCamera}
          visible={showCamera}
          onCancelHandler={() => setShowCamera(false)}
          limit={limit}
          setFiles={setImages}
          files={images}
        />
      )}
      {visible ? (
        visible.type == 'application/pdf' ? (
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

      <DetailsModal
        visible={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        details={previewData.details}
        title={previewData.title}
        images={images}
        showDocument={showDocument}
        onSave={updatedDetails => {
          if (onDetailsUpdate) {
            onDetailsUpdate(updatedDetails);
          }
          setShowPreviewModal(false);
        }}
      />

      <BottomSheetOptions
        setVisible={setShowOptionsModal}
        visible={showOptionsModal}
        onCancelHandler={() => setShowOptionsModal(false)}
        limit={limit}
        setFiles={setImages}
        files={images}
      />

      {header && (
        <View style={{ paddingBottom: hp(1), flexDirection: 'column' }}>
          <View
            style={{
              flexDirection: 'row',
              //justifyContent: 'space-between',
              alignItems: 'center',
              gap: wp(2),
            }}
          >
            <Image
              source={documentHeader}
              style={{ width: wp(6), height: hp(3) }}
              resizeMode="contain"
            />
            <View
              style={{
                flexDirection: 'row',
                gap: wp(0.5),
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: hp(1.5),
                }}
              >
                {header}{' '}
                {required && (
                  <Text
                    style={{
                      color: colors.error,
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
                  color: colors.info,
                  fontSize: hp(1.5),
                }}
              >
                {headerDesc ? `(${headerDesc})` : null}
              </Text>
            </View>
          )}
        </View>
      )}

      {details && images.length > 0 ? (
        // Details view - shows card with document, name and actions
        <View
          style={[
            styles.detailsCard,
            {
              borderColor: missing ? colors.error : colors.primary,
              backgroundColor: colors.surface,
            },
          ]}
        >
          {/* Document Images */}
          <View style={{ gap: hp(1) }}>
            {images.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={styles.detailsImageContainer}
                onPress={async () => {
                  if (image.type === 'application/pdf') {
                    setLoading(true);
                    if (image.uri.includes('content://')) {
                      if (Platform.OS === 'android') {
                        const base64 = await convertContentUriToBase64(
                          image.uri,
                        );
                        setVisible({
                          index: index,
                          uri: base64,
                          type: 'application/pdf',
                          name: image.name.replace(/[^a-zA-Z0-9. ]/g, ''),
                        });
                        setLoading(false);
                      } else {
                        getBase64Data(image.uri)
                          .then(base64 => {
                            setVisible({
                              index: index,
                              uri: image.uri,
                              type: 'application/pdf',
                              name: image.name.replace(/[^a-zA-Z0-9. ]/g, ''),
                            });
                            setLoading(false);
                          })
                          .catch(err => {
                            setLoading(false);
                          });
                      }
                    } else {
                      setVisible({
                        index: index,
                        uri: image.uri,
                        type: 'application/pdf',
                        name: image.name.replace(/[^a-zA-Z0-9. ]/g, ''),
                      });
                      setLoading(false);
                    }
                  } else {
                    setVisible({
                      index: index,
                      uri: image.uri,
                      type: image.type,
                      name: image.name.replace(/[^a-zA-Z0-9. ]/g, ''),
                    });
                  }
                }}
              >
                {image.type === 'application/pdf' ? (
                  <Image
                    source={pdf}
                    style={styles.detailsPdfImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.detailsImage}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Document Details and Actions */}
          <View style={styles.detailsInfo}>
            <View style={styles.detailsTextContainer}>
              {details?.name && (
                <Text style={[styles.detailsName, { color: colors.text }]}>
                  Name: {details.name}
                </Text>
              )}
              {details?.card_type && (
                <Text style={[styles.detailsType, { color: colors.text }]}>
                  {details.card_type}
                </Text>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.detailsActions}>
              {/* Preview Button */}
              <TouchableOpacity
                onPress={() => {
                  setPreviewData({
                    title: header,
                    details: details || {},
                  });
                  setShowPreviewModal(true);
                }}
                style={[
                  styles.detailsActionButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={{ fontSize: hp(2.5) }}>👁️</Text>
              </TouchableOpacity>

              {/* Delete Button */}
              {!disabled && (
                <TouchableOpacity
                  onPress={() => {
                    logAlert(
                      'Are you sure you want to remove this document?',
                      () => {
                        // If limit is 2 and we have 2 images, delete both together
                        if (limit === 2 && images.length === 2) {
                          setImages([]);
                        } else {
                          // For single documents, delete all images (since we're in details view)
                          setImages([]);
                        }
                      },
                      () => {},
                    );
                  }}
                  style={[
                    styles.detailsActionButton,
                    { backgroundColor: '#fee', borderColor: '#fcc' },
                  ]}
                >
                  <Image
                    source={closeIcon}
                    style={{ width: wp(5), height: wp(5) }}
                    tintColor={colors.error}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.uploadYourDocuments,
            {
              borderStyle: missing ? 'solid' : 'dashed',
              backgroundColor: disabled
                ? colors.inputDisabledBackground
                : colors.surface,
              borderColor: missing
                ? colors.error
                : disabled
                ? colors.inputDisabledBackground
                : colors.primary,
            },
          ]}
        >
          {images.length > 0 ? (
            <View
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                flexDirection: 'row',
              }}
            >
              {!disabled && (
                <TouchableOpacity
                  disabled={disabled}
                  onPress={() => {
                    const message =
                      limit === 2 && images.length === 2
                        ? 'Are you sure you want to remove both documents?'
                        : 'Are you sure you want to remove the uploaded documents?';

                    logAlert(
                      message,
                      () => {
                        setImages([]);
                      },
                      () => {},
                    );
                  }}
                  style={{
                    position: 'absolute',
                    right: 5,
                    top: 5,
                    zIndex: 2,
                    backgroundColor: 'red',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: '#fff' }}>Remove</Text>
                </TouchableOpacity>
              )}

              {images.map((image, index) =>
                image.type == 'application/pdf' ? (
                  <TouchableOpacity
                    key={index}
                    onPress={async () => {
                      if (image.uri.includes('content://')) {
                        if (Platform.OS === 'android') {
                          const base64 = await convertContentUriToBase64(
                            image.uri,
                          );

                          setVisible({
                            index: index,
                            uri: base64,
                            type: 'application/pdf',
                            name: image.name.replace(/[^a-zA-Z0-9. ]/g, ''),
                          });
                          setLoading(false);
                        } else {
                          getBase64Data(image.uri)
                            .then(base64 => {
                              setVisible({
                                index: index,
                                uri: image.uri,
                                type: 'application/pdf',
                                name: image.name.replace(/[^a-zA-Z0-9. ]/g, ''),
                              });
                              setLoading(false);
                            })
                            .catch(err => {});
                        }
                      } else {
                        setVisible({
                          index: index,
                          uri: image.uri,
                          type: 'application/pdf',
                          name: image.name.replace(/[^a-zA-Z0-9. ]/g, ''),
                        });
                        setLoading(false);
                      }
                    }}
                    style={{
                      zIndex: 1,
                      height: '100%',
                      width: images.length > 1 ? '50%' : '100%',
                      borderWidth: 1,
                      borderColor: 'white',
                    }}
                  >
                    <Image
                      key={index}
                      source={pdf}
                      style={{
                        zIndex: 1,
                        height: '50%',
                        width: '100%',
                        borderWidth: 1,
                        marginVertical: 'auto',
                        objectFit: 'contain',
                      }}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setVisible({
                        index: index,
                        uri: image.uri,
                        type: image.type,
                        name: image.name.replace(/[^a-zA-Z0-9. ]/g, ''),
                      });
                    }}
                    style={{
                      zIndex: 1,
                      height: '100%',
                      width: images.length > 1 ? '50%' : '100%',
                      borderWidth: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderColor: 'white',
                    }}
                  >
                    <Image
                      key={index}
                      source={{
                        uri: image.uri,
                      }}
                      style={{
                        zIndex: 1,
                        height: '100%',
                        width: '100%',
                        borderWidth: 1,
                        borderColor: 'white',
                        objectFit: 'contain',
                      }}
                    />
                  </TouchableOpacity>
                ),
              )}
            </View>
          ) : (
            <View
              style={{
                position: 'relative',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                alignItems: 'center',
                paddingVertical: hp(3),
              }}
            >
              {/* Cloud Upload Icon */}
              <Image
                source={download}
                style={{
                  width: wp(20),
                  height: hp(8),
                  resizeMode: 'contain',
                  marginBottom: hp(2),
                }}
                tintColor={colors.primary}
              />

              {/* Upload Area Title */}
              <Text
                style={{
                  color: colors.text,
                  fontSize: hp(2.8),
                  fontWeight: '600',
                  marginBottom: hp(0.5),
                }}
              >
                Upload Area
              </Text>

              {/* Subtitle */}
              <Text
                style={{
                  fontSize: hp(1.6),
                  color: colors.textSecondary,
                  marginBottom: hp(3),
                }}
              >
                Please upload a jpg, png, pdf file
              </Text>

              {/* Buttons Container */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: wp(3),
                  width: '80%',
                }}
              >
                {/* Browse File Button */}
                <TouchableOpacity
                  disabled={disabled}
                  onPress={async () => {
                    if (disabled) return;
                    const results = await pick({
                      type: [types.pdf, types.images],
                      allowMultiSelection: limit > 1,
                    });

                    if (results.length > limit) {
                      logAlert(`You can only select ${limit} file`);
                      return;
                    } else {
                      let files: any = [];
                      for (let index = 0; index < results.length; index++) {
                        const element = results[index];
                        files.push({
                          uri: element.uri,
                          name: element.name?.replace(/[^a-zA-Z0-9. ]/g, ''),
                          type: element.type,
                        });
                      }
                      setImages(files);
                    }
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: disabled
                      ? colors.inputDisabledBackground
                      : colors.primary,
                    paddingVertical: hp(1.5),
                    borderRadius: wp(2),
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: wp(2),
                    opacity: disabled ? 0.6 : 1,
                  }}
                >
                  <Image
                    source={fileIcon}
                    style={{
                      width: wp(5),
                      height: wp(5),
                      tintColor: colors.surface,
                    }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      color: colors.surface,
                      fontSize: hp(1.8),
                      fontWeight: '600',
                    }}
                  >
                    Browse File
                  </Text>
                </TouchableOpacity>

                {/* Capture Button */}
                <TouchableOpacity
                  disabled={disabled}
                  onPress={() => {
                    if (disabled) return;
                    setShowCamera(true);
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    paddingVertical: hp(1.5),
                    borderRadius: wp(2),
                    borderWidth: 2,
                    borderColor: disabled
                      ? colors.inputDisabledBackground
                      : colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: disabled ? 0.6 : 1,
                  }}
                >
                  <Text
                    style={{
                      color: disabled
                        ? colors.inputDisabledBackground
                        : colors.primary,
                      fontSize: hp(1.8),
                      fontWeight: '600',
                    }}
                  >
                    Capture
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default CustomUploadButton;

const createStyles = (colors: any) =>
  StyleSheet.create({
    uploadYourDocuments: {
      backgroundColor: colors.surface,
      height: hp(32),
      borderRadius: wp(3),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
    button: {
      borderRadius: wp(2),
      paddingVertical: hp(1.3),
      paddingHorizontal: wp(6),
      borderColor: colors.primary,
      borderWidth: 1,
      marginTop: hp(1.5),
    },
    detailsCard: {
      borderWidth: 1,
      borderRadius: wp(3),
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    detailsImageContainer: {
      width: '100%',
      height: hp(30),
      backgroundColor: '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    detailsImage: {
      width: '100%',
      height: '100%',
    },
    detailsPdfImage: {
      width: '50%',
      height: '50%',
    },
    detailsInfo: {
      padding: wp(4),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailsTextContainer: {
      flex: 1,
      gap: hp(0.5),
    },
    detailsName: {
      fontSize: hp(1.8),
      fontWeight: '600',
    },
    detailsType: {
      fontSize: hp(1.6),
      fontWeight: '400',
    },
    detailsActions: {
      flexDirection: 'row',
      gap: wp(2),
      marginLeft: wp(2),
    },
    detailsActionButton: {
      width: wp(10),
      height: wp(10),
      borderRadius: wp(2),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
  });
