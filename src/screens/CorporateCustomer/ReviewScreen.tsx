import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
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

interface SummarySectionProps {
  icon: string;
  title: string;
  badge?: string;
  onEdit: () => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
  colors: any;
}

const SummarySection = ({ icon, title, badge, onEdit, defaultOpen = false, children, colors }: SummarySectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.sectionHeader} onPress={() => setOpen((o) => !o)} activeOpacity={0.7}>
        <View style={[styles.sectionIconBox, { backgroundColor: "#FFF4EC" }]}>
          <Text style={{ fontSize: 15 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
          {badge ? <Text style={[styles.sectionBadge, { color: colors.textSecondary }]}>{badge}</Text> : null}
        </View>
        <TouchableOpacity
          onPress={onEdit}
          style={[styles.editBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.editBtnText, { color: colors.textSecondary }]}>Edit</Text>
        </TouchableOpacity>
        <Text style={[styles.chevron, { color: colors.textMuted, transform: [{ rotate: open ? "90deg" : "0deg" }] }]}>
          ›
        </Text>
      </TouchableOpacity>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
};

const KV = ({ label, value, colors }: { label: string; value: string; colors: any }) => (
  <View style={[styles.kv, { borderBottomColor: colors.borderLight }]}>
    <Text style={[styles.kvLabel, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.kvValue, { color: colors.text }]}>{value || "—"}</Text>
  </View>
);

const DECLARATIONS = [
  { key: "accurate", text: "I confirm that all information and documents provided are accurate, complete and true." },
  { key: "verify", text: "I authorize TecuDigi Bank to verify company, director and signatory information." },
  { key: "terms", text: "I have read and agree to the Terms & Conditions and Privacy Policy.", link: true },
  { key: "consent", text: "I consent to financial and compliance verification, including credit bureau checks." },
  { key: "ubo", text: "I declare that the ultimate beneficial owners disclosed are accurate and complete." },
];

const ReviewScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const { company: c, financial: f, loan: l, office: o, directors, documents } = useSelector(
    (state: any) => state.corporate
  );
  const [showTerms, setShowTerms] = useState(false);
  const [declarations, setDeclarations] = useState<Record<string, boolean>>({});

  const allConsent = DECLARATIONS.every((d) => declarations[d.key]);
  const docCount = Object.keys(documents || {}).length;

  const toggleDecl = (key: string) => setDeclarations((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepHeader
        step={5}
        title="Review application"
        onBack={() => navigation.goBack()}
        onSaveExit={() => navigation.navigate("CorporateHome")}
        colors={colors}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Info banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.bannerIcon, { backgroundColor: "#FFF4EC" }]}>
            <Text style={{ fontSize: 16 }}>👁️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>Review before you generate application form</Text>
            <Text style={[styles.bannerDesc, { color: colors.textSecondary }]}>
              Check each section. Nothing is submitted yet.
            </Text>
          </View>
        </View>

        {/* Summary sections */}
        <SummarySection icon="🌐" title="Classification" badge={`${c.country} · ${c.businessType}`}
          onEdit={() => navigation.navigate("CorporateVerifyCompany")} defaultOpen colors={colors}>
          <KV label="Country" value={c.country} colors={colors} />
          <KV label="Business type" value={c.businessType} colors={colors} />
          <KV label="Industry" value={c.industry} colors={colors} />
        </SummarySection>

        <SummarySection icon="🏢" title="Company information" badge={c.name}
          onEdit={() => navigation.navigate("CorporateVerifyCompany")} defaultOpen colors={colors}>
          <KV label="Company name" value={c.name} colors={colors} />
          <KV label="CIN" value={c.cin} colors={colors} />
          <KV label="PAN" value={c.pan} colors={colors} />
          <KV label="GST" value={c.gst} colors={colors} />
          <KV label="Incorporated" value={c.doi} colors={colors} />
        </SummarySection>

        <SummarySection icon="📍" title="Office details"
          badge={o.reg.city ? `${o.reg.city}${!o.sameAsReg && o.op.city ? " · " + o.op.city : ""}` : undefined}
          onEdit={() => navigation.navigate("CorporateVerifyCompany")} colors={colors}>
          <KV label="Registered office" value={`${o.reg.address}, ${o.reg.city}, ${o.reg.state} ${o.reg.postal}`} colors={colors} />
          <KV label="Operational office" value={o.sameAsReg ? "Same as registered" : `${o.op.address}, ${o.op.city}, ${o.op.state} ${o.op.postal}`} colors={colors} />
        </SummarySection>

        <SummarySection icon="👥" title="Directors & owners"
          badge={`${directors.length} director${directors.length !== 1 ? "s" : ""}`}
          onEdit={() => navigation.navigate("CorporateVerifyCompany")} colors={colors}>
          {directors.map((d: any) => (
            <KV key={d.id} label={d.name} value={`${d.designation}${d.isOwner ? ` · ${d.ownership}%` : ""}`} colors={colors} />
          ))}
        </SummarySection>

        <SummarySection icon="📊" title="Financial information"
          badge={f.annualRevenue ? `Revenue ${inrShort(f.annualRevenue)}` : undefined}
          onEdit={() => navigation.navigate("CorporateVerifyCompany")} colors={colors}>
          <KV label="Annual revenue" value={inrShort(f.annualRevenue)} colors={colors} />
          <KV label="Monthly turnover" value={inrShort(f.monthlyTurnover)} colors={colors} />
          <KV label="Net profit" value={inrShort(f.netProfit)} colors={colors} />
          <KV label="Employees" value={f.employeeCount} colors={colors} />
          <KV label="Vintage" value={f.vintage ? `${f.vintage} years` : ""} colors={colors} />
        </SummarySection>

        <SummarySection icon="💰" title="Loan details"
          badge={l.amount ? `${inrShort(l.amount)} · ${l.tenure} mo` : undefined}
          onEdit={() => navigation.navigate("CorporateLoan")} colors={colors}>
          <KV label="Product" value={l.product} colors={colors} />
          <KV label="Amount" value={inrShort(l.amount)} colors={colors} />
          <KV label="Purpose" value={l.purpose} colors={colors} />
          <KV label="Tenor" value={l.tenure ? `${l.tenure} months` : ""} colors={colors} />
          <KV label="Moratorium" value={l.moratorium ? `${l.moratorium} months` : "0 months"} colors={colors} />
          <KV label="Category" value={l.category} colors={colors} />
        </SummarySection>

        <SummarySection icon="📄" title="Uploaded documents" badge={`${docCount} document${docCount !== 1 ? "s" : ""}`}
          onEdit={() => navigation.navigate("CorporateDocuments")} colors={colors}>
          <KV label="Documents uploaded" value={`${docCount} files`} colors={colors} />
        </SummarySection>

        {/* Declaration & consent */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.declHeader}>
            <Text style={[styles.declTitle, { color: colors.text }]}>Declaration & consent</Text>
            <Text style={[styles.declSubtitle, { color: colors.textSecondary }]}>
              Accept all to continue
            </Text>
          </View>
          {DECLARATIONS.map((d) => (
            <TouchableOpacity
              key={d.key}
              onPress={() => toggleDecl(d.key)}
              style={[
                styles.declRow,
                {
                  backgroundColor: declarations[d.key] ? "#E7F8EE" : colors.surface,
                  borderColor: declarations[d.key] ? "#BBE6CB" : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: declarations[d.key] ? "#3FAE63" : colors.inputBackground,
                    borderColor: declarations[d.key] ? "#3FAE63" : colors.border,
                  },
                ]}
              >
                {declarations[d.key] && <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✓</Text>}
              </View>
              <Text style={[styles.declText, { color: colors.text }]}>
                {d.text}{" "}
                {d.link && (
                  <Text
                    onPress={() => setShowTerms(true)}
                    style={{ color: BRAND, fontWeight: "600", textDecorationLine: "underline" }}
                  >
                    View terms
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderLight, backgroundColor: colors.background }]}>
        {!allConsent && (
          <Text style={[styles.footerNote, { color: colors.textSecondary }]}>
            ℹ️ Confirm the declaration to continue
          </Text>
        )}
        <Button
          text="Agree & Continue"
          click={() => navigation.navigate("CorporateGeneratedForm")}
          disabled={!allConsent}
          buttonStyle={styles.footerBtn}
        />
      </View>

      {/* Terms modal */}
      <Modal visible={showTerms} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setShowTerms(false)}>
                <Text style={[styles.modalClose, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {["1. Application", "2. Verification", "3. Sanction", "4. Repayment", "5. Default", "6. Data Privacy"].map((h) => (
                <View key={h} style={{ marginBottom: hp(2) }}>
                  <Text style={[styles.termsHeading, { color: colors.text }]}>{h}</Text>
                  <Text style={[styles.termsBody, { color: colors.textSecondary }]}>
                    The applicant company agrees that submission of this application does not constitute an offer or sanction of credit. All facilities are subject to the bank's credit assessment, internal approval and applicable regulatory requirements.
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ReviewScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: wp(4), paddingBottom: hp(4), gap: hp(1.5) },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    padding: hp(1.6),
    borderRadius: 12,
    borderWidth: 1,
  },
  bannerIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  bannerTitle: { fontSize: hp(1.6), fontWeight: "600" },
  bannerDesc: { fontSize: hp(1.5), lineHeight: hp(2.2) },
  section: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: hp(1.8),
    gap: wp(2.5),
  },
  sectionIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: hp(1.7), fontWeight: "600" },
  sectionBadge: { fontSize: hp(1.5), marginTop: 2 },
  editBtn: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: 8,
    borderWidth: 1,
  },
  editBtnText: { fontSize: hp(1.45), fontWeight: "600" },
  chevron: { fontSize: hp(2.4), fontWeight: "300" },
  sectionBody: { paddingHorizontal: hp(2), paddingBottom: hp(1.5) },
  kv: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: hp(1),
    borderBottomWidth: 1,
    gap: wp(3),
  },
  kvLabel: { fontSize: hp(1.55), flex: 1 },
  kvValue: { fontSize: hp(1.55), fontWeight: "500", flex: 1.5, textAlign: "right" },
  declHeader: { padding: hp(1.8), paddingBottom: hp(1) },
  declTitle: { fontSize: hp(1.8), fontWeight: "700" },
  declSubtitle: { fontSize: hp(1.5), marginTop: 2 },
  declRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: wp(3),
    padding: hp(1.5),
    marginHorizontal: hp(1.5),
    marginBottom: hp(1),
    borderRadius: 12,
    borderWidth: 1.5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  declText: { flex: 1, fontSize: hp(1.6), lineHeight: hp(2.4) },
  footer: {
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    paddingBottom: hp(3),
    paddingHorizontal: wp(4),
  },
  footerNote: { fontSize: hp(1.5), textAlign: "center", marginBottom: hp(1) },
  footerBtn: { borderRadius: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
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
  modalClose: { fontSize: hp(2.2), fontWeight: "400" },
  modalBody: { padding: wp(5) },
  termsHeading: { fontSize: hp(1.7), fontWeight: "700", marginBottom: hp(0.8) },
  termsBody: { fontSize: hp(1.6), lineHeight: hp(2.5) },
});
