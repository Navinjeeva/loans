import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "@src/common/ThemeContext";
import {Sx, EditIcon, BankIcon, TrashIcon} from "@src/common/svg/CorporateLoansSvgs/index"


// ── Indian-style number formatter — ₹X Cr / ₹X L / ₹X,XXX ──
const inrShort = (n: number | string | undefined): string => {
  if (n == null || n === "" || isNaN(Number(n))) return "—";
  const num = Number(n);
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 1e7)
    return `${sign}₹${(num / 1e7).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (abs >= 1e5)
    return `${sign}₹${(num / 1e5).toFixed(2).replace(/\.00$/, "")} L`;
  return `${sign}₹${num.toLocaleString("en-IN")}`;
};

interface BankCardProps {
  lender: string;
  facilityType?: string;
  endDate?: string;
  sanctioned?: number | string;
  outstanding?: number | string;
  emi?: number | string;
  onEdit?: () => void;
  onDelete?: () => void;
  style?: ViewStyle;
}

const BankCard = ({
  lender,
  facilityType,
  endDate,
  sanctioned,
  outstanding,
  emi,
  onEdit,
  onDelete,
  style,
}: BankCardProps) => {
  const { colors } = useTheme();
  const meta = [facilityType, endDate ? `ends ${endDate}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.borderLight },
        style,
      ]}
    >
      {/* top row — icon + lender + actions */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: colors.buttonDisabledBackground },
          ]}
        >
          <BankIcon size={18} color={colors.muted} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[styles.lender, { color: colors.ink }]}
            numberOfLines={1}
          >
            {lender}
          </Text>
          {!!meta && (
            <Text
              style={[styles.meta, { color: colors.muted }]}
              numberOfLines={1}
            >
              {meta}
            </Text>
          )}
        </View>
        {!!onEdit && (
          <TouchableOpacity
            onPress={onEdit}
            style={[
              styles.actionBtn,
              { backgroundColor: colors.buttonDisabledBackground },
            ]}
          >
            <EditIcon size={15} color={colors.muted} />
          </TouchableOpacity>
        )}
        {!!onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            style={[
              styles.actionBtn,
              {
                backgroundColor: colors.dangerTint,
                borderWidth: 1,
                borderColor: colors.dangerBorder,
              },
            ]}
          >
            <TrashIcon size={15} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* bottom row — 3 stats (separated by dashed border) */}
      <View style={[styles.statsRow, { borderTopColor: colors.borderLight }]}>
        <Stat label="Sanctioned" value={sanctioned} />
        <Stat label="Outstanding" value={outstanding} />
        <Stat label="EMI / mo" value={emi} />
      </View>
    </View>
  );
};

const Stat = ({
  label,
  value,
}: {
  label: string;
  value?: number | string;
}) => {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={[styles.statLabel, { color: colors.faint }]}>
        {label.toUpperCase()}
      </Text>
      <Text style={[styles.statValue, { color: colors.ink }]}>
        {value && Number(value) ? inrShort(value) : "—"}
      </Text>
    </View>
  );
};

export default BankCard;
export { inrShort };

const styles = StyleSheet.create({
  card: {
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  lender: {
    fontSize: 14,
    fontWeight: "600",
  },
  meta: {
    fontSize: 11.5,
    marginTop: 2,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderStyle: "dashed",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  statValue: {
    fontSize: 12.5,
    fontWeight: "700",
    marginTop: 2,
  },
});
