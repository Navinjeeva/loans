import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import DropDownModal from "../DropDownModal";
import TextInputComponent from "../TextInputComponent/index";
import { useTheme } from "@src/common/ThemeContext";
import type { Disbursement } from "@src/store/corporate";
import {Sx, BankIcon, WalletIcon, PlusIcon, ChevronDown, CloseIcon, CheckIcon, InfoIcon, UploadIcon } from "@src/common/svg/CorporateLoansSvgs/index"

const BANKS = [
  { label: "State Bank of India", value: "State Bank of India" },
  { label: "HDFC Bank", value: "HDFC Bank" },
  { label: "ICICI Bank", value: "ICICI Bank" },
  { label: "Axis Bank", value: "Axis Bank" },
  { label: "Punjab National Bank", value: "Punjab National Bank" },
  { label: "Bank of Baroda", value: "Bank of Baroda" },
  { label: "Canara Bank", value: "Canara Bank" },
  { label: "Union Bank of India", value: "Union Bank of India" },
  { label: "Indian Bank", value: "Indian Bank" },
  { label: "Kotak Mahindra Bank", value: "Kotak Mahindra Bank" },
  { label: "IndusInd Bank", value: "IndusInd Bank" },
  { label: "IDFC FIRST Bank", value: "IDFC FIRST Bank" },
];

const ACCOUNT_TYPES = [
  { label: "Savings Account", value: "Savings Account" },
  { label: "Current Account", value: "Current Account" },
  { label: "Salary Account", value: "Salary Account" },
  { label: "Fixed Deposit Account", value: "Fixed Deposit Account" },
  { label: "Recurring Deposit Account", value: "Recurring Deposit Account" },
  { label: "NRE Account", value: "NRE Account" },
  { label: "NRO Account", value: "NRO Account" },
  { label: "FCNR Account", value: "FCNR Account" },
  { label: "Joint Account", value: "Joint Account" },
  { label: "Corporate Account", value: "Corporate Account" },
];

const PREFERRED_OPEN_TYPES = [
  { label: "Current Account", value: "Current Account" },
  { label: "Cash Credit", value: "Cash Credit" },
  { label: "Overdraft", value: "Overdraft" },
];

