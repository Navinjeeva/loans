import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import AlertService from './index';

import { capitalizeFirstLetter } from '../../utils/string';
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen';
import { alertIcon, errorIcon, successIcon } from '@src/common/assets';
import { useTheme } from '@src/common/utils/ThemeContext';

let types = [
  {
    type: 'alert',
    icon: alertIcon,
  },
  {
    type: 'error',
    icon: errorIcon,
  },
  {
    type: 'success',
    icon: successIcon,
  },
];

// Provider Component
export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alert, setAlert] = useState({
    type: 'alert',
    icon: alertIcon,
    visible: false,
    message: '',
    confirmText: 'Proceed',
    cancelText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => {},
    showNoButton: false,
  });

  const showAlert = (
    message: string,
    type?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
  ) => {
    setAlert({
      type: type || types[0].type,
      icon: types.find(t => t.type === type)?.icon || types[0].icon,
      visible: true,
      message,
      confirmText: confirmText ? confirmText : 'Proceed',
      cancelText: cancelText ? cancelText : 'Cancel',
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

  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  return (
    <>
      {children}
      {alert.visible && (
        <Modal
          transparent={true}
          onDismiss={() => hideAlert()}
          visible={alert.visible}
          animationType="fade"
        >
          <Pressable onPress={() => hideAlert()} style={styles.modalOverlay}>
            <View
              style={[
                styles.alertBox,
                {
                  zIndex: 10,
                  maxHeight: heightPercentageToDP(50),
                  flex: alert?.message?.length > 300 ? 1 : undefined,
                },
              ]}
            >
              <View style={styles.iconContainer}>
                <Image source={alert.icon} style={{ width: 50, height: 50 }} />
              </View>
              <Text style={styles.alertTitle}>
                {capitalizeFirstLetter(alert.type)}
              </Text>

              <ScrollView
                style={{
                  flex: alert?.message?.length > 300 ? 1 : undefined,
                }}
              >
                <Text
                  style={[
                    styles.alertMessage,
                    {
                      textAlign:
                        alert?.message?.length > 300 ? 'left' : 'center',
                      // flex: 1,
                      overflow: 'scroll',
                    },
                  ]}
                >
                  {alert?.message}
                </Text>
              </ScrollView>

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
                          color: '#E3781C',
                        },
                      ]}
                    >
                      {alert.cancelText}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={alert.onConfirm}
                  >
                    <Text style={styles.buttonText}>{alert.confirmText}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={alert.onConfirm}
                  >
                    <Text style={styles.buttonText}>OK</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    alertBox: {
      width: widthPercentageToDP(85),
      padding: 20,
      backgroundColor: '#fff',
      borderRadius: 10,
      alignItems: 'center',
    },
    iconContainer: {
      padding: 10,
      borderRadius: 50,
      position: 'absolute',
      top: -35,
    },
    alertTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 10,
    },
    alertMessage: {
      fontSize: heightPercentageToDP(1.8),
      color: '#333',

      marginTop: 5,
      marginBottom: 6,
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 20,
    },
    button: {
      flex: 1,
      backgroundColor: colors.buttonPrimary,
      paddingVertical: 10,
      borderRadius: 5,
      marginHorizontal: 5,
      alignItems: 'center',
    },
    buttonNo: {
      borderColor: '#E3781C',
      borderWidth: 1,
      backgroundColor: '#fff',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
    },
  });
