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
import Button from "@src/components/Button";
import { useDispatch, useSelector } from "react-redux";
import { resetCorporate } from "@src/store/corporate";

const BRAND = "#F97316";

const STAGES = [
  "Submitted",
  "Under Review",
  "Credit Assessment",
  "Sanction",
  "Disbursement",
];

const STAGE_INFO: Record<string, { icon: string; desc: string }> = {
  Submitted: { icon: "✓", desc: "Application received and queued for review." },
  "Under Review": { icon: "👁️", desc: "Branch officers are reviewing your application and uploaded documents." },
  "Credit Assessment": { icon: "📊", desc: "Credit assessment and underwriting in progress." },
  Sanction: { icon: "✅", desc: "Loan sanctioned and final terms approved." },
  Disbursement: { icon: "🏦", desc: "Funds disbursed to your corporate account." },
};

function inrShort(n: string | number) {
  const v = Number(n);
  if (!v) return "—";
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

const TrackScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { application, loan: l } = useSelector((state: any) => state.corporate);
  const [currentStage, setCurrentStage] = useState(application?.stage ?? 0);
  const app = application || { id: "TD-CL-2026-004821" };

  const pct = currentStage / (STAGES.length - 1);
  const baseTime = application?.submittedAt ? new Date(application.submittedAt) : new Date();

  const stamp = (i: number) => {
    if (i > currentStage) return "Pending";
    return new Date(baseTime.getTime() + i * 7200000).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.navigate("CorporateSubmitted")} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>{app.id}</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Track application</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Status hero */}
        <View style={styles.statusHero}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusEyebrow}>CURRENT STATUS</Text>
            <Text style={styles.statusLabel}>{STAGES[currentStage]}</Text>
          </View>
          <View style={[styles.statusIcon, { backgroundColor: "rgba(249,115,22,0.18)" }]}>
            <Text style={{ fontSize: 24 }}>{STAGE_INFO[STAGES[currentStage]]?.icon}</Text>
          </View>
        </View>
        <View style={styles.heroProgress}>
          <View style={[styles.progressTrack, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
          </View>
          <View style={styles.heroProgressLabels}>
            <Text style={styles.heroLabel}>{inrShort(l.amount)} · {l.tenure} mo</Text>
            <Text style={styles.heroPct}>{Math.round(pct * 100)}% complete</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate("CorporateDocuments")}
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#FFF4EC" }]}>
              <Text style={{ fontSize: 18 }}>📄</Text>
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Documents</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.actionIconBox, { backgroundColor: "#FFF4EC" }]}>
              <Text style={{ fontSize: 18 }}>💰</Text>
            </View>
            <Text style={[styles.actionLabel, { color: colors.text }]}>Loan summary</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <View style={styles.sectionHeaderRow}>
          <Text style={{ fontSize: 14 }}>📋</Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Review timeline</Text>
        </View>

        <View style={styles.timeline}>
          {STAGES.map((stage, i) => {
            const done = i < currentStage;
            const active = i === currentStage;
            const info = STAGE_INFO[stage];
            return (
              <View key={stage} style={styles.timelineItem}>
                {/* Connector line */}
                {i < STAGES.length - 1 && (
                  <View
                    style={[
                      styles.connector,
                      { backgroundColor: done ? BRAND : colors.borderLight },
                    ]}
                  />
                )}
                {/* Node */}
                <View
                  style={[
                    styles.node,
                    {
                      backgroundColor: done ? BRAND : active ? "#fff" : colors.surface,
                      borderColor: done || active ? BRAND : colors.border,
                      shadowColor: active ? BRAND : "transparent",
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: active ? 0.3 : 0,
                      shadowRadius: active ? 6 : 0,
                    },
                  ]}
                >
                  {done ? (
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>✓</Text>
                  ) : (
                    <View
                      style={[
                        styles.nodeDot,
                        { backgroundColor: active ? BRAND : colors.border },
                      ]}
                    />
                  )}
                </View>

                {/* Content */}
                <View style={styles.timelineContent}>
                  <View style={styles.timelineRow}>
                    <Text
                      style={[
                        styles.stageName,
                        {
                          color: done || active ? colors.text : colors.textSecondary,
                          fontWeight: active ? "800" : "700",
                        },
                      ]}
                    >
                      {stage}
                    </Text>
                    {active && (
                      <View style={[styles.currentBadge, { backgroundColor: "#FFF4EC", borderColor: "#F4CBA9" }]}>
                        <Text style={[styles.currentBadgeText, { color: BRAND }]}>Current</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.stageDesc, { color: done || active ? colors.textSecondary : colors.textMuted }]}>
                    {info?.desc}
                  </Text>
                  <View style={styles.timelineTime}>
                    <Text style={{ fontSize: 11 }}>⏱️</Text>
                    <Text style={[styles.stageTime, { color: colors.textMuted }]}>{stamp(i)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.borderLight, backgroundColor: colors.background }]}>
        <View style={styles.footerRow}>
          <TouchableOpacity
            onPress={() => { dispatch(resetCorporate()); navigation.navigate("CorporateHome"); }}
            style={[styles.newAppBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={{ fontSize: 14 }}>+</Text>
            <Text style={[styles.newAppText, { color: colors.text }]}>New application</Text>
          </TouchableOpacity>
          {currentStage < STAGES.length - 1 && (
            <TouchableOpacity
              onPress={() => setCurrentStage((s: number) => Math.min(s + 1, STAGES.length - 1))}
              style={[styles.advanceBtn, { backgroundColor: "#FFF4EC", borderColor: "#F4CBA9" }]}
            >
              <Text style={[styles.advanceBtnText, { color: BRAND }]}>✨ Advance (demo)</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default TrackScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    borderBottomWidth: 1,
    gap: wp(3),
  },
  backBtn: { paddingTop: hp(0.4) },
  backArrow: { fontSize: hp(2.8), fontWeight: "300" },
  eyebrow: { fontSize: hp(1.4), marginBottom: 2 },
  headerTitle: { fontSize: hp(2.2), fontWeight: "700" },
  scroll: { padding: wp(4), paddingBottom: hp(4) },
  statusHero: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1E293B",
    borderRadius: 20,
    padding: hp(2.2),
    marginBottom: 0,
  },
  statusLeft: {},
  statusEyebrow: { fontSize: hp(1.3), color: "rgba(255,255,255,0.55)", fontWeight: "600", letterSpacing: 0.4, textTransform: "uppercase" },
  statusLabel: { fontSize: hp(2.5), fontWeight: "700", color: "#fff", letterSpacing: -0.4, marginTop: 3 },
  statusIcon: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  heroProgress: {
    backgroundColor: "#1E293B",
    paddingHorizontal: hp(2.2),
    paddingBottom: hp(2.2),
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: hp(2),
  },
  progressTrack: { height: 6, borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: BRAND, borderRadius: 99 },
  heroProgressLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: hp(1) },
  heroLabel: { fontSize: hp(1.45), color: "rgba(255,255,255,0.6)" },
  heroPct: { fontSize: hp(1.45), color: "rgba(255,255,255,0.6)" },
  quickActions: { flexDirection: "row", gap: wp(3), marginBottom: hp(2.5) },
  actionCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: wp(2.5),
    padding: hp(1.8),
    borderRadius: 15,
    borderWidth: 1,
  },
  actionIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: hp(1.6), fontWeight: "600" },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: wp(2), marginBottom: hp(1.5) },
  sectionTitle: { fontSize: hp(1.8), fontWeight: "700" },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: "row", gap: wp(4), position: "relative" },
  connector: {
    position: "absolute",
    left: wp(3.6),
    top: 30,
    width: 2,
    bottom: -6,
    zIndex: 0,
  },
  node: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    zIndex: 1,
    marginTop: 2,
  },
  nodeDot: { width: 9, height: 9, borderRadius: 5 },
  timelineContent: { flex: 1, paddingBottom: hp(2.5) },
  timelineRow: { flexDirection: "row", alignItems: "center", gap: wp(2), flexWrap: "wrap" },
  stageName: { fontSize: hp(1.8) },
  currentBadge: {
    paddingHorizontal: wp(2.5),
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  currentBadgeText: { fontSize: hp(1.35), fontWeight: "600" },
  stageDesc: { fontSize: hp(1.5), lineHeight: hp(2.3), marginTop: 4 },
  timelineTime: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 5 },
  stageTime: { fontSize: hp(1.4) },
  footer: {
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    paddingBottom: hp(3),
    paddingHorizontal: wp(4),
  },
  footerRow: { flexDirection: "row", gap: wp(3) },
  newAppBtn: {
    flex: 1.3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(1.5),
    paddingVertical: hp(1.7),
    borderRadius: 12,
    borderWidth: 1,
  },
  newAppText: { fontSize: hp(1.6), fontWeight: "600" },
  advanceBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(1.7),
    borderRadius: 12,
    borderWidth: 1,
  },
  advanceBtnText: { fontSize: hp(1.6), fontWeight: "600" },
});
