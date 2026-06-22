import React from "react";
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

const HomeScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { drafts } = useSelector((state: any) => state.corporate);

  const stepName = (k: string) =>
    ({
      classification: "Find your company",
      verifyCompany: "Company information",
      loan: "Loan details",
      documents: "Document upload",
      review: "Review application",
      generatedForm: "Application form",
    }[k] || "Find your company");

  const stepOf = (k: string) =>
    ({
      classification: 1,
      verifyCompany: 2,
      loan: 3,
      documents: 4,
      review: 5,
      generatedForm: 5,
      submitted: 6,
      track: 6,
    }[k] || 1);

  const editedLabel = (ts: number) => {
    const m = Math.floor(Math.max(0, Date.now() - ts) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return h === 1 ? "an hour ago" : `${h} hours ago`;
    const d = Math.floor(h / 24);
    if (d === 1) return "yesterday";
    if (d < 7) return `${d} days ago`;
    return new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const startApplication = () => {
    dispatch(resetCorporate());
    navigation.navigate("CorporateClassification");
  };

  const handleResume = (draft: any) => {
    const screenMap: Record<string, string> = {
      classification: "CorporateClassification",
      verifyCompany: "CorporateVerifyCompany",
      loan: "CorporateLoan",
      documents: "CorporateDocuments",
      review: "CorporateReview",
    };
    navigation.navigate(screenMap[draft.stepKey] || "CorporateClassification");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Your applications</Text>
        <View style={{ width: wp(10) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {drafts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyIconText}>📄</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No draft applications yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Start a new application to begin.
            </Text>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DRAFTS</Text>
            {drafts.map((d: any) => (
              <TouchableOpacity
                key={d.id}
                onPress={() => handleResume(d)}
                style={[styles.draftCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.draftIcon, { backgroundColor: colors.surface }]}>
                  <Text style={{ fontSize: 18 }}>🏢</Text>
                </View>
                <View style={styles.draftInfo}>
                  <Text style={[styles.draftName, { color: colors.text }]} numberOfLines={1}>
                    {d.name || "Untitled application"}
                  </Text>
                  <Text style={[styles.draftStep, { color: colors.textSecondary }]}>
                    Step {stepOf(d.stepKey)} of 6 · {stepName(d.stepKey)}
                  </Text>
                  <Text style={[styles.draftTime, { color: colors.textMuted }]}>
                    Edited {editedLabel(d.editedAt)}
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderLight, backgroundColor: colors.background }]}>
        <Button text="Start new application" click={startApplication} buttonStyle={styles.footerBtn} />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
    borderBottomWidth: 1,
  },
  backBtn: { width: wp(10), justifyContent: "center" },
  backArrow: { fontSize: hp(2.8), fontWeight: "300" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: hp(2.2), fontWeight: "700" },
  scroll: { padding: wp(4), paddingBottom: hp(4) },
  emptyState: { alignItems: "center", paddingTop: hp(8) },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hp(1.8),
  },
  emptyIconText: { fontSize: 26 },
  emptyTitle: { fontSize: hp(1.9), fontWeight: "600", marginBottom: hp(0.5) },
  emptyDesc: { fontSize: hp(1.7), lineHeight: hp(2.6), textAlign: "center" },
  sectionLabel: {
    fontSize: hp(1.4),
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: hp(1.2),
    marginHorizontal: wp(1),
  },
  draftCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: hp(1.8),
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: hp(1.2),
    gap: wp(3),
  },
  draftIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  draftInfo: { flex: 1, minWidth: 0 },
  draftName: { fontSize: hp(1.8), fontWeight: "600", marginBottom: 2 },
  draftStep: { fontSize: hp(1.5), marginBottom: 2 },
  draftTime: { fontSize: hp(1.4) },
  chevron: { fontSize: hp(2.4), fontWeight: "300" },
  footer: {
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    paddingBottom: hp(3),
  },
  footerBtn: { marginHorizontal: wp(4), borderRadius: 12 },
});
