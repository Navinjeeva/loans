import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import Button from "@src/components/Button";
import { useDispatch, useSelector } from "react-redux";
import { setOtpVerified } from "@src/store/corporate";

const BRAND = "#F97316";

type OtpState = "intro" | "idle" | "verifying" | "done";

const OtpScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { otpVerified, directors } = useSelector((state: any) => state.corporate);
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [state, setState] = useState<OtpState>(otpVerified ? "done" : "intro");
  const [timer, setTimer] = useState(28);
  const refs = useRef<Array<TextInput | null>>([]);

  const signatory = directors[0] || { name: "Authorised Signatory", mobile: "+91 XXXXX XXXXX" };

  useEffect(() => {
    if (timer > 0 && state !== "intro" && state !== "done") {
      const t = setTimeout(() => setTimer((v) => v - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [timer, state]);

  const sendOtp = () => {
    setState("idle");
    setTimer(28);
    setTimeout(() => refs.current[0]?.focus(), 60);
  };

  const verify = (arr: string[]) => {
    setState("verifying");
    setTimeout(() => {
      setState("done");
      dispatch(setOtpVerified(true));
    }, 1100);
  };

  const onChange = (i: number, v: string) => {
    v = v.replace(/[^0-9]/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
    if (next.every((x) => x) && state !== "done") verify(next);
  };

  const onKey = (i: number, e: any) => {
    if (e.nativeEvent.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const resend = () => {
    setTimer(28);
    setDigits(["", "", "", "", "", ""]);
    setState("idle");
    refs.current[0]?.focus();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>OTP verification</Text>
        <View style={{ width: wp(10) }} />
      </View>

      <View style={styles.content}>
        {/* Hero icon */}
        <View
          style={[
            styles.heroIcon,
            {
              backgroundColor: "#FFF4EC",
              borderColor: "#F4CBA9",
            },
          ]}
        >
          <Text style={{ fontSize: 36 }}>{state === "done" ? "🛡️" : "📱"}</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          {state === "done" ? "Mobile verified" : "Verify signatory"}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {state === "done" ? (
            `Identity of ${signatory.name} confirmed.`
          ) : state === "intro" ? (
            `We'll send a 6-digit verification code to\n${signatory.mobile}`
          ) : (
            `We sent a 6-digit code to\n${signatory.mobile}`
          )}
        </Text>

        {/* OTP boxes */}
        {(state === "idle" || state === "verifying") && (
          <View style={styles.otpSection}>
            <View style={styles.otpBoxes}>
              {digits.map((dg, i) => (
                <TextInput
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  value={dg}
                  onChangeText={(v) => onChange(i, v)}
                  onKeyPress={(e) => onKey(i, e)}
                  keyboardType="numeric"
                  maxLength={1}
                  style={[
                    styles.otpBox,
                    {
                      color: colors.text,
                      borderColor: dg ? BRAND : colors.inputBorder,
                      backgroundColor: colors.inputBackground,
                    },
                  ]}
                />
              ))}
            </View>

            {state === "verifying" && (
              <View style={styles.verifyingRow}>
                <Text style={[styles.verifyingText, { color: BRAND }]}>🔄 Verifying…</Text>
              </View>
            )}

            <View style={styles.resendRow}>
              {timer > 0 ? (
                <Text style={[styles.timerText, { color: colors.textSecondary }]}>
                  Resend code in{" "}
                  <Text style={{ fontWeight: "700", color: colors.text }}>
                    0:{String(timer).padStart(2, "0")}
                  </Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={resend}>
                  <Text style={[styles.resendText, { color: BRAND }]}>Resend OTP</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.demoNote, { backgroundColor: colors.surface }]}>
              <Text style={[styles.demoNoteText, { color: colors.textSecondary }]}>
                Demo: enter any 6 digits to verify.
              </Text>
            </View>
          </View>
        )}

        {/* Verified badge */}
        {state === "done" && (
          <View style={[styles.verifiedBadge, { backgroundColor: "#FFF4EC", borderColor: "#F4CBA9" }]}>
            <Text style={[styles.verifiedText, { color: BRAND }]}>OTP verified successfully</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.borderLight, backgroundColor: colors.background }]}>
        {state === "intro" ? (
          <>
            <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
              📱 A one-time code will be sent to this number by SMS
            </Text>
            <Button text="Send OTP" click={sendOtp} buttonStyle={styles.footerBtn} />
          </>
        ) : (
          <>
            {state !== "done" && (
              <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
                🔒 Submission is blocked until OTP is verified
              </Text>
            )}
            <Button
              text={state === "done" ? "Verified · Continue" : "Verify to continue"}
              click={() => navigation.navigate("CorporateSubmitted")}
              disabled={state !== "done"}
              buttonStyle={styles.footerBtn}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default OtpScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    borderBottomWidth: 1,
  },
  backBtn: { width: wp(10) },
  backArrow: { fontSize: hp(2.8), fontWeight: "300" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: hp(2.2), fontWeight: "700" },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: wp(8),
    paddingTop: hp(5),
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(2.5),
  },
  title: { fontSize: hp(2.8), fontWeight: "700", letterSpacing: -0.5, marginBottom: hp(1) },
  subtitle: {
    fontSize: hp(1.7),
    lineHeight: hp(2.7),
    textAlign: "center",
    marginBottom: hp(3),
  },
  otpSection: { width: "100%", alignItems: "center" },
  otpBoxes: { flexDirection: "row", gap: wp(2.5), marginBottom: hp(1) },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    textAlign: "center",
    fontSize: hp(2.8),
    fontWeight: "700",
  },
  verifyingRow: { marginTop: hp(1.5), marginBottom: hp(0.5) },
  verifyingText: { fontSize: hp(1.6), fontWeight: "600" },
  resendRow: { marginTop: hp(2), alignItems: "center" },
  timerText: { fontSize: hp(1.6) },
  resendText: { fontSize: hp(1.7), fontWeight: "600" },
  demoNote: {
    marginTop: hp(2.5),
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    borderRadius: 12,
  },
  demoNoteText: { fontSize: hp(1.5), textAlign: "center" },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.4),
    borderRadius: 99,
    borderWidth: 1,
    marginTop: hp(3),
  },
  verifiedText: { fontSize: hp(1.7), fontWeight: "600" },
  footer: {
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    paddingBottom: hp(3),
    paddingHorizontal: wp(4),
  },
  footerNote: { fontSize: hp(1.5), textAlign: "center", marginBottom: hp(1) },
  footerBtn: { borderRadius: 12 },
});
