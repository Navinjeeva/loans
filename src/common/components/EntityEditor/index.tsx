import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { useTheme } from "@src/common/ThemeContext";
import DropDownModal, { Option } from "../DropDownModal";
import {Sx, CheckIcon, AlertIcon, PercentIcon, CalendarIcon, ChevronDown, CloseIcon } from "@src/common/svg/CorporateLoansSvgs/index"
// ── SVG icons (inline) — color is always passed via theme at the call site ──
// const Sx = ({
//   size = 18,
//   color,
//   stroke = 1.75,
//   children,
// }: {
//   size?: number;
//   color?: string;
//   stroke?: number;
//   children: React.ReactNode;
// }) => (
//   <Svg
//     width={size}
//     height={size}
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke={color}
//     strokeWidth={stroke}
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     {children}
//   </Svg>
// );
// const CloseIcon = (p: any) => (
//   <Sx {...p} stroke={2}>
//     <Path d="M18 6L6 18M6 6l12 12" />
//   </Sx>
// );
// const CheckIcon = (p: any) => (
//   <Sx {...p} stroke={3}>
//     <Path d="M20 6L9 17l-5-5" />
//   </Sx>
// );
// const AlertIcon = (p: any) => (
//   <Sx {...p}>
//     <Path d="M12 3l9 16H3z" />
//     <Path d="M12 10v4M12 17h.01" />
//   </Sx>
// );
// const ChevronDown = (p: any) => (
//   <Sx {...p} stroke={2}>
//     <Path d="M6 9l6 6 6-6" />
//   </Sx>
// );
// const PercentIcon = (p: any) => (
//   <Sx {...p}>
//     <Path d="M19 5L5 19" />
//     <Circle cx={7.5} cy={7.5} r={2.5} />
//     <Circle cx={16.5} cy={16.5} r={2.5} />
//   </Sx>
// );
// const UserIcon = (p: any) => (
//   <Sx {...p}>
//     <Circle cx={12} cy={8} r={3.5} />
//     <Path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
//   </Sx>
// );
// const CalendarIcon = (p: any) => (
//   <Sx {...p}>
//     <Rect x={3} y={5} width={18} height={16} rx={2} />
//     <Path d="M3 9h18M8 3v4M16 3v4" />
//   </Sx>
// );

// ── Field config ──
export type FieldConfig = {
  key: string;
  label: string;
  type?:
    | "text"
    | "select"
    | "phone"
    | "amount"
    | "date"
    | "percent"
    | "toggle";
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  helper?: string;
  options?: Option[];
  numeric?: boolean;
  upper?: boolean;
  re?: RegExp;
  /** Hide this field unless this predicate returns true (drives conditional fields) */
  when?: (v: any) => boolean;
  /** Field-level icon for the toggle row */
  icon?: "percent" | "user" | "calendar";
  /** Country dial-code default for phone fields, e.g. "+91" */
  defaultCode?: string;
  /** Currency symbol prefix for amount fields */
  currency?: string;
  maxLength?: number;
};

interface EntityEditorProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: FieldConfig[];
  initial?: Record<string, any>;
  onSave: (values: Record<string, any>) => void;
  saveLabel?: string;
  maxHeight?: number;
}

// ── Shared input shell ──
function useInputShellStyle() {
  const { colors } = useTheme();
  return (focused: boolean, error: boolean) => ({
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: error
      ? colors.dangerBorder
      : focused
      ? colors.brand
      : colors.borderLight,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 13,
    gap: 9,
  });
}

