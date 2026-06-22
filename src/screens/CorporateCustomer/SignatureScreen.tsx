import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import Button from "@src/components/Button";
import { useDispatch, useSelector } from "react-redux";
import { setSignatures, setApplication } from "@src/store/corporate";

const BRAND = "#F97316";

interface SigningModalProps {
  visible: boolean;
  signerName: string;
  signerKey: string;
  onClose: () => void;
  onSigned: (key: string, method: string) => void;
  colors: any;
}

const SigningModal = ({ visible, signerName, signerKey, onClose, onSigned, colors }: SigningModalProps) => {
  const [method, setMethod] = useState<"esign" | "dsc">("esign");
  const [aadhaar, setAadhaar] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [timer, setTimer] = useState(0);

  const aadhaarOk = aadhaar.replace(/\s/g, "").length >= 12;

  const sendOtp = () => {
    setOtpSent(true);
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const verifyESign = () => {
    if (otp.length < 6) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onSigned(signerKey, "Aadhaar eSign");
      onClose();
    }, 900);
  };

  const signDsc = () => {
    if (pin.length < 4) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onSigned(signerKey, "DSC");
      onClose();
    }, 900);
  };

  const reset = () => {
    setOtpSent(false);
    setOtp("");
    setAadhaar("");
    setPin("");
    setTimer(0);
    setBusy(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sign application</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Signing as {signerName}
              </Text>
            </View>
            <TouchableOpacity onPress={() => { onClose(); reset(); }}>
              <Text style={[styles.modalClose, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Method toggle */}
            <View style={[styles.methodToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {(["esign", "dsc"] as const).map((id) => (
                <TouchableOpacity
                  key={id}
                  onPress={() => { setMethod(id); reset(); }}
                  style={[
                    styles.methodBtn,
                    method === id && { backgroundColor: colors.card },
                  ]}
                >
                  <Text style={[styles.methodBtnText, { color: method === id ? colors.text : colors.textSecondary }]}>
                    {id === "esign" ? "Aadhaar eSign" : "DSC"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {method === "esign" ? (
              !otpSent ? (
                <View>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Aadhaar number / VID</Text>
                  <View style={[styles.inputBox, { borderColor: aadhaar.length >= 12 ? BRAND : colors.inputBorder, backgroundColor: colors.inputBackground }]}>
                    <TextInput
                      value={aadhaar}
                      onChangeText={(v) => {
                        const raw = v.replace(/[^0-9]/g, "").slice(0, 16);
                        setAadhaar(raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim());
                      }}
                      placeholder="XXXX XXXX XXXX"
                      placeholderTextColor={colors.inputPlaceholder}
                      keyboardType="numeric"
                      style={[styles.input, { color: colors.text }]}
                    />
                  </View>
                  <Button
                    text="Send OTP"
                    click={sendOtp}
                    disabled={!aadhaarOk}
                    buttonStyle={[styles.actionBtn, { marginTop: hp(2) }]}
                  />
                  <Text style={[styles.secureNote, { color: colors.textMuted }]}>
                    🔒 OTP sent to your Aadhaar-linked mobile
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={[styles.otpDesc, { color: colors.textSecondary }]}>
                    Enter the 6-digit OTP sent to the mobile linked with Aadhaar ••••{" "}
                    {aadhaar.replace(/\s/g, "").slice(-4)}
                  </Text>
                  <View style={[styles.inputBox, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}>
                    <TextInput
                      value={otp}
                      onChangeText={(v) => setOtp(v.replace(/[^0-9]/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor={colors.inputPlaceholder}
                      keyboardType="numeric"
                      style={[styles.input, { color: colors.text, textAlign: "center", letterSpacing: 8, fontSize: hp(2.2) }]}
                    />
                  </View>
                  <View style={styles.resendRow}>
                    {timer > 0 ? (
                      <Text style={[styles.timerText, { color: colors.textMuted }]}>
                        Resend OTP in 0:{String(timer).padStart(2, "0")}
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={sendOtp}>
                        <Text style={[styles.resendText, { color: BRAND }]}>Resend OTP</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Button
                    text={busy ? "Verifying…" : "Verify & sign"}
                    click={verifyESign}
                    disabled={otp.length < 6 || busy}
                    buttonStyle={[styles.actionBtn, { marginTop: hp(1) }]}
                  />
                </View>
              )
            ) : (
              <View>
                <Text style={[styles.dscDesc, { color: colors.textSecondary }]}>
                  Insert your DSC token and enter your PIN to sign with your Digital Signature Certificate.
                </Text>
                <Text style={[styles.inputLabel, { color: colors.text }]}>DSC PIN</Text>
                <View style={[styles.inputBox, { borderColor: colors.inputBorder, backgroundColor: colors.inputBackground }]}>
                  <TextInput
                    value={pin}
                    onChangeText={(v) => setPin(v.replace(/[^0-9]/g, "").slice(0, 8))}
                    placeholder="Enter DSC PIN"
                    placeholderTextColor={colors.inputPlaceholder}
                    keyboardType="numeric"
                    secureTextEntry
                    style={[styles.input, { color: colors.text }]}
                  />
                </View>
                <Button
                  text={busy ? "Signing…" : "Sign"}
                  click={signDsc}
                  disabled={pin.length < 4 || busy}
                  buttonStyle={[styles.actionBtn, { marginTop: hp(2) }]}
                />
              </View>
            )}
            <Text style={[styles.secureNote, { color: colors.textMuted, textAlign: "center", marginTop: hp(2) }]}>
              🔒 Secure · legally binding signature
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const SignatureScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { directors, signatures: signaturesState } = useSelector((state: any) => state.corporate);
  const [submitting, setSubmitting] = useState(false);
  const [modalSigner, setModalSigner] = useState<{ key: string; name: string } | null>(null);

  const signers = directors.map((d: any) => ({
    key: `dir:${d.id}`,
    name: d.name,
    role: d.designation,
  }));

  const signatures = signaturesState || {};
  const isSigned = (k: string) => !!(signatures[k]?.image);
  const signedCount = signers.filter((s: any) => isSigned(s.key)).length;
  const allSigned = signers.length > 0 && signers.every((s: any) => isSigned(s.key));

  const handleSigned = (key: string, method: string) => {
    dispatch(setSignatures({ ...signatures, [key]: { image: "signed", method, at: Date.now() } }));
  };

  const submit = () => {
    if (!allSigned) return;
    setSubmitting(true);
    setTimeout(() => {
      dispatch(setApplication({
        id: "TD-CL-2026-" + Math.floor(Math.random() * 90000 + 10000),
        submittedAt: new Date().toISOString(),
        status: "Submitted",
        stage: 0,
      }));
      setSubmitting(false);
      navigation.navigate("CorporateOtp");
    }, 1400);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Signatures</Text>
        <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>{signedCount} of {signers.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          Each director and owner must sign to submit this application.
        </Text>

        {signers.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ fontSize: 28 }}>👥</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No directors or owners found. Add them in Step 2 to collect signatures.
            </Text>
          </View>
        ) : (
          signers.map((s: any) => {
            const signed = isSigned(s.key);
            const sig = signatures[s.key];
            return (
              <View key={s.key} style={[styles.signerCard, { backgroundColor: colors.card, borderColor: signed ? "#BBE6CB" : colors.border }]}>
                <View style={styles.signerInfo}>
                  <View style={[styles.signerAvatar, { backgroundColor: signed ? "#E7F8EE" : "#FFF4EC" }]}>
                    <Text style={{ fontSize: 20 }}>👤</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.signerName, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[styles.signerRole, { color: colors.textSecondary }]}>{s.role}</Text>
                    {signed && sig && (
                      <Text style={[styles.signedAt, { color: "#3FAE63" }]}>
                        ✓ Signed via {sig.method} · {new Date(sig.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    )}
                  </View>
                </View>
                {signed ? (
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert("Replace signature?", "This will remove the current signature.", [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Replace",
                          style: "destructive",
                          onPress: () => {
                            const next = { ...signatures };
                            delete next[s.key];
                            dispatch(setSignatures(next));
                          },
                        },
                      ]);
                    }}
                    style={[styles.signBtn, { backgroundColor: "#E7F8EE", borderColor: "#BBE6CB" }]}
                  >
                    <Text style={[styles.signBtnText, { color: "#3FAE63" }]}>✓ Signed</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => setModalSigner({ key: s.key, name: s.name })}
                    style={[styles.signBtn, { backgroundColor: "#FFF4EC", borderColor: "#F4CBA9" }]}
                  >
                    <Text style={[styles.signBtnText, { color: BRAND }]}>Sign →</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderLight, backgroundColor: colors.background }]}>
        {!allSigned && (
          <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
            ✏️ All signatures required to submit
          </Text>
        )}
        <Button
          text={submitting ? "Submitting application…" : "Submit application"}
          click={submit}
          disabled={!allSigned || submitting}
          buttonStyle={styles.footerBtn}
        />
      </View>

      {modalSigner && (
        <SigningModal
          visible={!!modalSigner}
          signerName={modalSigner.name}
          signerKey={modalSigner.key}
          onClose={() => setModalSigner(null)}
          onSigned={handleSigned}
          colors={colors}
        />
      )}
    </View>
  );
};

export default SignatureScreen;

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
  badge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: 99,
    borderWidth: 1,
  },
  badgeText: { fontSize: hp(1.5), fontWeight: "700" },
  scroll: { padding: wp(4), paddingBottom: hp(4), gap: hp(1.5) },
  desc: { fontSize: hp(1.7), lineHeight: hp(2.5) },
  emptyState: {
    alignItems: "center",
    padding: hp(4),
    borderRadius: 14,
    borderWidth: 1,
    gap: hp(1.2),
  },
  emptyText: { fontSize: hp(1.7), textAlign: "center", lineHeight: hp(2.5) },
  signerCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: hp(1.8),
    gap: hp(1.5),
  },
  signerInfo: { flexDirection: "row", alignItems: "center", gap: wp(3) },
  signerAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  signerName: { fontSize: hp(1.8), fontWeight: "600" },
  signerRole: { fontSize: hp(1.55), marginTop: 2 },
  signedAt: { fontSize: hp(1.5), marginTop: 3 },
  signBtn: {
    paddingVertical: hp(1.2),
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  signBtnText: { fontSize: hp(1.7), fontWeight: "600" },
  footer: {
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    paddingBottom: hp(3),
    paddingHorizontal: wp(4),
  },
  footerNote: { fontSize: hp(1.5), textAlign: "center", marginBottom: hp(1) },
  footerBtn: { borderRadius: 12 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: hp(4),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  modalTitle: { fontSize: hp(2), fontWeight: "700" },
  modalSubtitle: { fontSize: hp(1.6), marginTop: 2 },
  modalClose: { fontSize: hp(2.2), fontWeight: "400" },
  modalBody: { padding: wp(5) },
  methodToggle: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: hp(2.5),
    gap: 4,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: hp(1.2),
    borderRadius: 9,
    alignItems: "center",
  },
  methodBtnText: { fontSize: hp(1.7), fontWeight: "600" },
  inputLabel: { fontSize: hp(1.6), fontWeight: "600", marginBottom: hp(0.8) },
  inputBox: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.4),
  },
  input: { fontSize: hp(1.8), padding: 0 },
  otpDesc: { fontSize: hp(1.6), lineHeight: hp(2.4), marginBottom: hp(2) },
  resendRow: { alignItems: "center", marginTop: hp(1.5), marginBottom: hp(1) },
  timerText: { fontSize: hp(1.6) },
  resendText: { fontSize: hp(1.6), fontWeight: "600" },
  dscDesc: { fontSize: hp(1.6), lineHeight: hp(2.4), marginBottom: hp(2) },
  actionBtn: { borderRadius: 12 },
  secureNote: { fontSize: hp(1.45), marginTop: hp(1.5) },
});
