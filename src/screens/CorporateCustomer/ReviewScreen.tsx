import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useSelector } from "react-redux";
import { useTheme } from "@src/common/ThemeContext";
import ScreenHeader from "@src/common/components/ScreenHeader";
import BottomButton from "@src/common/components/BottomButton";
import {
  CheckIcon,
  CloseIcon,
} from "@src/common/svg/CorporateLoansSvgs";
import type { RootState } from "@src/store";
import {
  ReviewBanner,
  ReviewSection,
  ReviewKV,
  ReviewDocRow,
} from "./ReviewComponents";

// ── Helpers ────────────────────────────────────────────────────────────
function inrShort(n: string | number | undefined) {
  const v = Number(n);
  if (!v || isNaN(v)) return "—";
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

function fmtDateLong(d?: string) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const RATE_BY_CATEGORY: Record<string, number> = {
  "Secured Term Loan": 9.5,
  "Unsecured Term Loan": 14.25,
  "Cash Credit": 12.75,
  "Overdraft Facility": 13.5,
};

function computeEMI(amount: number, tenure: number, rate: number) {
  if (!amount || !tenure) return 0;
  const r = rate / 100 / 12;
  return (amount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1);
}

// Lightweight catalog (mirrors DocumentsScreen DOC_GROUPS) — used to group
// uploaded documents in the review summary. Not exhaustive: any doc id not
// matched here lands in an "Other" bucket so nothing is dropped.
const DOC_GROUPS: { id: string; label: string; docIds: string[] }[] = [
  { id: "company", label: "Company Documents", docIds: ["coi", "moa", "aoa", "panco", "boardReso"] },
  { id: "tax", label: "Tax & Statutory", docIds: ["gst", "shop_est_lic", "udyam_reg", "no_obj_cert"] },
  { id: "financial", label: "Financial Documents", docIds: ["audited", "pnl", "bankStmt", "itr", "gst_return"] },
  { id: "kyc", label: "Director & Owner KYC", docIds: ["dirKyc", "dirAadhaar", "dirPhoto"] },
  { id: "deal", label: "Deal-Specific", docIds: ["proforma"] },
];
const DOC_NAME: Record<string, string> = {
  coi: "Certificate of Incorporation",
  moa: "Memorandum of Association",
  aoa: "Articles of Association (AOA)",
  panco: "Company PAN Card",
  boardReso: "Board Resolution",
  gst: "GST Registration Certificate",
  shop_est_lic: "Shop & Establishment License",
  udyam_reg: "Udyam/MSME Registration",
  no_obj_cert: "No-Objection Certificate",
  audited: "Audited Financial Statements — FY24",
  pnl: "Profit & Loss Statement",
  bankStmt: "Bank Statements — Last 12 months",
  itr: "Income Tax Returns — 2 years",
  gst_return: "GST Returns - Last 4 quarters",
  dirKyc: "Director KYC — PAN",
  dirAadhaar: "Director Aadhaar",
  dirPhoto: "Director Photographs",
  proforma: "Proforma invoice/quotation",
};

const DECLARATIONS = [
  { key: "accurate", text: "I confirm that all information and documents provided are accurate, complete and true." },
  { key: "verify", text: "I authorize TecuDigi Bank to verify company, director and signatory information." },
  { key: "terms", text: "I have read and agree to the Terms & Conditions and Privacy Policy.", link: true },
  { key: "consent", text: "I consent to financial and compliance verification, including credit bureau checks." },
  { key: "ubo", text: "I declare that the ultimate beneficial owners disclosed are accurate and complete." },
];

const TERMS_HEADINGS = [
  "1. Application",
  "2. Verification",
  "3. Sanction",
  "4. Repayment",
  "5. Default",
  "6. Data Privacy",
];

// ── Screen ─────────────────────────────────────────────────────────────
const ReviewScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const c = useSelector((s: RootState) => s.corporate.company);
  const o = useSelector((s: RootState) => s.corporate.office);
  const f = useSelector((s: RootState) => s.corporate.financial);
  const l = useSelector((s: RootState) => s.corporate.loan);
  const directors = useSelector((s: RootState) => s.corporate.directors);
  const owners = useSelector((s: RootState) => s.corporate.owners);
  const documents = useSelector((s: RootState) => s.corporate.documents) || {};

  const [showTerms, setShowTerms] = useState(false);
  const [declarations, setDeclarations] = useState<Record<string, boolean>>({});
  const allConsent = DECLARATIONS.every((d) => declarations[d.key]);
  const toggleDecl = (key: string) =>
    setDeclarations((prev) => ({ ...prev, [key]: !prev[key] }));

  // ── Derived data ───────────────────────────────────────────────────
  const countryLabel = c.country
    ? c.country === "India"
      ? "India (IN)"
      : c.country
    : "—";

  const addrLine = (a: any) =>
    [a?.address, a?.city, `${a?.state || ""} ${a?.postal || ""}`.trim(), a?.country]
      .filter(Boolean)
      .join(", ");

  const officeSummary = [o?.reg?.city, o?.op?.city]
    .filter(Boolean)
    .join(" · ");

  const docCount = Object.keys(documents).length;
  const ownerLine = (d: any) =>
    `${d.designation || "—"}${
      d.isOwner && d.ownership ? ` · ${d.ownership}%` : ""
    }`;

  const amt = Number(l.amount) || 0;
  const ten = Number(l.tenure) || 0;
  const rate = RATE_BY_CATEGORY[l.category] ?? 12.5;
  const emi = computeEMI(amt, ten, rate);

  // Group uploaded documents
  const grouped = DOC_GROUPS.map((g) => ({
    ...g,
    entries: g.docIds
      .filter((id) => !!documents[id])
      .map((id) => ({ id, name: DOC_NAME[id] || id, ...documents[id] })),
  })).filter((g) => g.entries.length > 0);

  const otherIds = Object.keys(documents).filter(
    (id) => !DOC_GROUPS.some((g) => g.docIds.includes(id)),
  );
  if (otherIds.length > 0) {
    grouped.push({
      id: "other",
      label: "Other",
      docIds: otherIds,
      entries: otherIds.map((id) => ({
        id,
        name: DOC_NAME[id] || documents[id]?.fileName || id,
        ...documents[id],
      })),
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        step={5}
        showSteps
        title="Review application"
        onPress={() => navigation.goBack()}
        onSaveExit={() => navigation.navigate("CorporateHome")}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <ReviewBanner
          title="Review before you generate application form"
          subtitle="Check each section. Nothing is submitted yet."
        />

        {/* ── Classification ── */}
        <ReviewSection
          title="Classification"
          subtitle={countryLabel}
          onEdit={() => navigation.navigate("CorporateVerifyCompany")}
          defaultOpen
        >
          <ReviewKV label="Country" value={countryLabel} />
          <ReviewKV label="Business type" value={c.businessType} />
          <ReviewKV label="Industry" value={c.industry} />
        </ReviewSection>

        {/* ── Company information ── */}
        <ReviewSection
          title="Company information"
          subtitle={c.name || undefined}
          onEdit={() => navigation.navigate("CorporateVerifyCompany")}
          defaultOpen
        >
          <ReviewKV label="Company name" value={c.name} />
          <ReviewKV label="Registration / CIN" value={c.cin} mono />
          <ReviewKV label="Company PAN" value={c.pan} mono />
          <ReviewKV label="GSTIN" value={c.gst} mono />
          <ReviewKV label="Udyam Registration" value={(c as any).udyam} mono />
          <ReviewKV label="Incorporated" value={fmtDateLong(c.doi)} />
        </ReviewSection>

        {/* ── Office details ── */}
        <ReviewSection
          title="Office details"
          subtitle={officeSummary || undefined}
          onEdit={() => navigation.navigate("CorporateVerifyCompany")}
        >
          <ReviewKV label="Registered office" value={addrLine(o.reg)} />
          <ReviewKV
            label="Operational office"
            value={
              addrLine(o.reg) === addrLine(o.op)
                ? "Same as registered"
                : addrLine(o.op)
            }
          />
        </ReviewSection>

        {/* ── Directors & owners ── */}
        <ReviewSection
          title="Directors & owners"
          subtitle={`${directors.length} director${
            directors.length !== 1 ? "s" : ""
          } · ${owners.length} owner${owners.length !== 1 ? "s" : ""}`}
          onEdit={() => navigation.navigate("CorporateVerifyCompany")}
        >
          {directors.map((d: any) => (
            <ReviewKV key={d.id} label={d.name} value={ownerLine(d)} />
          ))}
          {owners.map((o: any) => (
            <ReviewKV
              key={o.id}
              label={o.name}
              value={`${o.ownerType || "Owner"}${
                o.shareholding ? ` · ${o.shareholding}%` : ""
              }`}
            />
          ))}
        </ReviewSection>

        {/* ── Financial information ── */}
        <ReviewSection
          title="Financial information"
          subtitle={
            f.annualRevenue ? `Revenue ${inrShort(f.annualRevenue)}` : undefined
          }
          onEdit={() => navigation.navigate("CorporateVerifyCompany")}
        >
          <ReviewKV label="Annual revenue" value={inrShort(f.annualRevenue)} mono />
          <ReviewKV label="Monthly turnover" value={inrShort(f.monthlyTurnover)} mono />
          <ReviewKV label="Net profit" value={inrShort(f.netProfit)} mono />
          <ReviewKV
            label="Capital investment"
            value={inrShort((f as any).capitalInvestment)}
            mono
          />
          <ReviewKV
            label="Existing loans"
            value={inrShort((f as any).existingLoans)}
            mono
          />
          <ReviewKV
            label="Outstanding debt"
            value={inrShort((f as any).outstandingDebt)}
            mono
          />
          <ReviewKV label="Employees" value={f.employeeCount} mono />
          <ReviewKV
            label="Vintage"
            value={f.vintage ? `${f.vintage} years` : undefined}
          />
        </ReviewSection>

        {/* ── Loan details ── */}
        <ReviewSection
          title="Loan details"
          subtitle={
            l.amount
              ? `${inrShort(l.amount)}${l.tenure ? ` · ${l.tenure} mo` : ""}`
              : undefined
          }
          onEdit={() => navigation.navigate("CorporateLoan")}
        >
          <ReviewKV label="Product" value={l.product} />
          <ReviewKV label="Amount" value={inrShort(l.amount)} mono />
          <ReviewKV label="Purpose" value={l.purpose} />
          <ReviewKV
            label="Tenor"
            value={l.tenure ? `${l.tenure} months` : undefined}
          />
          <ReviewKV
            label="Moratorium"
            value={`${Number(l.moratorium) || 0} months`}
          />
          <ReviewKV label="Category" value={l.category} />
          <ReviewKV label="Interest rate" value={`${rate.toFixed(2)}% p.a.`} />
          <ReviewKV
            label="Tentative EMI"
            value={emi ? `₹${emi.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : undefined}
            mono
          />
          <ReviewKV label="Branch" value={(l as any).branch} />
          <ReviewKV label="Loan officer" value={(l as any).officer} />
        </ReviewSection>

        {/* ── Uploaded documents ── */}
        <ReviewSection
          title="Uploaded documents"
          subtitle={`${docCount} document${docCount !== 1 ? "s" : ""}`}
          onEdit={() => navigation.navigate("CorporateDocuments")}
        >
          <View style={{ gap: 12, paddingTop: 4, paddingBottom: 6 }}>
            {grouped.length === 0 ? (
              <Text style={styles.emptyDocs}>No documents uploaded yet.</Text>
            ) : (
              grouped.map((g) => (
                <View key={g.id} style={{ gap: 8 }}>
                  <Text style={styles.docGroupLabel}>{g.label.toUpperCase()}</Text>
                  {g.entries.map((e: any) => {
                    const ext = e.fileName?.split(".").pop()?.toUpperCase() || "PDF";
                    return (
                      <ReviewDocRow
                        key={e.id}
                        name={e.name}
                        fileType={ext}
                        fileSize={e.size}
                        onEdit={() => navigation.navigate("CorporateDocuments")}
                        onPreview={() => navigation.navigate("CorporateDocuments")}
                      />
                    );
                  })}
                </View>
              ))
            )}
          </View>
        </ReviewSection>

        {/* ── Declaration & consent ── */}
        <View style={styles.declCard}>
          <View style={styles.declHeader}>
            <Text style={styles.declTitle}>Declaration & consent</Text>
            <Text style={styles.declSubtitle}>Accept all to continue</Text>
          </View>
          {DECLARATIONS.map((d) => {
            const checked = !!declarations[d.key];
            return (
              <TouchableOpacity
                key={d.key}
                activeOpacity={0.85}
                onPress={() => toggleDecl(d.key)}
                style={[
                  styles.declRow,
                  {
                    backgroundColor: checked ? colors.successLight : colors.card,
                    borderColor: checked ? colors.successBorder : colors.borderLight,
                  },
                ]}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: checked ? colors.success : colors.card,
                      borderColor: checked ? colors.success : colors.borderLight,
                    },
                  ]}
                >
                  {checked && (
                    <CheckIcon size={13} color={colors.buttonText} />
                  )}
                </View>
                <Text style={styles.declText}>
                  {d.text}{" "}
                  {d.link && (
                    <Text
                      onPress={() => setShowTerms(true)}
                      style={styles.termsLink}
                    >
                      View terms
                    </Text>
                  )}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <BottomButton
        text="Agree & Continue"
        onPress={() => navigation.navigate("CorporateGeneratedForm")}
        disabled={!allConsent}
        note={!allConsent ? "Confirm the declaration to continue" : undefined}
      />

      {/* Terms modal */}
      <Modal visible={showTerms} transparent animationType="slide" onRequestClose={() => setShowTerms(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setShowTerms(false)} hitSlop={6}>
                <CloseIcon size={18} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {TERMS_HEADINGS.map((h) => (
                <View key={h} style={{ marginBottom: hp(2) }}>
                  <Text style={styles.termsHeading}>{h}</Text>
                  <Text style={styles.termsBody}>
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

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    scroll: { padding: wp(4), paddingBottom: hp(4), gap: hp(1.4) },

    // Documents inside the Uploaded documents section
    docGroupLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.muted,
      letterSpacing: 0.5,
      paddingTop: 8,
      paddingHorizontal: 2,
    },
    emptyDocs: {
      fontSize: 13,
      color: colors.muted,
      paddingVertical: 10,
      textAlign: "center",
    },

    // Declaration card
    declCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.card,
      overflow: "hidden",
    },
    declHeader: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 10,
    },
    declTitle: { fontSize: 15, fontWeight: "700", color: colors.ink, letterSpacing: -0.2 },
    declSubtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },
    declRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 11,
      padding: 13,
      marginHorizontal: 12,
      marginBottom: 9,
      borderRadius: 13,
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
      marginTop: 1,
    },
    declText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19,
      color: colors.ink2,
      fontWeight: "500",
    },
    termsLink: {
      color: colors.brand600,
      fontWeight: "600",
      textDecorationLine: "underline",
    },

    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.modalBackdrop,
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: colors.card,
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
      borderBottomColor: colors.hairline,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", color: colors.ink },
    modalBody: { padding: wp(5) },
    termsHeading: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.ink,
      marginBottom: hp(0.8),
    },
    termsBody: { fontSize: 13, lineHeight: 20, color: colors.muted },
  });
