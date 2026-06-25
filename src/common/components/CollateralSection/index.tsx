import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EntityEditor, { FieldConfig } from "../EntityEditor";
import { useTheme } from "@src/common/ThemeContext";
import {Sx, ShieldIcon, PlusIcon, TrashIcon, EditIcon} from "@src/common/svg/CorporateLoansSvgs/index"



const inrShort = (n: number | string | undefined) => {
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

// ── Collateral field config (used by EntityEditor) ──
const COLLATERAL_FIELDS: FieldConfig[] = [
  {
    key: "kind",
    label: "Collateral Type",
    type: "select",
    required: true,
    placeholder: "Select type",
    options: [
      { value: "Property", label: "Property" },
      { value: "Plant & machinery", label: "Plant & machinery" },
      { value: "Inventory", label: "Inventory" },
      { value: "Fixed deposit", label: "Fixed deposit" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    key: "desc",
    label: "Description",
    required: true,
    placeholder: "e.g. Industrial plot — Pune MIDC",
  },
  { key: "value", label: "Estimated Value", type: "amount", required: true, currency: "₹" },
  {
    key: "ownedBy",
    label: "Owned By",
    type: "select",
    required: true,
    placeholder: "Select owner",
    options: [
      { value: "Company", label: "Company" },
      { value: "Director", label: "Director" },
      { value: "Third party", label: "Third party" },
    ],
  },
  {
    key: "charge",
    label: "Existing Charge or Lien?",
    type: "select",
    required: true,
    placeholder: "Select",
    options: [
      { value: "No", label: "No" },
      { value: "Yes", label: "Yes" },
    ],
  },
];

export type Collateral = {
  id: string;
  kind: string;
  desc?: string;
  value?: string | number;
  ownedBy?: string;
  charge?: string;
};

interface CollateralSectionProps {
  list?: Collateral[];
  onChange?: (next: Collateral[]) => void;
  loanAmount?: number;
}

const CollateralSection = ({
  list = [],
  onChange = () => {},
  loanAmount = 0,
}: CollateralSectionProps) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  const openAdd = () => {
    setEditingId(null);
    setForm({});
    setModalOpen(true);
  };
  const openEdit = (c: Collateral) => {
    setEditingId(c.id);
    setForm({ ...c });
    setModalOpen(true);
  };
  const save = (values: any) => {
    if (editingId) {
      onChange(list.map((c) => (c.id === editingId ? { ...c, ...values } : c)));
    } else {
      onChange([...list, { id: String(Date.now()), ...values }]);
    }
    setModalOpen(false);
  };
  const del = (id: string) => onChange(list.filter((c) => c.id !== id));

  const totalValue = list.reduce((s, c) => s + (Number(c.value) || 0), 0);
  const coverage = loanAmount ? totalValue / loanAmount : 0;

  return (
    <View style={styles.panel}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Collateral / security</Text>
        <Text style={styles.subtitle}>
          Assets pledged as security for this secured facility.
        </Text>
      </View>

      <View style={styles.body}>
        {list.length === 0 ? (
          // ── Empty state ──
          <View style={styles.emptyBox}>
            <ShieldIcon size={26} color={colors.faint} />
            <Text style={styles.emptyText}>No collateral added yet.</Text>
          </View>
        ) : (
          <View style={{ gap: 9, marginBottom: 12 }}>
            {list.map((c) => (
              <View key={c.id} style={styles.itemCard}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.itemKind}>{c.kind}</Text>
                  {!!c.desc && (
                    <Text style={styles.itemDesc} numberOfLines={1}>
                      {c.desc}
                    </Text>
                  )}
                  <Text style={styles.itemMeta}>
                    {inrShort(c.value)} · Owned by {c.ownedBy} ·{" "}
                    {c.charge === "Yes" ? "Existing charge" : "No charge"}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => openEdit(c)} style={styles.iconBtn}>
                  <EditIcon size={15} color={colors.muted} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => del(c.id)}
                  style={[styles.iconBtn, styles.deleteBtn]}
                >
                  <TrashIcon size={15} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Add collateral button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={openAdd}
          style={styles.addBtn}
        >
          <PlusIcon size={16} color={colors.muted} />
          <Text style={styles.addBtnText}>Add collateral</Text>
        </TouchableOpacity>

        {/* Total coverage (when list has items) */}
        {list.length > 0 && (
          <View style={styles.coverageRow}>
            <Text style={styles.coverageText}>
              Total security {inrShort(totalValue)} · {coverage.toFixed(2)}× the loan amount
            </Text>
          </View>
        )}
      </View>

      {/* Add / Edit modal */}
      <EntityEditor
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit collateral" : "Add collateral"}
        subtitle="Security offered for this loan"
        fields={COLLATERAL_FIELDS}
        initial={form}
        onSave={save}
      />
    </View>
  );
};

export default CollateralSection;

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

    body: { paddingHorizontal: 15, paddingTop: 12, paddingBottom: 15 },

    // ── Empty state ──
    emptyBox: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 28,
      paddingHorizontal: 16,
      borderRadius: 14,
      backgroundColor: colors.buttonDisabledBackground,
      marginBottom: 12,
      gap: 8,
    },
    emptyText: {
      fontSize: 13,
      color: colors.muted,
      fontWeight: "500",
    },

    // ── Item card ──
    itemCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 13,
      borderRadius: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    itemKind: { fontSize: 14, fontWeight: "600", color: colors.ink },
    itemDesc: { fontSize: 11.5, color: colors.muted, marginTop: 1 },
    itemMeta: { fontSize: 11.5, color: colors.muted, marginTop: 7, fontWeight: "500" },
    iconBtn: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: colors.buttonDisabledBackground,
      alignItems: "center",
      justifyContent: "center",
      marginTop: -2,
    },
    deleteBtn: {
      backgroundColor: colors.dangerSoft,
      borderWidth: 1,
      borderColor: colors.dangerSoftBorder,
    },

    // ── Add button ──
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      paddingVertical: 11,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderLight,
      backgroundColor: colors.card,
    },
    addBtnText: { fontSize: 13.5, fontWeight: "600", color: colors.ink },

    // ── Coverage row ──
    coverageRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: colors.surfaceSoft,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    coverageText: { fontSize: 12.5, fontWeight: "600", color: colors.ink },
  });
