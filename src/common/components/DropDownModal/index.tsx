import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import { useDebounce } from "@src/common";
import { ChevronDown, SearchIcon, CloseIcon, CheckIconModal as CheckIcon  } from "@src/common/svg/CorporateLoansSvgs";

export type Option = {
  label: string;
  value: string | number;
  flag?: string;
  icon?: string;
  desc?: string;
  search?: string;
};

interface DropDownModalProps {
  /** options list */
  data?: Option[];
  /** currently-selected value */
  selected?: string | number;
  /** fired when an item is picked */
  onChange?: (value: string, label?: string) => void;

  /** form label above field */
  label?: string;
  /** placeholder when nothing selected */
  placeholder?: string;
  /** title shown at the top of the sheet */
  header?: string;
  /** optional subtitle under the sheet title */
  subtitle?: string;
  /** placeholder for the in-sheet search field */
  searchPlaceholder?: string;

  required?: boolean;
  disabled?: boolean;
  /** Force-show or force-hide search. If undefined, auto-shows when data.length > 8. */
  isSearchable?: boolean;
  /** Show "X" to clear the selection */
  allowClear?: boolean;
  /** Send (value, label) instead of just value */
  passIdAndDesc?: boolean;

  error?: string;
  style?: ViewStyle;
  labelStyle?: ViewStyle | object;

  /** optional async fetch — returns options for the given search string */
  dropdownFetchFunction?: (search: string) => Promise<Option[]> | Option[];

  /** sheet height as a fraction of the screen (0..1) */
  maxHeight?: number;
}