// ── Reusable field shell ──
function Field({
  label,
  required,
  optional,
  error,
  hint,
  children,
}: {
  label?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ marginBottom: 16 }}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.inputLabel }]}>
            {label}
            {required ? (
              <Text style={{ color: colors.brand600 }}> *</Text>
            ) : null}
          </Text>
          {optional ? (
            <Text style={[styles.optional, { color: colors.faint }]}>
              Optional
            </Text>
          ) : null}
        </View>
      ) : null}
      {children}
      {error ? (
        <View style={styles.errorRow}>
          <AlertIcon size={13} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      ) : hint ? (
        <Text style={[styles.hintText, { color: colors.muted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

// ── Individual inputs ──
function TextField({
  value,
  onChange,
  placeholder,
  error,
  numeric,
  upper,
  maxLength,
  inputMode,
}: any) {
  const { colors } = useTheme();
  const shell = useInputShellStyle();
  const [f, setF] = useState(false);
  return (
    <View style={shell(f, !!error)}>
      <TextInput
        value={value ?? ""}
        onChangeText={(t) => {
          let v = t;
          if (numeric) v = v.replace(/[^0-9]/g, "");
          if (upper) v = v.toUpperCase();
          if (maxLength) v = v.slice(0, maxLength);
          onChange(v);
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        keyboardType={
          numeric
            ? "number-pad"
            : inputMode === "email"
            ? "email-address"
            : "default"
        }
        autoCapitalize={upper ? "characters" : "sentences"}
        autoCorrect={false}
        maxLength={maxLength}
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        style={[styles.input, { color: colors.ink }]}
      />
    </View>
  );
}

function AmountField({
  value,
  onChange,
  placeholder = "0.00",
  error,
  currency = "₹",
}: any) {
  const { colors } = useTheme();
  const shell = useInputShellStyle();
  const [f, setF] = useState(false);
  return (
    <View style={shell(f, !!error)}>
      <Text style={[styles.currency, { color: colors.ink2 }]}>{currency}</Text>
      <TextInput
        value={String(value ?? "")}
        onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ""))}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        keyboardType="decimal-pad"
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        style={[styles.input, { color: colors.ink }]}
      />
    </View>
  );
}

function PercentField({ value, onChange, error }: any) {
  const { colors } = useTheme();
  const shell = useInputShellStyle();
  const [f, setF] = useState(false);
  return (
    <View style={shell(f, !!error)}>
      <TextInput
        value={String(value ?? "")}
        onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, "").slice(0, 5))}
        placeholder="0"
        placeholderTextColor={colors.faint}
        keyboardType="decimal-pad"
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        style={[styles.input, { color: colors.ink }]}
      />
      <Text style={[styles.suffix, { color: colors.muted }]}>%</Text>
    </View>
  );
}

function DateField({ value, onChange, error }: any) {
  const { colors } = useTheme();
  const shell = useInputShellStyle();
  const [f, setF] = useState(false);
  return (
    <View style={shell(f, !!error)}>
      <CalendarIcon size={18} color={f ? colors.brand600 : colors.faint} />
      <TextInput
        value={value ?? ""}
        onChangeText={onChange}
        placeholder="dd/mm/yyyy"
        placeholderTextColor={colors.faint}
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        style={[styles.input, { color: colors.ink }]}
      />
    </View>
  );
}

function PhoneField({ value, onChange, defaultCode = "+91", error }: any) {
  const { colors } = useTheme();
  const shell = useInputShellStyle();
  const [f, setF] = useState(false);
  // value format: "+91 99999 99999"
  const str = String(value ?? "").trim();
  const match = str.match(/^(\+\d{1,4})\s*(.*)$/);
  const dial = match ? match[1] : defaultCode;
  const rest = match ? match[2] : str;
  const setNumber = (n: string) =>
    onChange(`${dial} ${n.replace(/[^0-9 ]/g, "")}`.trimEnd());
  return (
    <View style={[shell(f, !!error), { paddingLeft: 6, gap: 4 }]}>
      <View
        style={[
          styles.dialPill,
          { backgroundColor: colors.buttonDisabledBackground },
        ]}
      >
        <Text style={[styles.dialText, { color: colors.ink }]}>{dial}</Text>
        <ChevronDown size={14} color={colors.muted} />
      </View>
      <View
        style={[styles.divider, { backgroundColor: colors.borderLight }]}
      />
      <TextInput
        value={rest}
        onChangeText={setNumber}
        placeholder="00000 00000"
        placeholderTextColor={colors.faint}
        keyboardType="phone-pad"
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        style={[styles.input, { fontWeight: "600", color: colors.ink }]}
      />
    </View>
  );
}

function ToggleRow({
  label,
  helper,
  value,
  onChange,
}: {
  label: string;
  helper?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.toggleRow,
        {
          backgroundColor: value
            ? colors.brandTint
            : colors.buttonDisabledBackground,
          borderColor: value ? colors.brandBorder : colors.borderLight,
        },
      ]}
    >
      <View
        style={[styles.toggleIconBox, { backgroundColor: colors.card }]}
      >
        <PercentIcon size={18} color={colors.brand600} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleLabel, { color: colors.ink }]}>{label}</Text>
        {!!helper && (
          <Text style={[styles.toggleHelper, { color: colors.muted }]}>
            {helper}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.switchTrack, true: colors.brand }}
        thumbColor={colors.card}
        ios_backgroundColor={colors.switchTrack}
      />
    </View>
  );
}