// ── Upload card (Cancelled cheque / Bank statement) ──
const UploadCard = ({
  label,
  uploaded,
  onPress,
}: {
  label: string;
  uploaded?: boolean;
  onPress?: () => void;
}) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.uploadCard,
        {
          backgroundColor: uploaded
            ? colors.brandTint
            : colors.buttonDisabledBackground,
          borderColor: uploaded ? colors.brandBorder : colors.borderLight,
        },
      ]}
    >
      <UploadIcon size={20} color={colors.brand600} />
      <Text style={[styles.uploadLabel, { color: colors.ink2 }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export type DisbAccount = {
  value: string;
  bankName: string;
  number: string;
  type: string;
};

export type DisbMode = "linked" | "external" | "open";

interface DisbursementSectionProps {
  mode: DisbMode;
  onModeChange: (m: DisbMode) => void;
  accounts: DisbAccount[];
  values: Disbursement;
  onChange: (k: keyof Disbursement, v: any) => void;
}

const OPTIONS: {
  id: DisbMode;
  title: string;
  desc: string;
  icon: "bank" | "wallet" | "plus";
}[] = [
  {
    id: "linked",
    title: "Linked business account",
    desc: "Use an account already held with the bank",
    icon: "bank",
  },
  {
    id: "external",
    title: "External bank account",
    desc: "Receive funds in another bank account",
    icon: "wallet",
  },
  {
    id: "open",
    title: "Open new business account",
    desc: "Open a current account with us at disbursal",
    icon: "plus",
  },
];

const maskedNumber = (num: string) => {
  const digits = String(num || "").replace(/\s/g, "");
  return digits.length > 4 ? `•••• ${digits.slice(-4)}` : num;
};

const DisbursementSection = ({
  mode,
  onModeChange,
  accounts,
  values,
  onChange,
}: DisbursementSectionProps) => {
  const { colors } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const acc = accounts.find((a) => a.value === values.accountId);

  // animation for picker
  const sheetY = useRef(new Animated.Value(1)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const sheetHeight = hp(100) * 0.7;
  const translateY = sheetY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, sheetHeight],
  });

  useEffect(() => {
    if (pickerOpen) {
      Animated.parallel([
        Animated.timing(sheetY, {
          toValue: 0,
          duration: 300,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [pickerOpen]);

  const closePicker = () => {
    Animated.parallel([
      Animated.timing(sheetY, {
        toValue: 1,
        duration: 230,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 0,
        duration: 230,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => setPickerOpen(false));
  };

  const renderIcon = (key: "bank" | "wallet" | "plus", active: boolean) => {
    const color = active ? colors.brand600 : colors.muted;
    if (key === "bank") return <BankIcon size={18} color={color} />;
    if (key === "wallet") return <WalletIcon size={18} color={color} />;
    return <PlusIcon size={18} color={color} />;
  };

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: colors.card, borderColor: colors.borderLight },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.dividerSoft }]}>
        <Text style={[styles.panelTitle, { color: colors.ink }]}>
          Disbursement account
        </Text>
        <Text style={[styles.panelSub, { color: colors.muted }]}>
          Choose where the approved amount should be credited.
        </Text>
      </View>

      {/* Options */}
      <View>
        {OPTIONS.map((o, i) => {
          const active = mode === o.id;
          return (
            <TouchableOpacity
              key={o.id}
              activeOpacity={0.8}
              onPress={() => onModeChange(o.id)}
              style={[
                styles.optionRow,
                i > 0 && {
                  borderTopWidth: 1,
                  borderTopColor: colors.hairline,
                },
              ]}
            >
              <View
                style={[
                  styles.optionIconBox,
                  {
                    backgroundColor: active
                      ? colors.brandTint
                      : colors.buttonDisabledBackground,
                  },
                ]}
              >
                {renderIcon(o.icon, active)}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[styles.optionTitle, { color: colors.ink }]}>
                  {o.title}
                </Text>
                <Text
                  style={[styles.optionDesc, { color: colors.muted }]}
                  numberOfLines={1}
                >
                  {o.desc}
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  {
                    borderColor: active ? colors.brand : colors.borderLight,
                    backgroundColor: active ? colors.brand : colors.card,
                  },
                ]}
              >
                {active && <CheckIcon size={11} color={colors.buttonText} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Linked → Select account trigger */}
      {mode === "linked" && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setPickerOpen(true)}
          style={[
            styles.selectTrigger,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderLight,
            },
          ]}
        >
          {acc ? (
            <View
              style={[styles.accIconBoxSm, { backgroundColor: colors.brandTint }]}
            >
              <WalletIcon size={16} color={colors.brand600} />
            </View>
          ) : (
            <WalletIcon size={18} color={colors.faint} />
          )}
          <Text
            style={[
              styles.selectText,
              { color: acc ? colors.ink : colors.muted },
            ]}
            numberOfLines={1}
          >
            {acc
              ? `${acc.bankName} · ${maskedNumber(acc.number)}`
              : "Select account"}
          </Text>
          <ChevronDown color={colors.muted} />
        </TouchableOpacity>
      )}

      {/* External bank account */}
      {mode === "external" && (
        <>
          <DropDownModal
            options={BANKS}
            value={values.bankName}
            setValue={(v) => onChange("bankName", v)}
            header="Bank Name"
            label="Bank name"
            required
            style={{ marginVertical: 12 }}
            isSearchable
          />

          <TextInputComponent
            header="Account holder name"
            placeholder="As per bank account"
            value={values.holderName}
            onChange={(v: string) => onChange("holderName", v)}
            required
            numberOfLines={1}
          />

          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginBottom: 12,
              marginTop: 4,
              textAlign: "left",
            }}
          >
            Must match the bank records exactly
          </Text>

          <TextInputComponent
            header="Account number"
            placeholder="Enter account number"
            value={values.accountNumber}
            onChange={(v: string) =>
              onChange("accountNumber", v.replace(/[^0-9]/g, ""))
            }
            required
            numberOfLines={1}
            keyboardType="numeric"
            customStyles={{ marginBottom: 14 }}
          />

          <TextInputComponent
            header="Confirm account number"
            placeholder="Re-enter account number"
            value={values.confirmAccountNumber}
            onChange={(v: string) =>
              onChange("confirmAccountNumber", v.replace(/[^0-9]/g, ""))
            }
            required
            numberOfLines={1}
            keyboardType="numeric"
            customStyles={{ marginBottom: 14 }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 4,
            }}
          >
            <TextInputComponent
              header="IFSC/SWIFT"
              placeholder="IFSC/SWIFT"
              value={values.ifscSwift}
              onChange={(v: string) =>
                onChange("ifscSwift", v.toUpperCase())
              }
              required
              numberOfLines={1}
              keyboardType="default"
              customStyles={{ flex: 0.5 }}
            />

            <DropDownModal
              options={ACCOUNT_TYPES}
              value={values.accountType}
              setValue={(v) => onChange("accountType", v)}
              header="Account type"
              label="Account type"
              required
              style={{ flex: 0.5 }}
              isSearchable
            />
          </View>

          <TextInputComponent
            header="Branch Name"
            placeholder="Enter branch name"
            value={values.branchName}
            onChange={(v: string) => onChange("branchName", v)}
            required
            numberOfLines={1}
            keyboardType="default"
            customStyles={{ marginBottom: 14, marginTop: 12 }}
          />

          <Text style={[styles.supportingLabel, { color: colors.ink2 }]}>
            SUPPORTING DOCUMENTS{" "}
            <Text style={[styles.supportingLabelMuted, { color: colors.faint }]}>
              · optional
            </Text>
          </Text>
          <View style={styles.uploadRow}>
            <UploadCard
              label="Cancelled cheque"
              uploaded={!!values.cancelledCheque}
              onPress={() =>
                onChange("cancelledCheque", {
                  uri: "placeholder",
                  name: "cheque.pdf",
                })
              }
            />
            <UploadCard
              label="Bank statement"
              uploaded={!!values.bankStatement}
              onPress={() =>
                onChange("bankStatement", {
                  uri: "placeholder",
                  name: "statement.pdf",
                })
              }
            />
          </View>
        </>
      )}

      {/* Open new business account */}
      {mode === "open" && (
        <View
          style={{
            backgroundColor: colors.buttonDisabledBackground,
            borderRadius: 12,
            padding: 14,
            marginTop: 14,
          }}
        >
          <DropDownModal
            placeholder="Select the account type"
            options={PREFERRED_OPEN_TYPES}
            value={values.preferredAccountType}
            setValue={(v) => onChange("preferredAccountType", v)}
            header="Preferred account type"
            label="Preferred account type"
            required
            style={{ marginVertical: 12 }}
          />
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginBottom: 1,
              marginTop: 4,
              textAlign: "left",
            }}
          >
            A business account will be created during loan processing.
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted, textAlign: "left" }}>
            KYC from this application will be reused.
          </Text>
        </View>
      )}

      {/* Linked-account picker modal */}
      <Modal
        visible={pickerOpen}
        transparent
        animationType="none"
        onRequestClose={closePicker}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          <TouchableWithoutFeedback onPress={closePicker}>
            <Animated.View
              style={[
                styles.backdrop,
                { opacity: backdrop, backgroundColor: colors.modalBackdrop },
              ]}
            />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.card,
                maxHeight: sheetHeight,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.handleWrap}>
              <View style={[styles.handle, { backgroundColor: colors.handle }]} />
            </View>

            <View style={[styles.titleRow, { borderBottomColor: colors.hairline }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.ink }]}>
                  Select disbursement account
                </Text>
                <Text style={[styles.subtitle, { color: colors.muted }]}>
                  Funds will be credited to this account
                </Text>
              </View>
              <TouchableOpacity
                onPress={closePicker}
                style={[
                  styles.closeBtn,
                  { backgroundColor: colors.buttonDisabledBackground },
                ]}
                hitSlop={6}
              >
                <CloseIcon color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.listBody}>
              {accounts.map((a) => {
                const active = a.value === values.accountId;
                const isEscrow = /escrow/i.test(a.type);
                return (
                  <TouchableOpacity
                    key={a.value}
                    activeOpacity={0.85}
                    onPress={() => {
                      onChange("accountId", a.value);
                      closePicker();
                    }}
                    style={[
                      styles.accCard,
                      {
                        backgroundColor: active ? colors.brandTint : colors.card,
                        borderColor: active ? colors.brand : colors.borderLight,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.accIconBox,
                        {
                          backgroundColor: active
                            ? colors.card
                            : colors.buttonDisabledBackground,
                        },
                      ]}
                    >
                      <WalletIcon size={18} color={colors.brand600} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={styles.accTopRow}>
                        <Text
                          style={[styles.accName, { color: colors.ink }]}
                          numberOfLines={1}
                        >
                          {a.bankName}
                        </Text>
                        <View
                          style={[
                            styles.typeBadge,
                            {
                              backgroundColor: active
                                ? colors.card
                                : colors.buttonDisabledBackground,
                            },
                          ]}
                        >
                          <Text style={[styles.typeBadgeText, { color: colors.ink2 }]}>
                            {isEscrow ? "Escrow" : a.type.replace(" Account", "")}
                          </Text>
                          {isEscrow && <InfoIcon size={11} color={colors.muted} />}
                        </View>
                      </View>
                      <Text style={[styles.accNumber, { color: colors.muted }]}>
                        {maskedNumber(a.number)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor: active ? colors.brand : colors.borderLight,
                          backgroundColor: active ? colors.brand : colors.card,
                        },
                      ]}
                    >
                      {active && <CheckIcon size={11} color={colors.buttonText} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default DisbursementSection;

const styles = StyleSheet.create({
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    paddingBottom: 13,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  panelTitle: { fontSize: 15, fontWeight: "700", letterSpacing: -0.2 },
  panelSub: { fontSize: 12, marginTop: 2 },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  optionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionTitle: { fontSize: 13.5, fontWeight: "600" },
  optionDesc: { fontSize: 11.5, marginTop: 1 },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 99,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  accIconBoxSm: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  selectText: { flex: 1, fontSize: 15, fontWeight: "500" },

  // ── modal scaffold ──
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    width: "100%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
  },
  handleWrap: { paddingTop: 12, paddingBottom: 4, alignItems: "center" },
  handle: { width: 40, height: 5, borderRadius: 99 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 6,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  title: { fontSize: 19, fontWeight: "600", letterSpacing: -0.3 },
  subtitle: { fontSize: 13, marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },

  listBody: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28, gap: 8 },

  accCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1.5,
  },
  accIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  accTopRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  accName: { fontSize: 15, fontWeight: "500", flexShrink: 1 },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 99,
    flexShrink: 0,
  },
  typeBadgeText: { fontSize: 10, fontWeight: "600" },
  accNumber: { fontSize: 12.5, marginTop: 1 },

  supportingLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 10,
  },
  supportingLabelMuted: {
    fontWeight: "500",
    letterSpacing: 0,
    textTransform: "none",
  },
  uploadRow: { flexDirection: "row", gap: 9 },
  uploadCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 13,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  uploadLabel: { fontSize: 11.5, fontWeight: "600", marginTop: 4 },
});
