import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import RNBlobUtil from "react-native-blob-util";
import RNFS from "react-native-fs";
import PdfViewer from "@src/common/components/PdfViewer";
import ImageViewer from "@src/common/components/ImageViewer";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { useTheme } from "@src/common/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import { upsertDocument, removeDocument } from "@src/store/corporate";
import type { DocumentEntry } from "@src/store/corporate";
import type { RootState } from "@src/store";
import ScreenHeader from "@src/common/components/ScreenHeader";
import BottomButton from "@src/common/components/BottomButton";
import DocumentUploader from "@src/common/components/DocumentUploader";
import PersonKYCCard, { KycDoc } from "@src/common/components/PersonKYCCard";
import BottomFileUploadModal from "@src/common/components/BottomFileUploadModal";
import DocumentActionsModal from "@src/common/components/DocumentActionsModal";
import DocumentPreviewModal from "@src/common/components/DocumentPreviewModal";

// ── KYC catalog ──
// Personal docs (individual person)
const PERSON_KYC_DOCS: KycDoc[] = [
  { id: "pan", name: "PAN Card", required: true },
  { id: "aadhaar", name: "Aadhaar", required: true },
  { id: "din", name: "DIN Proof", required: false },
  { id: "photo", name: "Photograph", required: true },
  { id: "address", name: "Address Proof", required: false },
];

// Entity owner docs (e.g. Holding Company, Trust)
const ENTITY_KYC_DOCS: KycDoc[] = [
  { id: "registration", name: "Company Registration", required: true },
  { id: "ownership", name: "Ownership Proof", required: true },
];

type Person = { id: string; name: string; role: string; entity?: boolean };

// ── Inline group icons (matches screenshot) ──
const GroupIcon = ({
  kind,
  color,
}: {
  kind?: string;
  color: string;
}) => {
  const stroke = 1.85;
  const props = {
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  if (kind === "shield")
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" {...props} />
        <Path d="M9 12l2 2 4-4" {...props} />
      </Svg>
    );
  if (kind === "chart")
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path d="M3 3v18h18" {...props} />
        <Rect x={7} y={11} width={3} height={6} rx={0.6} {...props} />
        <Rect x={12} y={7} width={3} height={10} rx={0.6} {...props} />
        <Rect x={17} y={13} width={3} height={4} rx={0.6} {...props} />
      </Svg>
    );
  if (kind === "users")
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Circle cx={9} cy={8} r={3} {...props} />
        <Path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" {...props} />
        <Path d="M16 5.2a3 3 0 0 1 0 5.6M21 19c0-2.3-1.3-4-3.5-4.6" {...props} />
      </Svg>
    );
  // default — building / doc
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Rect x={4} y={3} width={16} height={18} rx={1.5} {...props} />
      <Path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" {...props} />
      <Path d="M9 21v-3h6v3" {...props} />
    </Svg>
  );
};

