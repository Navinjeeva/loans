import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import {
  TextInputComponent,
  DropdownWithModal,
  CurrencyInput,
} from "@src/common";
import Button from "@src/components/Button";
import { useDispatch, useSelector } from "react-redux";
import StepHeader from "./StepHeader";
import { setLoan } from "@src/store/corporate";

const BRAND = "#F97316";

const CATEGORIES = [
  { label: "Secured Term Loan", value: "Secured Term Loan" },
  { label: "Unsecured Term Loan", value: "Unsecured Term Loan" },
  { label: "Working Capital - Cash Credit", value: "Working Capital - Cash Credit" },
  { label: "Working Capital - Overdraft", value: "Working Capital - Overdraft" },
];

const PRODUCTS = [
  { label: "Corporate Business Loan", value: "Corporate Business Loan" },
  { label: "Working Capital Loan", value: "Working Capital Loan" },
  { label: "Business Expansion Loan", value: "Business Expansion Loan" },
  { label: "Corporate Unsecured Loan", value: "Corporate Unsecured Loan" },
];

const PURPOSES = [
  { label: "Business expansion", value: "Business expansion" },
  { label: "Working capital", value: "Working capital" },
  { label: "Equipment purchase", value: "Equipment purchase" },
  { label: "Infrastructure development", value: "Infrastructure development" },
  { label: "Technology upgrade", value: "Technology upgrade" },
  { label: "Debt consolidation", value: "Debt consolidation" },
  { label: "Trade finance", value: "Trade finance" },
];

const MORATORIUM_OPTIONS = [
  { label: "0 months", value: "0" },
  { label: "1 month", value: "1" },
  { label: "2 months", value: "2" },
  { label: "3 months", value: "3" },
  { label: "6 months", value: "6" },
];

