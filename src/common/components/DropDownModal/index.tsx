import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Platform,
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
import { DROPDOWNS } from "@src/services";
import { ChevronDown, SearchIcon, CloseIcon, CheckIconModal as CheckIcon } from "@src/common/svg/CorporateLoansSvgs";

export type Option = {
  label: string;
  value: string | number;
  flag?: string;
  icon?: string;
  desc?: string;
  search?: string;
  img?: string;
};

interface DropDownModalProps {
  options?: Option[];
  value?: string | number;
  toShowValue?: string | number;
  setValue?: (id: string, desc?: string) => void;
  placeholder?: string;
  header?: string;
  style?: ViewStyle | object;
  showImage?: boolean;
  label?: string;
  subLabel?: string;
  labelStyle?: ViewStyle | object;
  required?: boolean;
  passIdAndDesc?: boolean;
  type?: string;
  subtype?: string;
  isSearchable?: boolean;
  disabled?: boolean;
  alllowClear?: boolean;
  iconStyle?: object;
  error?: string;
  manualSearch?: boolean;
  manualSearchText?: string;
  removeHeader?: boolean;
  setManualSearchText?: (text?: string) => void;
  dropdownFetchFunction?: (type: string, search: string, subtype?: string) => any;
  maxHeight?: number;
  subtitle?: string;
  searchPlaceholder?: string;
}