const EntityEditor = ({
  visible,
  onClose,
  title,
  subtitle,
  fields,
  initial,
  onSave,
  saveLabel = "Save details",
  maxHeight = 0.9,
}: EntityEditorProps) => {
  const { colors } = useTheme();
  const [values, setValues] = useState<Record<string, any>>(initial || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pressing, setPressing] = useState(false);

  // animation refs
  const sheetY = useRef(new Animated.Value(1)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const sheetHeight = hp(100) * maxHeight;
  const translateY = sheetY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, sheetHeight],
  });

  useEffect(() => {
    if (visible) {
      setValues(initial || {});
      setErrors({});
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
  }, [visible]);

  const close = () => {
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
    ]).start(() => onClose());
  };

  const set = (k: string, v: any) => setValues((s) => ({ ...s, [k]: v }));

  const save = () => {
    const e: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.when && !f.when(values)) return;
      if (f.type === "toggle") return;
      const v = String(values[f.key] ?? "").trim();
      if (f.required && !v) e[f.key] = `${f.label} is required`;
      else if (v && f.re && !f.re.test(v))
        e[f.key] = `Invalid ${f.label.replace(/ \(.*\)/, "")} format`;
    });
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave(values);
    close();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={close}
      presentationStyle="overFullScreen"
    >
      <KeyboardAvoidingView
        style={styles.modalRoot}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
        enabled
      >
        <TouchableWithoutFeedback onPress={close}>
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
              maxHeight: sheetHeight,
              transform: [{ translateY }],
              backgroundColor: colors.card,
            },
          ]}
        >
          {/* drag handle */}
          <View style={styles.handleWrap}>
            <View
              style={[styles.handle, { backgroundColor: colors.handle }]}
            />
          </View>

          {/* title row */}
          <View
            style={[styles.titleRow, { borderBottomColor: colors.hairline }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
              {!!subtitle && (
                <Text style={[styles.subtitle, { color: colors.muted }]}>
                  {subtitle}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={close}
              hitSlop={6}
              style={[
                styles.closeBtn,
                { backgroundColor: colors.buttonDisabledBackground },
              ]}
            >
              <CloseIcon color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* form */}
          <ScrollView
            style={{ flexShrink: 1, minHeight: 0 }}
            contentContainerStyle={styles.formBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {Object.keys(errors).length > 1 && (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: colors.dangerTint,
                    borderColor: colors.dangerBorder,
                  },
                ]}
              >
                <AlertIcon size={16} color={colors.error} />
                <Text
                  style={[styles.errorBannerText, { color: colors.error }]}
                >
                  {Object.keys(errors).length} fields need attention
                </Text>
              </View>
            )}

            {fields.map((f) => {
              if (f.when && !f.when(values)) return null;

              if (f.type === "toggle") {
                return (
                  <View key={f.key} style={{ marginBottom: 16 }}>
                    <ToggleRow
                      label={f.label}
                      helper={f.helper}
                      value={!!values[f.key]}
                      onChange={(v) => set(f.key, v)}
                    />
                  </View>
                );
              }

              const err = errors[f.key];

              if (f.type === "select") {
                return (
                  <Field
                    key={f.key}
                    label={f.label}
                    required={f.required}
                    optional={f.optional}
                    error={err}
                    hint={f.helper}
                  >
                    <DropDownModal
                      data={f.options || []}
                      selected={values[f.key]}
                      onChange={(v) => set(f.key, v)}
                      placeholder={
                        f.placeholder || `Select ${f.label.toLowerCase()}`
                      }
                      header={f.label}
                      error={err}
                      style={{ marginBottom: 0 }}
                    />
                  </Field>
                );
              }

              if (f.type === "amount") {
                return (
                  <Field
                    key={f.key}
                    label={f.label}
                    required={f.required}
                    optional={f.optional}
                    error={err}
                    hint={f.helper}
                  >
                    <AmountField
                      value={values[f.key]}
                      onChange={(v: any) => set(f.key, v)}
                      currency={f.currency}
                      error={err}
                    />
                  </Field>
                );
              }

              if (f.type === "percent") {
                return (
                  <Field
                    key={f.key}
                    label={f.label}
                    required={f.required}
                    optional={f.optional}
                    error={err}
                    hint={f.helper}
                  >
                    <PercentField
                      value={values[f.key]}
                      onChange={(v: any) => set(f.key, v)}
                      error={err}
                    />
                  </Field>
                );
              }

              if (f.type === "phone") {
                return (
                  <Field
                    key={f.key}
                    label={f.label}
                    required={f.required}
                    optional={f.optional}
                    error={err}
                    hint={f.helper}
                  >
                    <PhoneField
                      value={values[f.key]}
                      onChange={(v: any) => set(f.key, v)}
                      defaultCode={f.defaultCode}
                      error={err}
                    />
                  </Field>
                );
              }

              if (f.type === "date") {
                return (
                  <Field
                    key={f.key}
                    label={f.label}
                    required={f.required}
                    optional={f.optional}
                    error={err}
                    hint={f.helper}
                  >
                    <DateField
                      value={values[f.key]}
                      onChange={(v: any) => set(f.key, v)}
                      error={err}
                    />
                  </Field>
                );
              }

              // default: text input
              return (
                <Field
                  key={f.key}
                  label={f.label}
                  required={f.required}
                  optional={f.optional}
                  error={err}
                  hint={f.helper}
                >
                  <TextField
                    value={values[f.key]}
                    onChange={(v: any) => set(f.key, v)}
                    placeholder={f.placeholder}
                    numeric={f.numeric}
                    upper={f.upper}
                    maxLength={f.maxLength}
                    inputMode={(f as any).inputMode}
                    error={err}
                  />
                </Field>
              );
            })}
          </ScrollView>

          {/* save button */}
          <View style={[styles.footer, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={() => setPressing(true)}
              onPressOut={() => setPressing(false)}
              onPress={save}
              style={[
                styles.saveBtn,
                {
                  backgroundColor: pressing
                    ? colors.buttonPrimaryHover
                    : colors.buttonPrimary,
                  transform: [{ scale: pressing ? 0.975 : 1 }],
                },
              ]}
            >
              <CheckIcon size={20} color={colors.buttonText} />
              <Text style={[styles.saveText, { color: colors.buttonText }]}>
                {saveLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EntityEditor;

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    width: "100%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingBottom: 0,
    overflow: "hidden",
    flexShrink: 1,
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

  formBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  label: { fontSize: 12, fontWeight: "500" },
  optional: { fontSize: 11.5, fontWeight: "500" },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  errorText: { fontSize: 12, fontWeight: "500" },
  hintText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "300",
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 11,
    paddingHorizontal: 13,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorBannerText: { fontSize: 12.5, fontWeight: "600" },

  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: "400",
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    minWidth: 0,
  },
  currency: { fontSize: 15, fontWeight: "600" },
  suffix: { fontSize: 14, fontWeight: "600" },

  dialPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 9,
    borderRadius: 10,
  },
  dialText: { fontSize: 15, fontWeight: "600" },
  divider: { width: 1, height: 24 },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  toggleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  toggleLabel: { fontSize: 14, fontWeight: "600" },
  toggleHelper: { fontSize: 11.5, marginTop: 1 },

  footer: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 30,
    borderTopWidth: 0,
  },
  saveBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  saveText: { fontSize: 16.5, fontWeight: "600", letterSpacing: -0.2 },
});
