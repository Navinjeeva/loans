import { back } from "@src/components/images";
import { useTheme } from "@src/common/ThemeContext";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { CheckIcon } from "@src/common/svg/CorporateLoansSvgs";

interface ScreenHeaderProps {
  step?: number;
  totalSteps?: number;
  showSteps?: boolean;
  title: string;
  onPress?: () => void;
  showBack?: boolean;
  onSaveExit?: () => void;
  saveExitLabel?: string;
}

const ScreenHeader = ({
  title,
  onPress,
  showBack = true,
  onSaveExit,
  saveExitLabel = "Save & exit",
  showSteps = false,
  step = 1,
  totalSteps = 6,
}: ScreenHeaderProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity
            onPress={onPress}
            style={[
              styles.backButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.7}
          >
            <Image
              source={back}
              style={styles.backIcon}
              tintColor={colors.text}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        <View style={styles.titleWrapper}>
          <Text
            numberOfLines={1}
            style={[styles.title, { color: colors.text }]}
          >
            {title}
          </Text>
        </View>

        <View style={styles.spacer} />

        {onSaveExit ? (
          <TouchableOpacity
            onPress={onSaveExit}
            activeOpacity={0.7}
            style={[
              styles.saveExitButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <CheckIcon size={13} color={colors.text} />
            <Text style={[styles.saveExitText, { color: colors.text }]}>
              {saveExitLabel}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {showSteps && (
        <View style={styles.stepBarWrapper}>
          <View style={styles.stepBarRow}>
            <View style={styles.stepSegments}>
              {Array.from({ length: totalSteps }).map((_, i) => {
                const bg =
                  i < step - 1
                    ? colors.stepDone
                    : i === step - 1
                    ? colors.stepCurrent
                    : colors.stepUpcoming;
                return (
                  <View
                    key={i}
                    style={[styles.stepSegment, { backgroundColor: bg }]}
                  />
                );
              })}
            </View>
            <Text style={[styles.stepNumberText, { color: colors.stepNumber }]}>
              {step}
              <Text style={{ color: colors.stepNumberTotal }}>
                /{totalSteps}
              </Text>
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default ScreenHeader;

const styles = StyleSheet.create({
  container: {
    paddingTop:
      (Platform.OS === "android" ? hp(0.8) ?? 0 : hp(5)) +
      hp(0.5),
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingTop: hp(0.5),
    paddingBottom: hp(1.4),
    gap: wp(3),
  },
  backButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  backIcon: {
    width: wp(5.5),
    height: wp(5.5),
  },
  titleWrapper: {
    // flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: "600",
    letterSpacing: -0.3,
    lineHeight: hp(2.4),
    textAlign: "center",
  },
  placeholder: {
    width: wp(10),
    height: wp(10),
  },
  spacer: {
    flex: 1,
  },
  saveExitButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderRadius: 99,
    borderWidth: 1,
    flexShrink: 0,
  },
  saveExitText: {
    fontSize: 12,
    fontWeight: "600",
    display : "flex",
    justifyContent : "flex-end"
  },
  stepBarWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  stepBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepSegments: {
    flex: 1,
    flexDirection: "row",
    gap: 4,
  },
  stepSegment: {
    flex: 1,
    height: 5,
    borderRadius: 99,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
