import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import AlertService from "./index";
import { alertIcon, errorIcon, successIcon } from "../../assets";
import { capitalizeFirstLetter } from "../../utils/string";
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from "react-native-responsive-screen";
import { useTheme } from "../../ThemeContext";

let types = [
  {
    type: "alert",
    icon: alertIcon,
  },
  {
    type: "error",
    icon: errorIcon,
  },
  {
    type: "success",
    icon: successIcon,
  },
];

// Provider Component
export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const { colors } = useTheme();
  const [alert, setAlert] = useState({
    type: "alert",
    icon: alertIcon,
    visible: false,
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
    showNoButton: false,
  });

  const showAlert = (
    message: string,
    type?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    setAlert({
      type: type || types[0].type,
      icon: types.find((t) => t.type === type)?.icon || types[0].icon,
      visible: true,
      message,
      onConfirm: onConfirm
        ? () => {
            if (onConfirm) {
              onConfirm();
            }
            hideAlert();
          }
        : hideAlert,
      onCancel: () => {
        if (onCancel) {
          onCancel();
        }
        hideAlert();
      },
      showNoButton: onCancel ? true : false,
    });
  };

  const hideAlert = () => {
    setAlert({ ...alert, visible: false });
  };

  useEffect(() => {
    AlertService.register(showAlert);
  }, []);

  return (
    <>
      {children}
      {alert.visible && (
        <Modal transparent={true} visible={alert.visible} animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.alertBox,
                {
                  maxHeight: heightPercentageToDP(50),
                  flex: alert?.message?.length > 100 ? 1 : undefined,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <View style={styles.iconContainer}>
                <Image source={alert.icon} style={{ width: 50, height: 50 }} />
              </View>
              <Text style={[styles.alertTitle, { color: colors.text }]}>
                {capitalizeFirstLetter(alert.type)}
              </Text>

              <ScrollView
                style={{
                  flex: alert?.message?.length > 100 ? 1 : undefined,
                }}
              >
                <Text
                  style={[
                    styles.alertMessage,
                    {
                      textAlign:
                        alert?.message?.length > 100 ? "left" : "center",
                      // flex: 1,
                      overflow: "scroll",
                      color: colors.text,
                    },
                  ]}
                >
                  {alert?.message}
                </Text>
              </ScrollView>

              {alert.showNoButton ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.buttonNo,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={alert.onCancel}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: colors.primary,
                        },
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={alert.onConfirm}
                  >
                    <Text
                      style={[styles.buttonText, { color: colors.buttonText }]}
                    >
                      Yes
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={alert.onConfirm}
                  >
                    <Text
                      style={[styles.buttonText, { color: colors.buttonText }]}
                    >
                      Ok
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: widthPercentageToDP(85),
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  iconContainer: {
    padding: 10,
    borderRadius: 50,
    position: "absolute",
    top: -35,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  alertMessage: {
    fontSize: 16,
    color: "#333",

    marginTop: 5,
    marginBottom: 6,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonNo: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
  },
});
