import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import React from 'react';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import RNFS from 'react-native-fs';

const ImageViewer = ({
  visible,
  setVisible,
  image,
  header = '',
  downloadAllowed = true,
  deleteAllowed = false,
  onDelete,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  image: string;
  header?: string;
  downloadAllowed?: boolean;
  deleteAllowed?: boolean;
  onDelete?: () => void;
}) => {
  const downloadPdf = async () => {
    const timeStamp = new Date().getTime();
    const downloadDest = `${RNFS.DownloadDirectoryPath}/downloaded_pdf_${timeStamp}.pdf`;

    try {
      await RNFS.writeFile(downloadDest, pdfBase64, 'base64');
      Alert.alert(
        'Download Successful',
        `PDF downloaded successfully to ${downloadDest}`,
      );
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Download Error',
        'An error occurred while downloading the PDF.',
      );
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(prev => !prev)}
    >
      <View
        style={{
          alignItems: 'center',
          height: heightPercentageToDP(100),
          width: widthPercentageToDP(100),
          backgroundColor: '#fff',
        }}
      >
        <View
          style={{
            padding: heightPercentageToDP(2),
            width: widthPercentageToDP(100),
            marginHorizontal: widthPercentageToDP(20),
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              color: '#000',
              fontSize: heightPercentageToDP(2),
              fontWeight: 'bold',
              width: widthPercentageToDP(60),
            }}
          >
            {header}
          </Text>
          {/* {deleteAllowed && (
            <TouchableOpacity onPress={onDelete}>
              <Image
                source={dustbin}
                style={{
                  height: heightPercentageToDP(2.5),
                  width: widthPercentageToDP(5),
                }}
              />
            </TouchableOpacity>
          )} */}
          {/* {downloadAllowed && (
            <TouchableOpacity onPress={downloadPdf}>
              <Image
                source={download}
                style={{
                  height: heightPercentageToDP(2.5),
                  width: widthPercentageToDP(5),
                }}
              />
            </TouchableOpacity>
          )} */}
        </View>

        <Image
          source={{ uri: image }}
          style={{
            height: heightPercentageToDP(80),
            width: widthPercentageToDP(100),
            resizeMode: 'contain',
          }}
        />
      </View>
    </Modal>
  );
};

export default ImageViewer;