const DropDownModal = ({
  options = [],
  value = "",
  toShowValue = "",
  setValue = () => {},
  placeholder = "SELECT OPTION",
  header = "",
  style = {},
  showImage = false,
  label = "",
  subLabel = "",
  labelStyle = {},
  required = false,
  passIdAndDesc = false,
  type = "",
  subtype = undefined,
  isSearchable = true,
  disabled = false,
  alllowClear = false,
  iconStyle = {},
  error = "",
  manualSearch = false,
  manualSearchText: _manualSearchText = "",
  removeHeader = false,
  setManualSearchText = () => {},
  dropdownFetchFunction,
  maxHeight = 0.82,
  subtitle = "",
  searchPlaceholder = "Search…",
}: DropDownModalProps) => {
  const { colors } = useTheme();

  const [visible, setVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [remoteData, setRemoteData] = useState<Option[]>([]);
  const [imgUri, setImgUri] = useState<string | null>(null);
  const [kbHeight, setKbHeight] = useState(0);
  const debounced = useDebounce(searchText);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const show = Keyboard.addListener(showEvent, (e) => setKbHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener(hideEvent, () => setKbHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const sheetY = useRef(new Animated.Value(1)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  const source = options.length > 0 ? options : remoteData;
  const wantSearch = isSearchable;

  // remote fetch
  useEffect(() => {
    if (options.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        let result: any;
        if (dropdownFetchFunction) {
          result = await dropdownFetchFunction(type, debounced, subtype);
        } else if (type) {
          result = await DROPDOWNS(type, debounced, subtype);
        } else {
          return;
        }
        if (!cancelled && Array.isArray(result)) {
          const mapped: Option[] = result.map((item: any) =>
            item.keyId !== undefined
              ? { label: item.keyDesc, value: item.keyId, img: item.img }
              : item,
          );
          setRemoteData(mapped);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [debounced, type, subtype, dropdownFetchFunction, options.length]);

  // client-side filtering
  const filtered = useMemo(() => {
    if (type || dropdownFetchFunction) return source;
    const q = debounced.trim().toLowerCase();
    if (!q) return source;
    return source.filter((o) =>
      `${o.label} ${o.desc || ""} ${o.search || ""}`.toLowerCase().includes(q),
    );
  }, [source, debounced, type, dropdownFetchFunction]);

  // sync showImage thumbnail
  useEffect(() => {
    if (!showImage) return;
    const opt = source.find((o) => String(o.value) === String(value));
    setImgUri((opt as any)?.img ?? null);
  }, [value, source.length, showImage]);

  const sheetHeight = hp(100) * maxHeight;
  const translateY = sheetY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, sheetHeight],
  });

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(sheetY, { toValue: 0, duration: 300, easing: Easing.bezier(0.22, 1, 0.36, 1), useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 1, duration: 240, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  };

  const animateOut = (after?: () => void) => {
    Animated.parallel([
      Animated.timing(sheetY, { toValue: 1, duration: 230, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(backdrop, { toValue: 0, duration: 230, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start(() => after && after());
  };

  const open = () => {
    if (disabled) return;
    setSearchText("");
    if (manualSearch) setManualSearchText("");
    setVisible(true);
    requestAnimationFrame(animateIn);
  };

  const close = () => {
    animateOut(() => {
      setSearchText("");
      if (manualSearch) setManualSearchText("");
      setVisible(false);
    });
  };

  const pick = (opt: Option) => {
    if (showImage && (opt as any).img) setImgUri((opt as any).img);
    if (passIdAndDesc) setValue(String(opt.value), opt.label);
    else setValue(String(opt.value));
    close();
  };

  const clear = () => {
    setImgUri(null);
    if (passIdAndDesc) setValue("", "");
    else setValue("");
  };

  const selectedOption = source.find((o) => String(o.value) === String(value));
  const triggerLabel = selectedOption
    ? selectedOption.label
    : value
      ? String(value).toUpperCase()
      : placeholder;

  const sheet = (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <View style={styles.modalRoot}>
        <TouchableWithoutFeedback onPress={close}>
          <Animated.View style={[styles.backdrop, { opacity: backdrop, backgroundColor: colors.modalBackdrop }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            { maxHeight: sheetHeight, transform: [{ translateY }], backgroundColor: colors.card, borderTopColor: colors.borderLight },
          ]}
        >
          <View style={styles.handleWrap}>
            <View style={[styles.handle, { backgroundColor: colors.handle }]} />
          </View>

          {!!header && !removeHeader && (
            <View style={[styles.titleRow, { borderBottomColor: colors.hairline }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.ink }]}>{header}</Text>
                {!!subtitle && <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>}
              </View>
              <TouchableOpacity onPress={close} style={[styles.closeBtn, { backgroundColor: colors.buttonDisabledBackground }]} hitSlop={6}>
                <CloseIcon color={colors.muted} />
              </TouchableOpacity>
            </View>
          )}

          {wantSearch && (
            <View style={[styles.searchRow, { backgroundColor: colors.card }]}>
              <View style={[styles.searchPill, { backgroundColor: colors.buttonDisabledBackground, borderColor: colors.borderLight }]}>
                <SearchIcon color={colors.muted} />
                <TextInput
                  style={[styles.searchInput, { color: colors.ink }]}
                  onChangeText={(text) => {
                    setSearchText(text);
                    if (manualSearch) setManualSearchText(text);
                  }}
                  value={searchText}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.faint}
                  autoFocus
                />
                {!!searchText && (
                  <TouchableOpacity
                    onPress={() => { setSearchText(""); if (manualSearch) setManualSearchText(""); }}
                    style={[styles.searchClear, { backgroundColor: colors.borderLight }]}
                    hitSlop={8}
                  >
                    <CloseIcon size={12} color={colors.muted} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(item, i) => String(item.value ?? i)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.listContent, { paddingBottom: kbHeight + 28 }]}
            renderItem={({ item }) => {
              const active = String(item.value) === String(value);
              return (
                <TouchableOpacity
                  onPress={() => pick(item)}
                  activeOpacity={0.85}
                  style={[
                    styles.row,
                    { backgroundColor: active ? colors.brandTint : "transparent", borderColor: active ? colors.brand : "transparent" },
                  ]}
                >
                  {item.flag ? (
                    <View style={styles.flagWrap}><Text style={styles.flagText}>{item.flag}</Text></View>
                  ) : (item as any).img ? (
                    <Image source={{ uri: (item as any).img }} style={styles.rowImg} />
                  ) : item.icon ? (
                    <View style={[styles.iconWrap, { backgroundColor: active ? colors.card : colors.buttonDisabledBackground }]} />
                  ) : null}

                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[styles.rowLabel, { color: active ? colors.brand : colors.ink, fontWeight: active ? "700" : "500" }]}>
                      {item.label}
                    </Text>
                    {!!item.desc && <Text style={[styles.rowDesc, { color: colors.muted }]}>{item.desc}</Text>}
                  </View>

                  <View style={[styles.radio, { borderColor: active ? colors.brand : colors.borderLight, backgroundColor: active ? colors.brand : "transparent" }]}>
                    {active && <CheckIcon size={13} color={colors.card} />}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  {searchText ? `No matches for "${searchText}"` : "No options"}
                </Text>
              </View>
            }
          />
        </Animated.View>
      </View>
    </Modal>
  );

  // with label
  if (label && label.length > 0) {
    return (
      <View style={[{ marginBottom: 12 }, style]}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.inputLabel }, labelStyle as object]}>
            {label}
            {required && <Text style={[styles.required, { color: colors.error }]}> *</Text>}
          </Text>
        </View>

        <TouchableOpacity
          onPress={open}
          disabled={disabled}
          activeOpacity={0.8}
          style={[styles.field, { borderColor: error ? colors.error : colors.borderLight, backgroundColor: colors.card }]}
        >
          {showImage && imgUri ? (
            <View style={styles.imageRow}>
              <Image source={{ uri: imgUri }} style={styles.triggerImg} />
              {!!value && (
                <Text numberOfLines={1} style={[styles.selectedText, { color: colors.ink }]}>
                  +{toShowValue || value}
                </Text>
              )}
            </View>
          ) : (
            <Text
              numberOfLines={1}
              style={[styles.selectedText, { color: selectedOption || value ? colors.ink : colors.faint }]}
            >
              {triggerLabel}
            </Text>
          )}

          {alllowClear && value ? (
            <TouchableOpacity onPress={clear} disabled={disabled} hitSlop={8}>
              <View style={iconStyle}><CloseIcon color={colors.muted} /></View>
            </TouchableOpacity>
          ) : (
            <View style={iconStyle}><ChevronDown color={colors.faint} /></View>
          )}
        </TouchableOpacity>

        {!!error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

        {sheet}
      </View>
    );
  }

  // no-label compact variant
  return (
    <View style={[styles.container, style]}>
      <View style={styles.customPicker}>
        <TouchableOpacity style={{ flex: 1, paddingHorizontal: wp(3) }} onPress={open} disabled={disabled}>
          {showImage && imgUri ? (
            <View style={styles.imageRow}>
              <Image source={{ uri: imgUri }} style={styles.triggerImg} />
              {!!value && (
                <Text numberOfLines={1} style={[{ color: colors.ink },{
                      color: colors.text,
                      //fontWeight: "bold",
                      //fontSize: 16,
                      backgroundColor: disabled
                        ? colors.inputDisabledBackground
                        : colors.inputBackground,
                      paddingHorizontal: wp(0.4),
                      paddingVertical: 4,
                      borderRadius: 4,
                    }]}>
                  +{toShowValue || value}
                </Text>
              )}
            </View>
          ) : (
            <>
              <Text
                numberOfLines={1}
                style={[styles.selectedText, { color: value ? colors.ink : colors.faint, fontWeight: "bold", fontSize: 16 }]}
              >
                {triggerLabel}
              </Text>
              {!!subLabel && <Text style={[styles.subLabel, { color: colors.muted }]}>{subLabel}</Text>}
            </>
          )}
        </TouchableOpacity>

        {alllowClear && value ? (
          <TouchableOpacity onPress={clear} disabled={disabled} hitSlop={8}>
            <View style={iconStyle}><CloseIcon color={colors.muted} /></View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={open} disabled={disabled}>
            <View style={iconStyle}><ChevronDown color={colors.faint} /></View>
          </TouchableOpacity>
        )}
      </View>

      {!!error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

      {sheet}
    </View>
  );
};

export default DropDownModal;

const styles = StyleSheet.create({
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
  imageRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  triggerImg: { width: 24, height: 18, resizeMode: "contain" },

  container: { flexDirection: "row", alignItems: "center", width: "100%" },
  customPicker: { width: "100%", justifyContent: "space-between", alignItems: "center", flexDirection: "row" },
  subLabel: { fontSize: hp(1.4), marginTop: 2 },

  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: { width: "100%", borderTopLeftRadius: 26, borderTopRightRadius: 26, borderTopWidth: 1, overflow: "hidden" },

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
  closeBtn: { width: 32, height: 32, borderRadius: 99, alignItems: "center", justifyContent: "center" },

  searchRow: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10 },
  searchPill: { height: 46, borderRadius: 12, borderWidth: 1, paddingHorizontal: 13, flexDirection: "row", alignItems: "center", gap: 9 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  searchClear: { width: 22, height: 22, borderRadius: 99, alignItems: "center", justifyContent: "center" },

  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 28 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1.5, marginBottom: 4 },
  flagWrap: { width: 38, height: 38, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  flagText: { fontSize: 23 },
  rowImg: { width: 38, height: 28, resizeMode: "contain", flexShrink: 0 },
  iconWrap: { width: 38, height: 38, borderRadius: 11, flexShrink: 0 },
  rowValue: { fontSize: 11, fontWeight: "500", marginBottom: 1 },
  rowLabel: { fontSize: 15.5, fontWeight: "600" },
  rowDesc: { fontSize: 12.5, marginTop: 1 },
  radio: { width: 22, height: 22, borderRadius: 99, borderWidth: 2, alignItems: "center", justifyContent: "center", flexShrink: 0 },

  emptyWrap: { paddingVertical: 28, alignItems: "center" },
  emptyText: { fontSize: 13.5 },
});