const DropDownModal = ({
  data = [],
  selected = "",
  onChange = () => {},
  label = "",
  placeholder = "Select",
  header = "",
  subtitle = "",
  searchPlaceholder = "Search…",
  required = false,
  disabled = false,
  isSearchable,
  allowClear = false,
  passIdAndDesc = false,
  error = "",
  style,
  labelStyle = {},
  dropdownFetchFunction,
  maxHeight = 0.82,
}: DropDownModalProps) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [remoteData, setRemoteData] = useState<Option[]>([]);
  const debounced = useDebounce(searchText);

  // animations for sheet + backdrop
  const sheetY = useRef(new Animated.Value(1)).current; // 0 = fully shown, 1 = below screen
  const backdrop = useRef(new Animated.Value(0)).current; // 0 → 1

  const source = data && data.length > 0 ? data : remoteData;
  const wantSearch =
    isSearchable !== undefined ? isSearchable : source.length > 8;

  useEffect(() => {
    if (!dropdownFetchFunction) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await dropdownFetchFunction(debounced);
        if (!cancelled && Array.isArray(res)) setRemoteData(res);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [debounced, dropdownFetchFunction]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return source;
    return source.filter((o) =>
      `${o.label} ${o.desc || ""} ${o.search || ""}`.toLowerCase().includes(q),
    );
  }, [source, debounced]);

  const selectedOption = source.find(
    (o) => String(o.value) === String(selected),
  );

  const animateIn = () => {
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
  };
  const animateOut = (after?: () => void) => {
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
    ]).start(() => after && after());
  };

  const open = () => {
    if (disabled) return;
    setSearchText("");
    setVisible(true);
    requestAnimationFrame(animateIn);
  };
  const close = () => {
    animateOut(() => {
      setSearchText("");
      setVisible(false);
    });
  };

  const pick = (opt: Option) => {
    if (passIdAndDesc) onChange(String(opt.value), opt.label);
    else onChange(String(opt.value));
    close();
  };

  const clear = () => {
    if (passIdAndDesc) onChange("", "");
    else onChange("");
  };

  // slide distance — translate by sheet height so it starts off-screen
  const sheetHeight = hp(100) * maxHeight;
  const translateY = sheetY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, sheetHeight],
  });

  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {!!label && (
        <View style={styles.labelRow}>
          <Text
            style={[
              styles.label,
              { color: colors.inputLabel },
              labelStyle as object,
            ]}
          >
            {label}
            {required && (
              <Text style={[styles.required, { color: colors.error }]}> *</Text>
            )}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={open}
        disabled={disabled}
        activeOpacity={0.8}
        style={[
          styles.field,
          {
            borderColor: error ? colors.error : colors.borderLight,
            backgroundColor: colors.card,
          },
        ]}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.selectedText,
            { color: selectedOption ? colors.ink : colors.faint },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        {allowClear && selected ? (
          <TouchableOpacity onPress={clear} disabled={disabled} hitSlop={8}>
            <CloseIcon color={colors.muted} />
          </TouchableOpacity>
        ) : (
          <ChevronDown color={colors.faint} />
        )}
      </TouchableOpacity>

      {!!error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={close}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          {/* Animated backdrop */}
          <TouchableWithoutFeedback onPress={close}>
            <Animated.View
              style={[
                styles.backdrop,
                { opacity: backdrop, backgroundColor: colors.modalBackdrop },
              ]}
            />
          </TouchableWithoutFeedback>

          {/* Animated sheet */}
          <Animated.View
            style={[
              styles.sheet,
              {
                maxHeight: sheetHeight,
                transform: [{ translateY }],
                backgroundColor: colors.card,
                borderTopColor: colors.borderLight,
              },
            ]}
          >
            {/* drag handle */}
            <View style={styles.handleWrap}>
              <View style={[styles.handle, { backgroundColor: colors.handle }]} />
            </View>

            {/* title row */}
            {!!header && (
              <View style={[styles.titleRow, { borderBottomColor: colors.hairline }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.ink }]}>
                    {header}
                  </Text>
                  {!!subtitle && (
                    <Text style={[styles.subtitle, { color: colors.muted }]}>
                      {subtitle}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={close}
                  style={[
                    styles.closeBtn,
                    { backgroundColor: colors.buttonDisabledBackground },
                  ]}
                  hitSlop={6}
                >
                  <CloseIcon color={colors.muted} />
                </TouchableOpacity>
              </View>
            )}

            {/* search */}
            {wantSearch && (
              <View style={[styles.searchRow, { backgroundColor: colors.card }]}>
                <View
                  style={[
                    styles.searchPill,
                    {
                      backgroundColor: colors.buttonDisabledBackground,
                      borderColor: colors.borderLight,
                    },
                  ]}
                >
                  <SearchIcon color={colors.muted} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.ink }]}
                    onChangeText={setSearchText}
                    value={searchText}
                    placeholder={searchPlaceholder}
                    placeholderTextColor={colors.faint}
                    autoFocus
                  />
                  {!!searchText && (
                    <TouchableOpacity
                      onPress={() => setSearchText("")}
                      style={[styles.searchClear, { backgroundColor: colors.borderLight }]}
                      hitSlop={8}
                    >
                      <CloseIcon size={12} color={colors.muted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* list */}
            <FlatList
              data={filtered}
              keyExtractor={(item, i) => String(item.value ?? i)}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const active = String(item.value) === String(selected);
                return (
                  <TouchableOpacity
                    onPress={() => pick(item)}
                    activeOpacity={0.85}
                    style={[
                      styles.row,
                      {
                        backgroundColor: active ? colors.brandTint : "transparent",
                        borderColor: active ? colors.brand : "transparent",
                      },
                    ]}
                  >
                    {item.flag ? (
                      <View style={styles.flagWrap}>
                        <Text style={styles.flagText}>{item.flag}</Text>
                      </View>
                    ) : item.icon ? (
                      <View
                        style={[
                          styles.iconWrap,
                          {
                            backgroundColor: active
                              ? colors.card
                              : colors.buttonDisabledBackground,
                          },
                        ]}
                      />
                    ) : null}

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.rowLabel, { color: colors.ink }]}>
                        {item.label}
                      </Text>
                      {!!item.desc && (
                        <Text style={[styles.rowDesc, { color: colors.muted }]}>
                          {item.desc}
                        </Text>
                      )}
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
                      {active && <CheckIcon size={13} color={colors.card} />}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyWrap}>
                  <Text style={[styles.emptyText, { color: colors.muted }]}>
                    {searchText ? `No matches for “${searchText}”` : "No options"}
                  </Text>
                </View>
              }
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default DropDownModal;

const styles = StyleSheet.create({
  // ── trigger field (matches EntityEditor input shell) ──
  // Colors (border / background / text) are applied inline via useTheme().
  labelRow: { flexDirection: "row", marginBottom: 7 },
  label: { fontSize: 12, fontWeight: "500" },
  required: { fontSize: 12 },
  field: {
    height: hp(6),
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 9,
  },
  selectedText: { flex: 1, fontSize: 13, fontWeight: "400", marginRight: 8 },
  errorText: { fontSize: 12, fontWeight: "500", marginTop: 6 },

  // ── modal scaffold ──
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    width: "100%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    overflow: "hidden",
  },

  // ── top handle + title ──
  handleWrap: {
    paddingTop: 12,
    paddingBottom: 4,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 99,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 6,
    paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  title: {
    fontSize: 19,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── search ──
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  searchPill: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  searchClear: {
    width: 22,
    height: 22,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── list rows ──
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 6,
  },
  flagWrap: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  flagText: { fontSize: 23 },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    flexShrink: 0,
  },
  rowLabel: {
    fontSize: 15.5,
    fontWeight: "600",
  },
  rowDesc: {
    fontSize: 12.5,
    marginTop: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 99,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // ── empty ──
  emptyWrap: {
    paddingVertical: 28,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13.5,
  },
});
