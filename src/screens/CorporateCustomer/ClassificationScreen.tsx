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
import { useTheme } from "@src/common/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { setLookup, setOnboardMode } from "@src/store/corporate";
import ScreenHeader from "@src/common/components/ScreenHeader";
import BottomButton from "@src/common/components/BottomButton";
import { EditIcon } from "@src/common/svg/CorporateLoansSvgs/index";


const ClassificationScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const lookup = useSelector((state: any) => state.corporate.lookup);

  const website = lookup?.website || "";
  const [focused, setFocused] = useState(false);
  const hasInput = website.trim().length > 3;

  const setWebsite = (v: string) => dispatch(setLookup({ website: v }));

  const startAI = () => {
    dispatch(setOnboardMode("ai"));
    navigation.navigate("CorporateAIExtraction");
  };

  const goManual = () => {
    dispatch(setOnboardMode("manual"));
    navigation.navigate("CorporateVerifyCompany");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>

        {/* header */}
        <ScreenHeader 
          step={1}
          showSteps={true}
          title="Find your company"
          onPress={() => navigation.goBack()}
          onSaveExit={() => navigation.navigate("CorporateHome")}
        />

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* one structured onboarding section */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.borderLight },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.ink }]}>
              Company website
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.muted }]}>
              We'll automatically fetch your company information from your website.
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.inputLabel }]}>
              Company website URL
            </Text>
            <View
              style={[
                styles.inputShell,
                {
                  borderColor: focused ? colors.brand : colors.borderLight,
                  backgroundColor: colors.card,
                },
              ]}
            >
              <TextInput
                value={website}
                onChangeText={setWebsite}
                placeholder="https://www.companyname.com"
                placeholderTextColor={colors.faint}
                style={[styles.input, { color: colors.ink }]}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </View>

            {/* OR divider */}
            <View style={styles.orRow}>
              <View
                style={[styles.orLine, { backgroundColor: colors.dividerSoft }]}
              />
              <Text style={[styles.orText, { color: colors.faint }]}>OR</Text>
              <View
                style={[styles.orLine, { backgroundColor: colors.dividerSoft }]}
              />
            </View>

            {/* Manual setup */}
            <TouchableOpacity
              onPress={goManual}
              activeOpacity={0.7}
              style={[
                styles.manualBtn,
                {
                  backgroundColor: colors.buttonDisabledBackground,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <EditIcon size={16} color={colors.muted} />
              <Text style={[styles.manualBtnText, { color: colors.ink2 }]}>
                Continue manual setup
              </Text>
            </TouchableOpacity>

            <Text style={[styles.bottomHint, { color: colors.muted }]}>
              No website? Fill each section yourself on the next screen.
            </Text>
          </View>
        </ScrollView>

        <BottomButton
          text="Fetch company Details"
          note="✨ We’ll fetch & prefill your company details"
          disabled={!hasInput}
          onPress={startAI}
          // loading
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ClassificationScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingTop: 8, paddingBottom: 24 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 15,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: "600",
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 13,
    lineHeight: 17,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputShell: {
    width: "100%",
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: "400",
    paddingVertical: 10,
    minWidth: 0,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 16,
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
  bottomHint: {
    fontSize: 11.5,
    textAlign: "center",
    marginTop: 9,
    marginHorizontal: 8,
    lineHeight: 17,
  },
  manualBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 13,
    borderRadius: 13,
    borderWidth: 1,
  },
  manualBtnText: { fontSize: 14, fontWeight: "600" },
});