const ChevronDown = ({ open, color }: { open: boolean; color: string }) => (
  <Svg
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
  >
    <Path
      d="M6 9l6 6 6-6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);


const DOC_GROUPS: {
  id: string;
  label: string;
  icon: "building" | "shield" | "chart" | "users";
  docs: { id: string; name: string; req: boolean; template?: boolean }[];
}[] = [
  {
    id: "company",
    label: "Company Documents",
    icon: "building",
    docs: [
      { id: "coi", name: "Certificate of Incorporation", req: true },
      { id: "moa", name: "Memorandum of Association (MOA)", req: true },
      { id: "aoa", name: "Articles of Association (AOA)", req: true },
      { id: "panco", name: "Company PAN Card", req: true },
      { id: "boardReso", name: "Board Resolution", req: true, template: true },
    ],
  },
  {
    id: "tax",
    label: "Tax & statutory",
    icon: "shield",
    docs: [
      { id: "gst", name: "GST Registration Certificate", req: true },
      { id: "shop_est_lic", name: "Shop & Establishment License", req : false},
      { id: "udyam_reg", name: "Udyam/MSME Registration", req : false},
      { id: "no_obj_cert", name: "No-Objection Certificate", req : false},
    ],
  },
  {
    id: "financial",
    label: "Financial Documents",
    icon: "chart",
    docs: [
      { id: "audited", name: "Audited Financial Statements — FY24", req: true },
      { id: "pnl", name: "Profit & Loss Statement", req: true },
      { id: "bankStmt", name: "Bank Statements — Last 12 months", req: true },
      { id: "itr", name: "Income Tax Returns — 2 years", req: true },
      { id: "gst_return", name: "GST Returns - Last 4 quarters", req: false },
    ],
  },
  {
    id: "kyc",
    label: "Director & owner KYC",
    icon: "users",
    docs: [
      { id: "dirKyc", name: "Director KYC — PAN", req: true },
      { id: "dirAadhaar", name: "Director Aadhaar", req: true },
      { id: "dirPhoto", name: "Director Photographs", req: true },
    ],
  },
  {
    id: "deal-specific",
    label: "Deal-specific",
    icon: "users",
    docs: [
      { id: "proforma", name: "Proforma invoice/quotation", req: false },
    ],
  },
];

const DocumentsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  
  const documents = useSelector((state: RootState) => state.corporate.documents) || {};
  const directors = useSelector((state: RootState) => state.corporate.directors);
  const owners = useSelector((state: RootState) => state.corporate.owners);
  const [openGroup, setOpenGroup] = useState<string>("company");
  const [pickerFor, setPickerFor] = useState<{ id: string; name: string } | null>(null);
  const [actionsFor, setActionsFor] = useState<{ id: string; name: string } | null>(null);
  const [previewFor, setPreviewFor] = useState<{ id: string; name: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [fullViewDoc, setFullViewDoc] = useState<{
    uri: string;
    mimeType?: string;
    fileName?: string;
  } | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);

  const downloadDocument = async (entry: DocumentEntry) => {
    if (!entry.uri) return;
    try {
      const base64 = await RNBlobUtil.fs.readFile(entry.uri, "base64");

      const ext = entry.fileName?.split(".").pop() || (entry.mimeType === "application/pdf" ? "pdf" : "jpg");
      const safeName = entry.fileName?.replace(/[^a-zA-Z0-9._-]/g, "_") || `document_${Date.now()}.${ext}`;
      const destDir = Platform.OS === "android" ? RNFS.DownloadDirectoryPath : RNFS.DocumentDirectoryPath;
      const destPath = `${destDir}/${safeName}`;

      await RNFS.writeFile(destPath, base64, "base64");
      Alert.alert("Downloaded", `Saved to ${Platform.OS === "android" ? "Downloads" : "Files"}: ${safeName}`);
    } catch (e) {
      Alert.alert("Download failed", "Could not save the file. Please try again.");
    }
  };

  const openFullView = async (entry: DocumentEntry) => {
    if (!entry.uri) return;
    if (entry.mimeType === "application/pdf") {
      try {
        const uriForRead =
          Platform.OS === "android" ? entry.uri : entry.uri.replace("file://", "");
        const base64 = await RNBlobUtil.fs.readFile(uriForRead, "base64");
        setPdfBase64(base64);
        setFullViewDoc({ uri: entry.uri, mimeType: entry.mimeType, fileName: entry.fileName });
      } catch (e) {
        Alert.alert("Error", "Could not open PDF.");
      }
    } else {
      setFullViewDoc({ uri: entry.uri, mimeType: entry.mimeType, fileName: entry.fileName });
    }
  };

  const people: Person[] = [
    ...directors.map((d) => ({
      id: d.id,
      name: d.name,
      role: d.designation,
      entity: false,
    })),
    ...owners.map((o) => ({
      id: o.id,
      name: o.name,
      role: o.ownerType,
      entity: o.ownerType !== "Individual",
    })),
  ];

  const isSatisfied = (entry: DocumentEntry | undefined) =>
    !!entry && entry.status === "uploaded";

  const simulateUpload = (docId: string, docName: string) => {
    setPickerFor({ id: docId, name: docName });
  };

  // ── KYC helpers: per-person docs (Person KYC vs Entity KYC) ──
  const docsForPerson = (p: Person) =>
    p.entity ? ENTITY_KYC_DOCS : PERSON_KYC_DOCS;
  const kycKey = (personId: string, docId: string) => `kyc_${personId}_${docId}`;

  // KYC totals (people × their docs)
  const kycRequiredTotal = people.reduce(
    (a, p) => a + docsForPerson(p).filter((d) => d.required).length,
    0,
  );
  const kycRequiredDone = people.reduce(
    (a, p) =>
      a +
      docsForPerson(p).filter(
        (d) => d.required && isSatisfied(documents[kycKey(p.id, d.id)]),
      ).length,
    0,
  );
  const kycTotal = people.reduce(
    (a, p) => a + docsForPerson(p).length,
    0,
  );
  const kycDone = people.reduce(
    (a, p) =>
      a +
      docsForPerson(p).filter((d) => isSatisfied(documents[kycKey(p.id, d.id)]))
        .length,
    0,
  );

  const allRequired =
    DOC_GROUPS.filter((g) => g.id !== "kyc").every((g) =>
      g.docs.filter((d) => d.req).every((d) => isSatisfied(documents[d.id])),
    ) && kycRequiredDone === kycRequiredTotal;

  const requiredTotal =
    DOC_GROUPS.filter((g) => g.id !== "kyc").reduce(
      (acc, g) => acc + g.docs.filter((d) => d.req).length,
      0,
    ) + kycRequiredTotal;
  const requiredDone =
    DOC_GROUPS.filter((g) => g.id !== "kyc").reduce(
      (acc, g) =>
        acc + g.docs.filter((d) => d.req && isSatisfied(documents[d.id])).length,
      0,
    ) + kycRequiredDone;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      
      <ScreenHeader
        title="Document upload"
        onPress={() => navigation.goBack()}
        onSaveExit={() => navigation.navigate("CorporateHome")}
        showSteps
        step={4}
        totalSteps={6}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {DOC_GROUPS.map((g) => {
          const isOpen = openGroup === g.id;
          const isKyc = g.id === "kyc";
          const doneCount = isKyc
            ? kycDone
            : g.docs.filter((d) => isSatisfied(documents[d.id])).length;
          const totalCount = isKyc ? kycTotal : g.docs.length;

          return (
            <View key={g.id} style={[styles.group, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.groupHeader}
                onPress={() => setOpenGroup(isOpen ? "" : g.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.groupIconBox, { backgroundColor: colors.brandTint }]}>
                  <GroupIcon kind={g.icon} color={colors.brand} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.groupLabel, { color: colors.text }]}>{g.label}</Text>
                  <Text style={[styles.groupCount, { color: colors.textSecondary }]}>
                    {doneCount} of {totalCount} uploaded
                  </Text>
                </View>
                <ChevronDown open={isOpen} color={colors.faint} />
              </TouchableOpacity>

              {isOpen && isKyc && (
                <View style={styles.groupBody}>
                  {people.map((p) => (
                    <PersonKYCCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      role={p.role}
                      docs={docsForPerson(p)}
                      uploads={documents}
                      uploadProgress={uploadProgress}
                      onUpload={(docKey, docName) => {
                        const entry = documents[docKey];
                        if (entry?.status === "uploaded") {
                          Alert.alert(
                            "Replace document?",
                            `Remove "${entry?.fileName}" and upload a new file?`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Replace",
                                style: "destructive",
                                onPress: () => simulateUpload(docKey, docName),
                              },
                            ],
                          );
                        } else {
                          simulateUpload(docKey, docName);
                        }
                      }}
                      onMenu={(docKey) => {
                        const docName =
                          docsForPerson(p).find((d) => kycKey(p.id, d.id) === docKey)?.name || docKey;
                        setActionsFor({ id: docKey, name: docName });
                      }
                      }
                    />
                  ))}
                </View>
              )}

              {isOpen && !isKyc && (
                <View style={styles.groupBody}>
                  {g.docs.map((doc) => {
                    const entry = documents[doc.id];
                    const uploaded = isSatisfied(entry);
                    return (
                      <View key={doc.id} style={{ marginBottom: 8 }}>
                        <DocumentUploader
                          name={doc.name}
                          required={doc.req}
                          template={doc.template}

                          onDownloadTemplate={() =>
                            Alert.alert("Download template", `Template for ${doc.name}`)
                          }

                          status={uploaded ? "uploaded" : "empty"}

                          fileType={entry?.fileName?.split(".").pop()?.toUpperCase() || "PDF"}
                          fileSize={entry?.size}
                          progress={uploadProgress[doc.id]}

                          onUpload={() => {
                            if (uploaded) {
                              Alert.alert(
                                "Replace document?",
                                `Remove "${entry?.fileName}" and upload a new file?`,
                                [
                                  { text: "Cancel", style: "cancel" },
                                  {
                                    text: "Replace",
                                    style: "destructive",
                                    onPress: () => simulateUpload(doc.id, doc.name),
                                  },
                                ],
                              );
                            } else {
                              simulateUpload(doc.id, doc.name);
                            }
                          }}

                          onMenu={() => setActionsFor({ id: doc.id, name: doc.name })}
                        />
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

      </ScrollView>

      <BottomFileUploadModal
        visible={!!pickerFor}
        docName={pickerFor?.name || ""}
        onClose={() => setPickerFor(null)}
        onPicked={(entry) => {
          if (!pickerFor) return;
          const docId = pickerFor.id;
          setPickerFor(null);
          setUploadProgress((prev) => ({ ...prev, [docId]: 0 }));
          let p = 0;
          const tick = setInterval(() => {
            p += Math.random() * 19 + 7;
            if (p >= 100) {
              clearInterval(tick);
              setUploadProgress((prev) => ({ ...prev, [docId]: 100 }));
              setTimeout(() => {
                dispatch(upsertDocument({ id: docId, entry }));
                setUploadProgress((prev) => {
                  const next = { ...prev };
                  delete next[docId];
                  return next;
                });
              }, 300);
            } else {
              setUploadProgress((prev) => ({ ...prev, [docId]: p }));
            }
          }, 130);
        }}
      />

      <DocumentActionsModal
        visible={!!actionsFor}
        docName={actionsFor?.name || ""}
        fileMeta={(() => {
          if (!actionsFor) return undefined;
          const e = documents[actionsFor.id];
          if (!e) return undefined;
          const type = e.fileName?.split(".").pop()?.toUpperCase() || "PDF";
          return e.size ? `${type} · ${e.size}` : type;
        })()}

        onClose={() => setActionsFor(null)}

        onPreview={() => {
          if (!actionsFor) return;
          const target = actionsFor;
          setActionsFor(null);
          setPreviewFor(target);
        }}

        onReplace={() => {
          if (!actionsFor) return;
          const target = actionsFor;
          setActionsFor(null);
          setPickerFor(target);
        }}

        onDownload={() => {
          if (!actionsFor) return;
          const entry = documents[actionsFor.id];
          if (entry) downloadDocument(entry);
        }}

        onDelete={() => {
          if (!actionsFor) return;
          dispatch(removeDocument(actionsFor.id));
          setActionsFor(null);
        }}
      />

      <DocumentPreviewModal
        visible={!!previewFor}
        docName={previewFor?.name || ""}
        fileName={previewFor ? documents[previewFor.id]?.fileName : undefined}
        fileSize={previewFor ? documents[previewFor.id]?.size : undefined}
        fileType={ previewFor ? documents[previewFor.id]?.fileName?.split(".").pop()?.toUpperCase() || "PDF" : undefined}

        uri={previewFor ? documents[previewFor.id]?.uri : undefined}
        mimeType={previewFor ? documents[previewFor.id]?.mimeType : undefined}

        onClose={() => setPreviewFor(null)}

        onDownload={() => {
          if (!previewFor) return;
          const entry = documents[previewFor.id];
          if (entry) downloadDocument(entry);
        }}

        onReplace={() => {
          if (!previewFor) return;
          const target = previewFor;
          setPreviewFor(null);
          setPickerFor(target);
        }}

        onViewFull={() => {
          if (!previewFor) return;
          const entry = documents[previewFor.id];
          if (entry) openFullView(entry);
        }}
      />

      {fullViewDoc?.mimeType === "application/pdf" && pdfBase64 ? (
        <PdfViewer
          visible
          setVisible={(v) => { if (!v) { setFullViewDoc(null); setPdfBase64(null); } }}
          pdfBase64={pdfBase64}
          header={fullViewDoc.fileName || "Document"}
          downloadAllowed={false}
          deleteAllowed={false}
        />
      ) : fullViewDoc && (!fullViewDoc.mimeType || fullViewDoc.mimeType.startsWith("image/")) ? (
        <ImageViewer
          visible
          setVisible={(v) => { if (!v) setFullViewDoc(null); }}
          image={fullViewDoc.uri}
          header={fullViewDoc.fileName || "Document"}
          downloadAllowed={false}
          deleteAllowed={false}
        />
      ) : null}

      <BottomButton
        text={allRequired ? "Continue" : `Upload ${requiredTotal - requiredDone} more to continue`}
        onPress={() => navigation.navigate("CorporateReview")}
        // disabled={!allRequired}
        note={ !allRequired ? `⚠ ${requiredTotal - requiredDone} required document${requiredTotal - requiredDone !== 1 ? "s" : ""} pending` : undefined}
      />
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
