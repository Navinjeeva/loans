import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "@src/common/ThemeContext";
import {RefreshIcon, ChevronDownEMI as ChevronDown, ChevronRightEMI as ChevronRight} from "@src/common/svg/CorporateLoansSvgs/index"

// ── Formatters ──
const fmtINR = (n: number, paise = true) => {
  if (isNaN(n)) return "";
  const neg = n < 0;
  const abs = Math.abs(n);
  const intPart = Math.floor(abs);
  let x = intPart.toString();
  let last3 = x.slice(-3);
  let rest = x.slice(0, -3);
  if (rest) last3 = "," + last3;
  rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  let out = rest + last3;
  if (paise) {
    const p = Math.round((abs - intPart) * 100);
    out += "." + String(p).padStart(2, "0");
  }
  return (neg ? "-" : "") + out;
};

const addMonths = (d: Date, m: number) => {
  const nd = new Date(d);
  nd.setMonth(nd.getMonth() + m);
  return nd;
};
const fmtDateLong = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

// ── EMI computation ──
function computeEMI(P: number, T: number, M: number, rate: number) {
  const r = rate / 100 / 12;
  const N = Math.max(T, 1);
  const emi = P && T ? (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1) : 0;
  const now = new Date();
  const start = addMonths(now, M + 1);
  const maturity = addMonths(now, M + T + 1);
  let totalInterest = 0;
  if (P && T) {
    let bal = P;
    for (let m = 1; m <= N; m++) {
      const interest = bal * r;
      let principal = emi - interest;
      if (m === N) principal = bal;
      bal = Math.max(bal - principal, 0);
      totalInterest += interest;
    }
  }
  return {
    rate,
    emi,
    P,
    N,
    M,
    start,
    maturity,
    totalInterest,
    totalPayment: P + totalInterest,
    valid: !!(P && T),
  };
}

interface EMICalculatorProps {
  loanAmount?: number;
  tenure?: number; // months
  moratorium?: number; // months
  rate?: number;
  onViewSchedule?: () => void;
}

