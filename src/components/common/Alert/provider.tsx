import React, { createContext, useState, useContext, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import AlertService from "./index";
import { alertIcon, errorIcon, successIcon } from "@src/components/images";
import { capitalizeFirstLetter } from "@src/common";

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
            <View style={styles.alertBox}>
              <View style={styles.iconContainer}>
                <Image source={alert.icon} style={{ width: 50, height: 50 }} />
              </View>
              <Text style={styles.alertTitle}>
                {capitalizeFirstLetter(alert.type)}
              </Text>
              <Text style={styles.alertMessage}>{alert?.message}</Text>
              {alert.showNoButton ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.buttonNo]}
                    onPress={alert.onCancel}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: "#F13937",
                        },
                      ]}
                    >
                      No
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={alert.onConfirm}
                  >
                    <Text style={styles.buttonText}>Yes</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={alert.onCancel}
                  >
                    <Text style={styles.buttonText}>Ok</Text>
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
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
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
    textAlign: "center",
    marginTop: 5,
    marginBottom: 6,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#F13937",
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonNo: {
    borderColor: "#F13937",
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
