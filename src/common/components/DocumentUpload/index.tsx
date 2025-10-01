import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { cameraIcon, download, fileIcon, pdf } from '@src/common/assets/icons';
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
}: {
  visible: boolean;
  onClose: () => void;
  details: Record<string, any>;
  title: string;
}) => {
  const { colors } = useTheme();

  // Convert details object to array for better rendering
  const detailsArray = Object.entries(details);

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
                <TouchableOpacity style={{ marginLeft: wp(2) }}>
                  <Text style={{ fontSize: hp(2), color: colors.primary }}>
                    ✏️
                  </Text>
                </TouchableOpacity>
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
              {/* Render in two-column layout */}
              {Array.from({ length: Math.ceil(detailsArray.length / 2) }).map(
                (_, rowIndex) => (
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
                          <Text
                            style={{
                              fontSize: hp(1.8),
                              color: colors.textSecondary || '#666',
                            }}
                          >
                            {detailsArray[rowIndex * 2][1]}
                          </Text>
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
                          <Text
                            style={{
                              fontSize: hp(1.8),
                              color: colors.textSecondary || '#666',
                            }}
                          >
                            {detailsArray[rowIndex * 2 + 1][1]}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                ),
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
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [showOptionsModal, setShowOptionsModal] = React.useState(false);
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
              justifyContent: 'space-between',
            }}
          >
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
        // Details view - shows card for each document with name and type
        <View style={{ gap: hp(2) }}>
          {images.map((image, index) => (
            <View
              key={index}
              style={[
                styles.detailsCard,
                {
                  borderColor: missing ? colors.error : colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
            >
              {/* Document Image Preview */}
              <TouchableOpacity
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
                        title: `Document ${index + 1}`,
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
                            setImages(images.filter((_, i) => i !== index));
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
          ))}
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
                    logAlert(
                      'Are you sure you want to remove the uploaded documents?',
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
            <TouchableOpacity
              disabled={disabled}
              style={[
                {
                  position: 'relative',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                },
              ]}
              onPress={async () => {
                if (disabled) return;
                setShowOptionsModal(true);
              }}
            >
              <Image
                source={download}
                style={{
                  width: wp(20),
                  height: hp(7),
                  resizeMode: 'contain',
                }}
                tintColor={colors.primary}
              />
              <Text
                style={{
                  color: colors.text,
                  fontSize: hp(2.5),
                  marginTop: hp(0.5),
                  marginVertical: hp(0.5),
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: hp(1.4),
                  color: colors.textSecondary,
                }}
              >
                {description}
              </Text>
            </TouchableOpacity>
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
      height: hp(25),
      borderRadius: wp(2),
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
