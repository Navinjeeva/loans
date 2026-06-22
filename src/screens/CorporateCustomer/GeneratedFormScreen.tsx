import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import Button from "@src/components/Button";
import { useSelector } from "react-redux";
import StepHeader from "./StepHeader";

const BRAND = "#F97316";

function inrShort(n: string | number) {
  const v = Number(n);
  if (!v) return "—";
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

const GeneratedFormScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { company: c, loan: l, financial: f, directors } = useSelector(
    (state: any) => state.corporate
  );
  const appDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepHeader
        step={5}
        title="Application form"
        onBack={() => navigation.goBack()}
        onSaveExit={() => navigation.navigate("CorporateHome")}
        colors={colors}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Form preview card */}
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Form header */}
          <View style={[styles.formHeader, { borderBottomColor: colors.borderLight }]}>
            <View style={styles.formHeaderLeft}>
              <View style={[styles.logoBox, { backgroundColor: BRAND }]}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>T</Text>
              </View>
              <View>
                <Text style={[styles.formBankName, { color: colors.text }]}>TecuDigi Bank</Text>
                <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>Corporate Loan Application</Text>
              </View>
            </View>
            <View style={styles.formHeaderRight}>
              <Text style={[styles.formRef, { color: colors.textSecondary }]}>Form CL-01</Text>
              <Text style={[styles.formDate, { color: colors.textMuted }]}>{appDate}</Text>
            </View>
          </View>

          {/* Form body */}
          <View style={styles.formBody}>
            {/* Section 1 */}
            <View style={styles.formSection}>
              <Text style={[styles.formSectionTitle, { color: BRAND, borderBottomColor: BRAND }]}>
                1. APPLICANT DETAILS
              </Text>
              <View style={styles.formGrid}>
                <FormRow label="Company Name" value={c.name || "—"} colors={colors} />
                <FormRow label="Business Type" value={c.businessType || "—"} colors={colors} />
                <FormRow label="CIN" value={c.cin || "—"} mono colors={colors} />
                <FormRow label="PAN" value={c.pan || "—"} mono colors={colors} />
                <FormRow label="Country" value={c.country || "—"} colors={colors} />
                <FormRow label="Industry" value={c.industry || "—"} colors={colors} />
                <FormRow label="Date of Incorporation" value={c.doi || "—"} colors={colors} />
              </View>
            </View>

            {/* Section 2 */}
            <View style={styles.formSection}>
              <Text style={[styles.formSectionTitle, { color: BRAND, borderBottomColor: BRAND }]}>
                2. LOAN DETAILS
              </Text>
              <View style={styles.formGrid}>
                <FormRow label="Loan Product" value={l.product || "—"} colors={colors} />
                <FormRow label="Loan Amount" value={inrShort(l.amount)} mono colors={colors} />
                <FormRow label="Tenure" value={l.tenure ? `${l.tenure} months` : "—"} colors={colors} />
                <FormRow label="Purpose" value={l.purpose || "—"} colors={colors} />
                <FormRow label="Category" value={l.category || "—"} colors={colors} />
              </View>
            </View>

            {/* Section 3 */}
            <View style={styles.formSection}>
              <Text style={[styles.formSectionTitle, { color: BRAND, borderBottomColor: BRAND }]}>
                3. FINANCIAL INFORMATION
              </Text>
              <View style={styles.formGrid}>
                <FormRow label="Annual Revenue" value={inrShort(f.annualRevenue)} mono colors={colors} />
                <FormRow label="Monthly Turnover" value={inrShort(f.monthlyTurnover)} mono colors={colors} />
                <FormRow label="Net Profit" value={inrShort(f.netProfit)} mono colors={colors} />
                <FormRow label="Employees" value={f.employeeCount || "—"} colors={colors} />
              </View>
            </View>

            {/* Section 4 — directors */}
            {directors.length > 0 && (
              <View style={styles.formSection}>
                <Text style={[styles.formSectionTitle, { color: BRAND, borderBottomColor: BRAND }]}>
                  4. DIRECTORS & AUTHORISED SIGNATORIES
                </Text>
                {directors.map((d: any, i: number) => (
                  <View key={d.id} style={[styles.dirEntry, { borderBottomColor: colors.borderLight }]}>
                    <Text style={[styles.dirEntryName, { color: colors.text }]}>
                      {i + 1}. {d.name}
                    </Text>
                    <Text style={[styles.dirEntryDetail, { color: colors.textSecondary }]}>
                      {d.designation}{d.isOwner ? ` · ${d.ownership}% ownership` : ""}
                    </Text>
                    <Text style={[styles.dirEntryDetail, { color: colors.textMuted }]}>
                      DIN: {d.din || "—"}  |  PAN: {d.pan || "—"}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Signature box */}
            <View style={styles.signatureBox}>
              <Text style={[styles.signatureLabel, { color: colors.textSecondary }]}>
                Authorised Signatory
              </Text>
              <View style={[styles.signatureLine, { borderBottomColor: colors.border }]} />
              <Text style={[styles.signatureHint, { color: colors.textMuted }]}>
                Signature & Stamp
              </Text>
            </View>

            <Text style={[styles.disclaimer, { color: colors.textMuted }]}>
              This application is subject to TecuDigi Bank's credit policies and regulatory requirements.
              Submission does not guarantee loan sanction.
            </Text>
          </View>
        </View>

        {/* Preview hint */}
        <View style={[styles.previewHint, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ fontSize: 16 }}>📄</Text>
          <Text style={[styles.previewHintText, { color: colors.textSecondary }]}>
            This is your auto-generated application form. Download the PDF or proceed to collect signatures.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderLight, backgroundColor: colors.background }]}>
        <View style={styles.footerRow}>
          <TouchableOpacity
            onPress={() => Alert.alert("Downloaded", "Application PDF saved successfully.")}
            style={[styles.downloadBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={{ fontSize: 14 }}>⬇️</Text>
            <Text style={[styles.downloadBtnText, { color: colors.text }]}>PDF</Text>
          </TouchableOpacity>
          <Button
            text="Continue"
            click={() => navigation.navigate("CorporateSignature")}
            buttonStyle={styles.continueBtn}
          />
        </View>
      </View>
    </View>
  );
};

const FormRow = ({ label, value, mono, colors }: { label: string; value: string; mono?: boolean; colors: any }) => (
  <View style={styles.formRow}>
    <Text style={[styles.formLabel, { color: "#888" }]}>{label}</Text>
    <Text style={[styles.formValue, { color: "#1A1D23", fontFamily: mono ? "monospace" : undefined }]}>{value}</Text>
  </View>
);

export default GeneratedFormScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: wp(4), paddingBottom: hp(4), gap: hp(2) },
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: hp(2),
    borderBottomWidth: 1,
    backgroundColor: "#FAFAFA",
  },
  formHeaderLeft: { flexDirection: "row", alignItems: "center", gap: wp(3) },
  logoBox: { width: 36, height: 36, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  formBankName: { fontSize: hp(1.8), fontWeight: "700" },
  formSubtitle: { fontSize: hp(1.45) },
  formHeaderRight: { alignItems: "flex-end" },
  formRef: { fontSize: hp(1.5), fontWeight: "600" },
  formDate: { fontSize: hp(1.4) },
  formBody: { padding: hp(2) },
  formSection: { marginBottom: hp(2.5) },
  formSectionTitle: {
    fontSize: hp(1.5),
    fontWeight: "700",
    letterSpacing: 0.5,
    borderBottomWidth: 1.5,
    paddingBottom: hp(0.7),
    marginBottom: hp(1.2),
  },
  formGrid: { gap: hp(0.6) },
  formRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: hp(0.6) },
  formLabel: { fontSize: hp(1.5), flex: 1 },
  formValue: { fontSize: hp(1.5), fontWeight: "500", flex: 1.5, textAlign: "right" },
  dirEntry: {
    paddingVertical: hp(1),
    borderBottomWidth: 1,
    marginBottom: hp(0.5),
  },
  dirEntryName: { fontSize: hp(1.6), fontWeight: "600" },
  dirEntryDetail: { fontSize: hp(1.5), marginTop: 2 },
  signatureBox: { marginTop: hp(2), alignItems: "flex-start" },
  signatureLabel: { fontSize: hp(1.5), marginBottom: hp(4) },
  signatureLine: { width: "60%", borderBottomWidth: 1, marginBottom: hp(0.5) },
  signatureHint: { fontSize: hp(1.4) },
  disclaimer: { fontSize: hp(1.4), lineHeight: hp(2), marginTop: hp(2), textAlign: "center" },
  previewHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: wp(3),
    padding: hp(1.8),
    borderRadius: 14,
    borderWidth: 1,
  },
  previewHintText: { flex: 1, fontSize: hp(1.6), lineHeight: hp(2.4) },
  footer: {
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    paddingBottom: hp(3),
    paddingHorizontal: wp(4),
  },
  footerRow: { flexDirection: "row", gap: wp(3), alignItems: "center" },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(1.5),
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.7),
    borderRadius: 12,
    borderWidth: 1,
  },
  downloadBtnText: { fontSize: hp(1.7), fontWeight: "600" },
  continueBtn: { flex: 1, borderRadius: 12 },
});
