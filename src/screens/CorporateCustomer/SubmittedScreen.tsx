import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
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

function inrShort(n: string | number) {
  const v = Number(n);
  if (!v) return "—";
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

const SubmittedScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const { application, company, loan } = useSelector((state: any) => state.corporate);
  const app = application || {
    id: "TD-CL-2026-004821",
    submittedAt: new Date().toISOString(),
    status: "Submitted",
    stage: 0,
  };

  const submittedDate = new Date(app.submittedAt).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const rows = [
    { icon: "#️⃣", label: "Application ID", value: app.id },
    { icon: "🏢", label: "Company", value: company.name || "—" },
    { icon: "💰", label: "Loan amount", value: inrShort(loan.amount) },
    { icon: "📅", label: "Submitted", value: submittedDate },
  ];

  const handleNewApplication = () => {
    dispatch(resetCorporate());
    navigation.navigate("CorporateHome");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Success section */}
        <View style={[styles.successSection, { backgroundColor: "#FFF7ED" }]}>
          {/* Seal */}
          <View style={styles.sealWrapper}>
            <View style={[styles.sealOuter, { borderColor: "#F4CBA9" }]}>
              <View style={[styles.sealInner, { backgroundColor: BRAND }]}>
                <Text style={styles.sealCheck}>✓</Text>
              </View>
            </View>
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Application submitted</Text>
          <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
            Your corporate loan application has been securely submitted to the branch for review.
          </Text>
        </View>

        {/* Receipt card */}
        <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.receiptHeader, { borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.receiptTitle, { color: colors.text }]}>RECEIPT</Text>
            <View style={[styles.statusBadge, { backgroundColor: "#FFF4EC", borderColor: "#F4CBA9" }]}>
              <View style={[styles.statusDot, { backgroundColor: BRAND }]} />
              <Text style={[styles.statusText, { color: BRAND }]}>{app.status}</Text>
            </View>
          </View>

          {rows.map(({ icon, label, value }) => (
            <View key={label} style={[styles.receiptRow, { borderBottomColor: colors.borderLight }]}>
              <Text style={{ fontSize: 17 }}>{icon}</Text>
              <Text style={[styles.receiptLabel, { color: colors.textSecondary }]}>{label}</Text>
              <Text style={[styles.receiptValue, { color: colors.text }]} numberOfLines={1}>{value}</Text>
            </View>
          ))}

          <View style={[styles.reviewBanner, { backgroundColor: "#FFF4EC" }]}>
            <View style={styles.reviewBannerLeft}>
              <Text style={{ fontSize: 20 }}>⏱️</Text>
              <View>
                <Text style={[styles.reviewLabel, { color: BRAND }]}>Estimated review</Text>
                <Text style={[styles.reviewTime, { color: BRAND }]}>3–5 working days</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            ℹ️ Processed in Tecu LOS by your branch team
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: colors.borderLight, backgroundColor: colors.background }]}>
        <Button
          text="Track application"
          click={() => navigation.navigate("CorporateTrack")}
          buttonStyle={styles.primaryBtn}
        />
        <TouchableOpacity
          onPress={handleNewApplication}
          style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={{ fontSize: 14 }}>+</Text>
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Start new application</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SubmittedScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: hp(4) },
  successSection: {
    alignItems: "center",
    paddingTop: hp(5),
    paddingBottom: hp(4),
    paddingHorizontal: wp(8),
  },
  sealWrapper: { marginBottom: hp(2.5) },
  sealOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  sealInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  sealCheck: { color: "#fff", fontSize: 36, fontWeight: "700" },
  successTitle: { fontSize: hp(3), fontWeight: "700", letterSpacing: -0.8, marginBottom: hp(1) },
  successDesc: { fontSize: hp(1.7), lineHeight: hp(2.6), textAlign: "center" },
  receiptCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginHorizontal: wp(4),
    marginTop: hp(2),
    overflow: "hidden",
  },
  receiptHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.6),
    borderBottomWidth: 1,
  },
  receiptTitle: { fontSize: hp(1.5), fontWeight: "700", letterSpacing: 0.4 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: 99,
    borderWidth: 1,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: hp(1.5), fontWeight: "600" },
  receiptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
  },
  receiptLabel: { fontSize: hp(1.6), flex: 1 },
  receiptValue: { fontSize: hp(1.6), fontWeight: "600", flex: 1.5, textAlign: "right" },
  reviewBanner: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.8),
  },
  reviewBannerLeft: { flexDirection: "row", alignItems: "center", gap: wp(3) },
  reviewLabel: { fontSize: hp(1.6), fontWeight: "600" },
  reviewTime: { fontSize: hp(1.55), opacity: 0.85 },
  infoRow: { alignItems: "center", marginTop: hp(2) },
  infoText: { fontSize: hp(1.5) },
  footer: {
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    paddingBottom: hp(3),
    paddingHorizontal: wp(4),
    gap: hp(1.2),
  },
  primaryBtn: { borderRadius: 12 },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: wp(2),
    paddingVertical: hp(1.7),
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: hp(1.7), fontWeight: "600" },
});
