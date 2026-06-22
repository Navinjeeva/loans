import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const BRAND = "#F97316";
const TOTAL_STEPS = 6;

interface StepHeaderProps {
  step: number;
  title: string;
  onBack: () => void;
  onSaveExit: () => void;
  colors: any;
}

const StepHeader = ({ step, title, onBack, onSaveExit, colors }: StepHeaderProps) => {
  return (
    <>
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.pillChevron, { color: colors.text }]}>‹</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>

        <TouchableOpacity
          onPress={onSaveExit}
          style={[styles.pill, styles.saveExitPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.saveExitText, { color: colors.text }]}>✓  Save & exit</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.stepBarRow, { backgroundColor: colors.background }]}>
        <View style={styles.segments}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                {
                  backgroundColor:
                    i < step - 1
                      ? BRAND
                      : i === step - 1
                      ? BRAND + "88"
                      : colors.borderLight,
                },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.counter, { color: colors.textMuted }]}>
          {step}/{TOTAL_STEPS}
        </Text>
      </View>
    </>
  );
};

export default StepHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.4),
    borderBottomWidth: 1,
    gap: wp(2),
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.9),
    borderRadius: 99,
    borderWidth: 1,
  },
  pillChevron: { fontSize: hp(2.2), fontWeight: "400", lineHeight: hp(2.6) },
  saveExitPill: { paddingHorizontal: wp(3) },
  saveExitText: { fontSize: hp(1.55), fontWeight: "600" },
  title: { flex: 1, fontSize: hp(1.9), fontWeight: "600", textAlign: "center" },
  stepBarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    gap: wp(2),
  },
  segments: { flex: 1, flexDirection: "row", gap: wp(1) },
  segment: { flex: 1, height: 4, borderRadius: 99 },
  counter: { fontSize: hp(1.5), fontWeight: "600", minWidth: wp(8), textAlign: "right" },
});
