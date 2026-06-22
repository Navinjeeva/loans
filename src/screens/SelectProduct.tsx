import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import Button from "@src/components/Button";
import useHideBottomBar from "@src/components/useHideBottomBar";

type CustomerType = "individual" | "corporate" | null;

const ORANGE = "#F97316";

const PersonIcon = () => (
  <View style={styles.iconCircle}>
    <View style={styles.personHead} />
    <View style={styles.personBody} />
  </View>
);

const BuildingIcon = () => (
  <View style={[styles.iconCircle, { backgroundColor: "#E5E7EB" }]}>
    <View style={styles.buildingWrapper}>
      <View style={styles.buildingMain}>
        {[0, 1, 2].map((col) => (
          <View key={col} style={styles.buildingCol}>
            {[0, 1, 2].map((row) => (
              <View key={row} style={styles.buildingWindow} />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.buildingDoor} />
    </View>
  </View>
);

const SelectProduct = ({ navigation }: any) => {
  useHideBottomBar();
  const { colors } = useTheme();
const [selected, setSelected] = useState<CustomerType>(null);

  const handleContinue = () => {
    if (selected === "individual") {
      navigation.navigate("LoanCustomer");
    } else if (selected === "corporate") {
      navigation.navigate("CorporateFlow");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoBox}>
          <View style={styles.logoCheckWrapper}>
            <View style={styles.logoCheckArm1} />
            <View style={styles.logoCheckArm2} />
          </View>
        </View>
        <View style={styles.logoTextRow}>
          <Text style={[styles.logoTecu, { color: colors.text }]}>Tecu</Text>
          <Text style={[styles.logoDigi, { color: ORANGE }]}>Digi</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          Let's get you started
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tell us who's applying so we can tailor the application.
        </Text>

        <Text style={[styles.sectionLabel, { color: colors.text }]}>
          I AM APPLYING AS
        </Text>

        {/* Individual Customer */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            {
              borderColor:
                selected === "individual" ? ORANGE : colors.border,
              backgroundColor: colors.card,
            },
          ]}
          onPress={() => setSelected("individual")}
          activeOpacity={0.8}
        >
          <PersonIcon />
          <View style={styles.optionTextWrapper}>
            <View style={styles.optionTitleRow}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>
                Individual Customer
              </Text>
            </View>
            <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
              Personal loans for salaried & self-employed individuals.
            </Text>
          </View>
          <View
            style={[
              styles.radio,
              {
                borderColor: selected === "individual" ? ORANGE : colors.border,
              },
            ]}
          >
            {selected === "individual" && (
              <View style={[styles.radioDot, { backgroundColor: ORANGE }]} />
            )}
          </View>
        </TouchableOpacity>

        {/* Corporate Customer */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            {
              borderColor:
                selected === "corporate" ? ORANGE : colors.border,
              backgroundColor: colors.card,
            },
          ]}
          onPress={() => setSelected("corporate")}
          activeOpacity={0.8}
        >
          <BuildingIcon />
          <View style={styles.optionTextWrapper}>
            <Text style={[styles.optionTitle, { color: colors.text }]}>
              Corporate Customer
            </Text>
            <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
              Loans for companies, LLPs, partnerships & enterprises.
            </Text>
          </View>
          <View
            style={[
              styles.radio,
              {
                borderColor: selected === "corporate" ? ORANGE : colors.border,
              },
            ]}
          >
            {selected === "corporate" && (
              <View style={[styles.radioDot, { backgroundColor: ORANGE }]} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
        <View style={styles.encryptionRow}>
          <Text style={[styles.lockIcon, { color: colors.textSecondary }]}>
            🔒
          </Text>
          <Text style={[styles.encryptionText, { color: colors.textSecondary }]}>
            Bank-grade 256-bit encryption
          </Text>
        </View>
        <Button
          text="Continue"
          click={handleContinue}
          buttonStyle={styles.continueButton}
        />
      </View>
    </View>
  );
};

export default SelectProduct;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
    paddingBottom: hp(1),
    gap: wp(2),
  },
  logoBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCheckWrapper: {
    width: 22,
    height: 16,
    position: "relative",
  },
  logoCheckArm1: {
    position: "absolute",
    width: 8,
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 2,
    bottom: 0,
    left: 0,
    transform: [{ rotate: "-45deg" }],
  },
  logoCheckArm2: {
    position: "absolute",
    width: 14,
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 2,
    bottom: 3,
    right: 0,
    transform: [{ rotate: "-130deg" }],
  },
  logoTextRow: {
    flexDirection: "row",
  },
  logoTecu: {
    fontSize: hp(2.2),
    fontWeight: "700",
  },
  logoDigi: {
    fontSize: hp(2.2),
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(3),
  },
  title: {
    fontSize: hp(3.2),
    fontWeight: "800",
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: hp(1.8),
    lineHeight: hp(2.8),
    marginBottom: hp(3),
  },
  sectionLabel: {
    fontSize: hp(1.5),
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: hp(2),
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: hp(1.8),
    marginBottom: hp(1.8),
    gap: wp(3),
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  personHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#9CA3AF",
    marginBottom: 3,
  },
  personBody: {
    width: 20,
    height: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "#9CA3AF",
  },
  buildingWrapper: {
    alignItems: "center",
  },
  buildingMain: {
    flexDirection: "row",
    gap: 3,
  },
  buildingCol: {
    gap: 3,
  },
  buildingWindow: {
    width: 5,
    height: 5,
    backgroundColor: "#6B7280",
    borderRadius: 1,
  },
  buildingDoor: {
    width: 7,
    height: 9,
    backgroundColor: "#6B7280",
    borderRadius: 2,
    marginTop: 2,
  },
  optionTextWrapper: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    flexWrap: "wrap",
  },
  optionTitle: {
    fontSize: hp(1.9),
    fontWeight: "700",
  },
  soonBadge: {
    backgroundColor: "#E5E7EB",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  soonText: {
    fontSize: hp(1.4),
    color: "#6B7280",
    fontWeight: "600",
  },
  optionDesc: {
    fontSize: hp(1.6),
    lineHeight: hp(2.4),
    marginTop: 3,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    paddingBottom: hp(2),
  },
  encryptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(1.5),
    gap: wp(1.5),
  },
  lockIcon: {
    fontSize: hp(1.8),
  },
  encryptionText: {
    fontSize: hp(1.6),
  },
  continueButton: {
    marginHorizontal: wp(5),
    borderRadius: 12,
  },
});
