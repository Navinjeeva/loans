import React, { useState } from "react";
import {
  View,
  Text,
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
  CurrencyInput,
} from "@src/common";
import { useDispatch, useSelector } from "react-redux";
import { setLoan, setDisbursement, setCollateral, Disbursement } from "@src/store/corporate";
import type { RootState } from "@src/store";
import ScreenHeader from "@src/common/components/ScreenHeader";
import DropDownModal from "@src/common/components/DropDownModal";
import DisbursementSection from "@src/common/components/DisbursementSection";
import EMICalculator from "@src/common/components/EMICalculator";
import CollateralSection from "@src/common/components/CollateralSection";
import BottomButton from "@src/common/components/BottomButton";

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

  const l = useSelector((state: RootState) => state.corporate.loan);

  // Catalog / reference data — comes from API later, lives in catalogs slice
  const CATEGORIES = useSelector((s: RootState) => s.catalogs.loanCategory);
  const PRODUCTS = useSelector((s: RootState) => s.catalogs.loanProducts);
  const PURPOSES = useSelector((s: RootState) => s.catalogs.purposeOfLoans);
  const MORATORIUM_OPTIONS = useSelector((s: RootState) => s.catalogs.mortariumOptions);
  const LINKED_ACCOUNTS = useSelector((s: RootState) => s.catalogs.linkedBankAccounts);

  const set = (k: string, v: any) => dispatch(setLoan({ [k]: v }));
  const [calcState, setCalcState] = useState<"idle" | "calculating" | "done">(
    l.emiCalculated ? "done" : "idle"
  );
  const collateral = useSelector((s: RootState) => s.corporate.collateral);

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

  const setDisb = (k: keyof Disbursement, v: any) => dispatch(setDisbursement({ [k]: v }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <ScreenHeader
        step={3}
        showSteps
        title="Loan details"
        onPress={() => navigation.goBack()}
        onSaveExit={() => navigation.navigate("CorporateHome")}
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">


        {/* Loan information panel */}
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.panelHeader}>
            <Text style={{ fontSize: 16 }}></Text>
            <Text style={[styles.panelTitle, { color: colors.text }]}>Loan information</Text>
          </View>

          <DropDownModal
            options={CATEGORIES}
            value={l.category}
            setValue={(v) => set("category", v)}
            placeholder="Select Category"
            header="Loan Category"
            label="Select category"
            required={true}
            style={{marginBottom : 12}}
          />

         <DropDownModal
            options={PRODUCTS}
            value={l.product}
            setValue={(v) => set("product", v)}
            placeholder="Select product"
            header="Loan Product"
            label="Select product"
            required={true}
            style={{marginBottom : 12}}
          />


          <DropDownModal
            options={PRODUCTS}
            value={l.schema}
            setValue={(v) => set("schema", v)}
            placeholder="Select Schema"
            header="Loan Schema"
            label="Select Schema"
            required={true}
            isSearchable={true}
            style={{marginBottom : 12}}
          />

          <Text style={{fontSize : 12, color : colors.text, marginBottom : 12}}> 
            Government or special lending scheme this loan is availed under. Choose 'Standard' if none applies.
          </Text>

          <CurrencyInput
            label="Loan amount"
            value={l.amount ? Number(l.amount) : null}
            onChangeText={(v: number | null) => { onLoanChange("amount", v )}}
            lableimp
            prefix="₹"
            placeholder=""
          />

          <Text style={{fontSize : 12, color : colors.text, marginBottom : 12}}> 
            Principal you wish to borrow
          </Text>

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
                  <DropDownModal
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
              <Text style={{fontSize : 12, color : colors.text, marginBottom : 18}}> 
                Repayment starts after the moratorium period.
              </Text>
            </>
          )}

          <DropDownModal
            options={PURPOSES}
            value={l.purpose}
            setValue={(v) => set("purpose", v)}
            placeholder="Select purpose"
            header="Purpose of Loan"
            label="Purpose of loan"
            required
            style={{marginBottom : 12}}
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

        {/* disbursement account  */}
        <DisbursementSection
          mode={l.disbMode}
          onModeChange={(m) => set("disbMode", m)}
          accounts={LINKED_ACCOUNTS}
          values={l.disbursement}
          onChange={setDisb}
        />

        {/* EMI calculator */}
        <View style={{ marginTop: 12 }}>
          <EMICalculator
            loanAmount={amt}
            tenure={ten}
            moratorium={mor}
            rate={9.5}
            onViewSchedule={() => {}}
          />
        </View>

        {/* collateral / security */}
        <View style={{ marginTop: 12 }}>
          <CollateralSection
            list={collateral}
            onChange={(next) => dispatch(setCollateral(next))}
            loanAmount={amt}
          />
        </View>

      </ScrollView>

      <BottomButton
        text="Save & Continue"
        onPress={() => navigation.navigate("CorporateDocuments")}
        // disabled
      />
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