const EMICalculator = ({
  loanAmount = 0,
  tenure = 0,
  moratorium = 0,
  rate = 9.5,
  onViewSchedule,
}: EMICalculatorProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [calcState, setCalcState] = useState<"idle" | "calculating" | "done">(
    "idle",
  );
  const [breakdownOpen, setBreakdownOpen] = useState(false);

  const res = computeEMI(loanAmount, tenure, moratorium, rate);

  const calculate = () => {
    if (!res.valid) return;
    setCalcState("calculating");
    setTimeout(() => setCalcState("done"), 850);
  };
  const recalculate = () => {
    setBreakdownOpen(false);
    calculate();
  };

  const hasAmount = loanAmount > 0;
  const hasTenor = tenure > 0;
  const hasMora = moratorium != null;
  const guidance = !hasAmount
    ? "Enter loan amount to begin calculation"
    : !hasTenor
    ? "Select tenure to estimate your EMI"
    : "You're all set — calculate your EMI estimate";

  return (
    <View style={styles.panel}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>EMI calculator</Text>
        <Text style={styles.subtitle}>
          Estimate your monthly repayment instantly
        </Text>
      </View>

      <View style={styles.body}>
        {calcState !== "done" ? (
          // ── Pre-calc state ──
          <>
            <View style={styles.checklist}>
              <ChecklistRow
                label="Loan amount"
                done={hasAmount}
                value={hasAmount ? `₹${fmtINR(loanAmount, false)}` : null}
                styles={styles}
                colors={colors}
              />
              <ChecklistRow
                label="Tenure"
                done={hasTenor}
                value={hasTenor ? `${tenure} months` : null}
                styles={styles}
                colors={colors}
              />
              <ChecklistRow
                label="Moratorium"
                done={hasMora}
                value={hasMora ? `${moratorium} months` : null}
                styles={styles}
                colors={colors}
              />
            </View>

            <View style={styles.guidanceBanner}>
              <Text
                style={[
                  styles.guidanceText,
                  { color: res.valid ? colors.buttonPrimaryHover : colors.muted },
                ]}
              >
                {guidance}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!res.valid || calcState === "calculating"}
              onPress={calculate}
              style={[
                styles.calcBtn,
                {
                  backgroundColor: res.valid
                    ? colors.brand
                    : colors.buttonDisabledBackground,
                },
              ]}
            >
              {calcState === "calculating" ? (
                <ActivityIndicator color={colors.buttonText} />
              ) : (
                <Text
                  style={[
                    styles.calcBtnText,
                    { color: res.valid ? colors.buttonText : colors.faint },
                  ]}
                >
                  Calculate EMI
                </Text>
              )}
            </TouchableOpacity>

            {res.valid && calcState !== "calculating" && (
              <Text style={styles.subFootnote}>Instant repayment estimate</Text>
            )}
          </>
        ) : (
          // ── Post-calc state ──
          <>
            {/* Hero EMI */}
            <View style={styles.heroWrap}>
              <Text style={styles.heroLabel}>MONTHLY EMI</Text>
              <View style={styles.heroEmiRow}>
                <Text style={styles.heroEmi}>
                  ₹{fmtINR(res.emi, false)}
                </Text>
                <Text style={styles.heroEmiSlash}> / month</Text>
              </View>
              <Text style={styles.heroSubtitle}>
                {res.rate.toFixed(2)}% p.a · {res.M + res.N} months
                {res.M ? ` · ${res.M} month moratorium` : ""}
              </Text>
            </View>

            {/* Expandable breakdown */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setBreakdownOpen((o) => !o)}
              style={styles.breakdownToggle}
            >
              <Text style={styles.breakdownToggleText}>
                {breakdownOpen ? "Hide loan breakdown" : "View loan breakdown"}
              </Text>
              <ChevronDown size={15} color={colors.muted} up={breakdownOpen} />
            </TouchableOpacity>

            {breakdownOpen && (
              <View style={styles.breakdownList}>
                <BreakdownRow label="Principal amount" value={`₹${fmtINR(res.P)}`} styles={styles} />
                <BreakdownRow label="Interest amount" value={`₹${fmtINR(res.totalInterest)}`} styles={styles} />
                <BreakdownRow label="Total payable" value={`₹${fmtINR(res.totalPayment)}`} styles={styles} />
                <BreakdownRow label="First EMI date" value={fmtDateLong(res.start)} styles={styles} />
                <BreakdownRow label="Maturity date" value={fmtDateLong(res.maturity)} isLast styles={styles} />
              </View>
            )}

            {/* View repayment schedule */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onViewSchedule}
              style={styles.scheduleBtn}
            >
              <Text style={styles.scheduleBtnText}>View repayment schedule</Text>
              <ChevronRight color={colors.muted} />
            </TouchableOpacity>

            {/* Recalculate */}
            <View style={styles.recalcRow}>
              <TouchableOpacity onPress={recalculate} style={styles.recalcBtn}>
                <RefreshIcon size={13} color={colors.muted} />
                <Text style={styles.recalcText}>Recalculate</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

// ── Checklist row ──
const ChecklistRow = ({
  label,
  done,
  value,
  styles,
  colors,
}: {
  label: string;
  done: boolean;
  value?: string | null;
  styles: any;
  colors: any;
}) => (
  <View style={styles.checkRow}>
    <View
      style={[
        styles.checkDot,
        {
          backgroundColor: done ? colors.brandTint : colors.buttonDisabledBackground,
          borderStyle: done ? "solid" : "dashed",
          borderColor: done ? "transparent" : colors.borderLight,
          borderWidth: done ? 0 : 1,
        },
      ]}
    >
      <View
        style={{
          width: done ? 7 : 5,
          height: done ? 7 : 5,
          borderRadius: 99,
          backgroundColor: done ? colors.brand : colors.faint,
        }}
      />
    </View>
    <Text
      style={[
        styles.checkLabel,
        { color: done ? colors.ink : colors.muted, fontWeight: "500" },
      ]}
    >
      {label}
    </Text>
    {value ? (
      <Text style={styles.checkValue}>{value}</Text>
    ) : (
      <Text style={styles.checkPending}>Pending</Text>
    )}
  </View>
);

// ── Breakdown row ──
const BreakdownRow = ({
  label,
  value,
  isLast,
  styles,
}: {
  label: string;
  value: string;
  isLast?: boolean;
  styles: any;
}) => (
  <View style={[styles.breakRow, !isLast && styles.breakRowBorder]}>
    <Text style={styles.breakLabel}>{label}</Text>
    <Text style={styles.breakValue}>{value}</Text>
  </View>
);

export default EMICalculator;

const createStyles = (colors: any) =>
  StyleSheet.create({
    panel: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderLight,
      overflow: "hidden",
    },

    header: {
      paddingHorizontal: 15,
      paddingTop: 14,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.dividerSoft,
    },
    title: { fontSize: 15, fontWeight: "700", color: colors.ink, letterSpacing: -0.2 },
    subtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },

    body: { paddingHorizontal: 15, paddingTop: 4, paddingBottom: 15 },

    // ── Checklist ──
    checklist: { paddingHorizontal: 2, paddingTop: 4, paddingBottom: 10 },
    checkRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 8,
    },
    checkDot: {
      width: 22,
      height: 22,
      borderRadius: 99,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    checkLabel: { flex: 1, fontSize: 13, fontWeight: "500" },
    checkValue: { fontSize: 12.5, fontWeight: "600", color: colors.ink },
    checkPending: { fontSize: 11.5, fontWeight: "500", color: colors.faint },

    // ── Guidance banner ──
    guidanceBanner: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: colors.brandTint,
      marginBottom: 12,
      alignItems: "center",
    },
    guidanceText: { fontSize: 12, fontWeight: "500", lineHeight: 16 },

    // ── Calculate button ──
    calcBtn: {
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    calcBtnText: { fontSize: 15, fontWeight: "600", letterSpacing: -0.2 },
    subFootnote: {
      textAlign: "center",
      marginTop: 8,
      fontSize: 11.5,
      color: colors.faint,
      fontWeight: "500",
    },

    // ── Hero EMI ──
    heroWrap: { alignItems: "center", paddingVertical: 4, paddingBottom: 12 },
    heroLabel: {
      fontSize: 11,
      fontWeight: "600",
      color: colors.muted,
      letterSpacing: 0.5,
    },
    heroEmiRow: {
      flexDirection: "row",
      alignItems: "baseline",
      marginTop: 5,
    },
    heroEmi: {
      fontSize: 30,
      fontWeight: "700",
      color: colors.ink,
      letterSpacing: -0.6,
      lineHeight: 32,
    },
    heroEmiSlash: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.muted,
      marginLeft: 4,
    },
    heroSubtitle: {
      marginTop: 9,
      fontSize: 12.5,
      color: colors.muted,
      fontWeight: "500",
    },

    // ── Breakdown ──
    breakdownToggle: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.hairline,
    },
    breakdownToggleText: { fontSize: 13, fontWeight: "600", color: colors.ink2 },
    breakdownList: { borderTopWidth: 1, borderTopColor: colors.hairline },
    breakRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 14,
      paddingVertical: 9,
    },
    breakRowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.hairline,
    },
    breakLabel: { fontSize: 12.5, color: colors.muted },
    breakValue: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.ink,
      textAlign: "right",
    },

    // ── View repayment schedule ──
    scheduleBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 12,
      paddingVertical: 12,
      borderRadius: 13,
      backgroundColor: colors.buttonDisabledBackground,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    scheduleBtnText: { fontSize: 13.5, fontWeight: "600", color: colors.ink2 },

    // ── Recalculate ──
    recalcRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 12,
    },
    recalcBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 6,
      paddingHorizontal: 4,
    },
    recalcText: { fontSize: 12.5, fontWeight: "600", color: colors.ink2 },
  });
