import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";

interface LoanDocumentModalProps {
  visible: boolean;
  onClose: () => void;
}

const LoanDocumentModal: React.FC<LoanDocumentModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors, isDark);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Loan Document
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeIcon, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Income Proof Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Income Proof:
              </Text>
              <View style={styles.underline} />
              <View style={styles.listContainer}>
                <Text
                  style={[styles.listItem, { color: colors.textSecondary }]}
                >
                  • Recent Salary SLips
                </Text>
                <Text
                  style={[styles.listItem, { color: colors.textSecondary }]}
                >
                  • Bank Statements
                </Text>
                <Text
                  style={[styles.listItem, { color: colors.textSecondary }]}
                >
                  • Income Tax Return
                </Text>
                <Text
                  style={[styles.listItem, { color: colors.textSecondary }]}
                >
                  • Audited / Management Accounts
                </Text>
              </View>
            </View>

            {/* Employment / Business Proof Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Employment / Business Proof:
              </Text>
              <View style={styles.underline} />
              <View style={styles.listContainer}>
                <Text
                  style={[styles.listItem, { color: colors.textSecondary }]}
                >
                  • Employment ID Card
                </Text>
                <Text
                  style={[styles.listItem, { color: colors.textSecondary }]}
                >
                  • Employment / Job Letter
                </Text>
                <Text
                  style={[styles.listItem, { color: colors.textSecondary }]}
                >
                  • Appointment Letter / Offer Letter
                </Text>
                <Text
                  style={[styles.listItem, { color: colors.textSecondary }]}
                >
                  • Property Tax Bill / Land Tax Assessment
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: wp(6),
    },
    modalCard: {
      width: "100%",
      minHeight: "60%",
      backgroundColor: colors.surface,
      borderRadius: wp(5),
      paddingVertical: hp(2),
      paddingHorizontal: wp(5),
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: hp(2),
      paddingBottom: hp(1),
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: hp(2.2),
      fontWeight: "bold",
    },
    closeButton: {
      padding: wp(2),
    },
    closeIcon: {
      fontSize: hp(2.5),
      fontWeight: "bold",
    },
    modalContent: {
      flex: 1,
    },
    modalContentContainer: {
      paddingBottom: hp(2),
    },
    section: {
      marginBottom: hp(3),
    },
    sectionTitle: {
      fontSize: hp(2.2),
      fontWeight: "600",
      marginBottom: hp(0.5),
    },
    underline: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: hp(1.5),
    },
    listContainer: {
      paddingLeft: wp(2),
    },
    listItem: {
      fontSize: hp(1.8),
      lineHeight: hp(2.4),
      marginBottom: hp(0.8),
    },
  });

export default LoanDocumentModal;
