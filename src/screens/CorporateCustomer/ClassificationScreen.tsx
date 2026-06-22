import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import Button from "@src/components/Button";
import { useDispatch, useSelector } from "react-redux";
import { setState } from "@src/store/corporate";
import StepHeader from "./StepHeader";

const BRAND = "#F97316";

const ClassificationScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const lookup = useSelector((state: any) => state.corporate.lookup);
  const [website, setWebsite] = useState(lookup?.website || "");
  const hasInput = website.trim().length > 3;

  const startAI = () => {
    dispatch(setState({ onboardMode: "ai", lookup: { website } }));
    navigation.navigate("CorporateAIExtraction");
  };

  const goManual = () => {
    dispatch(setState({ onboardMode: "manual" }));
    navigation.navigate("CorporateVerifyCompany");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StepHeader
          step={1}
          title="Find your company"
          onBack={() => navigation.goBack()}
          onSaveExit={() => navigation.navigate("CorporateHome")}
          colors={colors}
        />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={[styles.desc, { color: colors.textSecondary }]}>
            We'll automatically fetch and prefill your company details to reduce manual work.
          </Text>

          {/* AI banner */}
          <View style={[styles.aiBanner, { borderColor: "#F4CBA9", backgroundColor: "#FFF7ED" }]}>
            <View style={[styles.aiIconBox, { backgroundColor: "#fff" }]}>
              <Text style={{ fontSize: 22 }}>✨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.aiBannerTitle, { color: colors.text }]}>AI-assisted onboarding</Text>
              <Text style={[styles.aiBannerDesc, { color: colors.textSecondary }]}>
                Skip the long forms — verify prefilled details instead.
              </Text>
            </View>
          </View>

          {/* Website input */}
          <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.panelHeader}>
              <Text style={{ fontSize: 16 }}>🌐</Text>
              <Text style={[styles.panelTitle, { color: colors.text }]}>Company website</Text>
            </View>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Company website URL</Text>
            <Text style={[styles.fieldHint, { color: colors.textMuted }]}>
              We'll read your public business profile
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  borderColor: hasInput ? BRAND : colors.inputBorder,
                  backgroundColor: colors.inputBackground,
                },
              ]}
            >
              <Text style={styles.inputIcon}>🌐</Text>
              <TextInput
                value={website}
                onChangeText={setWebsite}
                placeholder="www.apexindustrial.com"
                placeholderTextColor={colors.inputPlaceholder}
                style={[styles.input, { color: colors.text }]}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {hasInput && <Text style={{ color: BRAND, fontSize: 18 }}>✓</Text>}
            </View>
          </View>

          {/* Manual setup */}
          <TouchableOpacity
            onPress={goManual}
            style={[styles.manualBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={{ fontSize: 15 }}>✏️</Text>
            <Text style={[styles.manualBtnText, { color: colors.text }]}>Continue manual setup</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.borderLight, backgroundColor: colors.background }]}>
          <View style={styles.footerNote}>
            <Text style={[styles.footerNoteText, { color: colors.textSecondary }]}>
              ✨ AI fetches public business records to prefill your form
            </Text>
          </View>
          <Button
            text="Continue"
            click={startAI}
            disabled={!hasInput}
            buttonStyle={styles.footerBtn}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ClassificationScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: wp(4), paddingBottom: hp(4) },
  desc: { fontSize: hp(1.7), lineHeight: hp(2.6), marginBottom: hp(2.5) },
  aiBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    padding: hp(1.8),
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: hp(2.5),
  },
  aiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  aiBannerTitle: { fontSize: hp(1.7), fontWeight: "600", marginBottom: 2 },
  aiBannerDesc: { fontSize: hp(1.5), lineHeight: hp(2.3) },
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    padding: hp(2),
    marginBottom: hp(2),
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    marginBottom: hp(1.5),
  },
  panelTitle: { fontSize: hp(1.8), fontWeight: "700" },
  fieldLabel: { fontSize: hp(1.6), fontWeight: "600", marginBottom: 3 },
  fieldHint: { fontSize: hp(1.45), marginBottom: hp(1) },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.4),
    gap: wp(2),
  },
  inputIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: hp(1.8), padding: 0 },
  manualBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
    padding: hp(1.8),
    borderRadius: 13,
    borderWidth: 1,
    marginTop: hp(1),
  },
  manualBtnText: { fontSize: hp(1.7), fontWeight: "600" },
  footer: {
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    paddingBottom: hp(3),
    paddingHorizontal: wp(4),
  },
  footerNote: { alignItems: "center", marginBottom: hp(1.2) },
  footerNoteText: { fontSize: hp(1.5) },
  footerBtn: { borderRadius: 12 },
});
