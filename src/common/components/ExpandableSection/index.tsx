import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@src/common/ThemeContext";
import { ChevronDown } from "@src/common/svg/CorporateLoansSvgs";
// ── Status badge palette (resolved from theme inside the component) ──
type Status = "review" | "entry" | "selection" | "verified" | "none";


interface ExpandableSectionProps {
  title: string;
  summary?: string;
  status?: Status;
  defaultOpen?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

const ExpandableSection = ({
  title,
  summary,
  status = "none",
  defaultOpen = false,
  children,
  style,
}: ExpandableSectionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const { colors } = useTheme();

  const STATUS_META: Record<
    Exclude<Status, "verified" | "none">,
    { fg: string; bg: string; label: string }
  > = {
    review: { fg: colors.warningInk, bg: colors.warningSoft, label: "Please check" },
    entry: { fg: colors.buttonPrimaryHover, bg: colors.brandTint, label: "Your entry" },
    selection: { fg: colors.muted, bg: colors.buttonDisabledBackground, label: "Your selection" },
  };

  const meta =
    status === "verified" || status === "none"
      ? null
      : STATUS_META[status as Exclude<Status, "verified" | "none">];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setOpen((o) => !o)}
        style={styles.header}
      >
        <View style={styles.headerTextWrap}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {!open && summary ? (
            <Text
              style={[styles.summary, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {summary}
            </Text>
          ) : null}
        </View>

        {meta && (
          <View style={[styles.badge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.badgeText, { color: meta.fg }]}>
              {meta.label}
            </Text>
          </View>
        )}

        <View
          style={{
            transform: [{ rotate: open ? "180deg" : "0deg" }],
            marginLeft: 4,
          }}
        >
          <ChevronDown color={colors.faint} />
        </View>
      </TouchableOpacity>

      {open && (
        <View
          style={[
            styles.body,
            { borderTopColor: colors.hairline },
          ]}
        >
          <View style={{ height: 12 }} />
          {children}
        </View>
      )}
    </View>
  );
};

export default ExpandableSection;

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  headerTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  summary: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 99,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  body: {
    paddingHorizontal: 15,
    paddingBottom: 16,
    paddingTop: 4,
    borderTopWidth: 1,
  },
});