function computeEMI(
  amount: number,
  tenure: number,
  moratorium: number
): { emi: number; rate: number; totalInterest: number; totalPayable: number } {
  const rate = 12.5 / 1200;
  const n = tenure - moratorium;
  if (!amount || !n || n <= 0)
    return { emi: 0, rate: 12.5, totalInterest: 0, totalPayable: amount };
  const emi =
    (amount * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
  const totalPayable = emi * n;
  return { emi, rate: 12.5, totalInterest: totalPayable - amount, totalPayable };
}

function inrFmt(n: number) {
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

const LoanScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const l = useSelector((state: any) => state.corporate.loan);
  const set = (k: string, v: any) => dispatch(setLoan({ [k]: v }));
  const [calcState, setCalcState] = useState<"idle" | "calculating" | "done">(
    l.emiCalculated ? "done" : "idle"
  );

  const isTermLoan = /term loan/i.test(l.category || "");
  const amt = Number(l.amount) || 0;
  const ten = Number(l.tenure) || 0;
  const mor = Number(l.moratorium) || 0;
  const emiResult = computeEMI(amt, ten, mor);

  const loanComplete =
    !!l.category &&
    !!l.product &&
    !!l.amount &&
    !!l.purpose &&
    !!l.purposeDesc &&
    (isTermLoan ? !!l.tenure : true);

  const calculate = () => {
    if (!amt || !ten) return;
    setCalcState("calculating");
    setTimeout(() => {
      dispatch(setLoan({ emiCalculated: true }));
      setCalcState("done");
    }, 900);
  };

  const onLoanChange = (k: string, v: any) => {
    dispatch(setLoan({ [k]: v }));
    if (["amount", "tenure", "moratorium"].includes(k) && l.emiCalculated) {
      dispatch(setLoan({ emiCalculated: false }));
      setCalcState("idle");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepHeader
        step={3}
        title="Loan details"
        onBack={() => navigation.goBack()}
        onSaveExit={() => navigation.navigate("CorporateHome")}
        colors={colors}
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Loan information panel */}
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <Text style={{ fontSize: 16 }}>📋</Text>
            <Text style={[styles.panelTitle, { color: colors.text }]}>Loan information</Text>
          </View>

          <DropdownWithModal
            options={CATEGORIES}
            value={l.category}
            setValue={(v) => set("category", v)}
            placeholder="Select category"
            header="Loan Category"
            label="Loan category"
            required
            isSearchable={false}
          />

          <DropdownWithModal
            options={PRODUCTS}
            value={l.product}
            setValue={(v) => set("product", v)}
            placeholder="Select product"
            header="Loan Product"
            label="Loan product"
            required
            isSearchable={false}
          />

          <CurrencyInput
            label="Loan amount"
            value={l.amount ? Number(l.amount) : null}
            onChangeText={(v: number | null) => {
              onLoanChange("amount", v );
            }}
            lableimp
            prefix="₹"
            placeholder="0"
          />

          {isTermLoan && (
            <>
              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <TextInputComponent
                    header="Tenor (months)"
                    placeholder="36"
                    value={l.tenure}
                    onChange={(v: string) =>
                      onLoanChange("tenure", v.replace(/[^0-9]/g, "").slice(0, 3))
                    }
                    required
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <DropdownWithModal
                    options={MORATORIUM_OPTIONS}
                    value={l.moratorium || "0"}
                    setValue={(v) => onLoanChange("moratorium", v)}
                    placeholder="Select"
                    header="Moratorium"
                    label="Moratorium"
                    isSearchable={false}
                  />
                </View>
              </View>
            </>
          )}

          <DropdownWithModal
            options={PURPOSES}
            value={l.purpose}
            setValue={(v) => set("purpose", v)}
            placeholder="Select purpose"
            header="Purpose of Loan"
            label="Purpose of loan"
            required
          />

          <TextInputComponent
            header="Purpose description"
            placeholder="Briefly describe how the funds will be used…"
            value={l.purposeDesc}
            onChange={(v: string) => set("purposeDesc", v)}
            required
            multiline
            numberOfLines={3}
          />
        </View>

        {/* EMI Calculator (term loans only) */}
        {isTermLoan && (
          <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.panelHeader}>
              <Text style={{ fontSize: 16 }}>🧮</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.panelTitle, { color: colors.text }]}>EMI calculator</Text>
                <Text style={[styles.panelSubtitle, { color: colors.textSecondary }]}>
                  Estimate your monthly repayment instantly
                </Text>
              </View>
            </View>

            {calcState !== "done" ? (
              <View>
                <View style={[styles.emiPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.emiPreviewRow, { borderBottomColor: colors.borderLight }]}>
                    <Text style={[styles.emiPreviewLabel, { color: colors.textSecondary }]}>Amount</Text>
                    <Text style={[styles.emiPreviewValue, { color: colors.text }]}>
                      {amt > 0 ? inrFmt(amt) : "—"}
                    </Text>
                  </View>
                  <View style={[styles.emiPreviewRow, { borderBottomColor: colors.borderLight }]}>
                    <Text style={[styles.emiPreviewLabel, { color: colors.textSecondary }]}>Tenure</Text>
                    <Text style={[styles.emiPreviewValue, { color: colors.text }]}>
                      {ten > 0 ? `${ten} months` : "—"}
                    </Text>
                  </View>
                  <View style={[styles.emiPreviewRow, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.emiPreviewLabel, { color: colors.textSecondary }]}>Rate</Text>
                    <Text style={[styles.emiPreviewValue, { color: colors.text }]}>12.5% p.a.</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={calculate}
                  disabled={!amt || !ten || calcState === "calculating"}
                  style={[
                    styles.calcBtn,
                    {
                      backgroundColor: !amt || !ten ? colors.surface : "#FFF4EC",
                      borderColor: !amt || !ten ? colors.border : "#F4CBA9",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.calcBtnText,
                      { color: !amt || !ten ? colors.textMuted : BRAND },
                    ]}
                  >
                    {calcState === "calculating" ? "Calculating…" : "Calculate EMI"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View
                  style={[styles.emiResult, { backgroundColor: "#FFF4EC", borderColor: "#F4CBA9" }]}
                >
                  <Text style={[styles.emiResultLabel, { color: BRAND }]}>Monthly EMI</Text>
                  <Text style={[styles.emiResultValue, { color: colors.text }]}>
                    ₹{Math.round(emiResult.emi).toLocaleString("en-IN")}
                  </Text>
                  <Text style={[styles.emiResultSub, { color: colors.textSecondary }]}>
                    For {ten - mor} months @ 12.5% p.a.
                  </Text>
                </View>
                <View style={[styles.emiBreakdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.emiBreakdownRow, { borderBottomColor: colors.borderLight }]}>
                    <Text style={[styles.emiBreakdownLabel, { color: colors.textSecondary }]}>Principal</Text>
                    <Text style={[styles.emiBreakdownValue, { color: colors.text }]}>{inrFmt(amt)}</Text>
                  </View>
                  <View style={[styles.emiBreakdownRow, { borderBottomColor: colors.borderLight }]}>
                    <Text style={[styles.emiBreakdownLabel, { color: colors.textSecondary }]}>Total interest</Text>
                    <Text style={[styles.emiBreakdownValue, { color: colors.text }]}>
                      {inrFmt(emiResult.totalInterest)}
                    </Text>
                  </View>
                  <View style={[styles.emiBreakdownRow, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.emiBreakdownLabel, { color: colors.textSecondary }]}>Total payable</Text>
                    <Text style={[styles.emiBreakdownValue, { color: colors.text, fontWeight: "700" }]}>
                      {inrFmt(emiResult.totalPayable)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    dispatch(setLoan({ emiCalculated: false }));
                    setCalcState("idle");
                  }}
                  style={styles.recalcBtn}
                >
                  <Text style={[styles.recalcText, { color: colors.textSecondary }]}>🔄 Recalculate</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { borderTopColor: colors.borderLight, backgroundColor: colors.background },
        ]}
      >
        <Button
          text="Save & Continue"
          click={() => navigation.navigate("CorporateDocuments")}
          disabled={!loanComplete}
          buttonStyle={styles.footerBtn}
        />
      </View>
    </View>
  );
};

export default LoanScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: wp(4), paddingBottom: hp(4), gap: hp(2) },
  panel: { borderRadius: 18, borderWidth: 1, padding: hp(2) },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2),
    marginBottom: hp(1.5),
  },
  panelTitle: { fontSize: hp(1.9), fontWeight: "700" },
  panelSubtitle: { fontSize: hp(1.5) },
  rowFields: { flexDirection: "row", gap: wp(3) },
  emiPreview: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: hp(1.5),
    overflow: "hidden",
  },
  emiPreviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.2),
    borderBottomWidth: 1,
  },
  emiPreviewLabel: { fontSize: hp(1.6) },
  emiPreviewValue: { fontSize: hp(1.6), fontWeight: "600" },
  calcBtn: {
    padding: hp(1.6),
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: "center",
  },
  calcBtnText: { fontSize: hp(1.7), fontWeight: "600" },
  emiResult: {
    borderRadius: 14,
    borderWidth: 1,
    padding: hp(2.2),
    alignItems: "center",
    marginBottom: hp(1.5),
  },
  emiResultLabel: {
    fontSize: hp(1.5),
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: hp(0.5),
  },
  emiResultValue: { fontSize: hp(3.6), fontWeight: "800", letterSpacing: -1, marginBottom: hp(0.5) },
  emiResultSub: { fontSize: hp(1.5) },
  emiBreakdown: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  emiBreakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(3),
    borderBottomWidth: 1,
  },
  emiBreakdownLabel: { fontSize: hp(1.6) },
  emiBreakdownValue: { fontSize: hp(1.6), fontWeight: "600" },
  recalcBtn: { alignItems: "flex-end", marginTop: hp(1.2) },
  recalcText: { fontSize: hp(1.5), fontWeight: "600" },
  footer: {
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    paddingBottom: hp(3),
  },
  footerBtn: { marginHorizontal: wp(4), borderRadius: 12 },
});
