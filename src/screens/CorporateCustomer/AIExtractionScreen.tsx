import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import { useDispatch } from "react-redux";
import { applyExtraction } from "@src/store/corporate";

const BRAND = "#F97316";

const EXTRACT_STEPS = [
  { label: "Identifying company classification", icon: "🌐" },
  { label: "Fetching CIN / registration number", icon: "#" },
  { label: "Collecting registered office details", icon: "📍" },
  { label: "Detecting operational office location", icon: "🏭" },
  { label: "Identifying directors & shareholders", icon: "👥" },
  { label: "Fetching company PAN & GST details", icon: "🪪" },
  { label: "Collecting financial information", icon: "📊" },
  { label: "Preparing loan onboarding profile", icon: "💼" },
];

const AIExtractionScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(false);

  const pct = Math.min(Math.round((active / EXTRACT_STEPS.length) * 100), 100);
  const currentLabel = done
    ? "All details collected"
    : EXTRACT_STEPS[Math.min(active, EXTRACT_STEPS.length - 1)].label;

  useEffect(() => {
    let i = 0;
    const tick = setInterval(() => {
      i += 1;
      if (i >= EXTRACT_STEPS.length) {
        clearInterval(tick);
        setActive(EXTRACT_STEPS.length);
        setTimeout(() => setDone(true), 450);
        setTimeout(() => {
          dispatch(applyExtraction());
          navigation.navigate("CorporateVerifyCompany");
        }, 1200);
      } else {
        setActive(i);
      }
    }, 520);
    return () => clearInterval(tick);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: "#FFF4EC", borderColor: "#F4CBA9" }]}>
            <Text style={{ fontSize: 30 }}>{done ? "✅" : "📄"}</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Setting up your application
          </Text>
          <Text style={[styles.heroDesc, { color: colors.textSecondary }]}>
            We're securely collecting your company information.
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.text }]} numberOfLines={1}>
              {currentLabel}
            </Text>
            <Text style={[styles.progressPct, { color: BRAND }]}>{pct}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>

        {/* Steps */}
        <View style={styles.stepList}>
          {EXTRACT_STEPS.map((s, i) => {
            const state = i < active ? "done" : i === active ? "active" : "idle";
            return (
              <View
                key={i}
                style={[
                  styles.stepRow,
                  state === "active" && { backgroundColor: "#FFF4EC", borderRadius: 11 },
                  { opacity: state === "idle" ? 0.45 : 1 },
                ]}
              >
                <View
                  style={[
                    styles.stepIconBox,
                    {
                      backgroundColor:
                        state === "done" ? "#FFF4EC" : state === "active" ? "#fff" : colors.surface,
                      borderWidth: state === "active" ? 1.5 : 0,
                      borderColor: state === "active" ? BRAND : "transparent",
                    },
                  ]}
                >
                  {state === "done" ? (
                    <Text style={{ fontSize: 12 }}>✓</Text>
                  ) : (
                    <Text style={{ fontSize: 13 }}>{s.icon}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: state === "idle" ? colors.textSecondary : colors.text,
                      fontWeight: state === "idle" ? "400" : "600",
                    },
                  ]}
                >
                  {s.label}
                </Text>
                {state === "done" && (
                  <Text style={{ color: BRAND, fontSize: 14 }}>✓</Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.securityNote}>
          <Text style={[styles.securityText, { color: colors.textMuted }]}>
            🔒 Securely sourced from public business registries
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AIExtractionScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: wp(5), paddingTop: hp(8) },
  heroSection: { alignItems: "center", marginBottom: hp(3) },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(2),
  },
  heroTitle: { fontSize: hp(2.2), fontWeight: "700", letterSpacing: -0.3, marginBottom: hp(0.5) },
  heroDesc: { fontSize: hp(1.6), lineHeight: hp(2.4), textAlign: "center" },
  progressSection: { marginBottom: hp(2.5) },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },
  progressLabel: { fontSize: hp(1.6), fontWeight: "600", flex: 1, marginRight: wp(2) },
  progressPct: { fontSize: hp(1.5), fontWeight: "700", flexShrink: 0 },
  progressTrack: {
    height: 6,
    borderRadius: 99,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: BRAND,
    borderRadius: 99,
  },
  stepList: { gap: hp(0.8) },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    paddingVertical: hp(1.1),
    paddingHorizontal: wp(3),
  },
  stepIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepLabel: { flex: 1, fontSize: hp(1.55) },
  securityNote: { alignItems: "center", marginTop: hp(3) },
  securityText: { fontSize: hp(1.45) },
});
