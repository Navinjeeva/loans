import React, { useState } from "react";
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
import { setDocuments } from "@src/store/corporate";
import StepHeader from "./StepHeader";

const BRAND = "#F97316";

const DOC_GROUPS = [
  {
    id: "company",
    icon: "🏢",
    label: "Company documents",
    docs: [
      { id: "moa_aoa", name: "MOA & AOA / Partnership deed", req: true },
      { id: "cin_cert", name: "Certificate of incorporation", req: true },
      { id: "pan_card", name: "Company PAN card", req: true },
      { id: "gst_cert", name: "GST registration certificate", req: false },
      { id: "itr_3yr", name: "ITR – last 3 years", req: true },
      { id: "audited_fs", name: "Audited financial statements (3 years)", req: true },
      { id: "bank_stmt", name: "Bank statements – last 12 months", req: true },
    ],
  },
  {
    id: "kyc",
    icon: "🪪",
    label: "KYC documents",
    docs: [
      { id: "aadhaar", name: "Aadhaar card (all directors)", req: true },
      { id: "pan_dir", name: "PAN card (all directors)", req: true },
      { id: "address_proof", name: "Address proof (all directors)", req: true },
    ],
  },
  {
    id: "property",
    icon: "🏗️",
    label: "Property documents",
    docs: [
      { id: "prop_title", name: "Property title deed", req: false },
      { id: "prop_valuation", name: "Valuation report", req: false },
    ],
  },
];

interface DocEntry {
  status: "uploaded" | "pending" | "rejected";
  fileName: string;
  size: string;
  uploadedAt: number;
}

const DocumentsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const documents = useSelector((state: any) => state.corporate.documents) || {};
  const [openGroup, setOpenGroup] = useState<string>("company");

  const setEntry = (id: string, val: DocEntry | undefined) => {
    const next = { ...documents };
    if (val === undefined) delete next[id];
    else next[id] = val;
    dispatch(setDocuments(next));
  };

  const isSatisfied = (entry: DocEntry | undefined) =>
    !!entry && entry.status === "uploaded";

  const simulateUpload = (docId: string, docName: string) => {
    Alert.alert(
      "Upload document",
      `Upload "${docName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Upload",
          onPress: () => {
            setEntry(docId, {
              status: "uploaded",
              fileName: docName.replace(/[^a-z0-9]+/gi, "_") + ".pdf",
              size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
              uploadedAt: Date.now(),
            });
          },
        },
      ]
    );
  };

  const allRequired = DOC_GROUPS.every((g) =>
    g.docs.filter((d) => d.req).every((d) => isSatisfied(documents[d.id]))
  );

  const requiredTotal = DOC_GROUPS.reduce((acc, g) => acc + g.docs.filter((d) => d.req).length, 0);
  const requiredDone = DOC_GROUPS.reduce(
    (acc, g) => acc + g.docs.filter((d) => d.req && isSatisfied(documents[d.id])).length,
    0
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepHeader
        step={4}
        title="Document upload"
        onBack={() => navigation.goBack()}
        onSaveExit={() => navigation.navigate("CorporateHome")}
        colors={colors}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {DOC_GROUPS.map((g) => {
          const isOpen = openGroup === g.id;
          const groupDone = g.docs.filter((d) => d.req).every((d) => isSatisfied(documents[d.id]));
          const doneCount = g.docs.filter((d) => isSatisfied(documents[d.id])).length;

          return (
            <View key={g.id} style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.groupHeader}
                onPress={() => setOpenGroup(isOpen ? "" : g.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.groupIconBox,
                    { backgroundColor: groupDone ? "#E7F8EE" : "#FFF4EC" },
                  ]}
                >
                  {groupDone ? (
                    <Text style={{ fontSize: 16 }}>✅</Text>
                  ) : (
                    <Text style={{ fontSize: 16 }}>{g.icon}</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupLabel, { color: colors.text }]}>{g.label}</Text>
                  <Text style={[styles.groupCount, { color: colors.textSecondary }]}>
                    {doneCount} of {g.docs.length} uploaded
                  </Text>
                </View>
                <Text style={[styles.chevron, { color: colors.textMuted, transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }]}>
                  ›
                </Text>
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.groupBody}>
                  {g.docs.map((doc, idx) => {
                    const entry = documents[doc.id];
                    const uploaded = isSatisfied(entry);
                    return (
                      <View
                        key={doc.id}
                        style={[
                          styles.docRow,
                          idx < g.docs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                        ]}
                      >
                        <View style={styles.docInfo}>
                          <View style={styles.docNameRow}>
                            <Text style={[styles.docName, { color: colors.text }]}>{doc.name}</Text>
                            {doc.req && (
                              <View style={[styles.reqBadge, { backgroundColor: "#FFF4EC" }]}>
                                <Text style={[styles.reqText, { color: BRAND }]}>Required</Text>
                              </View>
                            )}
                          </View>
                          {uploaded && entry && (
                            <Text style={[styles.docMeta, { color: colors.textSecondary }]}>
                              {entry.fileName} · {entry.size}
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={() => {
                            if (uploaded) {
                              Alert.alert("Replace document?", `Remove "${entry?.fileName}" and upload a new file?`, [
                                { text: "Cancel", style: "cancel" },
                                { text: "Replace", style: "destructive", onPress: () => simulateUpload(doc.id, doc.name) },
                              ]);
                            } else {
                              simulateUpload(doc.id, doc.name);
                            }
                          }}
                          style={[
                            styles.uploadBtn,
                            {
                              backgroundColor: uploaded ? "#E7F8EE" : "#FFF4EC",
                              borderColor: uploaded ? "#BBE6CB" : "#F4CBA9",
                            },
                          ]}
                        >
                          <Text style={[styles.uploadBtnText, { color: uploaded ? "#3FAE63" : BRAND }]}>
                            {uploaded ? "✓ Uploaded" : "↑ Upload"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {!allRequired && (
          <View style={[styles.infoNote, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.infoNoteText, { color: colors.textSecondary }]}>
              ⚠️ {requiredTotal - requiredDone} required document{requiredTotal - requiredDone !== 1 ? "s" : ""} pending
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderLight, backgroundColor: colors.background }]}>
        <Button
          text={allRequired ? "Continue" : `Upload ${requiredTotal - requiredDone} more to continue`}
          click={() => navigation.navigate("CorporateReview")}
          disabled={!allRequired}
          buttonStyle={styles.footerBtn}
        />
      </View>
    </View>
  );
};

export default DocumentsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: 99,
    borderWidth: 1,
  },
  progressBadgeText: { fontSize: hp(1.5), fontWeight: "700" },
  scroll: { padding: wp(4), paddingBottom: hp(4), gap: hp(1.5) },
  group: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: hp(1.8),
    gap: wp(3),
  },
  groupIconBox: { width: 34, height: 34, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  groupLabel: { fontSize: hp(1.7), fontWeight: "600" },
  groupCount: { fontSize: hp(1.5), marginTop: 2 },
  chevron: { fontSize: hp(2.6), fontWeight: "300" },
  groupBody: { paddingHorizontal: hp(2), paddingBottom: hp(1) },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1.4),
    gap: wp(3),
  },
  docInfo: { flex: 1 },
  docNameRow: { flexDirection: "row", alignItems: "center", gap: wp(2), flexWrap: "wrap" },
  docName: { fontSize: hp(1.6), fontWeight: "500", flex: 1 },
  reqBadge: { paddingHorizontal: wp(2), paddingVertical: 2, borderRadius: 6 },
  reqText: { fontSize: hp(1.3), fontWeight: "600" },
  docMeta: { fontSize: hp(1.4), marginTop: 3 },
  uploadBtn: {
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1),
    borderRadius: 10,
    borderWidth: 1.5,
    flexShrink: 0,
  },
  uploadBtnText: { fontSize: hp(1.5), fontWeight: "600" },
  infoNote: {
    padding: hp(1.8),
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  infoNoteText: { fontSize: hp(1.6) },
  footer: {
    borderTopWidth: 1,
    paddingTop: hp(1.5),
    paddingBottom: hp(3),
  },
  footerBtn: { marginHorizontal: wp(4), borderRadius: 12 },
});
