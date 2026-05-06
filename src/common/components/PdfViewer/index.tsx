import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React from "react";
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from "react-native-responsive-screen";
import Pdf from "react-native-pdf";
import { back, download, dustbin } from "../../assets";
import RNFS from "react-native-fs";
import { downloadButton } from "@src/components/images";
import { logSuccess } from "@src/common/utils/logger";

const PdfViewer = ({
  visible,
  setVisible,
  pdfBase64,
  header = "",
  downloadAllowed = true,
  deleteAllowed = false,
  onDelete,
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  pdfBase64: string;
  header?: string;
  downloadAllowed?: boolean;
  deleteAllowed?: boolean;
  onDelete?: () => void;
}) => {
  const downloadPdf = async () => {
    const timeStamp = new Date().getTime();
    const downloadDest = `${RNFS.DownloadDirectoryPath}/downloaded_pdf_${timeStamp}.pdf`;

    try {
      await RNFS.writeFile(downloadDest, pdfBase64, "base64");
      logSuccess(`PDF downloaded successfully to ${downloadDest}`);
    } catch (err) {
      console.error(err);
      Alert.alert(
        "Download Error",
        "An error occurred while downloading the PDF."
      );
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(!visible)}
    >
      <View
        style={{
          alignItems: "center",
          height: heightPercentageToDP(100),
          width: widthPercentageToDP(100),
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            padding: heightPercentageToDP(2),
            width: widthPercentageToDP(100),
            marginHorizontal: widthPercentageToDP(20),
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity onPress={() => setVisible(!visible)}>
            <Image
              source={back}
              style={{
                height: heightPercentageToDP(2.5),
                width: widthPercentageToDP(5),
              }}
            />
          </TouchableOpacity>

          <Text
            style={{
              color: "#000",
              fontSize: heightPercentageToDP(2),
              fontWeight: "bold",
            }}
          >
            {header}
          </Text>
          <View
            style={{ width: heightPercentageToDP(2.5), flexDirection: "row" }}
          >
            {downloadAllowed && (
              <TouchableOpacity
                testID="download-button"
                onPress={downloadPdf}
                style={{ marginRight: 10 }}
              >
                <Image
                  source={downloadButton}
                  tintColor={"#000000"}
                  style={{
                    height: heightPercentageToDP(2.5),
                    width: widthPercentageToDP(5),
                  }}
                />
              </TouchableOpacity>
            )}

            {deleteAllowed && (
              <TouchableOpacity testID="delete-button" onPress={onDelete}>
                <Image
                  source={dustbin}
                  style={{
                    height: heightPercentageToDP(2.5),
                    width: widthPercentageToDP(5),
                  }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Pdf
          enableAnnotationRendering={true}
          enableAntialiasing={false}
          trustAllCerts={false}
          source={{
            uri:
              pdfBase64 && pdfBase64?.startsWith("data:application/pdf;base64,")
                ? pdfBase64
                : "data:application/pdf;base64," + pdfBase64,
            // cache: true,
          }}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`number of pages: ${numberOfPages}, ${filePath}`);
          }}
          onPageChanged={(page, numberOfPages) => {}}
          onError={(error) => {}}
          style={{ flex: 1, width: widthPercentageToDP(90) }}
        />
      </View>
    </Modal>
  );
};

export default PdfViewer;
